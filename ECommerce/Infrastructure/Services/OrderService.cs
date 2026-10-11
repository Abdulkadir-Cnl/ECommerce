using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context; //
        }

        // =====================================================
        // 1. SİPARİŞ OLUŞTURMA (Orijinal Mantık ve Fiyat Kontrolü)
        // =====================================================
        public async Task<int> CreateOrderAsync(string? userId, CheckoutDto model)
        {
            if (model.Items == null || !model.Items.Any())
                throw new Exception("Sepet boş."); //

            using var transaction = await _context.Database.BeginTransactionAsync(); //

            try
            {
                // Ürünleri veritabanından çekerek fiyat güvenliğini sağla
                var productIds = model.Items.Select(i => i.ProductId).ToList(); //

                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id); //

                if (!products.Any())
                    throw new Exception("Ürünler bulunamadı."); //

                decimal totalPrice = 0;
                var orderItems = new List<OrderItem>(); //

                foreach (var item in model.Items)
                {
                    if (!products.TryGetValue(item.ProductId, out var product))
                        throw new Exception("Ürün bulunamadı."); //

                    decimal price = product.Fiyat;
                    totalPrice += price * item.Quantity; //

                    orderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Ad,
                        Quantity = item.Quantity,
                        Price = price
                    }); //
                }

                // Adres Bilgileri
                var shippingAddress = new Address
                {
                    Title = model.ShippingAddress.Title,
                    Street = model.ShippingAddress.Street,
                    City = model.ShippingAddress.City,
                    State = model.ShippingAddress.State,
                    ZipCode = model.ShippingAddress.ZipCode,
                    Country = model.ShippingAddress.Country,
                    AppUserId = userId
                }; //

                var billingAddress = new Address
                {
                    Title = model.BillingAddress.Title,
                    Street = model.BillingAddress.Street,
                    City = model.BillingAddress.City,
                    State = model.BillingAddress.State,
                    ZipCode = model.BillingAddress.ZipCode,
                    Country = model.BillingAddress.Country,
                    AppUserId = userId
                }; //

                _context.Addresses.AddRange(shippingAddress, billingAddress); //

                // Sipariş Kaydı
                var order = new Order
                {
                    AppUserId = userId,
                    OrderDate = DateTime.UtcNow,
                    OrderStatus = "Hazırlanıyor",
                    PaymentStatus = model.PaymentMethod == "Havale/EFT" ? "EFT Bekleniyor" : "Ödendi", //
                    PaymentMethod = model.PaymentMethod,
                    TotalPrice = totalPrice,
                    CustomerName = model.CustomerName,
                    CustomerEmail = model.CustomerEmail,
                    CustomerPhoneNumber = model.CustomerPhoneNumber,
                    ShippingAddress = shippingAddress,
                    BillingAddress = billingAddress,
                    OrderItems = orderItems,
                    IsCorporate = model.IsCorporate,
                    CompanyName = model.IsCorporate ? model.CompanyName : null,
                    TaxOffice = model.IsCorporate ? model.TaxOffice : null,
                    TaxNumber = model.IsCorporate ? model.TaxNumber : null,
                }; //

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); //
                await transaction.CommitAsync(); //

                // Kullanıcı sepetini kapat
                if (!string.IsNullOrEmpty(userId))
                {
                    var basket = await _context.Baskets
                        .FirstOrDefaultAsync(b => b.AppUserId == userId && !b.IsOrdered); //

                    if (basket != null)
                    {
                        basket.IsOrdered = true;
                        basket.LastModifiedDate = DateTime.UtcNow;
                        _context.Baskets.Update(basket);
                        await _context.SaveChangesAsync(); //
                    }
                }

                return order.Id; //
            }
            catch
            {
                await transaction.RollbackAsync(); //
                throw;
            }
        }

        // =====================================================
        // 2. TÜM SİPARİŞLER (Admin - Resim ve Kurumsal Dahil)
        // =====================================================
        public async Task<List<OrderDto>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(o => o.ShippingAddress)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    UserId = o.AppUserId,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.PaymentStatus,
                    PaymentMethod = o.PaymentMethod,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    CustomerPhoneNumber = o.CustomerPhoneNumber,
                    IsCorporate = o.IsCorporate,
                    CompanyName = o.CompanyName,
                    TaxOffice = o.TaxOffice,
                    TaxNumber = o.TaxNumber,
                    OrderItems = o.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        Price = i.Price,
                        ResimUrl = i.Product != null ? i.Product.ResimUrl : null
                    }).ToList()
                })
                .ToListAsync(); //
        }

        // =====================================================
        // 3. KULLANICI SİPARİŞLERİ
        // =====================================================
        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(string userId)
        {
            return await _context.Orders
                .Where(o => o.AppUserId == userId)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.PaymentStatus,
                    OrderItems = o.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        Price = i.Price,
                        ResimUrl = i.Product != null ? i.Product.ResimUrl : null
                    }).ToList()
                })
                .ToListAsync(); //
        }

        // =====================================================
        // 4. TEKİL SİPARİŞ DETAYI
        // =====================================================
        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .Where(o => o.Id == id)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    UserId = o.AppUserId,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.PaymentStatus,
                    PaymentMethod = o.PaymentMethod,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    CustomerPhoneNumber = o.CustomerPhoneNumber,
                    IsCorporate = o.IsCorporate,
                    CompanyName = o.CompanyName,
                    TaxOffice = o.TaxOffice,
                    TaxNumber = o.TaxNumber,
                    ShippingAddress = o.ShippingAddress == null ? null : new AddressDto
                    {
                        Title = o.ShippingAddress.Title,
                        Street = o.ShippingAddress.Street,
                        City = o.ShippingAddress.City,
                        State = o.ShippingAddress.State,
                        ZipCode = o.ShippingAddress.ZipCode,
                        Country = o.ShippingAddress.Country
                    },
                    OrderItems = o.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        Price = i.Price,
                        ResimUrl = i.Product != null ? i.Product.ResimUrl : null
                    }).ToList()
                })
                .FirstOrDefaultAsync(); //
        }

        // =====================================================
        // 5. DURUM GÜNCELLEMELERİ
        // =====================================================
        public async Task UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto model)
        {
            var order = await _context.Orders.FindAsync(orderId); //
            if (order == null)
                throw new Exception("Sipariş bulunamadı."); //

            order.OrderStatus = model.NewStatus; //
            await _context.SaveChangesAsync(); //
        }

        public async Task UpdatePaymentStatusAsync(int orderId, string paymentStatus)
        {
            var order = await _context.Orders.FindAsync(orderId); //
            if (order == null)
                throw new Exception("Sipariş bulunamadı."); //

            order.PaymentStatus = paymentStatus; //
            await _context.SaveChangesAsync(); //
        }

        // =====================================================
        // 6. SATIŞ İSTATİSTİKLERİ
        // =====================================================
        public async Task<List<MonthlySalesDto>> GetMonthlySalesDataAsync()
        {
            return await _context.Orders
                .Where(o => o.PaymentStatus == "Ödendi") //
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new MonthlySalesDto
                {
                    MonthYear = new DateTime(g.Key.Year, g.Key.Month, 1)
                        .ToString("MMM yyyy", new CultureInfo("tr-TR")),
                    TotalSpending = g.Sum(x => x.TotalPrice)
                })
                .OrderBy(x => x.MonthYear)
                .ToListAsync(); //
        }
    }
}
using Application.DTOs;
using Application.DTOs.Payment;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using Infrastructure.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly PaytrService _paytrService;
        private readonly AppDbContext _context;

        public OrderController(
            IOrderService orderService,
            PaytrService paytrService,
            AppDbContext context)
        {
            _orderService = orderService;
            _paytrService = paytrService;
            _context = context;
        }

        // -----------------------------
        // CHECKOUT (Sipariş Oluştur, Stok Düş ve Ödeme Başlat)
        // -----------------------------
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var orderId = await _orderService.CreateOrderAsync(userId, model);

                var createdOrder = await _context.Orders
                                                 .Include(x => x.OrderItems)
                                                 .FirstOrDefaultAsync(x => x.Id == orderId);

                if (createdOrder == null)
                    return BadRequest(new { message = "Sipariş oluşturuldu fakat detayları alınamadı." });

                // STOKLARI DÜŞME
                foreach (var item in createdOrder.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.Stok -= item.Quantity;
                        if (product.Stok < 0) product.Stok = 0;
                    }
                }

                await _context.SaveChangesAsync();

                if (model.PaymentMethod == "Kredi Kartı")
                {
                    try
                    {
                        var userIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                        if (userIp == "::1") userIp = "127.0.0.1";

                        var fullAddress = $"{model.ShippingAddress.Street} {model.ShippingAddress.State}/{model.ShippingAddress.City}";

                        var paytrRequest = new PaytrTokenRequest
                        {
                            OrderId = createdOrder.Id,
                            MerchantOrderId = $"ORD-{createdOrder.Id}-{DateTime.Now.Ticks}",
                            Email = model.CustomerEmail,
                            Amount = createdOrder.TotalPrice,
                            UserName = model.CustomerName,
                            UserAddress = fullAddress,
                            UserPhone = model.CustomerPhoneNumber,
                            UserIp = userIp,
                            SuccessUrl = "https://localhost:7011/order-success",
                            FailUrl = "https://localhost:7011/checkout",

                            Basket = createdOrder.OrderItems.Select(x => new PaytrBasketItemDto
                            {
                                Name = x.ProductName,
                                Price = x.Price,
                                Quantity = x.Quantity
                            }).ToList()
                        };

                        var token = await _paytrService.GetPaytrTokenAsync(paytrRequest);

                        return Ok(new
                        {
                            success = true,
                            message = "Sipariş oluşturuldu, Stoklar güncellendi ve PayTR bekleniyor.",
                            orderId = createdOrder.Id,
                            isPaytr = true,
                            paytrToken = token
                        });
                    }
                    catch (Exception paytrEx)
                    {
                        return BadRequest(new { message = "PayTR Hatası: " + paytrEx.Message });
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Sipariş başarıyla oluşturuldu ve stoklardan düşüldü.",
                    orderId,
                    isPaytr = false
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // -----------------------------
        // ADMIN - DURUM GÜNCELLEME VE STOK İADE
        // -----------------------------
        [Authorize(Roles = "Admin,Satıcı")]
        [HttpPut("status/{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusDto model)
        {
            try
            {
                // 🔴 YENİ: STOK İADE MANTIĞI
                // Eğer yeni durum "İptal Edildi" ise stokları geri yükle
                if (model.NewStatus == "İptal Edildi")
                {
                    // Siparişi ve içindeki ürünleri çek
                    var order = await _context.Orders
                        .Include(x => x.OrderItems)
                        .FirstOrDefaultAsync(x => x.Id == orderId);

                    // Eğer sipariş zaten iptal edilmemişse işlemi yap (mükerrer stok artışını önlemek için)
                    if (order != null && order.OrderStatus != "İptal Edildi")
                    {
                        foreach (var item in order.OrderItems)
                        {
                            var product = await _context.Products.FindAsync(item.ProductId);
                            if (product != null)
                            {
                                product.Stok += item.Quantity; // Ürün adedini stoklara geri ekle
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                // Mevcut servis üzerinden durum güncellemesini yap
                await _orderService.UpdateOrderStatusAsync(orderId, model);
                return Ok(new { message = "Sipariş durumu güncellendi ve ürünler stoklara geri iade edildi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Satıcı")]
        [HttpPut("payment-confirm/{orderId}")]
        public async Task<IActionResult> ConfirmEftPayment(int orderId)
        {
            try
            {
                await _orderService.UpdatePaymentStatusAsync(orderId, "Ödendi");
                await _orderService.UpdateOrderStatusAsync(orderId, new UpdateOrderStatusDto { NewStatus = "Hazırlanıyor" });
                return Ok(new { message = "EFT Ödemesi onaylandı. Sipariş hazırlama aşamasına alındı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Satıcı")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            return Ok(await _orderService.GetAllOrdersAsync());
        }

        [Authorize(Roles = "Admin,Satıcı")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound(new { message = "Sipariş bulunamadı." });
            return Ok(order);
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { message = "Yetkisiz erişim." });

            var data = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(data);
        }

        [Authorize]
        [HttpGet("my-order/{orderId}")]
        public async Task<IActionResult> GetMyOrderDetail(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub")?.Value;
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null) return NotFound(new { message = "Sipariş bulunamadı." });
            if (order.UserId != userId) return Unauthorized(new { message = "Bu sipariş size ait değil!" });

            return Ok(order);
        }

        [HttpGet("monthly-sales-chart")]
        [Authorize(Roles = "Admin,Satıcı")]
        public async Task<IActionResult> GetMonthlySalesData()
        {
            try
            {
                var data = await _orderService.GetMonthlySalesDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Grafik hatası: {ex.Message}");
            }
        }
    }
}
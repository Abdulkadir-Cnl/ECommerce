// Infrastructure/Services/AdminService.cs
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        // 1. En Çok Satan Ürünler Metodu
        public async Task<List<TopProductDto>> GetTopSellingProductsAsync(int count = 5)
        {
            var topProducts = await _context.OrderItems
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    TotalQuantity = g.Sum(oi => oi.Quantity),
                })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Join(_context.Products, 
                      oi => oi.ProductId, 
                      p => p.Id, 
                      (oi, p) => new TopProductDto
                      {
                          Id = p.Id,
                          Ad = p.Ad,
                          Fiyat = p.Fiyat,
                          Adet = oi.TotalQuantity,
                          ResimUrl = p.ResimUrl,
                          Barcode = "SKU-" + p.Id, 
                          Trend = (p.Id % 2 == 0) ? -0.63m : 1.15m 
                      })
                .ToListAsync();

            return topProducts;
        }

        // 2. Büyüme Metrikleri Metodu (Hata Çözümü Yapıldı)
        public async Task<GrowthMetricsDto> GetGrowthMetricsAsync()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalSales = await _context.Orders.SumAsync(o => o.TotalPrice);
            
            var totalProducts = await _context.Products.CountAsync();
            var ortUrunFiyati = totalProducts > 0 ? await _context.Products.AverageAsync(p => p.Fiyat) : 0;

            var allItemsCount = await _context.OrderItems.SumAsync(oi => oi.Quantity);
            // Hata çözümü: Doğru değişken ismi kullanıldı.
            var averageBasketSize = totalOrders > 0 ? (decimal)allItemsCount / totalOrders : 0; 
            
            return new GrowthMetricsDto
            {
                OrtIadeOrani = 0.00m, 
                OrtUrunFiyati = ortUrunFiyati,
                OrtSiparisTutari = totalOrders > 0 ? totalSales / totalOrders : 0,
                OrtSepetBuyuklugu = averageBasketSize, 
            };
        }
        
        // 3. Aylık Müşteri Harcaması Grafiği Metodu
        public async Task<List<MonthlySalesDto>> GetMonthlyCustomerSpendingAsync(int lastMonths = 6)
        {
            var cutoffDate = DateTime.Now.AddMonths(-lastMonths);

            var monthlyData = await _context.Orders
                .Where(o => o.OrderDate >= cutoffDate)
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new MonthlySalesDto
                {
                    MonthYear = g.Key.Month.ToString("00") + "/" + g.Key.Year.ToString().Substring(2),
                    TotalSpending = g.Sum(o => o.TotalPrice)
                })
                .OrderBy(m => m.MonthYear) 
                .ToListAsync();
                
            return monthlyData;
        }
    }
}
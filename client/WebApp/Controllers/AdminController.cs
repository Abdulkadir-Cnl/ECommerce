using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    // ROL GÜNCELLEME İÇİN ÖZEL DTO
    public class UpdateUserRolesDto
    {
        public List<string> Roles { get; set; } = new List<string>();
    }

    [ApiController]
    [Route("api/[controller]")]
    // Sadece Admin ve Satıcı rolleri erişebilir
    [Authorize(Roles = "Admin,Satıcı")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IAdminService _adminService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(
            AppDbContext context,
            UserManager<AppUser> userManager,
            IAdminService adminService,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _adminService = adminService;
            _roleManager = roleManager;
        }

        // ======================================================
        // TEST & PING
        // ======================================================
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok("AdminController aktif ve çalışıyor.");
        }

        // ======================================================
        // KULLANICI YÖNETİMİ (USERS)
        // ======================================================

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            // Kullanıcıları temel bilgileriyle çek
            var users = await _userManager.Users
                .AsNoTracking()
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.AdSoyad,
                    u.PhoneNumber,
                    u.Adres,
                    u.CreatedDate,
                    u.HasCommunicationPermission
                })
                .ToListAsync();

            var userIds = users.Select(u => u.Id).ToList();

            // Kullanıcıların sipariş istatistiklerini hesapla
            var orderStats = await _context.Orders
                .Where(o => userIds.Contains(o.AppUserId) && o.OrderStatus != "İptal Edildi")
                .GroupBy(o => o.AppUserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalSpent = g.Sum(x => x.TotalPrice),
                    OrderCount = g.Count()
                })
                .ToListAsync();

            var result = users.Select(u => {
                var stat = orderStats.FirstOrDefault(s => s.UserId == u.Id);
                return new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    AdSoyad = u.AdSoyad ?? u.UserName,
                    PhoneNumber = u.PhoneNumber,
                    Adres = u.Adres,
                    CreatedDate = u.CreatedDate,
                    HasPermission = u.HasCommunicationPermission,
                    TotalSpent = stat?.TotalSpent ?? 0,
                    OrderCount = stat?.OrderCount ?? 0,
                    HasAccount = true
                };
            });

            return Ok(result);
        }

        [HttpGet("total-users")]
        public async Task<IActionResult> GetTotalUsers()
        {
            try
            {
                var total = await _userManager.Users.CountAsync();
                return Ok(new { totalUsers = total });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Kullanıcı sayısı alınamadı: " + ex.Message });
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var roles = await _userManager.GetRolesAsync(user);

            var orders = await _context.Orders
                .Where(o => o.AppUserId == id)
                .AsNoTracking()
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            string finalPhoneNumber = user.PhoneNumber;
            if (string.IsNullOrEmpty(finalPhoneNumber))
            {
                var orderWithPhone = orders.FirstOrDefault(o => !string.IsNullOrEmpty(o.CustomerPhoneNumber));
                if (orderWithPhone != null) finalPhoneNumber = orderWithPhone.CustomerPhoneNumber;
                else finalPhoneNumber = "Telefon Belirtilmemiş";
            }

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                AdSoyad = user.AdSoyad ?? user.UserName,
                PhoneNumber = finalPhoneNumber,
                Adres = user.Adres ?? "Adres Girilmemiş",
                Roles = roles,
                Stats = new
                {
                    TotalSpent = orders.Sum(o => o.TotalPrice),
                    OrderCount = orders.Count,
                    LastOrderDate = orders.FirstOrDefault()?.OrderDate
                },
                RecentOrders = orders.Take(10).Select(o => new {
                    o.Id,
                    o.OrderDate,
                    o.TotalPrice,
                    o.OrderStatus
                })
            });
        }

        [HttpPatch("users/{id}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRoles(string id, [FromBody] UpdateUserRolesDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var currentRoles = await _userManager.GetRolesAsync(user);

            foreach (var newRole in model.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(newRole))
                    return BadRequest($"Hata: '{newRole}' isimli rol sistemde tanımlı değil.");
            }

            // Mevcut olmayan rolleri kaldır
            var rolesToRemove = currentRoles.Except(model.Roles).ToList();
            if (rolesToRemove.Any())
                await _userManager.RemoveFromRolesAsync(user, rolesToRemove);

            // Yeni rolleri ekle
            var rolesToAdd = model.Roles.Except(currentRoles).ToList();
            if (rolesToAdd.Any())
                await _userManager.AddToRolesAsync(user, rolesToAdd);

            return NoContent();
        }

        // ======================================================
        // BASKETS (TERK EDİLMİŞ SEPETLER)
        // ======================================================
        [HttpGet("baskets")]
        public async Task<IActionResult> GetBaskets()
        {
            // Siparişe dönüşmemiş ve içi dolu sepetleri çek
            var baskets = await _context.Baskets
                .Include(b => b.AppUser)
                .Include(b => b.Items).ThenInclude(i => i.Product)
                .Where(b => !b.IsOrdered && b.Items.Any())
                .AsNoTracking()
                .OrderByDescending(b => b.LastModifiedDate)
                .ToListAsync();

            var result = baskets.Select(b => new
            {
                b.Id,
                Customer = b.AppUser != null ? (b.AppUser.AdSoyad ?? b.AppUser.UserName) : "Misafir",
                Email = b.AppUser != null ? b.AppUser.Email : "-",
                OrderDate = b.LastModifiedDate ?? DateTime.UtcNow,
                TotalPrice = b.Items.Sum(i => i.Quantity * (i.Product != null ? i.Product.Fiyat : 0)),
                ItemsCount = b.Items.Sum(i => i.Quantity),
                Items = b.Items.Select(i => new {
                    i.Quantity,
                    ProductName = i.Product != null ? i.Product.Ad : "Silinmiş Ürün",
                    Price = i.Product != null ? i.Product.Fiyat : 0,
                    ResimUrl = i.Product != null ? i.Product.ResimUrl : ""
                })
            });

            return Ok(result);
        }

        // ======================================================
        // İSTATİSTİK & RAPORLAMA (DASHBOARD)
        // ======================================================

        [HttpGet("TopSellingProducts")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var result = await _adminService.GetTopSellingProductsAsync(5);
            return Ok(result);
        }

        [HttpGet("GrowthMetrics")]
        public async Task<IActionResult> GetGrowthMetrics()
        {
            var result = await _adminService.GetGrowthMetricsAsync();
            return Ok(result);
        }

        [HttpGet("MonthlySpending")]
        public async Task<IActionResult> GetMonthlySpending()
        {
            var result = await _adminService.GetMonthlyCustomerSpendingAsync(6);
            return Ok(result);
        }

        [HttpGet("ProductSalesReports")]
        public async Task<IActionResult> GetProductSalesReports(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] string view = "Günlük",
            [FromQuery] string metric = "tutar")
        {
            start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

            var items = await _context.OrderItems
                .Include(i => i.Order)
                .Include(i => i.Product)
                .AsNoTracking()
                .Where(i => i.Order.OrderDate >= start && i.Order.OrderDate <= end)
                .Where(i => i.Order.OrderStatus != "İptal Edildi")
                .ToListAsync();

            string GetLabel(DateTime d)
            {
                if (view == "Aylık") return d.ToString("MMM yyyy", new CultureInfo("tr-TR"));
                if (view == "Haftalık") return $"Hafta {ISOWeek.GetWeekOfYear(d)}";
                return d.ToString("dd MMM yyyy", new CultureInfo("tr-TR"));
            }

            var periods = items.Select(i => GetLabel(i.Order.OrderDate)).Distinct().OrderBy(x => x).ToList();

            var rows = items
                .GroupBy(i => new { i.ProductId, i.Product.Ad, i.Product.ResimUrl })
                .Select(g =>
                {
                    var dict = new Dictionary<string, decimal>();
                    foreach (var p in periods)
                    {
                        if (metric == "adet")
                            dict[p] = g.Where(x => GetLabel(x.Order.OrderDate) == p).Sum(x => x.Quantity);
                        else
                            dict[p] = g.Where(x => GetLabel(x.Order.OrderDate) == p).Sum(x => x.Price * x.Quantity);
                    }
                    return new ProductSalesReportRowDto
                    {
                        ProductId = g.Key.ProductId,
                        ProductName = g.Key.Ad,
                        ProductImage = g.Key.ResimUrl,
                        Sku = "SKU-" + g.Key.ProductId,
                        MetricsByPeriod = dict,
                        Total = dict.Values.Sum()
                    };
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            return Ok(new ProductSalesReportResponseDto { Periods = periods, Rows = rows });
        }

        [HttpGet("SalesReports")]
        public async Task<IActionResult> GetSalesReports(
           [FromQuery] DateTime start,
           [FromQuery] DateTime end,
           [FromQuery] string view = "Günlük")
        {
            start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.OrderDate >= start && o.OrderDate <= end)
                .Where(o => o.OrderStatus != "İptal Edildi")
                .ToListAsync();

            string Label(DateTime d)
            {
                if (view == "Aylık") return d.ToString("MM.yyyy");
                if (view == "Haftalık") return $"Hafta {ISOWeek.GetWeekOfYear(d)}";
                return d.ToString("dd.MM.yyyy");
            }

            var result = orders
                .GroupBy(o => Label(o.OrderDate))
                .Select(g => new
                {
                    label = g.Key,
                    value = g.Sum(x => x.TotalPrice)
                })
                .OrderBy(x => x.label)
                .ToList();

            return Ok(result);
        }
    }
}
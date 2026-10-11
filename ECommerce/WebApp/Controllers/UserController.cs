using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Application.DTOs;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Herkes girebilir (Giriş yapmış olması yeterli)
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public UserController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // ✅ YENİ EKLENEN: Kullanıcının kendi profil bilgilerini getir
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            // Frontend'in beklediği formatta veri dönüyoruz
            return Ok(new
            {
                fullName = user.AdSoyad ?? user.UserName,
                email = user.Email,
                isSeller = await _userManager.IsInRoleAsync(user, "Satıcı")
            });
        }

        // 1. SATICI OLMA TALEBİ GÖNDER
        [HttpPost("request-seller")]
        public async Task<IActionResult> RequestSeller([FromBody] SellerRequestDto model)
        {
            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var existing = await _context.SellerRequests
                .FirstOrDefaultAsync(x => x.AppUserId == userId && x.Status == "Bekliyor");

            if (existing != null)
                return BadRequest(new { message = "Zaten bekleyen bir talebiniz var." });

            user.Adres = model.Adres;
            user.VergiNo = model.VergiNo;
            await _userManager.UpdateAsync(user);

            var request = new SellerRequest
            {
                AppUserId = userId,
                RequestDate = DateTime.UtcNow,
                Status = "Bekliyor"
            };

            _context.SellerRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bilgileriniz kaydedildi ve satıcı olma talebiniz iletildi." });
        }
    }
}
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<AppUser> _userManager;       // YENİ EKLENDİ (Kurtarma için)
        private readonly RoleManager<IdentityRole> _roleManager;  // YENİ EKLENDİ (Kurtarma için)

        // Constructor (Yapıcı Metot) - Dependency Injection
        public AuthController(IAuthService authService, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _authService = authService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // -------------------------------------------------------------------
        // 1. KAYIT OL (Müşteri)
        // -------------------------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(model);

            if (result.Succeeded)
            {
                return Ok(new { message = "Kullanıcı başarıyla oluşturuldu ve Müşteri rolü atandı!" });
            }

            return BadRequest(result.Errors);
        }

        // -------------------------------------------------------------------
        // 2. GİRİŞ YAP (Token Al)
        // -------------------------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.LoginAsync(model);

            if (token == null)
            {
                return Unauthorized(new { message = "Email veya şifre hatalı!" });
            }

            return Ok(new { token = token });
        }

        // -------------------------------------------------------------------
        // 3. ROL ATA (Sadece Admin)
        // -------------------------------------------------------------------
        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] RoleDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultMessage = await _authService.AssignRoleAsync(model);

            if (resultMessage == null)
            {
                return Ok(new { message = $"{model.Email} kullanıcısına '{model.Role}' yetkisi verildi." });
            }

            return BadRequest(new { message = resultMessage });
        }

        // -------------------------------------------------------------------
        // 4. ACİL DURUM BUTONU: ADMİN OLUŞTUR (Kurtarma)
        // -------------------------------------------------------------------
        // Admin kullanıcısı silindiyse veya oluşmadıysa bunu çalıştır.
        [HttpGet("force-create-admin")]
        public async Task<IActionResult> ForceCreateAdmin()
        {
            // A. Önce "Admin" rolü var mı kontrol et, yoksa oluştur.
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // B. Admin kullanıcısını e-postasıyla ara.
            var adminEmail = "admin@basyazici.com";
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                // Kullanıcı yoksa SIFIRDAN OLUŞTUR
                adminUser = new AppUser
                {
                    UserName = "SuperAdmin",
                    Email = adminEmail,
                    AdSoyad = "Sistem Yöneticisi",
                    SecurityStamp = Guid.NewGuid().ToString(),
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(adminUser, "Admin123!");
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { message = "Admin oluşturulamadı", errors = createResult.Errors });
                }
            }

            // C. Kullanıcıya kesinlikle ADMIN yetkisi ver
            if (!await _userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
            }

            return Ok(new { message = $"Admin kullanıcısı ({adminEmail}) ve yetkisi başarıyla onarıldı! Şimdi giriş yapabilirsiniz." });
        }
    }
}
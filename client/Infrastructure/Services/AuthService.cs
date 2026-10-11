using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthService(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _context = context;
        }

        public async Task<IdentityResult> RegisterAsync(RegisterDto model)
        {
            var user = new AppUser
            {
                UserName = model.UserName,
                Email = model.Email,
                AdSoyad = model.AdSoyad,
                SecurityStamp = Guid.NewGuid().ToString(),
                Adres = model.Adres,
                VergiNo = model.VergiNo
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                if (!await _roleManager.RoleExistsAsync("Müşteri"))
                    await _roleManager.CreateAsync(new IdentityRole("Müşteri"));

                await _userManager.AddToRoleAsync(user, "Müşteri");

                if (model.IsSeller)
                {
                    var request = new SellerRequest
                    {
                        AppUserId = user.Id,
                        RequestDate = DateTime.UtcNow,
                        Status = "Bekliyor"
                    };
                    _context.SellerRequests.Add(request);
                    await _context.SaveChangesAsync();
                }
            }

            return result;
        }

        public async Task<string> LoginAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return null;

            var ok = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!ok) return null;
            // 🔥 Toplam oturum sayısını artır ve kaydet
            user.LoginCount++;
            await _userManager.UpdateAsync(user);

            return await GenerateJwtToken(user);
        }

        public async Task<string> AssignRoleAsync(RoleDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return "Kullanıcı bulunamadı.";

            if (!await _roleManager.RoleExistsAsync(model.Role))
                return "Rol bulunamadı.";

            var result = await _userManager.AddToRoleAsync(user, model.Role);
            return result.Succeeded ? null : "Hata.";
        }

        public async Task<string> RevokeRoleAsync(string email, string roleName)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return "Kullanıcı bulunamadı.";

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            return result.Succeeded ? null : "Hata.";
        }

        private async Task<string> GenerateJwtToken(AppUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            // ✅ KRİTİK: NameIdentifier eklendi
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in userRoles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var secret = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new Exception("JwtSettings:SecretKey appsettings.json içinde yok veya boş.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            var durationStr = _configuration["JwtSettings:DurationInMinutes"];
            _ = double.TryParse(durationStr, out var durationMinutes);
            if (durationMinutes <= 0) durationMinutes = 60;

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(durationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

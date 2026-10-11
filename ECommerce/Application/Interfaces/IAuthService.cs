using Application.DTOs;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterDto model);

        // YENİ EKLENEN SATIR: Geriye "Token" (string) dönecek
        Task<string> LoginAsync(LoginDto model);
        Task<string> AssignRoleAsync(RoleDto model);
        Task<string> RevokeRoleAsync(string email, string roleName);
    }
}
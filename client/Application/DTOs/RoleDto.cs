using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class RoleDto
    {
        [Required]
        public string Email { get; set; } // Kimi yetkilendireceğiz?

        [Required]
        public string Role { get; set; } // Hangi yetkiyi vereceğiz? (Admin, Satıcı)
    }
}
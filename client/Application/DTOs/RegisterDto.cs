using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class RegisterDto
    {
        [Required] public string AdSoyad { get; set; }
        [Required] public string UserName { get; set; }
        [Required][EmailAddress] public string Email { get; set; }
        [Required] public string Password { get; set; }
        [Compare("Password")] public string ConfirmPassword { get; set; }

        // YENİ ALANLAR (Zorunlu değil, sadece satıcı olmak isterse dolu gelecek)
        public bool IsSeller { get; set; } = false; // Satıcı olmak istiyor mu?
        public string? Adres { get; set; }
        public string? VergiNo { get; set; }
    }
}
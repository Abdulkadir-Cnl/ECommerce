using Microsoft.AspNetCore.Identity;

namespace Domain.Entities
{
    public class AppUser : IdentityUser
    {
        public string AdSoyad { get; set; }

        // YENİ EKLENENLER:
        public string? Adres { get; set; }
        public string? VergiNo { get; set; } // Satıcı belgesi yerine şimdilik bunu alalım
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow; // Kayıt Tarihi
        public bool HasCommunicationPermission { get; set; } = false;
        public int LoginCount { get; set; } = 0;
    }
}
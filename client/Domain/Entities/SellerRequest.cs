namespace Domain.Entities
{
    public class SellerRequest
    {
        public int Id { get; set; }
        public string AppUserId { get; set; } // Kim istiyor?
        public AppUser AppUser { get; set; }  // Kullanıcı detayları
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Bekliyor"; // Bekliyor, Onaylandı
    }
}
namespace Domain.Entities
{
    public class SeoSetting
    {
        public int Id { get; set; }

        // Sayfa Tipi: "General", "Product", "Category", "Blog"
        public string PageType { get; set; } = "General";

        // Eğer bir ürün veya kategoriye özgüyse ID'si (Örn: "1")
        // Genel ayarlar için null olabilir.
        public string? EntityId { get; set; }

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Keywords { get; set; } = "";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
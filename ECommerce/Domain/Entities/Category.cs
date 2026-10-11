namespace Domain.Entities
{
    public class Category
    {
        public int Id { get; set; } // Benzersiz numara
        public string Ad { get; set; } // Kategori adı (Örn: Elektronik)
        public string? ImageUrl { get; set; }

        // İLİŞKİ: Bir kategorinin içinde birden çok ürün olabilir
        public List<Product> Products { get; set; }
    }
}
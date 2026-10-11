// Application/DTOs/TopProductDto.cs
namespace Application.DTOs
{
    public class TopProductDto
    {
        public int Id { get; set; }
        public string Ad { get; set; }
        public decimal Fiyat { get; set; }
        public int Adet { get; set; } // Satılan/Sepetteki toplam adet
        public decimal Trend { get; set; } // Önceki döneme göre değişim (% olarak)
        public string ResimUrl { get; set; }
        public string Barcode { get; set; } // SKU veya barkod
    }
}
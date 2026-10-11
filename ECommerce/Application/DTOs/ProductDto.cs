namespace Application.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Ad { get; set; }
        public string Aciklama { get; set; }
        public decimal Fiyat { get; set; }
        public int Stok { get; set; }
        public string ResimUrl { get; set; }

        // Önemli: Kategori ID yerine ismini döndüreceğiz
        public string KategoriAdi { get; set; }
    }
}
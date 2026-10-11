// Domain/Entities/Product.cs (GÜNCELLENMİŞ)
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Ad { get; set; }
        public string Aciklama { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Fiyat { get; set; }

        public int Stok { get; set; }
        public string ResimUrl { get; set; }

        // YENİ: Soft Delete
        public bool IsActive { get; set; } = true;

        // İLİŞKİ: Her ürünün bir kategorisi vardır
        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreateProductDto
    {
        [Required] public string Ad { get; set; }
        public string Aciklama { get; set; }
        [Required] public decimal Fiyat { get; set; }
        [Required] public int Stok { get; set; }
        public string ResimUrl { get; set; }
        [Required] public int CategoryId { get; set; } // Hangi kategoriye ait?
    }
}
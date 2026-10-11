// Application/DTOs/UpdateProductDto.cs (YENİ)
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdateProductDto
    {
        public int Id { get; set; }
        public string? Ad { get; set; }
        public string? Aciklama { get; set; }
        public decimal? Fiyat { get; set; }
        public int? Stok { get; set; }
        public string? ResimUrl { get; set; }
        public int? CategoryId { get; set; }
        public bool? IsActive { get; set; } // Soft Delete güncellemesi
    }
}
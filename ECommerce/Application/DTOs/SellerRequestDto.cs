using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class SellerRequestDto
    {
        [Required]
        public string Adres { get; set; }

        [Required]
        public string VergiNo { get; set; }
    }
}
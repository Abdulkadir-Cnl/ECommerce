// Application/DTOs/UpdateOrderStatusDto.cs (YENİ)
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdateOrderStatusDto
    {
        [Required] public string NewStatus { get; set; } // Örn: Kargolandı, İptal
        public string? AdminNote { get; set; } // Opsiyonel
    }
}
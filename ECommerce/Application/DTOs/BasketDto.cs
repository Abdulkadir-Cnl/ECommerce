using System.Collections.Generic;

namespace Application.DTOs
{
    public class BasketDto
    {
        public int Id { get; set; }
        public List<BasketItemDto> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
    }
}

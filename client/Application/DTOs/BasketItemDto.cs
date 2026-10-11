namespace Application.DTOs
{
    public class BasketItemDto
    {
        public int ProductId { get; set; }

        public string? ProductName { get; set; }

        public decimal Price { get; set; }
        public int Quantity { get; set; }

        // 🔴 FOTO URL
        public string? ResimUrl { get; set; }
    }
}

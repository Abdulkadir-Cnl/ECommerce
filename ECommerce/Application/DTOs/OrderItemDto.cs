namespace Application.DTOs
{
    public class OrderItemDto
    {
        public int ProductId { get; set; } //
        public string ProductName { get; set; } //
        public int Quantity { get; set; } //
        public decimal Price { get; set; } //

        // 🔥 CS0117 hatasını gideren eksik alan
        public string? ResimUrl { get; set; } //
    }
}
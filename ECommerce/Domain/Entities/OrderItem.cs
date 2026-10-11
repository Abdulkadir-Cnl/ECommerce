namespace Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public string? ResimUrl { get; set; }

        public string ProductName { get; set; } // Ürün adı değişirse diye yedeğini alıyoruz
        public decimal Price { get; set; }      // O günkü fiyatı kaydediyoruz
        public int Quantity { get; set; }       // Kaç adet?

        public int OrderId { get; set; }
        public Order Order { get; set; }
    }
}
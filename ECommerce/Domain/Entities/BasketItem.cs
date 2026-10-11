namespace Domain.Entities
{
    public class BasketItem
    {
        public int Id { get; set; }

        public int BasketId { get; set; }
        public Basket Basket { get; set; }

        public int ProductId { get; set; }

        // 🔴 ÜRÜN BAĞLANTISI (foto buradan geliyor)
        public Product Product { get; set; }

        public int Quantity { get; set; }
    }
}

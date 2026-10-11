namespace Application.DTOs.Payment
{
    public class PaytrBasketItemDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; } // TL
        public int Quantity { get; set; }
    }
}

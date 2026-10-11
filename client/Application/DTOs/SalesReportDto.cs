namespace Application.DTOs
{
    public class SalesReportDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Sku { get; set; }
        public string ProductImage { get; set; }

        public decimal TotalValue { get; set; }
        public List<SalesPointDto> Points { get; set; } = new();
    }

    public class SalesPointDto
    {
        public string Label { get; set; }
        public decimal Value { get; set; }
    }
}

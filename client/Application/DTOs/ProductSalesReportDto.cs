namespace Application.DTOs
{
    public class ProductSalesReportResponseDto
    {
        public List<string> Periods { get; set; } = new();
        public List<ProductSalesReportRowDto> Rows { get; set; } = new();
    }

    public class ProductSalesReportRowDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Sku { get; set; }
        public string ProductImage { get; set; }

        public Dictionary<string, decimal> MetricsByPeriod { get; set; } = new();
        public decimal Total { get; set; }
    }
}

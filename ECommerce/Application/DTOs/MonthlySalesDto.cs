// Application/DTOs/MonthlySalesDto.cs
namespace Application.DTOs
{
    public class MonthlySalesDto
    {
        public string MonthYear { get; set; } // Örn: "Oca 2025" veya "01/25"
        public decimal TotalSpending { get; set; }
    }
}
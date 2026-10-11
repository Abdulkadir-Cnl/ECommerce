// Application/Interfaces/IAdminService.cs
using Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAdminService
    {
        Task<List<TopProductDto>> GetTopSellingProductsAsync(int count = 5);
        Task<GrowthMetricsDto> GetGrowthMetricsAsync();
        Task<List<MonthlySalesDto>> GetMonthlyCustomerSpendingAsync(int lastMonths = 2);
    }
}
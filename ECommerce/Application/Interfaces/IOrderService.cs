using Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IOrderService
    {
        // Sipariş oluşturur ve yeni Sipariş ID'sini döner
        Task<int> CreateOrderAsync(string? userId, CheckoutDto model);

        // Yönetim paneli için tüm siparişleri listeler
        Task<List<OrderDto>> GetAllOrdersAsync();

        // Belirli bir kullanıcıya ait siparişleri getirir
        Task<List<OrderDto>> GetOrdersByUserIdAsync(string userId);

        // ID bazlı sipariş detayını getirir (Resimler ve adresler dahil)
        Task<OrderDto?> GetOrderByIdAsync(int id);

        // Sipariş durumunu (Kargolandı, Teslim Edildi vb.) günceller
        Task UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto model);

        // EFT/Havale siparişleri için ödeme onayı fonksiyonu
        Task UpdatePaymentStatusAsync(int orderId, string paymentStatus);

        // Dashboard için aylık satış verilerini hazırlar
        Task<List<MonthlySalesDto>> GetMonthlySalesDataAsync();
    }
}
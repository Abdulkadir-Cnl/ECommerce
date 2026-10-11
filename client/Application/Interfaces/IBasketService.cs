using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IBasketService
    {
        // Sepeti Getir
        Task<BasketDto> GetBasketAsync(string userId);

        // Sepete Ürün Ekle
        Task AddItemToBasketAsync(string userId, int productId, int quantity);

        // Sepetten Ürün Sil
        Task RemoveItemFromBasketAsync(string userId, int productId);
    }
}
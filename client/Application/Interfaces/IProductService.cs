// Application/Interfaces/IProductService.cs (GÜNCELLENMİŞ)
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProductService
    {
        Task<List<ProductDto>> GetAllProductsAsync();
        Task<ProductDto> GetProductByIdAsync(int id);
        Task AddProductAsync(CreateProductDto model);
        Task DeleteProductAsync(int id);

        // YENİ: Ürün Güncelleme Metodu
        Task UpdateProductAsync(UpdateProductDto model);
    }
}
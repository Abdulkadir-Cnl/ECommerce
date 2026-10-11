using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Persistence; // Context için gerekli
using Microsoft.EntityFrameworkCore; // FindAsync için gerekli

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        // Resim güncelleme işlemi için Context'i ekliyoruz
        private readonly AppDbContext _context;

        public ProductController(IProductService productService, AppDbContext context)
        {
            _productService = productService;
            _context = context;
        }

        // HERKES GÖREBİLİR 
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        // HERKES GÖREBİLİR
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound(new { message = "Ürün bulunamadı!" });
            return Ok(product);
        }

        // SADECE "ADMİN" VEYA "SATICI" EKLEYEBİLİR
        [HttpPost]
        [Authorize(Roles = "Admin,Satıcı")]
        public async Task<IActionResult> AddProduct([FromBody] CreateProductDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _productService.AddProductAsync(model);
            return Ok(new { message = "Ürün başarıyla eklendi!" });
        }

        // YENİ: Ürün Resmi Güncelleme (ThemeEditor İçin Özel Endpoint)
        // Bu endpoint, AdminProductDetail.jsx'deki /theme/upload yerine kullanılabilir.
        [HttpPut("image/{id}")]
        //[Authorize(Roles = "Admin,Satıcı")] // Test ederken hata alırsan geçici kapatabilirsin
        public async Task<IActionResult> UpdateImage(int id, [FromForm] IFormFile File)
        {
            // Servis katmanını atlayıp direkt Context ile resmi güncelliyoruz (Hızlı Çözüm)
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Ürün bulunamadı");

            if (File != null && File.Length > 0)
            {
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/products");
                if (!Directory.Exists(path)) Directory.CreateDirectory(path);

                var fileName = Guid.NewGuid() + Path.GetExtension(File.FileName);
                using (var stream = new FileStream(Path.Combine(path, fileName), FileMode.Create))
                {
                    await File.CopyToAsync(stream);
                }

                // Senin Product.cs dosrandaki isim: 'ResimUrl'
                product.ResimUrl = "/uploads/products/" + fileName;

                await _context.SaveChangesAsync();

                // Frontend'in resmi tam yoldan çekebilmesi için güncel ürünü döndürüyoruz
                return Ok(product);
            }

            return BadRequest("Resim seçilmedi.");
        }

        // Ürün Güncelleme (Admin, Satıcı)
        [HttpPut]
        [Authorize(Roles = "Admin,Satıcı")]
        public async Task<IActionResult> UpdateProduct([FromBody] UpdateProductDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _productService.UpdateProductAsync(model);
                return Ok(new { message = $"Ürün (ID: {model.Id}) başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Soft Delete (Admin, Satıcı)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Satıcı")]
        public async Task<IActionResult> Delete(int id)
        {
            await _productService.DeleteProductAsync(id);
            return Ok(new { message = "Ürün başarıyla pasifleştirildi (Soft Delete)." });
        }
    }
}
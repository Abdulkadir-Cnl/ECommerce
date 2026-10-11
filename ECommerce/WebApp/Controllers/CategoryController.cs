using Microsoft.AspNetCore.Mvc;
using Infrastructure.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 TÜM KATEGORİLERİ GETİR
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Categories.ToListAsync());
        }

        // 🔹 DTO OLMADAN, DİREKT PARAMETRE İLE EKLEME (Sorunu Çözen Kısım)
        [HttpPost]
        // Swagger hatasını önlemek için parametreleri [FromForm] ile tek tek alıyoruz.
        // Veritabanında "Ad" olduğu için buradaki değişken adını da "Ad" yaptık.
        public async Task<IActionResult> Create([FromForm] string Ad, [FromForm] IFormFile? File)
        {
            // Yeni kategori nesnesi oluştur ve gelen Ad'ı ata
            var category = new Category
            {
                Ad = Ad
            };

            // Resim yükleme işlemi
            if (File != null && File.Length > 0)
            {
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/categories");

                // Klasör yoksa oluştur
                if (!Directory.Exists(path)) Directory.CreateDirectory(path);

                var fileName = Guid.NewGuid() + Path.GetExtension(File.FileName);
                var fullPath = Path.Combine(path, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await File.CopyToAsync(stream);
                }

                // Resim yolunu kaydet
                category.ImageUrl = "/uploads/categories/" + fileName;
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }
        // ==========================================
        // 🔹 GÜNCELLEME (RESİM EKLEME/DEĞİŞTİRME)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] string? Ad, [FromForm] IFormFile? File)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Kategori bulunamadı");

            // Eğer yeni isim geldiyse güncelle
            if (!string.IsNullOrEmpty(Ad))
            {
                category.Ad = Ad;
            }

            // Eğer yeni resim geldiyse yükle ve güncelle
            if (File != null && File.Length > 0)
            {
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/categories");
                if (!Directory.Exists(path)) Directory.CreateDirectory(path);

                var fileName = Guid.NewGuid() + Path.GetExtension(File.FileName);
                using (var stream = new FileStream(Path.Combine(path, fileName), FileMode.Create))
                {
                    await File.CopyToAsync(stream);
                }
                category.ImageUrl = "/uploads/categories/" + fileName;
            }

            await _context.SaveChangesAsync();
            return Ok(category);
        }
        // 🔹 SİLME İŞLEMİ
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Silindi" });
        }
    }
}
// ThemeController.cs

using Microsoft.AspNetCore.Mvc;
using Infrastructure.Persistence;
using Domain.Entities;
using System.Threading.Tasks; // async Task için gerekli
using System.IO; // Path için gerekli
using System; // DateTime için gerekli
using System.Linq; // FirstOrDefault için gerekli
using Microsoft.AspNetCore.Hosting; // IWebHostEnvironment için gerekli

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/theme")]
    public class ThemeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        // Constructor düzenlenmeli (Dependency Injection hatalarını önlemek için)
        public ThemeController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ===============================
        // 🔹 FOTO UPLOAD (ADMIN) (Aynı Kalır)
        // ===============================
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm(Name = "file")] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya gelmedi");

            var uploadPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "homepage"
            );

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(uploadPath, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return Ok(new
            {
                path = $"/uploads/homepage/{fileName}"
            });
        }

        // ===============================
        // 🔹 ADMIN KAYDEDER (GÜNCELLENDİ)
        // POST /api/theme/homepage
        // ===============================
        [HttpPost("homepage")]
        public async Task<IActionResult> SaveHomepage([FromBody] HomepageTheme model)
        {
            var existing = _context.HomepageThemes.FirstOrDefault();

            if (existing == null)
            {
                // Yeni kayıt
                model.UpdatedAt = DateTime.UtcNow;
                _context.HomepageThemes.Add(model);
            }
            else
            {
                // --- GÖRÜNÜRLÜK AYARLARI ---
                existing.ShowHeroSlider = model.ShowHeroSlider;
                existing.ShowCategories = model.ShowCategories;
                existing.ShowFeatured = model.ShowFeatured;
                existing.ShowKitchen = model.ShowKitchen;
                existing.ShowProducts = model.ShowProducts;
                existing.ShowShowcase = model.ShowShowcase;
                existing.ShowBottomShowcase = model.ShowBottomShowcase;

                // --- İÇERİK VERİLERİ (JSON) ---
                existing.HeroSliderImages = model.HeroSliderImages;
                existing.KitchenMedia = model.KitchenMedia;
                existing.HomepageCategoryIds = model.HomepageCategoryIds;
                existing.FeaturedProductIds = model.FeaturedProductIds;
                existing.ShowcaseCategoryIds = model.ShowcaseCategoryIds;
                existing.BottomShowcaseCategoryIds = model.BottomShowcaseCategoryIds;
                existing.HeroMarqueeText = model.HeroMarqueeText;

                // ✅ YENİ EKLENEN VİTRİN ALANLARI
                existing.ShowcaseItems = model.ShowcaseItems;
                existing.BottomShowcaseItems = model.BottomShowcaseItems;

                // --- LOGO VE FOOTER ---
                existing.LogoUrl = model.LogoUrl;
                existing.SavedLogos = model.SavedLogos;
                existing.FooterData = model.FooterData;
                existing.CustomPages = model.CustomPages;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }


        // ===============================
        // 🔹 CLIENT OKUR (GÜNCELLENDİ)
        // GET /api/theme/homepage
        // ===============================
        [HttpGet("homepage")]
        public IActionResult GetHomepage()
        {
            var theme = _context.HomepageThemes.FirstOrDefault();

            if (theme == null)
            {
                // Yeni HomePageTheme objesi dönerken yeni alanları da ekle
                return Ok(new HomepageTheme
                {
                    ShowHeroSlider = true,
                    ShowCategories = true,
                    ShowFeatured = true,
                    ShowKitchen = true,
                    ShowProducts = true,
                    ShowShowcase = true,
                    ShowBottomShowcase = true,
                    HeroSliderImages = "[]",
                    KitchenMedia = "[]",
                    HomepageCategoryIds = "[]",
                    FeaturedProductIds = "[]",
                    ShowcaseCategoryIds = "[]",
                    BottomShowcaseCategoryIds = "[]",
                    // ✅ YENİ ALANLAR DEFAULT BOŞ OLSUN
                    ShowcaseItems = "[]",
                    BottomShowcaseItems = "[]",
                    UpdatedAt = DateTime.UtcNow
                });
            }

            return Ok(theme);
        }
    }
}
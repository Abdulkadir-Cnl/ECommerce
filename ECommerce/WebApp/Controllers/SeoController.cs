using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/seo")]
    public class SeoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeoController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/seo/product/1
        [HttpGet("product/{id}")]
        public async Task<IActionResult> GetProductSeo(int id)
        {
            var seo = await _context.SeoSettings
    .AsNoTracking()
    .FirstOrDefaultAsync(x =>
        x.PageType.ToLower() == "product" &&
        x.EntityId == id.ToString());

            if (seo == null)
            {
                // ❗ SEO yoksa 404 yerine boş SEO dön
                return Ok(new
                {
                    title = "",
                    description = "",
                    keywords = ""
                });
            }

            return Ok(new
            {
                title = seo.Title,
                description = seo.Description,
                keywords = seo.Keywords
            });
        }
    }
}

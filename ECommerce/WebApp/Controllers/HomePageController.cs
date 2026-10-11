using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Domain.Entities;
using System.Threading.Tasks;
using System.Linq;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/homepage-sections")]
    public class HomePageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HomePageController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/homepage-sections
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sections = await _context.HomePageSections
                .OrderBy(x => x.Order)
                .ToListAsync();

            return Ok(sections);
        }

        // POST: /api/homepage-sections/{id}/toggle
        [HttpPost("{id}/toggle")]
        public async Task<IActionResult> Toggle(int id)
        {
            var section = await _context.HomePageSections
                .FirstOrDefaultAsync(x => x.Id == id);

            if (section == null)
                return NotFound();

            section.IsActive = !section.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                section.Id,
                section.IsActive
            });
        }
    }
}

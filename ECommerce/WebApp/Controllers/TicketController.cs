using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Application.DTOs;
using Infrastructure.Persistence;
using System.Security.Claims;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        // Yardımcı Metot: Güvenli UserID Alma
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst("sub")?.Value
                   ?? User.FindFirst("id")?.Value;
        }

        // ✔ KULLANICI TICKET OLUŞTURUR
        [HttpPost]
        public async Task<IActionResult> CreateTicket(CreateTicketDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return BadRequest(new { message = "Kullanıcı kimliği alınamadı." });

                var ticket = new Ticket
                {
                    UserId = userId,
                    Subject = dto.Subject,
                    Message = dto.Message,
                    Status = "Açık",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Talep oluşturuldu.", id = ticket.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Hata oluştu.", error = ex.Message });
            }
        }

        // ✔ KULLANICININ TÜM TICKETLERİ (DÜZELTİLDİ)
        [HttpGet]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = GetCurrentUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var tickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    Subject = t.Subject,
                    Message = t.Message,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // ✔ ADMIN: TÜM TICKETLERİ LİSTELE
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminGetAllTickets()
        {
            var tickets = await _context.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    Subject = t.Subject,
                    Message = t.Message,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // ✔ ADMIN: TICKET MESAJLARI
        [HttpGet("{id}/messages")]
        public async Task<IActionResult> GetMessages(int id)
        {
            var messages = await _context.TicketMessages
                .Where(m => m.TicketId == id)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new TicketMessageDto
                {
                    Id = m.Id,
                    Sender = m.Sender,
                    Text = m.Text,
                    Date = m.CreatedAt
                })
                .ToListAsync();

            return Ok(messages);
        }

        // ✔ ADMIN: CEVAP YAZ
        [HttpPost("{id}/reply")]
        [Authorize] // Roles = "Admin" kısıtlamasını kaldırdık, içeride kontrol edeceğiz
        public async Task<IActionResult> ReplyToTicket(int id, TicketReplyRequestDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var currentUserId = GetCurrentUserId(); // Class içindeki yardımcı metodunu kullanıyor
            string senderType = "user";

            // KİMLİK KONTROLÜ
            if (User.IsInRole("Admin"))
            {
                senderType = "admin";
            }
            else
            {
                // Admin değilse, ticket bu kullanıcıya mı ait?
                if (ticket.UserId != currentUserId)
                    return Unauthorized(new { message = "Bu talebe cevap verme yetkiniz yok." });

                senderType = "user";
            }

            // Ticket kapalıysa ve kullanıcı yazıyorsa tekrar "Açık" yapalım
            if (ticket.Status == "Kapandı" && senderType == "user")
            {
                ticket.Status = "Açık";
            }

            var message = new TicketMessage
            {
                TicketId = id,
                Sender = senderType,
                Text = dto.Text,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mesaj gönderildi." });
        }

        // ✔ ADMIN: TICKET KAPAT
        [HttpPut("{id}/close")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CloseTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            ticket.Status = "Kapandı";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Talep kapatıldı." });
        }
    }
}
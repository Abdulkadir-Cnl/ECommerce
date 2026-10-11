using Microsoft.AspNetCore.Mvc;
using Infrastructure.Services;
using Application.DTOs.Payment;
using Infrastructure.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly PaytrService _paytrService;
        private readonly AppDbContext _context;

        public PaymentController(PaytrService paytrService, AppDbContext context)
        {
            _paytrService = paytrService;
            _context = context;
        }

        // Ödeme Sayfası İçin Token Al (Frontend bu API'yi çağırır)
        [HttpPost("paytr-token")]
        public async Task<IActionResult> GetPaytrToken([FromBody] CreatePaytrTokenDto dto)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Include(o => o.ShippingAddress)
                    .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

                if (order == null) return NotFound("Sipariş bulunamadı.");

                var paytrRequest = new PaytrTokenRequest
                {
                    OrderId = order.Id,
                    MerchantOrderId = "ORD" + order.Id.ToString() + "_" + DateTime.Now.Ticks, // Benzersiz ID
                    Email = order.CustomerEmail,
                    Amount = order.TotalPrice,
                    UserName = order.CustomerName,
                    UserPhone = order.CustomerPhoneNumber,
                    UserIp = dto.UserIp,
                    UserAddress = order.ShippingAddress?.Street ?? "Adres Bilgisi Yok",
                    SuccessUrl = "https://localhost:7011/payment/success",
                    FailUrl = "https://localhost:7011/payment/fail",
                    Basket = order.OrderItems.Select(i => new PaytrBasketItemDto
                    {
                        Name = i.ProductName,
                        Price = i.Price,
                        Quantity = i.Quantity
                    }).ToList()
                };

                var token = await _paytrService.GetPaytrTokenAsync(paytrRequest);
                return Ok(new { success = true, token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // PayTR Bildirim URL (PayTR sunucuları bu API'yi çağırır)
        [HttpPost("paytr-callback")]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> PaytrCallback([FromForm] PaytrCallbackDto dto)
        {
            var paytr = await _context.PaymentMethods.FirstOrDefaultAsync(x => x.Key == "paytr");
            if (paytr == null) return Ok("OK");

            // Güvenlik Kontrolü: Hash Doğrulama
            if (!_paytrService.ValidateCallbackHash(dto, paytr.ApiKey, paytr.ApiSecret))
            {
                return Ok("PAYTR notification failed: bad hash");
            }

            // MerchantOrderId içinden OrderId'yi ayıkla (Eğer prefix kullandıysanız)
            // Örnekte "ORD123_ticks" yapısı kullanıldığı için split gerekebilir:
            var orderIdStr = dto.merchant_oid.Replace("ORD", "").Split('_')[0];

            if (int.TryParse(orderIdStr, out int orderId))
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    // Daha önce işlenmiş mi kontrol et (bildirim_url_ornek.aspx.cs Not 3)
                    if (order.PaymentStatus == "Ödendi") return Ok("OK");

                    if (dto.status == "success")
                    {
                        order.PaymentStatus = "Ödendi";
                        order.OrderStatus = "Hazırlanıyor";
                    }
                    else
                    {
                        order.PaymentStatus = "Başarısız";
                        // Başarısızlık nedeni loglanabilir: dto.failed_reason_msg
                    }
                    await _context.SaveChangesAsync();
                }
            }

            // PayTR sistemine işlemin alındığı bilgisi verilir
            return Ok("OK");
        }
    }
}
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Globalization;
using Application.DTOs.Payment;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class PaytrService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;

        public PaytrService(AppDbContext context)
        {
            _context = context;
            _httpClient = new HttpClient();
        }

        // 1. ADIM: PayTR'dan Ödeme Sayfası (iframe) için Token Alır
        public async Task<string> GetPaytrTokenAsync(PaytrTokenRequest request)
        {
            var settings = await _context.PaymentMethods
                .FirstOrDefaultAsync(m => m.Key == "paytr" && m.IsActive);

            if (settings == null) throw new Exception("PayTR ödeme yöntemi aktif değil.");

            var merchantId = settings.ApiId;
            var merchantKey = settings.ApiKey;
            var merchantSalt = settings.ApiSecret;
            var testMode = settings.IsTestMode ? "1" : "0";

            // Tutar kuruşa çevrilir (9.99 -> 999)
            int paymentAmount = (int)(request.Amount * 100);

            // Sepet (Basket) Hazırlama - aspx örneğindeki mantıkla aynı
            var basketItems = request.Basket.Select(item => new object[]
            {
                item.Name,
                item.Price.ToString("0.00", CultureInfo.InvariantCulture),
                item.Quantity
            }).ToList();

            var basketJson = JsonSerializer.Serialize(basketItems);
            var basketBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(basketJson));

            // Token oluşturulurken kullanılacak birleşik string (iframe_ornek.aspx.cs satır 119'daki sıra)
            string hashStr = merchantId + request.UserIp + request.MerchantOrderId + request.Email +
                             paymentAmount.ToString() + basketBase64 + "0" + "0" + "TL" + testMode + merchantSalt;

            string token = GenerateHash(hashStr, merchantKey);

            var postData = new Dictionary<string, string>
            {
                ["merchant_id"] = merchantId,
                ["user_ip"] = request.UserIp,
                ["merchant_oid"] = request.MerchantOrderId,
                ["email"] = request.Email,
                ["payment_amount"] = paymentAmount.ToString(),
                ["paytr_token"] = token,
                ["user_basket"] = basketBase64,
                ["debug_on"] = "1",
                ["test_mode"] = testMode,
                ["no_installment"] = "0",
                ["max_installment"] = "0",
                ["user_name"] = request.UserName,
                ["user_address"] = request.UserAddress,
                ["user_phone"] = request.UserPhone,
                ["merchant_ok_url"] = request.SuccessUrl,
                ["merchant_fail_url"] = request.FailUrl,
                ["timeout_limit"] = "30",
                ["currency"] = "TL"
            };

            var response = await _httpClient.PostAsync("https://www.paytr.com/odeme/api/get-token", new FormUrlEncodedContent(postData));
            var result = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(result).RootElement;

            if (json.GetProperty("status").GetString() != "success")
                throw new Exception("PayTR Hatası: " + json.GetProperty("reason").GetString());

            return json.GetProperty("token").GetString();
        }

        // 2. ADIM Yardımcısı: Gelen callback hash'ini doğrular (bildirim_url_ornek.aspx.cs satır 42)
        public bool ValidateCallbackHash(PaytrCallbackDto dto, string merchantKey, string merchantSalt)
        {
            string hashCombined = dto.merchant_oid + merchantSalt + dto.status + dto.total_amount;
            string calculatedHash = GenerateHash(hashCombined, merchantKey);
            return calculatedHash == dto.hash;
        }

        // Ortak Hash Oluşturma Fonksiyonu
        private string GenerateHash(string baseString, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var b = hmac.ComputeHash(Encoding.UTF8.GetBytes(baseString));
            return Convert.ToBase64String(b);
        }
    }
}
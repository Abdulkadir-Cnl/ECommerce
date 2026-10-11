// Application/DTOs/CheckoutRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CheckoutRequestDto
    {
        // KAPSAMLI SİPARİŞ OLUŞTURMA İÇİN GEREKLİ BİLGİLER

        [Required]
        // Gönderim Adresi Bilgisi (AddressDto daha önce tanımlanmıştı)
        public AddressDto ShippingAddress { get; set; }

        [Required]
        [MinLength(3)]
        public string PaymentMethod { get; set; } // Örn: "Kredi Kartı", "Kapıda Ödeme"

        // Not: Eğer farklı fatura adresi gerekiyorsa, BillingAddress de buraya eklenebilir.
    }
}
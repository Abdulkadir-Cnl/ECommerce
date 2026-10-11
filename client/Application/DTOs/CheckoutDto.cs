// Application/DTOs/CheckoutDto.cs (GÜNCELLENMİŞ)
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class CheckoutDto
    {
        // MÜŞTERİ BİLGİLERİ (Zorunlu)
        [Required] public string CustomerName { get; set; }
        [Required] public string CustomerEmail { get; set; }
        public string? CustomerPhoneNumber { get; set; }

        // KRİTİK ADRES ALANLARI
        [Required]
        public AddressDto ShippingAddress { get; set; } // Gönderim Adresi

        [Required]
        public AddressDto BillingAddress { get; set; } // Fatura Adresi

        [Required]
        [MinLength(3)]
        public string PaymentMethod { get; set; } // Örn: "Kredi Kartı", "Kapıda Ödeme"

        // Kart Bilgileri (Iyzico'ya gönderilecek)
        public string CardHolderName { get; set; }
        public string CardNumber { get; set; }
        public string ExpireMonth { get; set; }
        public string ExpireYear { get; set; }
        public string Cvc { get; set; }
        public bool IsCorporate { get; set; }
        public string? CompanyName { get; set; }
        public string? TaxOffice { get; set; }
        public string? TaxNumber { get; set; }

        // Misafir sepetindeki ürünler buraya gelecek
        public List<BasketItemDto> Items { get; set; } = new List<BasketItemDto>();
    }
}
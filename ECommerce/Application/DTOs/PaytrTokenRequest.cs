using System.Collections.Generic;

namespace Application.DTOs.Payment
{
    public class PaytrTokenRequest
    {
        public int OrderId { get; set; }               // DB Order Id
        public string MerchantOrderId { get; set; }    // PAYTR için benzersiz
        public string Email { get; set; }
        public decimal Amount { get; set; }            // TL
        public string UserName { get; set; }
        public string UserAddress { get; set; }
        public string UserPhone { get; set; }
        public string UserIp { get; set; }
        public string SuccessUrl { get; set; }
        public string FailUrl { get; set; }

        public List<PaytrBasketItemDto> Basket { get; set; }
    }
}

namespace Application.DTOs.Payment
{
    public class PaytrCallbackDto
    {
        public string merchant_oid { get; set; }
        public string status { get; set; }
        public string total_amount { get; set; }
        public string hash { get; set; }
        public string? failed_reason_code { get; set; }
        public string? failed_reason_msg { get; set; }
    }
}
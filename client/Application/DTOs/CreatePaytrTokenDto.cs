namespace Application.DTOs.Payment
{
    public class CreatePaytrTokenDto
    {
        public int OrderId { get; set; }
        public string UserIp { get; set; }
    }
}
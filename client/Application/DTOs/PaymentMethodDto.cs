namespace Application.DTOs.Payment
{
    public class UpdatePaymentMethodDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string AdjustmentType { get; set; }
        public decimal AdjustmentValue { get; set; }

        // PayTR Alanları
        public string ApiId { get; set; }
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }
        public bool IsTestMode { get; set; }
    }
}
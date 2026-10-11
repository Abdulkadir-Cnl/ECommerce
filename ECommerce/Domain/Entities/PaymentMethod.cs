using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    public class PaymentMethod
    {
        [Key]
        public int Id { get; set; }
        public string Key { get; set; } // "havale" veya "paytr"
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Havale için fiyat değişimi
        public string AdjustmentType { get; set; } = "none";
        public decimal AdjustmentValue { get; set; } = 0;

        // --- YENİ EKLENEN PAYTR ALANLARI ---
        public string? ApiId { get; set; }      // Merchant Id
        public string? ApiKey { get; set; }     // Merchant Key
        public string? ApiSecret { get; set; }  // Merchant Salt
        public bool IsTestMode { get; set; } = false;
    }
}
using Domain.Entities;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Order
    {
        public int Id { get; set; } //
        public string? AppUserId { get; set; } //
        public DateTime OrderDate { get; set; } = DateTime.UtcNow; //
        public decimal TotalPrice { get; set; } //
        public string OrderStatus { get; set; } //
        public string PaymentStatus { get; set; } //
        public string? PaymentMethod { get; set; } //
        public string CustomerName { get; set; } //
        public string CustomerEmail { get; set; } //
        public string? CustomerPhoneNumber { get; set; } //

        // Kurumsal Alanlar
        public bool IsCorporate { get; set; } //
        public string? CompanyName { get; set; } //
        public string? TaxOffice { get; set; } //
        public string? TaxNumber { get; set; } //

        // ❌ HATA: Burada AddressDto kullanmayın, Address entity'sini kullanın
        public Address ShippingAddress { get; set; } //
        public Address BillingAddress { get; set; } //

        // ❌ HATA: Burada OrderItemDto kullanmayın, OrderItem entity'sini kullanın
        public ICollection<OrderItem> OrderItems { get; set; } //
    }
}
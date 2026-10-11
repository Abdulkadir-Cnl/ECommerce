using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; } //
        public string? UserId { get; set; } //
        public DateTime OrderDate { get; set; } //
        public decimal TotalPrice { get; set; } //
        public string OrderStatus { get; set; } //
        public string PaymentStatus { get; set; } //
        public string CustomerName { get; set; } //
        public string CustomerEmail { get; set; } //
        public string? CustomerPhoneNumber { get; set; } //

        // 🔥 CS0117 hatalarını gideren eksik kurumsal ve ödeme alanları
        public string? PaymentMethod { get; set; } //
        public bool IsCorporate { get; set; } //
        public string? CompanyName { get; set; } //
        public string? TaxOffice { get; set; } //
        public string? TaxNumber { get; set; } //

        public AddressDto? ShippingAddress { get; set; } //
        public AddressDto? BillingAddress { get; set; } //
        public List<OrderItemDto> OrderItems { get; set; } = new(); //
    }
}
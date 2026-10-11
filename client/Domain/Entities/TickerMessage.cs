using System;

namespace Domain.Entities
{
    public class TicketMessage
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public Ticket Ticket { get; set; }

        public string Sender { get; set; } // "user" | "admin"
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

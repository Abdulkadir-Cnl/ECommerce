using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Basket
    {
        public int Id { get; set; }

        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

        public bool IsOrdered { get; set; } = false;
        public DateTime? LastModifiedDate { get; set; }

        public List<BasketItem> Items { get; set; } = new();
    }
}

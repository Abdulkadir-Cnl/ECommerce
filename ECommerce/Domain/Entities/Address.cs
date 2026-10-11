namespace Domain.Entities
{
    public class Address
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }

        // Misafir siparişler için NULL olabilir
        public string? AppUserId { get; set; }
        public AppUser? AppUser { get; set; }
    }
}

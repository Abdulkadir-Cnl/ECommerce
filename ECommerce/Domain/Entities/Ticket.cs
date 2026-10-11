using Domain.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public AppUser User { get; set; }

    public string Subject { get; set; }
    public string Message { get; set; }

    public string Status { get; set; } = "Açık";  // Açık - Yanıtlandı - Kapandı

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

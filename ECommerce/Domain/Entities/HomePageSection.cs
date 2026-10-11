public class HomePageSection
{
    public int Id { get; set; }
    public string Type { get; set; } = null!;
    public string? Title { get; set; }
    public bool IsActive { get; set; } = true;
    public int Order { get; set; }
    public string? Settings { get; set; } // JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ImageUrl { get; set; }
}

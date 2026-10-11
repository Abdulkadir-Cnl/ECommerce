public class SeoDto
{
    public string PageType { get; set; } = null!;
    public int EntityId { get; set; }

    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Canonical { get; set; }
    public string? OgImage { get; set; }
}

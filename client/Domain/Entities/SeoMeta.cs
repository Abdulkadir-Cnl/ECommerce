public class SeoMeta
{
    public int Id { get; set; }

    public string PageType { get; set; } = null!; // "product"
    public int EntityId { get; set; }              // ProductId

    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Canonical { get; set; }
    public string? OgImage { get; set; }
}

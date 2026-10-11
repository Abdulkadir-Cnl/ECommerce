using System;

public class HomepageTheme
{
    public int Id { get; set; }

    // Bölüm açık / kapalı
    public bool ShowHeroSlider { get; set; }
    public bool ShowCategories { get; set; }
    public bool ShowFeatured { get; set; }
    public string? HeroMarqueeText { get; set; } = "";
    public bool ShowKitchen { get; set; }

    // ✅ EKLENDİ – Frontend ThemeEditor & App.jsx bunu kullanıyor
    public bool ShowProducts { get; set; }

    // İçerikler (JSON string)
    public string HeroSliderImages { get; set; } = "[]";
    public string KitchenMedia { get; set; } = "[]";

    public string? HomepageCategoryIds { get; set; } = "[]";
    public string? FeaturedProductIds { get; set; } = "[]";
    public string? HomepageProductIds { get; set; } = "[]";
    public bool ShowShowcase { get; set; } = true; // Vitrin (3'lü Kart) Bölümü
    public string ShowcaseCategoryIds { get; set; } = "[]";
    public bool ShowBottomShowcase { get; set; } = true;
    public string BottomShowcaseCategoryIds { get; set; } = "[]";
    public string BottomShowcaseItems { get; set; } = "[]";
    public string ShowcaseItems { get; set; } = "[]";
    public string LogoUrl { get; set; } = "";
    public string SavedLogos { get; set; } = "[]";
    public string FooterData { get; set; } = "[]";
    public string CustomPages { get; set; } = "[]";

    public DateTime UpdatedAt { get; set; }
}

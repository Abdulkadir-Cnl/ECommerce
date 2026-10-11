// Infrastructure/Persistence/AppDbContext.cs (GÜNCELLENMİŞ)
using Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<BasketItem> BasketItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<SellerRequest> SellerRequests { get; set; }

        // YENİ: Adres Varlığı
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketMessage> TicketMessages { get; set; }
        public DbSet<SeoSetting> SeoSettings { get; set; }
        public DbSet<SeoMeta> SeoMetas { get; set; }
        public DbSet<HomePageSection> HomePageSections { get; set; }
        public DbSet<HomepageTheme> HomepageThemes { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }

    }
}
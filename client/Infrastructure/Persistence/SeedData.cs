// Infrastructure/Persistence/SeedData.cs

using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Persistence
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<AppDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            try
            {
                // Adım 1: ROLLERİ OLUŞTUR
                string[] roles = { "Admin", "Satıcı", "Müşteri" };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole(role));
                        Console.WriteLine($"[SEED] Rol oluşturuldu: {role}");
                    }
                }

                // Adım 2: ADMİN KULLANICISI (KRİTİK HATA YAKALAMA)
                var adminEmail = "admin@basyazici.com";
                if (await userManager.FindByEmailAsync(adminEmail) == null)
                {
                    var adminUser = new AppUser
                    {
                        // DÜZELTME: UserName alanındaki boşluk kaldırıldı
                        UserName = "SuperAdmin", // 'SüperAdmin' yerine 'SuperAdmin' kullanın
                        Email = adminEmail,
                        AdSoyad = "Sistem Yöneticisi",
                        SecurityStamp = Guid.NewGuid().ToString(),
                        EmailConfirmed = true
                    };

                    // Şifre: Admin123!
                    var createResult = await userManager.CreateAsync(adminUser, "Admin123!");

                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        Console.WriteLine("[SEED] Admin kullanıcısı başarıyla oluşturuldu ve rol atandı.");
                    }
                    else
                    {
                        // KRİTİK: Eğer kullanıcı oluşturma başarısız olursa, nedenini konsola yazdır.
                        Console.WriteLine($"[SEED HATA] Admin oluşturulamadı: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                        // Kullanıcı oluşturulamazsa, Admin yetkisi yok demektir.
                    }
                }

                // Adım 3: SATICI KULLANICISI
                var saticiEmail = "satici@basyazici.com";
                if (await userManager.FindByEmailAsync(saticiEmail) == null)
                {
                    var saticiUser = new AppUser
                    {
                        UserName = "BasYaziciSatici",
                        Email = saticiEmail,
                        AdSoyad = "Ahmet Başyazıcı",
                        SecurityStamp = Guid.NewGuid().ToString(),
                        EmailConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(saticiUser, "Satici123!");
                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(saticiUser, "Satıcı");
                        await userManager.AddToRoleAsync(saticiUser, "Müşteri");
                        Console.WriteLine("[SEED] Satıcı kullanıcısı oluşturuldu.");
                    }
                }

                // Adım 4: KATEGORİ VE ÜRÜNLER
                if (!context.Products.Any())
                {
                    var sucukCategory = new Category { Ad = "Sucuk" };
                    var pastirmaCategory = new Category { Ad = "Pastırma" };

                    context.Categories.AddRange(sucukCategory, pastirmaCategory);
                    await context.SaveChangesAsync();
                    Console.WriteLine("[SEED] Kategoriler kaydedildi.");

                    context.Products.AddRange(
                        new Product
                        {
                            Ad = "Başyazıcı Kasap Kangal Sucuk",
                            Aciklama = "Seed data ürünü: %100 Dana eti, Geleneksel tat.",
                            Fiyat = 490.00m,
                            Stok = 100,
                            CategoryId = sucukCategory.Id,
                            ResimUrl = "https://picsum.photos/id/10/200/300",
                            IsActive = true
                        },
                        // --- İŞTE YENİ EKLEDİĞİMİZ 800 TL'LİK ÜRÜN ---
                        new Product
                        {
                            Ad = "Başyazıcı Özel Fermente Sucuk", // İsim uydurdum
                            Aciklama = "Yeni eklenen özel seri sucuk, geleneksel yöntemlerle kurutulmuş.",
                            Fiyat = 800.00m, // İstediğin fiyat
                            Stok = 50,
                            CategoryId = sucukCategory.Id, // Sucuk kategorisine bağladık
                            ResimUrl = "https://picsum.photos/id/15/200/300",
                            IsActive = true
                        },
                        // ---------------------------------------------
                        new Product
                        {
                            Ad = "Özel Serisi Pastırma",
                            Aciklama = "Seed data ürünü: Özel dinlendirilmiş.",
                            Fiyat = 750.00m,
                            Stok = 50,
                            CategoryId = pastirmaCategory.Id,
                            ResimUrl = "https://picsum.photos/id/20/200/300",
                            IsActive = true
                        }
                    );
                    await context.SaveChangesAsync();
                    Console.WriteLine("[SEED] Ürünler kaydedildi.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SEED KRİTİK HATA] Seed Data çalışırken beklenmedik bir hata oluştu: {ex.Message}");
                Console.WriteLine($"[SEED KRİTİK HATA] İç Hata: {ex.InnerException?.Message}");
            }
        }
    }
}
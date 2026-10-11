using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Infrastructure.Services
{
    public class BasketService : IBasketService
    {
        private readonly AppDbContext _context;

        public BasketService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BasketDto> GetBasketAsync(string userId)
        {
            var basket = await _context.Baskets
                .Include(b => b.Items)
                .ThenInclude(i => i.Product) // 🔴 FOTO BURADAN
                .FirstOrDefaultAsync(b => b.AppUserId == userId && !b.IsOrdered);

            if (basket == null)
            {
                basket = new Basket
                {
                    AppUserId = userId,
                    IsOrdered = false,
                    LastModifiedDate = DateTime.UtcNow
                };

                _context.Baskets.Add(basket);
                await _context.SaveChangesAsync();

                return new BasketDto();
            }

            var dto = new BasketDto
            {
                Id = basket.Id,
                Items = basket.Items.Select(i => new BasketItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Ad,
                    Price = i.Product?.Fiyat ?? 0,
                    Quantity = i.Quantity,
                    ResimUrl = i.Product?.ResimUrl != null
    ? $"https://localhost:7011/{i.Product.ResimUrl}"
    : null // 🔥 FOTO
                }).ToList()
            };

            dto.TotalPrice = dto.Items.Sum(x => x.Price * x.Quantity);
            return dto;
        }

        public async Task AddItemToBasketAsync(string userId, int productId, int quantity)
        {
            var basket = await _context.Baskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.AppUserId == userId && !b.IsOrdered);

            if (basket == null)
            {
                basket = new Basket
                {
                    AppUserId = userId,
                    IsOrdered = false
                };
                _context.Baskets.Add(basket);
            }

            basket.LastModifiedDate = DateTime.UtcNow;

            var item = basket.Items.FirstOrDefault(x => x.ProductId == productId);
            if (item != null)
            {
                item.Quantity += quantity;
            }
            else
            {
                basket.Items.Add(new BasketItem
                {
                    ProductId = productId,
                    Quantity = quantity
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveItemFromBasketAsync(string userId, int productId)
        {
            var basket = await _context.Baskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.AppUserId == userId && !b.IsOrdered);

            if (basket == null) return;

            var item = basket.Items.FirstOrDefault(x => x.ProductId == productId);
            if (item != null)
            {
                basket.Items.Remove(item);
                basket.LastModifiedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}

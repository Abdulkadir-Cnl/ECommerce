using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Infrastructure.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        // TÜM ÜRÜNLERİ GETİR (Sadece aktif olanları listeler)
        public async Task<List<ProductDto>> GetAllProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive) // Soft Delete Kontrolü
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Ad = p.Ad,
                    Aciklama = p.Aciklama,
                    Fiyat = p.Fiyat,
                    Stok = p.Stok,
                    ResimUrl = p.ResimUrl,
                    // KRİTİK GÜVENLİK: İlişki null ise patlamasını engeller.
                    KategoriAdi = p.Category != null ? p.Category.Ad : "Tanımsız"
                })
                .ToListAsync();

            return products;
        }

        // TEK ÜRÜN GETİR
        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive); // Aktif kontrolü

            if (product == null) return null;

            return new ProductDto
            {
                Id = product.Id,
                Ad = product.Ad,
                Aciklama = product.Aciklama,
                Fiyat = product.Fiyat,
                Stok = product.Stok,
                ResimUrl = product.ResimUrl,
                // KRİTİK GÜVENLİK
                KategoriAdi = product.Category != null ? product.Category.Ad : "Tanımsız"
            };
        }

        // ÜRÜN EKLE
        public async Task AddProductAsync(CreateProductDto model)
        {
            var product = new Product
            {
                Ad = model.Ad,
                Aciklama = model.Aciklama,
                Fiyat = model.Fiyat,
                Stok = model.Stok,
                ResimUrl = model.ResimUrl,
                CategoryId = model.CategoryId,
                IsActive = true // Varsayılan aktif
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
        }

        // ÜRÜN GÜNCELLE
        public async Task UpdateProductAsync(UpdateProductDto model)
        {
            var product = await _context.Products.FindAsync(model.Id);

            if (product == null)
                throw new Exception("Güncellenecek ürün bulunamadı.");

            // YALNIZCA DTO'DA DEĞERİ OLAN ALANLARI GÜNCELLE
            if (model.Ad != null) product.Ad = model.Ad;
            if (model.Aciklama != null) product.Aciklama = model.Aciklama;
            if (model.Fiyat.HasValue) product.Fiyat = model.Fiyat.Value;
            if (model.Stok.HasValue) product.Stok = model.Stok.Value;
            if (model.ResimUrl != null) product.ResimUrl = model.ResimUrl;
            if (model.CategoryId.HasValue) product.CategoryId = model.CategoryId.Value;

            // Soft Delete/Aktiflik Güncellemesi
            if (model.IsActive.HasValue) product.IsActive = model.IsActive.Value;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        // SOFT DELETE: Ürünü pasifleştirir.
        public async Task DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product != null)
            {
                product.IsActive = false; // Soft Delete Uygulaması
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
            }
        }
    }
}
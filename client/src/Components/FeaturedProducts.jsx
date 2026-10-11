import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard'; 

import 'swiper/css';
import 'swiper/css/navigation';

function FeaturedProducts({ allProducts = [], selectedIds = "[]" }) {
  
  let orderedIds = [];
  try { 
      // Admin panelinden seçilen ID'leri alıyoruz
      orderedIds = JSON.parse(selectedIds || "[]").map(id => Number(id)); 
  } catch (e) { 
      orderedIds = []; 
  }

  // Seçilen ID'lere karşılık gelen ürünleri allProducts içinden buluyoruz ve sadece ilk 12 tanesini alıyoruz.
  const displayList = orderedIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) // Bulunamayan (null/undefined) ürünleri atla
    .slice(0, 12); // Maksimum 12 ürün göster

  if (displayList.length === 0) return null;

  return (
    <div className="w-full mt-6 select-none">
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-red-700 pl-3">
          Öne Çıkanlar
        </h2>
        <span className="text-xs text-gray-500 cursor-pointer hover:text-red-700">Tümünü Gör &rarr;</span>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={true} 
        spaceBetween={10} 
        
        // ✅ SÜREKLİ DÖNME AYARI: Gösterilen ürün sayısı, slayt başına düşen maksimum ürün sayısından (5) fazlaysa döngü (loop) aktif olur.
        // Bu, listenin yeterince uzun olması durumunda sürekli dönmesini sağlar.
        loop={displayList.length > 5} 
        
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="px-1 py-2"
      >
        {displayList.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default FeaturedProducts;
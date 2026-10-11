// src/Components/ProductCard.jsx

import { Link } from 'react-router-dom';
import { FaShoppingBasket } from 'react-icons/fa';
import { useBasket } from '../Context/BasketContext'; 

// ---------------------------------------------------------------------------
// 🔥 EKLENDİ: API Temel URL'si
// Sunucunuzun çalıştığı adresi kullanın
const API_BASE_URL = "https://localhost:7011"; 
// ---------------------------------------------------------------------------

function ProductCard({ product }) {
  const { addToBasket } = useBasket(); 
  
  // 🔥 YENİ FONKSİYON: Göreceli yolu tam URL'ye çevirir
  const getFullImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300?text=Resim+Yok'; 
    if (path.startsWith("http")) return path; 
    
    // API adresi + dosya yolu
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };


  const handleAddToBasket = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToBasket(product, 1);
  };

  const isDiscounted = product.id % 2 === 0; 
  const oldPrice = isDiscounted ? product.fiyat * 1.2 : null;
  
  // 🔥 DÜZELTME: Artık tam URL'yi kullanıyoruz
  const finalImageUrl = getFullImageUrl(product.resimUrl); 

  return (
    <div className="group relative bg-white w-full h-full rounded border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* --- RESİM ALANI --- */}
      <Link to={`/product/${product.id}`} className="relative block h-28 sm:h-36 overflow-hidden cursor-pointer bg-white">
        <img 
          src={finalImageUrl} // DÜZELTİLDİ: Tam URL kullanıldı
          alt={product.ad} 
          className="w-full h-full object-contain p-1.5 transform transition-transform duration-500 group-hover:scale-105"
        />
        {isDiscounted && (
          <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-sm shadow-sm">%20</span>
        )}
      </Link>
      
      {/* --- BİLGİ ALANI --- */}
      <div className="p-2 flex flex-col flex-1 text-center sm:text-left">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-gray-800 font-bold text-xs leading-tight mb-1 line-clamp-2 hover:text-red-600 transition-colors min-h-[2rem]">
            {product.ad}
          </h3>
        </Link>
        
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col items-center sm:items-start mb-2">
              {oldPrice && (
                <span className="text-[9px] text-gray-400 line-through">
                  {oldPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              )}
              <span className="text-sm font-bold text-red-700">
                {product.fiyat.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
          </div>

          <button 
              onClick={handleAddToBasket} 
              className="w-full bg-gray-100 text-gray-800 text-[10px] font-bold py-1.5 rounded hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
            >
              <FaShoppingBasket size={10} /> SEPETE EKLE
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
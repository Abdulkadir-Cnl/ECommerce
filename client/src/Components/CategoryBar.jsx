import { Link } from 'react-router-dom';

const BASE_URL = "https://localhost:7011"; 

function CategoryBar({ allCategories = [], selectedIds = "[]" }) {
  
  // 1. ThemeEditor'den gelen sıralı ID listesini al
  let orderedIds = [];
  try {
      orderedIds = JSON.parse(selectedIds || "[]").map(id => Number(id));
  } catch (e) {
      orderedIds = [];
  }

  // 2. ID sırasına göre kategorileri bul ve diz
  const displayList = orderedIds
    .map(id => allCategories.find(cat => cat.id === id)) // ID'ye karşılık gelen kategoriyi bul
    .filter(Boolean); // Bulunamayanları (silinmişleri) temizle

  // Eğer liste boşsa hiç gösterme
  if (displayList.length === 0) return null;

  return (
    <div className="py-4 bg-white border-b border-gray-100">
      <div className="container mx-auto px-2">
        {/* ✅ GÜNCELLENDİ: gap-6 (24px) ve sm:gap-16 (32px) kullanıldı */}
        <div className="flex gap-6 sm:gap-16 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {displayList.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.ad || cat.name}`} className="flex flex-col items-center group min-w-[70px] sm:min-w-[90px]">
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 group-hover:border-red-600 transition-all duration-300 p-0.5 bg-gray-50">
                <img 
                    src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : "https://via.placeholder.com/80"} 
                    alt={cat.ad || cat.name} 
                    className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* İSİM GÖSTERİMİ DÜZELTİLDİ: cat.ad öncelikli */}
              <span className="mt-2 text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors text-center truncate w-full px-1">
                {cat.ad || cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryBar;
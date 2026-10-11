import { Link } from "react-router-dom";

const BASE_URL = "https://localhost:7011";

// onRemove prop'u gelirse Admin modunda çalışır (Silme butonu çıkar)
function CategoryShowcase({ allCategories = [], selectedIds = "[]", onRemove = null }) {
  
  let orderedIds = [];
  try {
    orderedIds = JSON.parse(selectedIds || "[]").map(id => Number(id));
  } catch (e) {
    orderedIds = [];
  }

  const displayCats = orderedIds
    .map(id => allCategories.find(c => c.id === id))
    .filter(Boolean);

  if (displayCats.length === 0) {
      if(onRemove) return <div className="text-gray-400 text-sm p-4 text-center italic">Vitrine henüz kategori eklenmedi. Aşağıdan ekleyiniz.</div>;
      return null;
  }

  return (
    // Admin panelindeyse padding'i kıs, anasayfadaysa normal bırak
    <div className={onRemove ? "w-full" : "w-full mx-auto py-8 px-2"}>
      
      {/* Kartlar arasındaki gap azaltıldı (gap-2) */}
      <div className={`grid ${onRemove ? "grid-cols-1 sm:grid-cols-2 gap-4" : "grid-cols-1 md:grid-cols-3 gap-2"}`}>
        
        {displayCats.map((cat) => (
          <div key={cat.id} className="relative group">
            
            {/* --- KART GÖRÜNÜMÜ --- */}
            
            {onRemove ? (
                // Admin Modu (Küçük Kart)
                <div className="relative bg-[#fdfbf7] rounded-xl overflow-hidden shadow-sm border border-gray-200 h-48 flex items-center justify-between p-3 cursor-default select-none">
                    <CardInner cat={cat} />
                    
                    {/* 🔴 SİLME BUTONU (Sadece Admin'de çıkar) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(cat.id); }}
                        className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-red-800 hover:scale-110 transition-all z-50"
                        title="Vitrinden Kaldır"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                // Anasayfa Modu (Link) - KART YÜKSEKLİĞİ BÜYÜTÜLDÜ
                <Link to={`/category/${cat.ad || cat.name}`} className="relative bg-[#fdfbf7] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group border border-gray-100 h-[360px] flex items-center justify-between p-4 cursor-pointer block">
                    <CardInner cat={cat} isHome={true} />
                </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Kartın iç tasarımı (Kod tekrarını önlemek için ayrıldı)
const CardInner = ({ cat, isHome }) => (
    <>
        {/* Arkaplan Süsü (Bu hala duruyor, bu arkadaki hafif pembemsi blur efekti olabilir) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -z-0 opacity-50"></div>

        {/* SOL: Resim - ORTA BOYUTTA TUTULDU (w-2/3) */}
        <div className="w-2/3 h-full z-10 relative flex items-center justify-center">
             <img 
                src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : "https://via.placeholder.com/250x250"} 
                alt={cat.ad || cat.name}
                // Yuvarlak fotoğraf görünümü için CSS'i ayarlıyoruz
                className={`
                    w-full h-full object-contain drop-shadow-lg 
                    transform group-hover:scale-105 transition-transform duration-500
                    /* Yuvarlak stil ve pembe çerçeve KALDIRILDI */
                    ${isHome ? "w-[95%] h-[95%] p-2" : ""} 
                    /* NOT: Fotoğrafın kenarını kesen yuvarlak maske (div/kapsayıcı stili) bu dosyada yer almıyor. 
                       Eğer fotoğraf hala yuvarlak görünüyorsa, bu muhtemelen cat.imageUrl'nin kapsayıcı DIV'inde
                       veya CategoryShowcase'i çağıran üst bileşende (ThemeEditor.jsx'de CategoryShowcase yok)
                       özel bir stil (örneğin border-radius) olmasından kaynaklanır. 
                       Ancak bu kodda dıştaki pembe çerçeve (border-red-200) kaldırılmıştır.
                    */
                `}
             />
        </div>

        {/* SAĞ: Yazı - w-1/3 ORANINDA TUTULDU */}
        <div className="w-1/3 flex flex-col justify-center h-full py-2 text-right z-10 pl-2">
            <h3 className={`${isHome ? "text-2xl" : "text-lg"} font-bold text-red-800 leading-tight`}>
                {cat.ad || cat.name}
            </h3>
            <span className="text-gray-400 font-script italic opacity-80 text-base">
                {cat.ad || cat.name}
            </span>
            
            {/* Anasayfada 'İncele' butonu gibi görünen yazı */}
            {isHome && (
                <span className="mt-4 ml-auto bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md w-fit flex items-center gap-2 group-hover:bg-red-800 transition-colors">
                    İncele &rarr;
                </span>
            )}
        </div>
    </>
);

export default CategoryShowcase;
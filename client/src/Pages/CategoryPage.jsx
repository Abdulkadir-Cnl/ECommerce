import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api';
import ProductCard from '../Components/ProductCard';
import { FaArrowLeft, FaFilter, FaCheck, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

function CategoryPage() {
  const { categoryName } = useParams();
  const [allProducts, setAllProducts] = useState([]); 
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- FİLTRE STATE'LERİ ---
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [stockStatus, setStockStatus] = useState(null);
  const [selectedGrams, setSelectedGrams] = useState([]);
  
  // --- SIRALAMA STATE'İ (YENİ) ---
  // Varsayılan olarak 'featured' (Öne Çıkanlar)
  const [sortOption, setSortOption] = useState('featured'); 

  // Akordeon Açık/Kapalı Durumları
  const [openSections, setOpenSections] = useState({ price: true, stock: true, gram: true });

  // Fiyat Aralıkları
  const priceRanges = [
    { id: 1, label: "0 - 1000 ₺", min: 0, max: 1000 },
    { id: 2, label: "1000 - 2000 ₺", min: 1000, max: 2000 },
    { id: 3, label: "2000 - 4000 ₺", min: 2000, max: 4000 }
  ];

  // Gramaj Seçenekleri
  const gramOptions = ["250 Gr", "500 Gr", "750 Gr", "1000 Gr"];

  // Sıralama Seçenekleri Listesi (Görseldeki ile birebir)
  const sortOptions = [
    { key: 'featured', label: 'Öne çıkanlar' },
    { key: 'priceAsc', label: 'Fiyat artan' },
    { key: 'priceDesc', label: 'Fiyat azalan' },
    { key: 'discountAsc', label: 'İndirim oranı artan' },
    { key: 'discountDesc', label: 'İndirim oranı azalan' },
    { key: 'oldest', label: 'İlk eklenen' },
    { key: 'newest', label: 'Son eklenen' }
  ];

  // 1. Verileri Çek
  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    api.get('/Product')
      .then(response => {
        const categoryFiltered = response.data.filter(p => {
            if (!categoryName) return true;
            const search = categoryName.toLowerCase();
            const pCat = p.kategoriAdi ? p.kategoriAdi.toLowerCase() : "";
            const pName = p.ad ? p.ad.toLowerCase() : "";
            return pCat.includes(search) || pName.includes(search);
        });

        setAllProducts(categoryFiltered);
        setDisplayedProducts(categoryFiltered);
        setLoading(false);
      })
      .catch(error => {
        console.error("Hata:", error);
        setLoading(false);
      });
  }, [categoryName]);

  // 2. Filtreleme VE Sıralama Mantığı
  useEffect(() => {
    let result = [...allProducts];

    // --- FİLTRELER ---
    
    // A. Stok
    if (stockStatus === 'inStock') result = result.filter(p => p.stok > 0);
    else if (stockStatus === 'outOfStock') result = result.filter(p => p.stok <= 0);

    // B. Fiyat Aralığı
    if (selectedPrices.length > 0) {
      result = result.filter(p => {
        return selectedPrices.some(rangeId => {
          const range = priceRanges.find(r => r.id === rangeId);
          return p.fiyat >= range.min && p.fiyat <= range.max;
        });
      });
    }

    // C. Gramaj
    if (selectedGrams.length > 0) {
        result = result.filter(p => {
            const nameLower = p.ad.toLowerCase();
            return selectedGrams.some(g => {
                const searchGram = g.toLowerCase().replace(" ", "");
                const searchGramSpace = g.toLowerCase();
                return nameLower.includes(searchGram) || nameLower.includes(searchGramSpace);
            });
        });
    }

    // --- SIRALAMA (SORTING) ---
    // Not: Tarih bilgisi yoksa ID'yi baz alarak sıralama yapıyoruz (Varsayım: Küçük ID eski, Büyük ID yeni)
    switch (sortOption) {
        case 'priceAsc': // Fiyat Artan
            result.sort((a, b) => a.fiyat - b.fiyat);
            break;
        case 'priceDesc': // Fiyat Azalan
            result.sort((a, b) => b.fiyat - a.fiyat);
            break;
        case 'newest': // Son Eklenen (ID büyükten küçüğe)
            result.sort((a, b) => b.id - a.id);
            break;
        case 'oldest': // İlk Eklenen (ID küçükten büyüğe)
            result.sort((a, b) => a.id - b.id);
            break;
        case 'discountDesc': // İndirim Oranı Azalan (En çok indirim başta)
            result.sort((a, b) => {
                const discountA = a.eskiFiyat ? ((a.eskiFiyat - a.fiyat) / a.eskiFiyat) : 0;
                const discountB = b.eskiFiyat ? ((b.eskiFiyat - b.fiyat) / b.eskiFiyat) : 0;
                return discountB - discountA;
            });
            break;
        case 'discountAsc': // İndirim Oranı Artan
            result.sort((a, b) => {
                const discountA = a.eskiFiyat ? ((a.eskiFiyat - a.fiyat) / a.eskiFiyat) : 0;
                const discountB = b.eskiFiyat ? ((b.eskiFiyat - b.fiyat) / b.eskiFiyat) : 0;
                return discountA - discountB;
            });
            break;
        case 'featured': // Öne Çıkanlar (Varsayılan sıra)
        default:
            // API'den gelen orijinal sırayı bozma veya özel bir 'isFeatured' alanı varsa ona göre yap
            break;
    }

    setDisplayedProducts(result);
  }, [selectedPrices, stockStatus, selectedGrams, allProducts, sortOption]); // sortOption eklendi

  // --- Yardımcı Fonksiyonlar ---
  const toggleSection = (section) => {
      setOpenSections({ ...openSections, [section]: !openSections[section] });
  };

  const handlePriceChange = (id) => {
    if (selectedPrices.includes(id)) setSelectedPrices(selectedPrices.filter(item => item !== id));
    else setSelectedPrices([...selectedPrices, id]);
  };

  const handleGramChange = (gram) => {
      if (selectedGrams.includes(gram)) setSelectedGrams(selectedGrams.filter(g => g !== gram));
      else setSelectedGrams([...selectedGrams, gram]);
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-6 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Üst Başlık */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                <FaArrowLeft />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {categoryName || "Tüm Ürünler"}
                </h1>
                <p className="text-sm text-gray-500">{displayedProducts.length} ürün listeleniyor</p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* --- SOL TARA: FİLTRE PANELİ --- */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                
                {/* 1. FİYAT FİLTRESİ */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-4 group">
                        <h3 className="font-bold text-lg text-gray-800">Fiyat</h3>
                        {openSections.price ? <FaChevronUp className="text-sm text-gray-400"/> : <FaChevronDown className="text-sm text-gray-400"/>}
                    </button>
                    
                    {openSections.price && (
                        <div className="space-y-3 pl-1">
                            {priceRanges.map((range) => (
                                <label key={range.id} className="flex items-center gap-3 cursor-pointer group/item select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPrices.includes(range.id) ? 'bg-black border-black' : 'border-gray-300 bg-gray-50 group-hover/item:border-gray-400'}`}>
                                        {selectedPrices.includes(range.id) && <FaCheck className="text-white text-xs" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedPrices.includes(range.id)} onChange={() => handlePriceChange(range.id)}/>
                                    <span className="text-gray-600 text-sm group-hover/item:text-black transition-colors">{range.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. STOK FİLTRESİ */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('stock')} className="flex items-center justify-between w-full mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Stok</h3>
                        {openSections.stock ? <FaChevronUp className="text-sm text-gray-400"/> : <FaChevronDown className="text-sm text-gray-400"/>}
                    </button>

                    {openSections.stock && (
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setStockStatus(stockStatus === 'inStock' ? null : 'inStock')}
                                className={`px-4 py-3 rounded border text-sm font-medium text-left transition-all flex justify-between items-center ${stockStatus === 'inStock' ? 'border-black text-black bg-gray-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                Stokta <span className="text-xs text-gray-400">({allProducts.filter(p => p.stok > 0).length})</span>
                            </button>
                            <button 
                                onClick={() => setStockStatus(stockStatus === 'outOfStock' ? null : 'outOfStock')}
                                className={`px-4 py-3 rounded border text-sm font-medium text-left transition-all flex justify-between items-center ${stockStatus === 'outOfStock' ? 'border-black text-black bg-gray-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                Stokta yok <span className="text-xs text-gray-400">({allProducts.filter(p => p.stok <= 0).length})</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. GRAMAJ FİLTRESİ */}
                <div>
                    <button onClick={() => toggleSection('gram')} className="flex items-center justify-between w-full mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Gram</h3>
                        {openSections.gram ? <FaChevronUp className="text-sm text-gray-400"/> : <FaChevronDown className="text-sm text-gray-400"/>}
                    </button>

                    {openSections.gram && (
                        <div className="grid grid-cols-2 gap-2">
                            {gramOptions.map((gram) => (
                                <button
                                    key={gram}
                                    onClick={() => handleGramChange(gram)}
                                    className={`py-3 px-2 border rounded text-sm transition-all ${
                                        selectedGrams.includes(gram) 
                                        ? 'border-black text-black bg-gray-50 font-semibold' 
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {gram} <span className="text-xs text-gray-400 ml-1">({allProducts.filter(p => p.ad.includes(gram) || p.ad.includes(gram.replace(" ",""))).length})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Temizle Butonu */}
                {(selectedPrices.length > 0 || stockStatus || selectedGrams.length > 0) && (
                    <button 
                        onClick={() => { setSelectedPrices([]); setStockStatus(null); setSelectedGrams([]); }}
                        className="w-full py-2 text-red-600 text-sm font-bold hover:bg-red-50 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                        <FaTimes /> Filtreleri Temizle
                    </button>
                )}
            </div>

            {/* --- SAĞ TARAF: ÜRÜN LİSTESİ --- */}
            <div className="flex-1">
                
                {/* --- YENİ EKLENEN SIRALAMA ÇUBUĞU --- */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-4 min-w-max border-b border-gray-100 pb-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setSortOption(option.key)}
                                className={`px-4 py-2 text-sm font-medium transition-colors rounded-sm whitespace-nowrap ${
                                    sortOption === option.key
                                    ? 'bg-[#a31e2b] text-white shadow-sm' // Seçili Olan (Görseldeki Kırmızı)
                                    : 'text-gray-600 hover:text-[#a31e2b]' // Seçili Olmayan
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
                        <p className="text-gray-500 font-medium">Yükleniyor...</p>
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                        {displayedProducts.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg h-96">
                        <FaFilter className="text-4xl text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-800">Sonuç Bulunamadı</h2>
                        <p className="text-gray-500 text-sm mt-1 mb-6">Seçtiğiniz kriterlere uygun ürün yok.</p>
                        <button 
                            onClick={() => {setSelectedPrices([]); setStockStatus(null); setSelectedGrams([]);}} 
                            className="bg-black text-white px-6 py-2 rounded font-medium text-sm hover:bg-gray-800 transition"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
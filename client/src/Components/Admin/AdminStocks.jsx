// src/Components/Admin/AdminStocks.jsx

import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBoxOpen, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api'; 
import AdminProductDetail from './AdminProductDetail'; 

// 🔴 BASE URL Tanımlaması
const BASE_URL = "https://localhost:7011";

// 🔴 URL Birleştirme Yardımcı Fonksiyonu
const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    return `${BASE_URL}/${relativeUrl}`;
}

function AdminStocks() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); // Arama için state eklendi

  useEffect(() => {
    fetchStocks();
  }, []);

  // 🔴 DÜZELTME: Token eklenerek gerçek stok verileri çekiliyor
  const fetchStocks = async () => {
      try {
          const token = localStorage.getItem("token");
          const res = await api.get('/Product', {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          const processedProducts = (res.data || []).map(p => ({
              ...p,
              // Backend'den 'stok' veya 'stock' olarak gelebilir, her iki durumu da karşılıyoruz
              stok: p.stok !== undefined ? p.stok : (p.stock || 0),
              resimUrl: getImageUrl(p.resimUrl) 
          }));

          const sortedProducts = processedProducts.sort((a, b) => a.stok - b.stok);
          setProducts(sortedProducts);
      } catch (e) { 
          console.error("Stok verisi çekilemedi:", e); 
      }
  };

  // Stok Durumu Belirleme (Tasarım aynı kaldı)
  const getStockStatus = (stock) => {
      if (stock <= 0) return { label: 'Tükendi', color: 'bg-red-100 text-red-700 border-red-200', icon: <FaTimesCircle/> };
      if (stock < 10) return { label: 'Kritik Stok', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaExclamationTriangle/> };
      return { label: 'Stokta Var', color: 'bg-green-100 text-green-700 border-green-200', icon: <FaCheckCircle/> };
  };

  // Filtreleme Mantığı (Arama desteği eklendi)
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.ad.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'low') return matchesSearch && p.stok > 0 && p.stok < 10;
      if (filter === 'out') return matchesSearch && p.stok <= 0;
      return matchesSearch;
  });

  // --- EĞER BİR ÜRÜN SEÇİLDİYSE DETAY SAYFASINI GÖSTER ---
  if (selectedProduct) {
      return (
        <AdminProductDetail 
            product={selectedProduct} 
            onBack={() => {
                setSelectedProduct(null); 
                fetchStocks(); // 🔴 Burası iptal edilen siparişten dönen stoğu listeye yansıtır
            }} 
        />
      );
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Stok Takibi</h2>
                <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">{products.length} Ürün</span>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>Tümü</button>
                <button onClick={() => setFilter('low')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'low' ? 'bg-orange-500 text-white' : 'bg-white border text-orange-600 hover:bg-orange-50'}`}>Kritik Stok</button>
                <button onClick={() => setFilter('out')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'out' ? 'bg-red-600 text-white' : 'bg-white border text-red-600 hover:bg-red-50'}`}>Tükenenler</button>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            
            {/* Arama */}
            <div className="p-4 border-b border-gray-200 bg-white shrink-0">
                <div className="relative w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                        type="text" 
                        placeholder="Ürün veya stok kodu ara..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200 shadow-sm">
                            <th className="p-4">Ürün Bilgisi</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Stok Adedi</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {filteredProducts.map((p) => {
                            const status = getStockStatus(p.stok);
                            return (
                                <tr 
                                    key={p.id} 
                                    onClick={() => setSelectedProduct(p)} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                                <img src={p.resimUrl || "https://via.placeholder.com/40"} alt={p.ad} className="max-w-full max-h-full object-contain"/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.ad}</div>
                                                <div className="text-xs text-gray-400">{p.barcode || 'SKU-' + p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{p.categoryName || 'Genel'}</td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900">{p.stok}</span> <span className="text-xs text-gray-500">Adet</span>
                                    </td>
                                    <td className="p-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                            {status.icon} {status.label}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-indigo-600 font-bold text-xs hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                            Stok Düzenle
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

export default AdminStocks;
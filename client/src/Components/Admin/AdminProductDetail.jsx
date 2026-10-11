import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaSave, FaTrash, FaInfoCircle, FaImage, FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api';

// ⚠️ DİKKAT: Backend (API) adresinizi buraya yazmalısınız.
// AdminProducts.jsx'teki ile aynı olmalıdır.
const API_BASE_URL = "https://localhost:7011"; // 7256 -> 7011
// ---------------------------------------------------------------------------

function AdminProductDetail({ product, onBack }) {
  const [activeTab, setActiveTab] = useState('temel');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    ad: '',
    fiyat: 0,
    indirimliFiyat: 0,
    alisFiyati: 0,
    stok: 0,
    categoryId: 1,
    resimUrl: '',
    aciklama: '',
    urunTuru: 'Fiziksel'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        indirimliFiyat: product.indirimliFiyat || 0,
        alisFiyati: product.alisFiyati || 0,
        resimUrl: product.resimUrl || '',
        categoryId: product.categoryId || 1,
        aciklama: product.aciklama || ''
      });
    } else {
      setFormData({
        id: 0,
        ad: '',
        fiyat: 0,
        indirimliFiyat: 0,
        alisFiyati: 0,
        stok: 0,
        categoryId: 1,
        resimUrl: '',
        aciklama: '',
        urunTuru: 'Fiziksel'
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // ✅ Resim URL'sini tam yola çeviren fonksiyon
  const getFullImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path; // Zaten tam link ise dokunma
    // API adresi + dosya yolu
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };


  const handleSave = async () => {
    try {
      if (!formData.ad?.trim()) {
        toast.error("Ürün adı zorunlu.");
        return;
      }
      if (Number(formData.fiyat) <= 0) {
        toast.error("Satış fiyatı 0'dan büyük olmalı.");
        return;
      }

      const payload = {
        ad: formData.ad,
        aciklama: formData.aciklama,
        fiyat: parseFloat(formData.fiyat),
        stok: parseInt(formData.stok),
        categoryId: parseInt(formData.categoryId),
        // Sunucuya sadece göreceli yolu gönderiyoruz:
        resimUrl: formData.resimUrl 
      };

      if (product && product.id) {
        payload.id = product.id;
        await api.put('/Product', payload, { headers: authHeader() });
        toast.success("Ürün başarıyla güncellendi!");
      } else {
        await api.post('/Product', payload, { headers: authHeader() });
        toast.success("Yeni ürün başarıyla oluşturuldu!");
      }

      onBack();
    } catch (error) {
      console.error("Kaydetme Hatası:", error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error("Yetki hatası: Admin/Satıcı hesabıyla giriş yapmalısın.");
        return;
      }
      toast.error("İşlem başarısız: " + (error.response?.data?.message || "Sunucu hatası"));
    }
  };

  const handleDelete = async () => {
    if (!product || !product.id) return;
    if (window.confirm(`${product.ad} ürününü silmek istediğinize emin misiniz?`)) {
      try {
        await api.delete(`/Product/${product.id}`, { headers: authHeader() });
        toast.success("Ürün silindi.");
        onBack();
      } catch (error) {
        console.error("Silme Hatası:", error);
        toast.error("Silme işlemi başarısız.");
      }
    }
  };

  // 🔴 DÜZELTME: Dosya yükleme endpoint'ini ProductController.cs'deki UpdateImage metodu ile eşleştiriyoruz.
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Ürün ID'si olmadan resim yüklenemez
    if (!formData.id && !product) {
        toast.error("Önce ürünü kaydedin veya var olan bir ürünü düzenleyin.");
        return;
    }
    
    setUploading(true);
    const fd = new FormData();
    // ProductController'daki metot 'File' adında bir IFormFile bekliyor.
    fd.append("File", file); 

    try {
      // Endpoint: PUT /api/Product/image/{id}
      const productId = formData.id || product.id;
      const res = await api.put(`/Product/image/${productId}`, fd, {
          headers: {
              ...authHeader(),
              // 'Content-Type': 'multipart/form-data', // Tarayıcı bunu otomatik ekler
          },
      }); 
      
      // ProductController'dan dönen yanıt (güncel product nesnesi)
      const updatedProduct = res.data;
      const newResimUrl = updatedProduct?.resimUrl;
      
      if (newResimUrl) {
          // Yeni göreceli yolu kaydediyoruz
          setFormData(prev => ({ ...prev, resimUrl: newResimUrl }));
          toast.success("Resim başarıyla yüklendi ve ürüne kaydedildi!");
      } else {
          toast.error("API'dan geçerli bir resim yolu gelmedi.");
      }
      
    } catch (error) {
      console.error("Yükleme hatası:", error.response || error);
      toast.error("Resim yüklenirken hata oluştu: " + (error.response?.data?.message || "Sunucu hatası"));
    } finally {
      setUploading(false);
      // Dosya input'unu temizle (aynı dosyayı tekrar seçebilmek için)
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
      if(window.confirm("Resmi kaldırmak istediğinize emin misiniz?")) {
          setFormData(prev => ({...prev, resimUrl: ''}));
          // NOTE: Eğer resmi sunucudan da silmek isterseniz, burada backend'e
          // boş bir ResimUrl gönderen bir güncelleme çağrısı yapmalısınız.
      }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full bg-gray-50/50">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {product ? product.ad : 'Yeni Ürün Ekle'}
            </h2>
            {product && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded font-bold border border-green-200">
                Yayında
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {product && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-white border border-gray-300 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <FaTrash /> Sil
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#6366f1] text-white rounded-lg text-sm font-bold hover:bg-[#4f46e5] flex items-center gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <FaSave /> Kaydet
          </button>
        </div>
      </div>

      {/* SEKME MENÜSÜ */}
      <div className="border-b border-gray-200 mb-6 flex gap-6 text-sm font-medium text-gray-500 overflow-x-auto">
        {['Temel Bilgi', 'Medya', 'Ürün Detayı', 'Envanter', 'SEO', 'Özel Alanlar', 'Ürün Özelleştirmesi', 'Varyant'].map((tab) => {
          const key = tab.toLowerCase().replace(' ', '');
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-800'}`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* İÇERİK ALANI */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-5xl">

        {/* TEMEL */}
        {(activeTab === 'temelbilgi' || activeTab === 'temel') ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-800">Temel Bilgi</h3>
              <FaInfoCircle className="text-gray-400 text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Adı <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Örn: Kangal Sucuk"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Türü</label>
                <select
                  name="urunTuru"
                  value={formData.urunTuru}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option>Fiziksel</option>
                  <option>Dijital</option>
                  <option>Hizmet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Satış Fiyatı <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                  <input
                    type="number"
                    name="fiyat"
                    value={formData.fiyat}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg pl-8 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stok Miktarı</label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alış Fiyatı (Maliyet)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                  <input
                    type="number"
                    name="alisFiyati"
                    value={formData.alisFiyati}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg pl-8 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Resim URL</label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    name="resimUrl"
                    value={formData.resimUrl}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                    />
                    <button onClick={()=> setActiveTab('medya')} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-gray-600 border"><FaImage/></button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="1">Sucuk</option>
                  <option value="2">Pastırma</option>
                  <option value="3">Kavurma</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
              <textarea
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ürün açıklaması..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="showUnitTest" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
              <label htmlFor="showUnitTest" className="text-sm text-gray-700 font-medium select-none cursor-pointer">
                Bu ürün için birim fiyat göster
              </label>
            </div>
          </div>

        ) : activeTab === 'medya' ? (
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
               <h3 className="text-lg font-bold text-gray-800">Ürün Görselleri</h3>
               <FaInfoCircle className="text-gray-400 text-sm" />
             </div>

             <div 
               onClick={() => {
                   if (formData.id) {
                       fileInputRef.current.click();
                   } else {
                       toast.error("Görsel yüklemek için önce ürünü kaydedin.");
                   }
               }}
               className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors group 
                         ${!formData.id ? 'border-gray-300 bg-gray-100 text-gray-500 opacity-60' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'}`}
             >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload} 
                    disabled={!formData.id}
                />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div> : <FaUpload className="text-2xl text-indigo-500" />}
                </div>
                <p className="font-bold text-indigo-900">Görsel yüklemek için tıklayın</p>
                <p className="text-xs text-indigo-400 mt-1">Sadece kayıtlı ürünlere resim yüklenebilir.</p>
             </div>

             {formData.resimUrl && (
                <div className="mt-8">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Yüklü Görsel</h4>
                    <div className="relative w-48 h-48 bg-gray-100 rounded-xl border border-gray-200 p-2 group">
                        <img 
                            src={getFullImageUrl(formData.resimUrl)} 
                            alt="Ürün" 
                            className="w-full h-full object-contain rounded-lg bg-white" 
                        />
                        <button 
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Resmi Kaldır"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 break-all font-mono">
                        {/* Göreceli yolu göster */}
                        {formData.resimUrl}
                    </div>
                </div>
             )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">"{activeTab}" sekmesi şu anda geliştirme aşamasında.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminProductDetail;
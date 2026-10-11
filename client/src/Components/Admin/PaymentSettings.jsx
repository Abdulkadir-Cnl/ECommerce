import { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { 
  FaPlus, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaLink, 
  FaListUl, FaListOl, FaImage, FaCode, FaExpand, FaEllipsisV, 
  FaAlignLeft, FaUniversity, FaCreditCard, FaSave, FaExclamationTriangle
} from "react-icons/fa";

const PaymentSettings = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Yeni Hata State'i
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/payment/methods");
      setMethods(res.data);
    } catch (error) {
      console.error("Ödeme yöntemleri çekilemedi", error);
      setError("Ödeme yöntemleri yüklenemedi. API bağlantısını kontrol edin."); // Hata mesajı ayarlandı
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key) => setEditingKey(key);

  const handleBack = () => {
    setEditingKey(null);
    fetchMethods();
  };

  // --- GÖRÜNÜM KONTROLÜ ---
  
  if (editingKey) {
    const methodToEdit = methods.find(m => m.key === editingKey);
    if (!methodToEdit) return <div className="p-8 text-red-600">Hata: Yöntem bulunamadı.</div>;

    // PayTR Editörü
    if (editingKey === 'paytr') {
        return <PaytrEditor method={methodToEdit} onBack={handleBack} />;
    }

    // Havale Editörü
    return <HavaleEditor method={methodToEdit} onBack={handleBack} />;
  }

  // LİSTE GÖRÜNÜMÜ
  return (
    <div className="h-full overflow-y-auto bg-gray-50 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Yöntemleri</h1>
          <p className="text-sm text-gray-500 mt-1">Ödeme yöntemlerini yönetin.</p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50 transition">
          <FaPlus className="inline mr-2" /> Ekle
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-8 py-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Aktif Ödeme Yöntemleri</h2>
        
        {/* Hata Mesajı Gösterimi */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-3" role="alert">
                <FaExclamationTriangle className="text-lg"/>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {loading ? <p>Yükleniyor...</p> : methods.length === 0 && !error ? <p>Tanımlı ödeme yöntemi bulunamadı.</p> : methods.map((method) => (
            <div 
              key={method.id}
              onClick={() => handleEdit(method.key)}
              className="bg-white rounded-xl border mb-3 p-5 flex items-center justify-between cursor-pointer hover:border-indigo-500 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl 
                    ${method.key === 'havale' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {method.key === 'havale' ? <FaUniversity /> : <FaCreditCard />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{method.name}</p>
                  <p className="text-sm text-gray-500">{method.description ? method.description.substring(0, 30) : ''}...</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {method.isActive ? 'Aktif' : 'Pasif'}
                </span>
                <button className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 bg-white">Düzenle</button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 🎨 PAYTR EDİTÖRÜ (SİYAH HEADER + BEYAZ FORM)
// ==========================================
const PaytrEditor = ({ method, onBack }) => {
    const [formData, setFormData] = useState({
        apiId: method.apiId || "",
        apiKey: method.apiKey || "",
        apiSecret: method.apiSecret || "",
        isTestMode: method.isTestMode || false,
        isActive: method.isActive,
        // Diğer zorunlu alanlar
        name: method.name,
        description: method.description || "PayTR",
        adjustmentType: method.adjustmentType || "none",
        adjustmentValue: method.adjustmentValue || 0
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/payment/methods/paytr`, formData);
            toast.success("PayTR ayarları kaydedildi.");
            onBack();
        } catch (error) {
            console.error(error);
            toast.error("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    // Pasif/Aktif Toggle
    const toggleActive = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    return (
        <div className="flex flex-col h-full bg-[#F3F4F6] animate-fade-in">
            
            {/* SİYAH HEADER */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 border border-gray-700 rounded hover:bg-gray-800 transition text-gray-400 hover:text-white"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-[#ccff00]">Ödeme Ayarları</span>
                        <span className="text-gray-500">›</span>
                        <span className="text-white">PayTR</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleActive}
                        className={`px-4 py-2 text-sm font-medium border border-gray-700 rounded transition 
                        ${formData.isActive ? 'bg-black text-white hover:bg-gray-800' : 'bg-red-900/50 text-red-200 border-red-800'}`}
                    >
                        {formData.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    </button>
                    <div className="flex rounded shadow-sm">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 text-sm font-bold bg-[#6366F1] hover:bg-[#4f46e5] text-white rounded-l transition disabled:opacity-50"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button className="px-3 py-2 bg-[#4f46e5] text-white border-l border-indigo-400 rounded-r hover:bg-indigo-800">
                            <FaEllipsisV className="text-xs"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* FORM ALANI (Beyaz Kart) */}
            <div className="p-8 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">PayTR Entegrasyon Ayarları</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Merchant ID */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600">Merchant Id</label>
                            <input 
                                type="text"
                                name="apiId"
                                value={formData.apiId}
                                onChange={handleChange}
                                placeholder="Mağaza No (Örn: 123456)"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        {/* Merchant Key */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600">Merchant Key</label>
                            <input 
                                type="text"
                                name="apiKey"
                                value={formData.apiKey}
                                onChange={handleChange}
                                placeholder="Mağaza Anahtarı"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Merchant Salt */}
                    <div className="space-y-2 mb-6">
                        <label className="block text-sm font-semibold text-gray-600">Merchant Salt</label>
                        <input 
                            type="text"
                            name="apiSecret"
                            value={formData.apiSecret}
                            onChange={handleChange}
                            placeholder="Mağaza Gizli Anahtarı"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                        />
                    </div>

                    {/* Test Modu */}
                    <div className="space-y-2 mb-6">
                        <label className="block text-sm font-semibold text-gray-600">Test Modu</label>
                        <select 
                            name="isTestMode"
                            value={formData.isTestMode} 
                            onChange={(e) => setFormData(prev => ({...prev, isTestMode: e.target.value === 'true'}))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                        >
                            <option value="false">Kapalı (Canlı Mod)</option>
                            <option value="true">Açık (Test Modu)</option>
                        </select>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                         <input 
                            type="checkbox"
                            id="3dsecure" 
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                         />
                         <label htmlFor="3dsecure" className="text-sm text-gray-700 font-medium cursor-pointer">
                            Yurtdışı kartlar için 3D Secure kapatılsın. (Açmadan önce lütfen Destek Ekibimiz ile iletişime geçin.)
                         </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 🎨 HAVALE EDİTÖRÜ (SİYAH HEADER)
// ==========================================
const HavaleEditor = ({ method, onBack }) => {
    const [formData, setFormData] = useState({
        name: method.name || "",
        description: method.description || "",
        isActive: method.isActive,
        adjustmentType: method.adjustmentType || "none",
        adjustmentValue: method.adjustmentValue || 0
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/payment/methods/${method.key}`, {
                ...formData,
                adjustmentValue: Number(formData.adjustmentValue)
            });
            toast.success("Ayarlar başarıyla kaydedildi.");
            onBack();
        } catch(e) { 
            console.error(e);
            toast.error("Hata"); 
        } finally { 
            setSaving(false); 
        }
    };

    const toggleActive = () => setFormData(prev => ({ ...prev, isActive: !prev.isActive }));

    return (
        <div className="flex flex-col h-full bg-[#F3F4F6] animate-fade-in">
             <div className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 border border-gray-700 rounded hover:bg-gray-800 transition text-gray-400 hover:text-white"><FaArrowLeft /></button>
                    <div className="flex items-center gap-2 text-sm font-medium"><span className="text-[#ccff00]">Ödeme Ayarları</span><span className="text-gray-500">›</span><span className="text-white">{formData.name}</span></div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleActive} className={`px-4 py-2 text-sm font-medium border border-gray-700 rounded transition ${formData.isActive ? 'bg-black text-white hover:bg-gray-800' : 'bg-red-900/50 text-red-200 border-red-800'}`}>{formData.isActive ? 'Pasif Yap' : 'Aktif Yap'}</button>
                    <div className="flex rounded shadow-sm">
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm font-bold bg-[#6366F1] hover:bg-[#4f46e5] text-white rounded-l transition disabled:opacity-50">{saving ? '...' : 'Kaydet'}</button>
                        <button className="px-3 py-2 bg-[#4f46e5] text-white border-l border-indigo-400 rounded-r hover:bg-indigo-800"><FaEllipsisV className="text-xs"/></button>
                    </div>
                </div>
             </div>
             
             <div className="p-8 max-w-6xl mx-auto w-full">
                <div className="bg-white rounded border border-gray-200 p-8 space-y-8 shadow-sm">
                    {/* Form Alanları */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">Ödeme Yöntemi Adı</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition"/>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">Sipariş Tutarı Değişimi</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <select name="adjustmentType" value={formData.adjustmentType} onChange={handleChange} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white appearance-none">
                                    <option value="none">Değişiklik yapma</option>
                                </select>
                            </div>
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden w-32">
                                <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm">%</div>
                                <input type="number" name="adjustmentValue" value={formData.adjustmentValue} onChange={handleChange} className="w-full px-3 py-2.5 text-sm outline-none"/>
                            </div>
                        </div>
                    </div>

                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">Açıklama</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full border border-gray-300 p-4 text-sm outline-none focus:border-indigo-500 rounded resize-y"/>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default PaymentSettings;
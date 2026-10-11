// src/Pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { useBasket } from '../Context/BasketContext';
import {
  FaLock, FaChevronDown,
  FaBuilding, FaUniversity, FaArrowLeft, FaInfoCircle
} from 'react-icons/fa';

const MOCK_PAYMENT_METHODS = [
    { key: "Kredi Kartı", name: "Kredi Kartı", description: "Güvenli PayTR ödeme altyapısı.", isActive: true, adjustmentType: "none", adjustmentValue: 0, bankDetails: "" },
    { key: "Havale/EFT", name: "Havale/EFT", description: "Banka Bilgileri:\n- Hesap Adı: Başyazıcı Gıda A.Ş.\n- IBAN: TR12 0006 4000 0011 0000 0000 00", isActive: true, adjustmentType: "deduct", adjustmentValue: 3, bankDetails: "Siparişi tamamladıktan sonra IBAN bilgileri iletilecektir." }
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { basketItems, totalPrice, clearBasket } = useBasket();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  
  const [methods, setMethods] = useState(MOCK_PAYMENT_METHODS.filter(m => m.isActive)); 
  const [paymentMethod, setPaymentMethod] = useState(methods.length > 0 ? methods[0].key : ""); 

  const [cardData] = useState({
    cardHolder: 'IFRAME TEST', 
    cardNumber: '0000 0000 0000 0000', 
    expiryDate: '01/30', 
    cvv: '000'
  });

  const [addressData, setAddressData] = useState({
    email: '', newsletter: false, firstName: '', lastName: '',
    address: '', apartment: '', zipCode: '',
    city: '0', district: '0', phone: '',
    isCorporate: false, companyName: '', taxOffice: '', taxNumber: ''
  });

  useEffect(() => {
    const defaultMethod = methods.find(m => m.key === "Kredi Kartı") || methods[0];
    if (defaultMethod) {
        setPaymentMethod(defaultMethod.key);
    }
  }, [methods]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateAddress = () => {
    if (!addressData.city || addressData.city === "0") { toast.warning("Lütfen bir il seçiniz."); return false; }
    if (!addressData.district || addressData.district === "0") { toast.warning("Lütfen bir ilçe seçiniz."); return false; } 
    if (!addressData.zipCode || addressData.zipCode.trim().length < 3) { toast.warning("Lütfen posta kodunu giriniz."); return false; }
    if (!addressData.address?.trim()) { toast.warning("Lütfen açık adresi giriniz."); return false; } 
    if (!addressData.firstName?.trim() || !addressData.lastName?.trim()) { toast.warning("Lütfen Ad ve Soyad giriniz."); return false; }
    if (!addressData.email?.trim() || !addressData.phone?.trim()) { toast.warning("Lütfen İletişim bilgilerini (E-posta/Telefon) doldurunuz."); return false; }

    if (addressData.isCorporate && (!addressData.companyName || !addressData.taxNumber || !addressData.taxOffice)) {
      toast.warning("Kurumsal fatura bilgileri eksik."); return false;
    }
    return true;
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if(validateAddress()) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const extractBackendError = (error) => {
    const data = error?.response?.data;
    if (data?.errors) {
      const msgs = [];
      for (const key of Object.keys(data.errors)) {
        const arr = data.errors[key];
        if (Array.isArray(arr)) arr.forEach(x => msgs.push(`${key}: ${x}`));
      }
      return msgs.length ? `Hata: ${msgs.join(" | ")}` : "Doğrulama hatası.";
    }
    return data?.message || "İşlem başarısız.";
  };

  // 🔴 DÜZENLENEN ANA FONKSİYON: Sipariş ve PayTR Entegrasyonu
  const verifyAndComplete = async () => {
    if (!basketItems || basketItems.length === 0) {
        toast.error("Sepetinizde ürün bulunmamaktadır.");
        navigate('/basket');
        return;
    }

    setLoading(true);
    const selectedMethod = methods.find(m => m.key === paymentMethod);
    const isCreditCard = paymentMethod === 'Kredi Kartı';
    const isBankTransfer = paymentMethod === "Havale/EFT";

    try {
      const token = localStorage.getItem('token');
      
      const addressObject = {
        Title: addressData.isCorporate ? "Kurumsal Adres" : "Bireysel Adres", 
        Street: `${addressData.address} ${addressData.apartment}`.trim(), 
        City: String(addressData.city), 
        State: String(addressData.district), 
        ZipCode: String(addressData.zipCode), 
        Country: "Türkiye" 
      };

      const payload = {
        CustomerName: `${addressData.firstName} ${addressData.lastName}`.trim(),
        CustomerEmail: addressData.email,
        CustomerPhoneNumber: addressData.phone,
        IsCorporate: addressData.isCorporate,
        CompanyName: addressData.isCorporate ? addressData.companyName : null,
        TaxOffice: addressData.isCorporate ? addressData.taxOffice : null,
        TaxNumber: addressData.isCorporate ? addressData.taxNumber : null,
        ShippingAddress: addressObject,
        BillingAddress: addressObject, 
        PaymentMethod: selectedMethod.name,
        // PayTR iframe modelinde kart bilgileri backend'e gitmez, iFrame içinde girilir
        CardHolderName: "-", 
        CardNumber: "-", 
        ExpireMonth: "01",
        ExpireYear: "30",
        Cvc: "000",
        Items: basketItems.map(item => ({
            ProductId: item.productId || item.id,
            ProductName: item.productName || item.ad,
            Price: Number(item.price || item.fiyat),
            Quantity: item.quantity,
            ResimUrl: item.resimUrl || "" 
        }))
      };

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // 1. Siparişi Oluştur
      const response = await api.post('/Order/checkout', payload, config);
      const createdOrderId = response.data.orderId;

      // 2. Kredi Kartı Seçili ise PayTR Token Al ve Yönlendir
      if (isCreditCard && createdOrderId) {
          try {
            // PayTR için kullanıcının IP adresini alıyoruz
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();

            const paytrResponse = await api.post("/payment/paytr-token", { 
                orderId: createdOrderId,
                userIp: ipData.ip 
            }, config);

            if (paytrResponse.data.token) {
                if (clearBasket) clearBasket();
                // Kullanıcıyı iFrame sayfamıza yönlendiriyoruz
                navigate(`/payment/paytr?token=${paytrResponse.data.token}`); 
                return; 
            }
          } catch (err) {
            toast.error("PayTR ödeme sistemine bağlanırken bir hata oluştu.");
            return;
          }
      }

      // 3. Havale/EFT ise sepeti temizle ve ana sayfaya yönlendir
      if (clearBasket) clearBasket();
      toast.success(isBankTransfer ? "Siparişiniz alındı! Havale sonrası onaylanacaktır." : "Sipariş başarılı!");
      navigate('/'); 

    } catch (error) {
      toast.error(extractBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-checkout-container" className="fixed inset-0 z-[9999] bg-white overflow-y-auto font-sans text-gray-800">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-[58%] bg-white px-4 md:px-12 lg:px-20 pt-8 pb-16 flex flex-col border-r border-gray-100">
          <div className="mb-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-black text-[#C8102E] tracking-tighter cursor-pointer" onClick={() => navigate('/')}>BAŞYAZICI</h1>
              <button onClick={() => navigate('/basket')} className="text-[#C8102E] text-xs font-bold hover:underline flex items-center gap-1"><FaArrowLeft /> Sepete Dön</button>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={currentStep === 1 ? "text-gray-900" : "text-[#C8102E] cursor-pointer"} onClick={() => currentStep > 1 && setCurrentStep(1)}>İletişim</span>
              <FaChevronDown className="rotate-[270deg] text-gray-400 text-[10px]" />
              <span className={currentStep === 2 ? "text-gray-900" : (currentStep > 2 ? "text-[#C8102E] cursor-pointer" : "text-gray-400")} onClick={() => currentStep > 2 && setCurrentStep(2)}>Kargo</span>
              <FaChevronDown className="rotate-[270deg] text-gray-400 text-[10px]" />
              <span className={currentStep === 3 ? "text-gray-900" : "text-gray-400"}>Ödeme</span>
            </div>
          </div>

          <div className="w-full">
            {currentStep === 1 && (
              <form onSubmit={handleAddressSubmit} className="space-y-4 animate-fade-in mb-8 w-full">
                <h2 className="text-lg font-bold text-gray-800">İletişim</h2>
                <input type="email" name="email" required value={addressData.email} onChange={handleInputChange} placeholder="E-Posta Adresi" className="w-full border border-gray-300 rounded px-3 py-3 text-sm outline-none focus:border-[#C8102E] shadow-sm" />
                <h2 className="text-lg font-bold text-gray-800 pt-2 mb-3">Teslimat Adresi</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="firstName" placeholder="Ad" required value={addressData.firstName} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E] shadow-sm w-full" />
                  <input type="text" name="lastName" placeholder="Soyad" required value={addressData.lastName} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E] shadow-sm w-full" />
                </div>
                <input type="tel" name="phone" placeholder="Telefon" required value={addressData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E]" />
                <div className="grid grid-cols-2 gap-3">
                  <select name="city" value={addressData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-3 text-sm bg-white focus:border-[#C8102E]">
                    <option value="0">İl Seçiniz</option><option value="İstanbul">İstanbul</option><option value="Ankara">Ankara</option><option value="Konya">Konya</option>
                  </select>
                  <select name="district" value={addressData.district} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-3 text-sm bg-white focus:border-[#C8102E]">
                    <option value="0">İlçe Seçiniz</option><option value="Merkez">Merkez</option><option value="Selçuklu">Selçuklu</option>
                  </select>
                </div>
                <textarea name="address" rows="2" placeholder="Adres" required value={addressData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E] resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="apartment" placeholder="Bina / Daire No" value={addressData.apartment} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E] w-full" />
                  <input type="text" name="zipCode" placeholder="Posta Kodu" required value={addressData.zipCode} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-3 text-sm focus:border-[#C8102E] w-full" />
                </div>
                <div className="pt-2">
                  <div className="flex items-center">
                    <input id="corporate" type="checkbox" name="isCorporate" checked={addressData.isCorporate} onChange={handleInputChange} className="text-[#C8102E] rounded" />
                    <label htmlFor="corporate" className="ml-2 text-sm text-gray-600 flex items-center gap-1 cursor-pointer select-none"><FaBuilding /> Kurumsal Fatura</label>
                  </div>
                  {addressData.isCorporate && (
                    <div className="mt-3 grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded border border-gray-200">
                      <input type="text" name="companyName" placeholder="Firma Adı" value={addressData.companyName} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#C8102E] w-full" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="taxOffice" placeholder="Vergi Dairesi" value={addressData.taxOffice} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#C8102E] w-full" />
                        <input type="text" name="taxNumber" placeholder="Vergi Numarası" value={addressData.taxNumber} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#C8102E] w-full" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-4"><button type="submit" className="bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold text-sm w-full md:w-auto">Kargoya Devam Et</button></div>
              </form>
            )}

            {currentStep > 1 && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6 flex justify-between items-start bg-white shadow-sm w-full animate-fade-in">
                <div className="text-sm"><p className="font-medium text-gray-900 mb-1">{addressData.email}</p><p className="font-medium text-gray-900">{addressData.address} No:{addressData.apartment}</p></div>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-[#C8102E] font-bold hover:underline">Düzenle</button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in mb-8 w-full">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Kargo Yöntemi</h2>
                <div className="border border-[#C8102E] bg-red-50 rounded-lg p-4 flex justify-between items-center ring-1 ring-[#C8102E]">
                  <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full border-[6px] border-[#C8102E] bg-white"></div><span className="text-gray-900 text-sm font-bold">Standart Kargo</span></div>
                  <span className="font-bold text-gray-900 text-sm">Ücretsiz</span>
                </div>
                <div className="flex justify-between items-center pt-6"><button onClick={() => setCurrentStep(1)} className="text-sm text-[#C8102E] font-medium">İletişim Bilgilerine Dön</button><button onClick={() => setCurrentStep(3)} className="bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold text-sm shadow-md">Ödemeye Geç</button></div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in mb-8 w-full">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Ödeme Yöntemi Seçimi</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6 shadow-sm w-full">
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    {methods.map(method => (
                        <button key={method.key} onClick={() => setPaymentMethod(method.key)} className={`flex-1 py-4 text-sm font-bold ${paymentMethod === method.key ? "bg-white text-[#C8102E] border-t-2 border-t-[#C8102E]" : "text-gray-500"}`}>{method.name}</button>
                    ))}
                  </div>
                  <div className="p-6">
                    {paymentMethod === "Kredi Kartı" ? (
                      <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200 flex items-start gap-3"><FaInfoCircle className='shrink-0'/><div>Güvenli <b>PayTR</b> ödeme sayfasına yönlendirileceksiniz.</div></div>
                    ) : (
                      <div className="text-center py-4"><FaUniversity className="mx-auto mb-3 text-gray-400 text-3xl"/><p className="text-sm text-gray-500 font-medium px-4">{methods.find(m => m.key === "Havale/EFT")?.description}</p></div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2"><button onClick={() => setCurrentStep(2)} className="text-sm text-[#C8102E] font-medium">Kargoya Dön</button><button onClick={verifyAndComplete} disabled={loading} className="bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold text-sm shadow-xl">{loading ? 'İşleniyor...' : 'Siparişi Tamamla'}</button></div>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL - SEPET ÖZETİ */}
        <div className="hidden lg:block w-[42%] bg-[#fafafa] border-l border-gray-200 sticky top-0 h-screen overflow-y-auto p-10">
            <div className="space-y-4 mb-8">
              {basketItems?.map((item) => (
                <div key={item.productId || item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg relative flex items-center justify-center p-1 shrink-0"><img src={item.resimUrl} alt="ürün" className="max-w-full max-h-full object-contain" /><span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium">{item.quantity}</span></div>
                  <div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-gray-800 line-clamp-2">{item.productName || item.ad}</h4><p className="text-xs text-gray-500 mt-0.5">{item.quantity} adet</p></div>
                  <div className="font-bold text-sm text-gray-900 shrink-0">{((item.price || item.fiyat) * item.quantity).toFixed(2)} ₺</div>
                </div>
              ))}
            </div>
            <hr className="border-gray-200 mb-6" />
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600"><span>Ara Toplam</span><span className="font-medium text-gray-900">{totalPrice?.toFixed(2)} ₺</span></div>
              <div className="flex justify-between text-sm text-gray-600 items-center"><span>Kargo</span><span className="text-xs font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded">ÜCRETSİZ</span></div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-gray-200"><span className="text-lg font-medium text-gray-700">Toplam</span><div className="text-right"><span className="text-xs text-gray-400 block mb-1">KDV Dahil</span><span className="text-2xl font-black text-gray-900 tracking-tight">{totalPrice?.toFixed(2)} ₺</span></div></div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
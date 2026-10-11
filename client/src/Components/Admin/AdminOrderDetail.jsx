// src/Components/Admin/AdminOrderDetail.jsx
import {
  FaArrowLeft, FaBox, FaUser, FaCreditCard,
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaBuilding, FaCheckCircle, FaUniversity, FaTimesCircle
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import api from '../../api'; 
import { toast } from 'react-toastify';

const statusColors = {
  'Teslim Edildi': 'bg-green-100 text-green-700 border-green-200',
  'Ödendi': 'bg-green-100 text-green-700 border-green-200',
  'Ödeme Alındı': 'bg-green-100 text-green-700 border-green-200',
  'Gönderildi': 'bg-blue-100 text-blue-700 border-blue-200',
  'Kargoya Verildi': 'bg-blue-100 text-blue-700 border-blue-200',
  'Bekliyor': 'bg-orange-100 text-orange-700 border-orange-200',
  'Ödeme Bekliyor': 'bg-orange-100 text-orange-700 border-orange-200',
  'Sepette': 'bg-orange-100 text-orange-700 border-orange-200',
  'İptal Edildi': 'bg-red-100 text-red-700 border-red-200'
};

function AdminOrderDetail({ order, onBack }) {
  const [detailedOrder, setDetailedOrder] = useState(order);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "https://localhost:7011";

  useEffect(() => {
    // 🔴 DÜZELTME: Eğer terkedilmiş sepetse ve içinde ürün yoksa detay çekmeye çalış
    if (order?.id) {
        if (order.isAbandoned && (!order.items || order.items.length === 0)) {
            fetchFullBasketDetails(order.id);
        } else if (!order.isAbandoned) {
            fetchFullOrderDetails(order.id);
        } else {
            setDetailedOrder(order);
        }
    }
  }, [order]);

  const normalizeApiOrderToAdminShape = (apiOrder) => {
    const shipping = apiOrder.shippingAddress || apiOrder.ShippingAddress || null;
    const rawItems = apiOrder.orderItems || apiOrder.OrderItems || apiOrder.items || apiOrder.Items || [];
    
    const normalizedItems = Array.isArray(rawItems)
      ? rawItems.map(i => {
          let rawPath = i.resimUrl || i.ResimUrl || i.product?.resimUrl || i.product?.ResimUrl || null;
          let fullResimUrl = null;
          if (rawPath) {
            fullResimUrl = rawPath.startsWith('http') 
              ? rawPath 
              : `${API_BASE_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
          }
          return {
            productName: i.productName || i.ProductName || i.product?.ad || i.product?.Ad || "Ürün",
            quantity: i.quantity || i.Quantity || 1,
            price: i.price || i.Price || 0,
            resimUrl: fullResimUrl
          };
        })
      : [];

    return {
      id: apiOrder.id || apiOrder.Id,
      orderNo: apiOrder.isAbandoned ? `SEPET-${apiOrder.id || apiOrder.Id}` : `#${apiOrder.id || apiOrder.Id}`,
      date: apiOrder.orderDate || apiOrder.OrderDate || apiOrder.lastModifiedDate || apiOrder.LastModifiedDate,
      customer: apiOrder.customerName || apiOrder.CustomerName || apiOrder.customer || "Misafir",
      email: apiOrder.customerEmail || apiOrder.CustomerEmail || apiOrder.email || "-",
      customerPhone: apiOrder.customerPhoneNumber || apiOrder.CustomerPhoneNumber || "-",
      status: apiOrder.isAbandoned ? 'Sepette' : (apiOrder.orderStatus || apiOrder.OrderStatus),
      payment: apiOrder.isAbandoned ? 'Bekliyor' : (apiOrder.paymentStatus || apiOrder.PaymentStatus),
      paymentMethod: apiOrder.paymentMethod || apiOrder.PaymentMethod || "Bilinmiyor",
      total: apiOrder.totalPrice || apiOrder.TotalPrice || 0,
      isCorporate: apiOrder.isCorporate || apiOrder.IsCorporate,
      companyName: apiOrder.companyName || apiOrder.CompanyName,
      taxOffice: apiOrder.taxOffice || apiOrder.TaxOffice,
      taxNumber: apiOrder.taxNumber || apiOrder.TaxNumber,
      shippingAddress: shipping
        ? { line1: shipping.street || shipping.Street || shipping.title || '', city: shipping.city || shipping.City || '', state: shipping.state || shipping.State || '', zip: shipping.zipCode || shipping.ZipCode || '' }
        : null,
      items: normalizedItems,
      isAbandoned: apiOrder.isAbandoned 
    };
  };

  const fetchFullOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/Order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalized = normalizeApiOrderToAdminShape(res.data);
      setDetailedOrder(normalized);
    } catch (e) {
      console.error("Sipariş detay çekilemedi:", e);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 YENİ: Sepet detaylarını çekmek için fonksiyon
  const fetchFullBasketDetails = async (basketId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Backend'de /Admin/basket/{id} gibi bir yol olduğunu varsayıyoruz
      const res = await api.get(`/Admin/basket/${basketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalized = normalizeApiOrderToAdminShape({ ...res.data, isAbandoned: true });
      setDetailedOrder(normalized);
    } catch (e) {
      console.error("Sepet detay çekilemedi:", e);
      // Eğer tekil sepet çekme API'si yoksa, listeden gelen veriyi kullan
      setDetailedOrder(order);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEftPayment = async () => {
    if (!detailedOrder?.id) return;
    try {
        const token = localStorage.getItem('token');
        await api.put(`/Order/payment-confirm/${detailedOrder.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Ödeme onaylandı. Sipariş hazırlanıyor durumuna alındı.");
        setDetailedOrder(prev => ({ 
            ...prev, 
            payment: 'Ödendi', 
            status: 'Hazırlanıyor' 
        }));
    } catch (e) {
        toast.error("İşlem başarısız: " + (e.response?.data?.message || e.message));
    }
  };

  const handleUpdateStatus = async (newStatus) => {
      if (!detailedOrder?.id) return;
      try {
          const token = localStorage.getItem('token');
          await api.put(`/Order/status/${detailedOrder.id}`, 
              { newStatus: newStatus }, 
              { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`Durum '${newStatus}' olarak güncellendi.`);
          setDetailedOrder(prev => ({ ...prev, status: newStatus }));
      } catch (e) {
          toast.error("Durum güncellenemedi.");
      }
  };

  const handleCancelOrder = async () => {
    if (!detailedOrder?.id) return;
    const confirmCancel = window.confirm("Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.");
    if (!confirmCancel) return;

    try {
        const token = localStorage.getItem('token');
        await api.put(`/Order/status/${detailedOrder.id}`, 
            { newStatus: 'İptal Edildi' }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.warning("Sipariş iptal edildi.");
        setDetailedOrder(prev => ({ 
            ...prev, 
            status: 'İptal Edildi',
            payment: 'İade Edildi'
        }));
    } catch (e) {
        toast.error("İptal işlemi sırasında hata oluştu.");
    }
  };

  const safeDateText = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600 border-gray-200';
    for (const key of Object.keys(statusColors)) {
      if (String(status).includes(key)) return statusColors[key];
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const isEft = detailedOrder?.paymentMethod?.toLowerCase().includes('havale') || detailedOrder?.paymentMethod?.toLowerCase().includes('eft');
  const isPendingEft = isEft && detailedOrder?.payment !== 'Ödendi' && detailedOrder?.status !== 'İptal Edildi';

  return (
    <div className="animate-fade-in flex flex-col h-full bg-gray-50/50 overflow-y-auto p-4">
      
      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FaArrowLeft className="text-gray-600" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {detailedOrder?.isAbandoned ? "Sepet Detayı" : "Sipariş Detayı"} 
                  <span className="text-gray-400 font-normal text-lg ml-2">{detailedOrder?.orderNo}</span>
              </h2>
              <span className={`px-3 py-0.5 rounded text-xs font-bold border ${getStatusColor(detailedOrder?.status)}`}>{detailedOrder?.status || 'Bekliyor'}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{safeDateText(detailedOrder?.date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          {isPendingEft && (
              <div className="flex flex-col gap-2">
                  <button onClick={handleApproveEftPayment} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition flex items-center gap-2 shadow-sm justify-center">
                    <FaCheckCircle /> Ödemeyi Onayla (EFT)
                  </button>
                  <button onClick={handleCancelOrder} className="px-4 py-2 bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-200 transition flex items-center gap-2 shadow-sm justify-center">
                    <FaTimesCircle /> Siparişi İptal Et
                  </button>
              </div>
          )}

          {!detailedOrder?.isAbandoned && detailedOrder?.status !== 'İptal Edildi' && (
              <div className="flex gap-3">
                  <button onClick={() => handleUpdateStatus('Kargoya Verildi')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm h-fit">Kargola</button>
                  <button onClick={() => handleUpdateStatus('Teslim Edildi')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm h-fit">Teslim Et</button>
              </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 space-y-6">
          
          {detailedOrder?.isCorporate && (
            <div className="bg-white border-l-4 border-l-blue-500 border border-gray-200 rounded-xl shadow-sm p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FaBuilding /></div>
                <h3 className="font-bold text-gray-800">Kurumsal Fatura Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Şirket Ünvanı</p>
                  <p className="text-sm font-bold text-gray-700">{detailedOrder.companyName || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Vergi Dairesi</p>
                  <p className="text-sm font-bold text-gray-700">{detailedOrder.taxOffice || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Vergi Numarası</p>
                  <p className="text-sm font-bold text-gray-700">{detailedOrder.taxNumber || '-'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2"><FaBox className="text-gray-400" /><h3 className="font-bold text-gray-700">Ürünler ({detailedOrder?.items?.length || 0})</h3></div>
            <div className="divide-y divide-gray-100 min-h-[150px]">
                {loading ? (
                    <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
                ) : (detailedOrder?.items?.map((item, index) => (
                    <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {item.resimUrl ? (
                              <img src={item.resimUrl} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Resim+Yok"; }} />
                          ) : (
                              <FaBox className="text-gray-300 text-2xl" />
                          )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm">{item.productName}</h4>
                        <p className="text-xs text-gray-500 mt-1 font-medium">x {item.quantity} Adet</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toFixed(2)} ₺</div>
                        <div className="text-[10px] text-gray-400 font-bold">{item.price?.toFixed(2)} ₺ / adet</div>
                      </div>
                    </div>
                )))}
                {!loading && detailedOrder?.items?.length === 0 && <div className="p-10 text-center text-gray-400 italic">Ürün bulunamadı.</div>}
            </div>
            <div className="p-4 bg-gray-50 border-t flex flex-col gap-2 items-end">
              <div className="flex justify-between w-full max-w-xs text-lg font-black pt-2 border-t border-gray-300">
                <span className="text-gray-800">Genel Toplam</span>
                <span className="text-indigo-600">{Number(detailedOrder?.total || 0).toFixed(2)} ₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaUser className="text-gray-400" /> Müşteri Bilgileri</h3>
            <div className="space-y-3">
              <div className="font-bold text-gray-900">{detailedOrder?.customer || '-'}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600"><FaEnvelope className="text-gray-400" /> {detailedOrder?.email || '-'}</div>
              {detailedOrder?.customerPhone && <div className="flex items-center gap-3 text-sm text-gray-600"><FaPhone className="text-gray-400" /> {detailedOrder.customerPhone}</div>}
            </div>
          </div>

          {!detailedOrder?.isAbandoned && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaCreditCard className="text-gray-400" /> Ödeme Detayı</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">Yöntem:</span>
                        <span className="text-gray-800 italic flex items-center gap-1">
                            {isEft ? <FaUniversity className="text-amber-500" /> : <FaCreditCard className="text-blue-500" />}
                            {detailedOrder?.paymentMethod}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">Durum:</span>
                        <span className={`px-3 py-0.5 rounded text-xs font-bold border ${getStatusColor(detailedOrder?.payment)}`}>
                            {detailedOrder?.payment || 'Bekliyor'}
                        </span>
                    </div>
                </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> Teslimat Adresi</h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {detailedOrder?.shippingAddress ? (
                        <>{detailedOrder.shippingAddress.line1}<br/>{detailedOrder.shippingAddress.city} / {detailedOrder.shippingAddress.state} <br/> {detailedOrder.shippingAddress.zip}</>
                    ) : (
                        <span className="text-gray-400 italic">Adres bilgisi yok.</span>
                    )}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;
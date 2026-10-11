// src/Pages/OrderDetailPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api'; // ✅ düzeltildi (senin dosyada './api' idi)
import {
  FaReceipt, FaMapMarkerAlt, FaCalendarAlt,
  FaMoneyBillWave, FaBox, FaUserCircle,
  FaTruck, FaClock, FaCheckCircle
} from 'react-icons/fa';

// Durum renkleri
const statusColors = {
  'Oluşturuldu': 'text-yellow-700 bg-yellow-100',
  'Hazırlanıyor': 'text-blue-700 bg-blue-100',
  'Kargoya Verildi': 'text-indigo-700 bg-indigo-100',
  'Teslim Edildi': 'text-green-700 bg-green-100',
  'İptal Edildi': 'text-red-700 bg-red-100',
  'Bekliyor': 'text-gray-700 bg-gray-100',
  'Ödeme Alındı': 'text-green-700 bg-green-100',
  'Ödeme Bekliyor': 'text-gray-700 bg-gray-100',
};

// icon rengi (Tailwind dynamic class problemi çözümü)
const iconClassByStatus = (statusClass) => {
  if (!statusClass) return 'text-gray-500';
  if (statusClass.includes('text-yellow')) return 'text-yellow-600';
  if (statusClass.includes('text-blue')) return 'text-blue-600';
  if (statusClass.includes('text-indigo')) return 'text-indigo-600';
  if (statusClass.includes('text-green')) return 'text-green-600';
  if (statusClass.includes('text-red')) return 'text-red-600';
  return 'text-gray-500';
};

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await api.get(`/Order/my-order/${id}`, config);

        setOrder(response.data);
      } catch (err) {
        console.error('Order detail error:', err?.response?.data || err);
        if (err.response?.status === 404) {
          setError('Sipariş bulunamadı.');
          toast.error('Sipariş bulunamadı.');
        } else if (err.response?.status === 401) {
          setError('Bu siparişi görüntülemek için giriş yapmalısın.');
          toast.error('Bu siparişi görüntülemek için giriş yapmalısın.');
        } else {
          setError('Sipariş detayları yüklenirken bir hata oluştu.');
          toast.error('Sipariş detayları yüklenirken bir hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-'; // ✅ Invalid Date fix
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);
  };

  if (loading) {
    return <div className="text-center py-20 text-indigo-600 font-semibold">Sipariş Detayları Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600 font-bold text-xl">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-red-600 font-bold text-xl">Sipariş bulunamadı.</div>;
  }

  // ✅ backend nested address: order.shippingAddress
  const shipping = order.shippingAddress || null;
  const shippingText = shipping
    ? [
        shipping.title,
        shipping.street,
        `${shipping.state || ''} ${shipping.city || ''}`.trim(),
        shipping.zipCode,
        shipping.country,
      ].filter(Boolean).join(' • ')
    : null;

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-gray-800">
          <FaReceipt className="text-indigo-600" />
          Sipariş Detayı <span className="text-indigo-600">#{order.id}</span>
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium border border-indigo-600 px-4 py-2 rounded-lg"
        >
          Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol */}
        <div className="lg:col-span-2 space-y-8">
          {/* Özet */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
              <FaClock /> Sipariş Özeti ve Durumu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailCard icon={FaCalendarAlt} title="Sipariş Tarihi" value={formatDate(order.orderDate)} />
              <DetailCard
                icon={FaTruck}
                title="Kargo Durumu"
                value={order.orderStatus || '-'}
                statusClass={statusColors[order.orderStatus] || statusColors['Bekliyor']}
              />
              <DetailCard
                icon={FaCheckCircle}
                title="Ödeme Durumu"
                value={order.paymentStatus || '-'}
                statusClass={statusColors[order.paymentStatus] || statusColors['Bekliyor']}
              />
            </div>
          </div>

          {/* Müşteri */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
              <FaUserCircle /> Müşteri Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Ad Soyad:</span>
                <span className="text-gray-800 font-bold">{order.customerName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">E-posta:</span>
                <span className="text-gray-800">{order.customerEmail || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Telefon:</span>
                <span className="text-gray-800">{order.customerPhoneNumber || '-'}</span>
              </div>
            </div>
          </div>

          {/* Teslimat */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
              <FaMapMarkerAlt /> Teslimat Adresi
            </h2>

            {shippingText ? (
              <p className="text-gray-700">{shippingText}</p>
            ) : (
              <p className="text-gray-500">Adres bilgisi girilmemiş.</p>
            )}
          </div>
        </div>

        {/* Sağ */}
        <div className="space-y-8">
          {/* Ürünler */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
              <FaBox /> Ürünler ({items.length})
            </h2>

            {items.length === 0 ? (
              <div className="text-gray-500 text-sm">Ürün bulunamadı.</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} Adet x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-lg text-indigo-600">
                      {formatCurrency((item.price || 0) * (item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toplam */}
          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FaMoneyBillWave /> Genel Toplam
            </h2>
            <p className="text-4xl font-extrabold">{formatCurrency(order.totalPrice)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, title, value, statusClass = 'text-gray-800 bg-gray-100' }) {
  const iconCls = iconClassByStatus(statusClass);
  return (
    <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="flex items-center mt-1 gap-2">
        <Icon className={`text-lg ${iconCls}`} />
        <span className={`font-semibold text-sm ${statusClass} rounded-full px-2 py-0.5`}>{value}</span>
      </div>
    </div>
  );
}

export default OrderDetailPage;

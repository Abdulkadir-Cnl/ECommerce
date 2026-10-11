// src/Components/Admin/AdminOrders.jsx

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaSearch, FaFilter, FaInfoCircle, FaCheckCircle,
  FaClock, FaTrash, FaUser, FaTimes
} from 'react-icons/fa';
import api from '../../api';
import AdminOrderDetail from './AdminOrderDetail';
import { toast } from 'react-toastify';

function AdminOrders({ subTab }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtreleme State'leri
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* =========================
     FİLTRE YAPILANDIRMASI
  ========================= */
  const fieldOptions = [
    { value: 'status', label: 'Sipariş Durumu' },
    { value: 'date', label: 'Tarih' },
    { value: 'payment', label: 'Ödeme Durumu' },
    { value: 'customer', label: 'Müşteri Adı' },
  ];

  const operatorOptions = [
    { value: 'contains', label: 'içeren' },
    { value: 'eq', label: 'eşittir' },
    { value: 'not_eq', label: 'eşit değildir' },
  ];

  const getStatusOptions = () => [
    { value: 'Hazırlanıyor', label: 'Hazırlanıyor' },
    { value: 'Kargoya Verildi', label: 'Kargoya Verildi' },
    { value: 'Teslim Edildi', label: 'Teslim Edildi' },
    { value: 'İptal Edildi', label: 'İptal Edildi' },
    { value: 'Sepette', label: 'Sepette (Terk Edilmiş)' },
  ];

  const getPaymentOptions = () => [
    { value: 'Ödendi', label: 'Ödendi' },
    { value: 'Ödenmedi', label: 'Ödenmedi' },
  ];

  const makeDefaultCondition = () => ({
    id: Math.random().toString(36).substr(2, 9),
    field: 'status',
    operator: 'eq',
    value: '',
  });

  const [draftConditions, setDraftConditions] = useState([makeDefaultCondition()]);
  const [appliedConditions, setAppliedConditions] = useState([]);

  useEffect(() => {
    fetchData();
    setIsFilterOpen(false);
    setAppliedConditions([]);
    setDraftConditions([makeDefaultCondition()]);
    setCurrentPage(1);
    setSelectedOrder(null);
    setSearchText('');
  }, [subTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (subTab === 'abandoned') {
        const res = await api.get('/Admin/baskets', config);
        const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mappedData = rawData.map(basket => {
          const total = (basket.items || []).reduce((sum, item) => sum + ((item.product?.fiyat || 0) * item.quantity), 0);
          return {
            id: basket.id, orderNo: `SEPET-${basket.id}`, date: basket.lastModifiedDate || new Date(),
            customer: basket.appUser?.userName || basket.appUser?.email || "Bilinmeyen Kullanıcı",
            email: basket.appUser?.email || "-", status: 'Sepette', payment: 'Ödenmedi', total: total, isAbandoned: true
          };
        });
        setOrders(mappedData);
      } else {
        const res = await api.get('/Order', config); 
        const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mappedData = rawData.map(o => ({
          id: o.id, orderNo: `#${o.id}`, date: o.orderDate, customer: o.customerName || "Müşteri",
          email: o.customerEmail || "-", status: o.orderStatus, payment: o.paymentStatus, total: o.totalPrice || 0, isAbandoned: false
        }));
        setOrders(mappedData);
      }
    } catch (e) {
      toast.error("Veriler yüklenirken bir hata oluştu.");
    } finally { setLoading(false); }
  };

  /* =========================
     FİLTRE İŞLEMLERİ
  ========================= */
  const addCondition = () => setDraftConditions([...draftConditions, makeDefaultCondition()]);
  const removeCondition = (id) => setDraftConditions(draftConditions.filter(c => c.id !== id));
  const updateCondition = (id, key, val) => {
    setDraftConditions(draftConditions.map(c => c.id === id ? { ...c, [key]: val } : c));
  };

  const applyFilters = () => {
    setAppliedConditions([...draftConditions]);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    const search = searchText.toLowerCase();

    // 1. Basit Arama
    if (search) {
      result = result.filter(o => 
        o.orderNo.toString().toLowerCase().includes(search) ||
        o.customer.toLowerCase().includes(search) ||
        o.email.toLowerCase().includes(search)
      );
    }

    // 2. Gelişmiş Filtre Koşulları
    appliedConditions.forEach(cond => {
      if (!cond.value) return;
      result = result.filter(o => {
        let fieldVal = o[cond.field];
        
        // Tarih alanı için özel işlem: Formatı YYYY-MM-DD yapıyoruz.
        if (cond.field === 'date') {
            const dateObj = new Date(fieldVal);
            // Geçersiz tarih kontrolü
            if (!isNaN(dateObj.getTime())) {
                fieldVal = dateObj.toISOString().split('T')[0];
            }
        }
        
        const val = cond.value.toString().toLowerCase();
        const target = fieldVal ? fieldVal.toString().toLowerCase() : "";

        if (cond.operator === 'contains') return target.includes(val);
        if (cond.operator === 'eq') return target === val;
        if (cond.operator === 'not_eq') return target !== val;
        return true;
      });
    });

    return result;
  }, [orders, searchText, appliedConditions]);

  const getStatusBadge = (status) => {
    const commonStyles = "px-2 py-1 rounded text-xs font-bold border";
    switch (status) {
      case 'Hazırlanıyor': return <span className={`${commonStyles} bg-orange-100 text-orange-700 border-orange-200`}>Hazırlanıyor</span>;
      case 'Kargoya Verildi': return <span className={`${commonStyles} bg-blue-100 text-blue-700 border-blue-200`}>Kargoda</span>;
      case 'Teslim Edildi': return <span className={`${commonStyles} bg-green-100 text-green-700 border-green-200`}>Teslim</span>;
      case 'İptal Edildi': return <span className={`${commonStyles} bg-red-100 text-red-700 border-red-200`}>İptal</span>;
      case 'Sepette': return <span className={`${commonStyles} bg-purple-100 text-purple-700 border-purple-200`}>Terk Edilmiş</span>;
      default: return <span className={`${commonStyles} bg-gray-100 text-gray-600 border-gray-200`}>{status}</span>;
    }
  };

  // Sayfalama Hesaplamaları
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (selectedOrder) {
    return <AdminOrderDetail order={selectedOrder} onBack={() => { setSelectedOrder(null); fetchData(); }} />;
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {subTab === 'abandoned' ? 'Terk Edilmiş Sepetler' : 'Sipariş Yönetimi'}
        </h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-visible">
        <div className="p-4 border-b border-gray-200 flex gap-4 items-center bg-gray-50/50 relative">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş veya müşteri ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div className="relative" ref={filterRef}>
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
                <FaFilter /> Filtrele
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-[550px] bg-white border border-gray-200 shadow-2xl rounded-xl z-[100] p-4 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filtreleri Düzenle</span>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {draftConditions.map((cond) => (
                    <div key={cond.id} className="flex gap-2 items-center">
                      <select 
                        value={cond.field}
                        onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-purple-500"
                      >
                        {fieldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>

                      <select 
                        value={cond.operator}
                        onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                        className="w-32 p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-purple-500"
                      >
                        {operatorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>

                      {cond.field === 'status' ? (
                        <select 
                            value={cond.value}
                            onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-purple-500"
                        >
                            <option value="">Seçiniz</option>
                            {getStatusOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : cond.field === 'payment' ? (
                        <select 
                            value={cond.value}
                            onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-purple-500"
                        >
                            <option value="">Seçiniz</option>
                            {getPaymentOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input 
                            type={cond.field === 'date' ? 'date' : 'text'}
                            placeholder="Değer..."
                            value={cond.value}
                            onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                        />
                      )}

                      <button 
                        onClick={() => removeCondition(cond.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <button 
                        onClick={addCondition}
                        className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-1"
                    >
                        + Yeni Koşul Ekle
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setDraftConditions([makeDefaultCondition()]); setAppliedConditions([]); }}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                            Sıfırla
                        </button>
                        <button 
                            onClick={applyFilters}
                            className="px-6 py-2 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-sm font-bold transition-all"
                        >
                            Uygula
                        </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">ID / No</th>
                <th className="p-4">Son İşlem Tarihi</th>
                <th className="p-4">Müşteri Bilgisi</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Ödeme</th>
                <th className="p-4 text-right pr-8">Toplam Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-purple-50/30 transition-colors cursor-pointer group">
                    <td className="p-4 font-bold text-gray-900 group-hover:text-purple-600">{order.orderNo}</td>
                    <td className="p-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-300" />
                        {new Date(order.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><FaUser size={12} /></div>
                        <div>
                            <div className="font-bold text-gray-900">{order.customer}</div>
                            <div className="text-xs text-gray-400">{order.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-medium ${order.payment === 'Ödendi' ? 'text-green-600' : 'text-orange-500'}`}>
                            {order.payment === 'Ödendi' ? <FaCheckCircle size={12} /> : null}
                            {order.payment}
                        </span>
                    </td>
                    <td className="p-4 text-right pr-8 font-extrabold text-gray-900">
                      {order.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-white flex justify-between items-center">
          <div className="text-xs text-gray-500 font-medium font-mono">
            Toplam <b>{filteredOrders.length}</b> kayıt
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-gray-50">Geri</button>
            <div className="px-4 py-1 bg-purple-50 border border-purple-200 text-purple-700 font-bold rounded-lg">{currentPage}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-gray-50">İleri</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
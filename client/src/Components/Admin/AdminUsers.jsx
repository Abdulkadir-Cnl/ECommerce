// src/Components/Admin/AdminUsers.jsx

import { useState, useEffect } from "react";
import api from "../../api";
import { FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AdminUserDetail from "./AdminUserDetail";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/Admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Kullanıcılar çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Tarih Formatlayıcı Yardımcı Fonksiyon
  const formatDate = (dateString) => {
    if (!dateString) return { date: '-', time: '' };
    const d = new Date(dateString);
    return {
        date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
        time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (selectedUserId) {
    return (
      <AdminUserDetail
        userId={selectedUserId}
        onBack={() => {
            setSelectedUserId(null);
            fetchUsers();
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-full p-6 bg-[#F9FAFB]">
      
      {/* --- SADECE BAŞLIK --- */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Müşteriler</h1>
      </div>

      {/* --- ANA PANEL --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        
        {/* --- TABLO --- */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9FAFB] sticky top-0 z-10">
              <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-200">
                <th className="p-4 pl-6 font-medium">Müşteri</th>
                <th className="p-4 font-medium">İletişim Bilgileri</th>
                <th className="p-4 font-medium">Oluşturulma Tarihi</th>
                <th className="p-4 font-medium">İletişim İzni</th>
                <th className="p-4 font-medium">Toplam Sipariş</th>
                <th className="p-4 font-medium">Hesap Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
              ) : (
                currentItems.map((user) => {
                  // Backend'den gelen gerçek tarih
                  const dateInfo = formatDate(user.createdDate);
                  // Backend'den gelen gerçek sipariş durumu
                  const hasOrder = user.totalSpent > 0;
                  
                  return (
                    <tr 
                        key={user.id} 
                        onClick={() => setSelectedUserId(user.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer bg-white group"
                    >
                        {/* Müşteri Adı */}
                        <td className="p-4 pl-6">
                            <div className="text-gray-900 font-medium">{user.adSoyad || user.userName}</div>
                        </td>

                        {/* İletişim Bilgileri */}
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className="text-gray-900">{user.email}</span>
                                <span className="text-xs text-gray-500 mt-1">{user.phoneNumber || "-"}</span>
                            </div>
                        </td>

                        {/* Oluşturulma Tarihi (GERÇEK VERİ) */}
                        <td className="p-4">
                             <div className="flex flex-col">
                                <span className="text-gray-900">{dateInfo.date}</span>
                                <span className="text-xs text-gray-500 mt-1">{dateInfo.time}</span>
                            </div>
                        </td>

                        {/* İletişim İzni (GERÇEK VERİ) */}
                        <td className="p-4">
                            {user.hasPermission ? (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded border border-green-200 bg-green-50 text-green-600">
                                    İzni Var
                                </span>
                            ) : (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded border border-gray-200 bg-gray-50 text-gray-500">
                                    İzni Yok
                                </span>
                            )}
                        </td>

                        {/* Toplam Sipariş (GERÇEK VERİ) */}
                        <td className="p-4">
                            {hasOrder ? (
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">₺ {Number(user.totalSpent).toFixed(2)}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">{user.orderCount} Sipariş</span>
                                </div>
                            ) : (
                                <span className="text-gray-900">Sipariş Yok</span>
                            )}
                        </td>

                        {/* Hesap Durumu */}
                        <td className="p-4">
                             <div className="flex items-center gap-2 text-sm">
                                <FaCheckCircle className="text-green-500" /> 
                                <span className="text-gray-700">Hesabı Var</span>
                             </div>
                        </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Satır Adedi:</span>
                <select 
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500 bg-white text-gray-700"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                
                <span className="ml-4 text-gray-500">
                    {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, users.length)} / {users.length} Müşteri
                </span>
            </div>

            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 flex items-center gap-1 text-sm font-medium transition"
                >
                    <FaChevronLeft className="text-xs"/> Önceki
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition ${
                            currentPage === page 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                
                {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 flex items-center gap-1 text-sm font-medium transition"
                >
                    Sonraki <FaChevronRight className="text-xs"/>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
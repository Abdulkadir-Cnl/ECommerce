import { useEffect, useState } from "react";
import api from "../../api";
import {
  FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaShoppingBag, FaMoneyBillWave, FaCalendarAlt, FaShieldAlt, 
  FaExclamationTriangle, FaUserShield
} from "react-icons/fa";

const AdminUserDetail = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // Rol güncelleme işlemi için loading durumu
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      setErrorMsg(""); 
      
      try {
        const token = localStorage.getItem("token");
        // Backend'deki GetUserById metoduna istek atar
        const res = await api.get(`/Admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Gelen Kullanıcı Verisi:", res.data);
        setUser(res.data);

      } catch (error) {
        console.error("Detay Hatası:", error);
        if (error.response) {
            setErrorMsg(`Sunucu Hatası: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            setErrorMsg("Sunucuya ulaşılamıyor. Backend çalışıyor mu?");
        } else {
            setErrorMsg(`Hata: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetail();
  }, [userId]);

  // --- ROL GÜNCELLEME (ADMIN YAP / KALDIR) ---
  const handleToggleAdmin = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      // Backend'in beklediği yapı: { roles: ["Rol1", "Rol2"] }
      const currentRoles = user.roles || user.Roles || [];
      let newRoles;

      if (currentRoles.includes("Admin")) {
        // Adminliği kaldır
        newRoles = currentRoles.filter(r => r !== "Admin");
      } else {
        // Admin yap
        newRoles = [...currentRoles, "Admin"];
      }

      // Backend'deki UpdateUserRoles metoduna (HttpPatch) istek atar
      await api.patch(`/Admin/users/${userId}/roles`, 
        { roles: newRoles }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Başarılı olursa yerel state'i güncelle (sayfayı yenilemeye gerek kalmaz)
      setUser(prev => ({
        ...prev,
        roles: newRoles
      }));

      alert("Kullanıcı yetkisi başarıyla güncellendi.");
    } catch (error) {
      console.error("Rol güncellenemedi:", error);
      alert("Yetki güncellenirken hata oluştu. Yetkiniz olmayabilir.");
    } finally {
      setUpdating(false);
    }
  };

  // --- YÜKLENİYOR DURUMU ---
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Kullanıcı bilgileri yükleniyor...</p>
            </div>
        </div>
    );
  }

  // --- HATA DURUMU ---
  if (errorMsg) {
    return (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
            <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Bir Sorun Oluştu</h2>
            <p className="text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-6">{errorMsg}</p>
            <button 
                onClick={onBack} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
                Listeye Geri Dön
            </button>
        </div>
    );
  }

  if (!user) return null;

  // Veri yardımcıları (PascalCase/camelCase uyumu için)
  const getUserProp = (key) => user[key] || user[key.charAt(0).toUpperCase() + key.slice(1)];
  const getStats = (key) => user.stats ? (user.stats[key] || user.stats[key.charAt(0).toUpperCase() + key.slice(1)]) : 
                           user.Stats ? (user.Stats[key] || user.Stats[key.charAt(0).toUpperCase() + key.slice(1)]) : 0;

  const currentRoles = getUserProp("roles") || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition text-gray-600"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getUserProp("adSoyad") || getUserProp("userName")}
          </h1>
          <p className="text-gray-500 text-sm">@{getUserProp("userName")}</p>
        </div>

        {/* AKSİYON BUTONLARI VE ROLLER */}
        <div className="ml-auto flex items-center gap-4">
            <div className="flex gap-2">
                {currentRoles.map(role => (
                    <span key={role} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                        <FaShieldAlt /> {role}
                    </span>
                ))}
            </div>

            <button
                onClick={handleToggleAdmin}
                disabled={updating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-sm border
                    ${currentRoles.includes("Admin") 
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                        : "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"}`}
            >
                {updating ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                ) : (
                    <FaUserShield className="text-lg" />
                )}
                {currentRoles.includes("Admin") ? "Adminliği Kaldır" : "Kullanıcıyı Admin Yap"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL KOLON: PROFİL KARTI */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400">
                    <FaUser />
                </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <FaEnvelope className="text-gray-400" />
                <span className="text-sm">{getUserProp("email")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaPhone className="text-gray-400" />
                <span className="text-sm">{getUserProp("phoneNumber") || "Telefon Yok"}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <span className="text-sm">{getUserProp("adres") || "Adres Girilmemiş"}</span>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">Müşteri Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <FaMoneyBillWave /> <span className="text-sm font-semibold">Toplam Harcama</span>
                </div>
                <span className="font-bold text-green-800">{getStats("totalSpent")} ₺</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <FaShoppingBag /> <span className="text-sm font-semibold">Sipariş Adeti</span>
                </div>
                <span className="font-bold text-blue-800">{getStats("orderCount")}</span>
              </div>

               <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <FaCalendarAlt /> <span className="text-sm font-semibold">Son Sipariş</span>
                </div>
                <span className="font-bold text-orange-800 text-xs">
                    {getStats("lastOrderDate") 
                        ? new Date(getStats("lastOrderDate")).toLocaleDateString("tr-TR") 
                        : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: SİPARİŞ GEÇMİŞİ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-700">Sipariş Geçmişi</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-xs text-gray-500 uppercase font-bold border-b">
                  <tr>
                    <th className="p-4">Sipariş No</th>
                    <th className="p-4">Tarih</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {getUserProp("recentOrders") && getUserProp("recentOrders").length > 0 ? (
                    getUserProp("recentOrders").map((order) => {
                      const orderId = order.id || order.Id;
                      const orderDate = order.orderDate || order.OrderDate;
                      const orderStatus = order.orderStatus || order.OrderStatus;
                      const totalPrice = order.totalPrice || order.TotalPrice;

                      return (
                        <tr key={orderId} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-mono text-gray-500">#{orderId}</td>
                            <td className="p-4 text-gray-600">
                            {new Date(orderDate).toLocaleDateString("tr-TR")}
                            </td>
                            <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                ${orderStatus === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 
                                orderStatus === 'İptal Edildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {orderStatus}
                            </span>
                            </td>
                            <td className="p-4 text-right font-bold text-gray-800">
                            {totalPrice} ₺
                            </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        Henüz sipariş kaydı yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
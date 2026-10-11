import { useEffect, useState, useRef } from "react";
import api from "../../api";
import {
  FaShoppingBag,
  FaClipboardList,
  FaUsers,
  FaPercent,
  FaUndo,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  // --- CONFIG ---
  const API_BASE_URL = "https://localhost:7011";

  // --- STATE ---
  const [allOrders, setAllOrders] = useState([]); 
  const [totalUsers, setTotalUsers] = useState(0); // Toplam Kullanıcı Sayısı
  const [filteredMetrics, setFilteredMetrics] = useState({
    totalSales: 0,
    orderCount: 0,
    returnAmount: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre
  const [selectedFilter, setSelectedFilter] = useState("Bu Ay");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- 1. TARİH HESAPLAMA MOTORU ---
  const getDateRange = (filter) => {
    const end = new Date();
    let start = new Date();
    let viewType = "Günlük";

    const resetTime = (d) => d.setHours(0,0,0,0);

    switch (filter) {
      case "Bugün":
        resetTime(start);
        break;
      case "Dün":
        start.setDate(start.getDate() - 1);
        resetTime(start);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "Bu Hafta":
        const day = start.getDay() || 7; 
        if (day !== 1) start.setHours(-24 * (day - 1)); 
        else resetTime(start);
        break;
      case "Bu Ay":
        start.setDate(1); 
        resetTime(start);
        break;
      case "Geçen Ay":
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        resetTime(start);
        end.setDate(0);
        end.setHours(23,59,59,999);
        break;
      case "Son 7 Gün":
        start.setDate(start.getDate() - 7);
        break;
      case "Son 30 Gün":
        start.setDate(start.getDate() - 30);
        viewType = "Haftalık";
        break;
      case "Bu Yıl":
        start.setMonth(0, 1);
        resetTime(start);
        viewType = "Aylık";
        break;
      default:
        start.setDate(1); 
    }
    return { start, end, viewType };
  };

  // --- 2. VERİ ÇEKME ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Tüm siparişler
        const resOrders = await api.get("/Order", { headers }); 
        setAllOrders(resOrders.data);

        // En çok satanlar
        const resTop = await api.get("/Admin/TopSellingProducts", { headers });
        setTopProducts(resTop.data);

        // 🔥 TOPLAM KULLANICI SAYISI ÇEKİLMESİ
        const resUsers = await api.get("/Admin/total-users", { headers });
        setTotalUsers(resUsers.data.totalUsers ?? resUsers.data.TotalUsers ?? 0);

      } catch (err) {
        console.error("Veri çekme hatası:", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const updateDashboard = async () => {
      setLoading(true);
      const { start, end, viewType } = getDateRange(selectedFilter);
      const token = localStorage.getItem("token");
      
      try {
        const resChart = await api.get("/Admin/SalesReports", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
            view: viewType,
          },
        });
        setChartData(resChart.data);
      } catch (e) { setChartData([]); }

      if (allOrders.length > 0) {
        const filtered = allOrders.filter(o => {
          const oDate = new Date(o.orderDate);
          return oDate >= start && oDate <= end;
        });

        const totalSales = filtered.reduce((acc, curr) => acc + curr.totalPrice, 0);
        const orderCount = filtered.length;
        const returns = filtered.filter(o => o.orderStatus === "İptal Edildi").reduce((acc, curr) => acc + curr.totalPrice, 0);

        setFilteredMetrics({
          totalSales,
          orderCount,
          returnAmount: returns
        });
      }

      setLoading(false);
    };

    updateDashboard();
  }, [selectedFilter, allOrders]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- BİLEŞENLER ---
  const FilterOption = ({ label }) => (
    <button
      onClick={() => { setSelectedFilter(label); setIsDropdownOpen(false); }}
      className={`block w-full text-left px-4 py-2 text-sm transition ${
        selectedFilter === label 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon, trend, isMoney, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl text-xl ${colorClass || 'bg-gray-50 text-gray-600'}`}>
          {icon}
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {trend > 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
             {Math.abs(trend)}%
           </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-800">
          {isMoney 
            ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
            : value
          }
        </h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* BAŞLIK VE FİLTRE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Genel Bakış</h1>
          <p className="text-gray-500 mt-1 text-sm">Mağaza performans özetiniz.</p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-3 hover:border-gray-300 transition font-medium text-sm min-w-[160px] justify-between"
          >
            <div className="flex items-center gap-2">
               <FaCalendarAlt className="text-gray-400" />
               <span>{selectedFilter}</span>
            </div>
            <FaChevronDown className={`text-xs text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2 max-h-[400px] overflow-y-auto">
                <FilterOption label="Bugün" />
                <FilterOption label="Dün" />
                <div className="border-t border-gray-100 my-1"></div>
                <FilterOption label="Bu Hafta" />
                <FilterOption label="Bu Ay" />
                <FilterOption label="Geçen Ay" />
                <div className="border-t border-gray-100 my-1"></div>
                <FilterOption label="Son 7 Gün" />
                <FilterOption label="Son 30 Gün" />
                <FilterOption label="Bu Yıl" />
            </div>
          )}
        </div>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
            title="TOPLAM SATIŞ" 
            value={filteredMetrics.totalSales} 
            icon={<FaShoppingBag />} 
            trend={12} 
            isMoney 
            colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
            title="SİPARİŞ SAYISI" 
            value={filteredMetrics.orderCount} 
            icon={<FaClipboardList />} 
            trend={-5} 
            colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
            title="TOPLAM KULLANICI" 
            value={totalUsers} // API'den gelen toplam kullanıcı
            icon={<FaUsers />} 
            trend={18} 
            colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard 
            title="DÖNÜŞÜM ORANI" 
            value="%2.8" 
            icon={<FaPercent />} 
            colorClass="bg-teal-50 text-teal-600"
        />
        <StatCard 
            title="İADELER" 
            value={filteredMetrics.returnAmount} 
            icon={<FaUndo />} 
            isMoney 
            colorClass="bg-red-50 text-red-600"
        />
      </div>

      {/* GRAFİK */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaShoppingBag className="text-indigo-600" />
          Satış Grafiği ({selectedFilter})
        </h2>
        
        <div className="h-[350px] w-full">
          {loading ? (
             <div className="flex items-center justify-center h-full">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none", color:"#fff" }}
                  formatter={(value) => [`${parseFloat(value).toLocaleString("tr-TR")} ₺`, "Ciro"]}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Bu tarih aralığında veri bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* ALT BÖLÜM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EN ÇOK SATANLAR */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">En Çok Satanlar</h2>
          <div className="space-y-4">
            {topProducts.map((product, idx) => {
               // Resim URL birleştirme mantığı
               const fullResimUrl = product.resimUrl 
                 ? (product.resimUrl.startsWith('http') ? product.resimUrl : `${API_BASE_URL}${product.resimUrl}`)
                 : null;

               return (
                 <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition group">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                        {fullResimUrl ? (
                          <img 
                            src={fullResimUrl} 
                            alt={product.ad} 
                            className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Yok"; }}
                          />
                        ) : (
                          <FaShoppingBag className="text-gray-200" />
                        )}
                     </div>
                     <div>
                       <p className="font-bold text-gray-800 text-sm">{product.ad}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.barcode || "SKU-GENEL"}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-gray-900 text-sm">{product.fiyat?.toFixed(2)} ₺</p>
                     <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">
                        {product.adet} Satış
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-800">Analiz</h2>
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 text-[10px] font-black uppercase block mb-1">İade Oranı</span>
                    <span className="text-2xl font-black text-gray-800">%0.00</span>
                  </div>
                  <span className="text-red-500 font-bold text-sm">▼ %100</span>
              </div>
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 text-[10px] font-black uppercase block mb-1">Dönüşüm Oranı</span>
                    <span className="text-2xl font-black text-gray-800">%2.8</span>
                  </div>
                  <span className="text-green-500 font-bold text-sm">▲ Stabil</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
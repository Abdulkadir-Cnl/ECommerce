import { useEffect, useState, useMemo } from "react";
import {
  FaFilter, FaCalendarAlt, FaDownload, FaFileExport
} from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

// 🔴 BASE URL Tanımlaması
const BASE_URL = "https://localhost:7011";

// Yardımcılar
const formatDateToISO = (date) => date.toISOString().split('T')[0];

const getDefaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start: formatDateToISO(start), end: formatDateToISO(end) };
};

// 🔴 RESİM URL'Sİ DÜZELTME MANTIĞI
const getImageUrl = (relativeUrl) => {
    // Eğer relativeUrl null, çok kısa veya zaten tam bir URL ise (http/https içeriyorsa), olduğu gibi döndür.
    if (!relativeUrl || relativeUrl.length < 5 || relativeUrl.startsWith('http')) {
        return "https://via.placeholder.com/40?text=Urun"; // Varsayılan yer tutucu
    }
    // Aksi takdirde, BASE_URL ile birleştir.
    return `${BASE_URL}/${relativeUrl}`;
};

// Mevcut getImage fonksiyonunu getImageUrl ile güncelleyelim.
const getImage = getImageUrl;


function AdminReports() {
  const defaultDates = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  // METRİK STATE
  const [metric, setMetric] = useState("Net Satış"); 
  const [view, setView] = useState("Günlük");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // YENİ LİSTE: "Satış Adedi" eklendi
  const metricsList = [
    "Net Satış",
    "Satış Adedi" 
  ];

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, view, startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Backend'in beklediği parametreye çevir
      // "Net Satış" -> "tutar"
      // "Satış Adedi" -> "adet"
      const metricParam = metric === "Satış Adedi" ? "adet" : "tutar";

      const res = await api.get("/Admin/ProductSalesReports", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start: startDate,
          end: endDate,
          view: view,
          metric: metricParam // YENİ PARAMETRE GÖNDERİLİYOR
        },
      });

      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Rapor yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const periods = useMemo(() => data?.periods || [], [data]);
  const rows = data?.rows || [];

  const formatCurrency = (x) =>
    Number(x || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";

  // Eğer "Satış Adedi" seçiliyse Para Birimi (₺) gösterme
  const isCountMetric = metric === "Satış Adedi";

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      {/* BAŞLIK */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Satış Raporları</h2>
            <FaCalendarAlt className="text-gray-400 text-sm"/>
        </div>
      </div>

      {/* FİLTRELER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        
        {/* METRİK SEÇİMİ */}
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold mb-1 ml-1">METRİK</span>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white min-w-[140px]"
            >
              {metricsList.map((m) => <option key={m}>{m}</option>)}
            </select>
        </div>

        {/* GÖRÜNÜM SEÇİMİ */}
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold mb-1 ml-1">GÖRÜNÜM</span>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
            >
              <option>Günlük</option>
              <option>Haftalık</option>
              <option>Aylık</option>
            </select>
        </div>

        {/* TARİH */}
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold mb-1 ml-1">TARİH ARALIĞI</span>
            <div className="flex gap-2 items-center">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"/>
                <span className="text-gray-400">-</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"/>
            </div>
        </div>

        
      </div>

      {/* TABLO */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 w-1/3">Ürün</th>
                {periods.map((p) => (
                    <th key={p} className="p-4 text-right whitespace-nowrap min-w-[80px]">{p}</th>
                ))}
                <th className="p-4 text-right bg-gray-100/50">TOPLAM</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {loading ? (
                    <tr><td colSpan={periods.length + 2} className="text-center p-12 text-gray-500">Yükleniyor...</td></tr>
                ) : rows.length === 0 ? (
                    <tr>
                        <td colSpan={periods.length + 2} className="text-center p-12 text-gray-400">
                            <div className="flex flex-col items-center">
                                <FaFileExport className="text-4xl mb-3 opacity-20" />
                                <p>Veri bulunamadı.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                rows.map((r) => (
                    <tr key={r.productId} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white p-0.5 overflow-hidden shrink-0">
                                    {/* 🔴 Düzeltilmiş getImage fonksiyonu kullanılıyor */}
                                    <img src={getImage(r.productImage)} className="w-full h-full object-contain" alt={r.productName} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-800 truncate">{r.productName}</div>
                                    <div className="text-xs text-gray-400 font-mono">{r.sku}</div>
                                </div>
                            </div>
                        </td>
                        {periods.map((p) => (
                            <td key={p} className="p-4 text-right font-medium text-gray-600">
                                {isCountMetric ? (r.metricsByPeriod[p] || 0) : formatCurrency(r.metricsByPeriod[p])}
                            </td>
                        ))}
                        <td className="p-4 text-right font-bold text-indigo-700 bg-gray-50/30">
                            {isCountMetric ? r.total : formatCurrency(r.total)}
                        </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
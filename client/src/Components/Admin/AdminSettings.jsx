import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Bileşen Importları
import ThemeEditor from "./ThemeEditor";
import SeoSettings from "./SeoSettings";
import AdminPlugins from "./AdminPlugins";
import PaymentSettings from "./PaymentSettings";
import BlogSettings from "./BlogSettins";

// İkonlar
import {
  FaPalette,
  FaSearch,
  FaCreditCard,
  FaTruck,
  FaPuzzlePiece,
  FaPenNib,
  FaArrowLeft
} from "react-icons/fa";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("themes");
  const [previewKey, setPreviewKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const reloadPreview = () => {
      setPreviewKey(prev => prev + 1);
    };
    window.addEventListener("homepage-updated", reloadPreview);
    return () => window.removeEventListener("homepage-updated", reloadPreview);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">

      {/* SOL MENÜ (Sticky) */}
      <aside className="w-64 bg-[#0f172a] text-gray-400 flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0 shadow-xl z-20">

        {/* GERİ BUTONU */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-6 py-5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border-b border-gray-800 transition-colors flex-shrink-0"
        >
          <FaArrowLeft />
          Panele Dön
        </button>

        {/* BAŞLIK */}
        <div className="p-6 pb-2">
          <h2 className="text-white font-bold text-xl tracking-tight">Mağaza Ayarları</h2>
          <p className="text-xs text-gray-500 mt-1">Yönetim Paneli v2.0</p>
        </div>

        {/* MENÜ LİSTESİ */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          <MenuItem
            icon={<FaPalette />}
            label="Temalarım"
            active={activeTab === "themes"}
            onClick={() => setActiveTab("themes")}
          />
          <MenuItem
            icon={<FaSearch />}
            label="SEO ve Alan Adı"
            active={activeTab === "seo"}
            onClick={() => setActiveTab("seo")}
          />
          <MenuItem
            icon={<FaCreditCard />}
            label="Ödeme Yöntemleri"
            active={activeTab === "payment"}
            onClick={() => setActiveTab("payment")}
          />
          <MenuItem
            icon={<FaTruck />}
            label="Kargo Ayarları"
            active={activeTab === "cargo"}
            onClick={() => setActiveTab("cargo")}
          />
          <MenuItem
            icon={<FaPuzzlePiece />}
            label="Eklentiler"
            active={activeTab === "plugins"}
            onClick={() => setActiveTab("plugins")}
          />
          
          <div className="my-4 border-t border-gray-800 mx-4"></div>
          
          <MenuItem
            icon={<FaPenNib />}
            label="Blog Yönetimi"
            active={activeTab === "blog"}
            onClick={() => setActiveTab("blog")}
            isSpecial={true} // Özel vurgu için
          />
        </nav>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 bg-[#f8fafc] overflow-visible min-h-screen relative">
        {activeTab === "themes" && <ThemeEditor />}
        {activeTab === "seo" && <SeoSettings />}
        {activeTab === "plugins" && <AdminPlugins />}
        {activeTab === "payment" && <PaymentSettings />}
        
        {/* YENİ BLOG BÖLÜMÜ */}
        {activeTab === "blog" && <BlogSettings />}

        {/* HAZIR OLMAYAN SAYFALAR İÇİN */}
        {activeTab !== "themes" &&
          activeTab !== "seo" &&
          activeTab !== "plugins" &&
          activeTab !== "payment" && 
          activeTab !== "blog" && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FaPuzzlePiece className="text-6xl mb-4 opacity-20" />
              <h2 className="text-xl font-bold">Bu modül yapım aşamasında.</h2>
            </div>
          )}
      </div>
    </div>
  );
};

/* GELİŞMİŞ MENÜ ITEM */
const MenuItem = ({ icon, label, active, onClick, isSpecial }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
      ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1"
          : "hover:bg-white/5 hover:text-white text-gray-400"
      }`}
  >
    <span className={`text-lg transition-transform group-hover:scale-110 ${active ? "text-white" : isSpecial ? "text-indigo-400" : "text-gray-500"}`}>{icon}</span>
    {label}
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
  </button>
);

export default AdminSettings;
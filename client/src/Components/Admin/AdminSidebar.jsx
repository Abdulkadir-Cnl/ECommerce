// src/Components/Admin/AdminSidebar.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaBoxOpen, FaShoppingCart, FaUsers, FaCog, FaSignOutAlt,
  FaChevronDown, FaHeadset, FaChartBar, FaUserCircle,
  FaCreditCard, FaExclamationTriangle, FaEllipsisH
} from 'react-icons/fa';
import api from '../../api';

function AdminSidebar({ activeTab, setActiveTab, handleLogout }) {
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({
    products: false,
    orders: false,
  });

  const [paytrRemainingDays, setPaytrRemainingDays] = useState(0);
  const [adminName, setAdminName] = useState("Yönetici");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  /* 🔐 PayTR süre hesaplama */
  useEffect(() => {
    const PAYTR_END_DATE = "2025-03-31";

    const calc = () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const end = new Date(PAYTR_END_DATE);
      end.setHours(0,0,0,0);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      setPaytrRemainingDays(diff > 0 ? diff : 0);
    };

    calc();
    const i = setInterval(calc, 1000 * 60 * 60);
    return () => clearInterval(i);
  }, []);

  /* 👤 Admin bilgisi */
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await api.get("/User/me");
        setAdminName(res.data.fullName || res.data.userName || "Yönetici");
      } catch {}
    };
    fetchAdminInfo();
  }, []);

  return (
    <aside className="w-[280px] min-w-[280px] bg-[#0f0f0f] text-gray-400 flex flex-col h-screen sticky top-0">

      {/* LOGO ALANI */}
      <div 
        onClick={() => navigate('/')} 
        className="h-24 flex items-center justify-center px-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors group"
      >
        {/* Public klasöründeki dosya adın '0' olduğu için /0.png olarak güncellendi */}
        <img 
          src="/0.png" 
          alt="Başyazıcı Logo" 
          className="max-h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Eğer .png olarak bulamazsa .jpg dene (opsiyonel hata yakalama)
            if (!e.target.src.includes('.png')) e.target.src = '/0.png';
          }}
        />
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">

        <SidebarItem icon={<FaHome />} text="Giriş"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />

        <DropdownItem
          icon={<FaBoxOpen />}
          text="Ürünler"
          isOpen={openMenus.products}
          onClick={() => toggleMenu('products')}
        >
          <SubItem
            text="Ürünler"
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <SubItem
            text="Stoklar"
            active={activeTab === 'stocks'}
            onClick={() => setActiveTab('stocks')}
          />
        </DropdownItem>

        <DropdownItem
          icon={<FaShoppingCart />}
          text="Siparişler"
          isOpen={openMenus.orders}
          onClick={() => toggleMenu('orders')}
        >
          <SubItem
            text="Siparişler"
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <SubItem
            text="Terkedilmiş Sepetler"
            active={activeTab === 'abandoned'}
            onClick={() => setActiveTab('abandoned')}
          />
        </DropdownItem>

        <SidebarItem icon={<FaUsers />} text="Müşteriler"
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        />

        <SidebarItem icon={<FaChartBar />} text="Satış Raporları"
          active={activeTab === 'reports'}
          onClick={() => setActiveTab('reports')}
        />

        <SidebarItem icon={<FaHeadset />} text="Destek Talepleri"
          active={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
        />

        <SidebarItem icon={<FaCog />} text="Ayarlar"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />

        {/* 💳 PayTR Uyarı */}
        <div
          className={`mx-4 mt-3 p-3 rounded-lg border text-xs ${
            paytrRemainingDays === 0
              ? "bg-red-900/30 border-red-700 text-red-400"
              : paytrRemainingDays <= 7
              ? "bg-yellow-900/30 border-yellow-700 text-yellow-400"
              : "bg-green-900/30 border-green-700 text-green-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCreditCard />
              <span>
                {paytrRemainingDays === 0
                  ? "PayTR süresi doldu"
                  : `PayTR ${paytrRemainingDays} gün`}
              </span>
            </div>
            {paytrRemainingDays <= 7 && <FaExclamationTriangle />}
          </div>
        </div>

      </nav>

      {/* PROFİL & ÇIKIŞ */}
      <div className="p-4 border-t border-[#222] relative">
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group">
          <div className="flex items-center gap-3">
            <FaUserCircle size={24} className="text-gray-400 group-hover:text-white" />
            <div className="text-left">
              <p className="text-sm font-bold text-white leading-tight">{adminName}</p>
              <p className="text-xs text-[#ccff00]">Yönetici</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-[#333] rounded-full text-gray-500 hover:text-white transition-all"
          >
            <FaEllipsisH />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-1 animate-fade-in z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/10 hover:text-red-300 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FaSignOutAlt /> Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

const SidebarItem = ({ icon, text, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
      active ? 'bg-[#222] text-white font-medium' : 'hover:bg-[#1a1a1a]'
    }`}
  >
    {icon} <span>{text}</span>
  </div>
);

const DropdownItem = ({ icon, text, isOpen, onClick, children }) => (
  <div>
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-[#1a1a1a] ${isOpen ? 'bg-[#1a1a1a] text-white' : ''}`}
    >
      <div className="flex items-center gap-3">
        {icon} <span>{text}</span>
      </div>
      <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </div>
    {isOpen && <div className="ml-8 space-y-1 mt-1 border-l border-[#333] pl-2">{children}</div>}
  </div>
);

const SubItem = ({ text, active, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
      active ? 'bg-[#222] text-[#ccff00] font-medium' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300'
    }`}
  >
    {text}
  </div>
);

export default AdminSidebar;
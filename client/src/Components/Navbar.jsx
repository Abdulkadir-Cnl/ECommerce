import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaHeart, FaShoppingBasket, FaSignInAlt } from 'react-icons/fa';
import { useBasket } from '../Context/BasketContext';
import { jwtDecode } from "jwt-decode"; 
import api from "../Api"; 

const BASE_URL = "https://localhost:7011";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null); 
  const [navCategories, setNavCategories] = useState([]); // Seçili kategoriler
  const [theme, setTheme] = useState(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const { basketCount, setIsBasketOpen } = useBasket();

  // 1. Verileri Çek ve Eşleştir
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [catRes, themeRes] = await Promise.all([
                api.get("/Category"),
                api.get("/theme/homepage")
            ]);
            
            const allCats = catRes.data || [];
            const themeData = themeRes.data || {};
            setTheme(themeData);

            // 🔴 ÖNEMLİ: Sadece Kategori Barı için seçilen ID'leri filtrele
            // JSON parse hatası ihtimaline karşı try-catch veya güvenli parse
            let selectedIds = [];
            try {
                selectedIds = JSON.parse(themeData.homepageCategoryIds || "[]").map(Number);
            } catch {
                selectedIds = [];
            }

            // Seçili ID'lere göre kategorileri bul ve sırala
            const filtered = selectedIds
                .map(id => allCats.find(c => c.id === id))
                .filter(Boolean); // Bulunamayanları temizle

            setNavCategories(filtered);

        } catch (error) {
            console.error("Navbar veri hatası", error);
        }
    };
    fetchData();
  }, []);

  // 2. Kullanıcı Kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUser({
          role: userRole,
          link: (userRole === "Admin" || userRole === "Satıcı") ? "/admin" : "/profile"
        });
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/category/${searchTerm}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="bg-white font-sans sticky top-0 z-40 shadow-sm">
      
      {/* --- ÜST KISIM --- */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0">
             {theme?.logoUrl ? (
                 <img 
                    src={`${BASE_URL}${theme.logoUrl}`} 
                    alt="Logo" 
                    className="h-12 md:h-16 object-contain"
                 />
             ) : (
                 <div className="bg-black text-white px-4 py-2 text-center">
                    <h1 className="text-xl md:text-2xl font-serif tracking-widest font-bold">BAŞYAZICI</h1>
                    <p className="text-[9px] md:text-[10px] tracking-widest text-gray-300 uppercase">Geleneksel Lezzet</p>
                 </div>
             )}
          </Link>

          {/* ARAMA */}
          <div className="flex-1 w-full max-w-2xl mx-auto md:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                placeholder="Aradığınız lezzeti yazın..." 
                className="w-full py-2.5 pl-5 pr-10 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-600 shadow-sm text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute right-1.5 top-1 bg-red-700 text-white p-1.5 rounded-full hover:bg-red-800 transition">
                <FaSearch size={12} />
              </button>
            </form>
          </div>

          {/* İKONLAR */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
                <Link to={user.link} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded hover:border-red-600 transition">
                    <FaUser size={14} className="text-gray-600"/> <span className="text-xs font-bold text-gray-600">Hesabım</span>
                </Link>
            ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded hover:border-red-600 transition">
                    <FaSignInAlt size={14} className="text-gray-600"/> <span className="text-xs font-bold text-gray-600">Giriş</span>
                </Link>
            )}
            <Link to="/" className="p-2.5 border border-gray-200 rounded hover:text-red-600 transition"><FaHeart size={16} /></Link>
            <button onClick={() => setIsBasketOpen(true)} className="relative p-2.5 border border-gray-200 rounded hover:text-red-600 transition">
              <FaShoppingBasket size={18} />
              {basketCount > 0 && <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{basketCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* --- ALT MENÜ (SADECE SEÇİLİ KATEGORİLER) --- */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 py-3">
                
                {/* Seçili Kategoriler Listesi */}
                {navCategories.map(cat => (
                    <Link key={cat.id} to={`/category/${cat.ad || cat.name}`} className="text-xs md:text-sm font-bold text-gray-600 hover:text-red-700 uppercase tracking-wide">
                        {cat.ad || cat.name}
                    </Link>
                ))}

                {navCategories.length === 0 && (
                    <span className="text-xs text-gray-400">Kategori seçilmedi (ThemeEditor'den Kategori Barı'nı düzenleyin)</span>
                )}
            </div>
        </div>
      </div>

    </div>
  );
}

export default Navbar;
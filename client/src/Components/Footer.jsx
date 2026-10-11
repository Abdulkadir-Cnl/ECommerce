import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import api from '../Api';

function Footer() {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    api.get("/theme/homepage")
       .then(res => {
           if(res.data && res.data.footerData) {
               try {
                   setColumns(JSON.parse(res.data.footerData));
               } catch {
                   setColumns([]); // Hata varsa boş
               }
           }
       })
       .catch(() => setColumns([]));
  }, []);

  // Eğer veri yoksa varsayılanı göster (Opsiyonel)
  // Veya loading state eklenebilir.

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto flex flex-col">
      <div className="container mx-auto px-4 pt-16 pb-8">
        
        {/* ÜST KISIM: DİNAMİK SÜTUNLAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Dinamik Link Sütunları (İlk 4 Sütun) */}
          {columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-gray-900 mb-6 text-lg">{col.title}</h4>
                <ul className="flex flex-col gap-3 text-sm text-gray-500">
                  {col.links.map((link, i) => (
                      <li key={i}>
                          <Link to={link.url} className="hover:text-red-600 transition-colors">
                              {link.text}
                          </Link>
                      </li>
                  ))}
                </ul>
              </div>
          ))}

          {/* 5. Sütun: Bülten (Sabit Kalabilir veya Dinamik Yapılabilir) */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Doğallığa Adım Atın</h4>
            <p className="text-sm text-gray-500 mb-4">Başyazıcı'nın eşsiz fırsatlarını kaçırmayın!</p>
            <form className="flex flex-col gap-2">
                <input type="email" placeholder="E-posta adresiniz" className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm"/>
                <button className="w-full bg-red-700 text-white font-bold py-3 rounded hover:bg-red-800 transition-colors">ABONE OL</button>
            </form>
          </div>

        </div>

        {/* ALT KISIM: Sosyal Medya ve Copyright (Sabit) */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"><FaFacebookF /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"><FaInstagram size={18} /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"><FaYoutube size={18} /></a>
            </div>
            <div className="text-sm text-gray-400">© 2025 Başyazıcı Et Ürünleri. Tüm hakları saklıdır.</div>
            <div className="flex gap-3 text-gray-400 text-3xl"><FaCcVisa className="hover:text-blue-900 transition-colors"/><FaCcMastercard className="hover:text-red-600 transition-colors"/></div>
        </div>
      </div>

      <div className="w-full bg-red-700 py-2">
        <div className="container mx-auto px-4"><span className="text-white text-sm font-medium">Performance Marketing: Balp Dijital</span></div>
      </div>
    </footer>
  );
}

export default Footer;
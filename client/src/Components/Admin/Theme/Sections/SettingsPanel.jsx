// src/Components/Admin/Theme/Sections/SettingsPanel.jsx
import React from 'react';

function SettingsPanel({ theme, setTheme, settingsOpen, setSettingsOpen }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
             <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setSettingsOpen(!settingsOpen)}>
                Görünüm Ayarları
                <span>{settingsOpen?"-":"+"}</span>
             </div>
             {settingsOpen && (
                 <div className="p-4 border-t grid grid-cols-2 gap-3 text-gray-700 bg-white">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showHeroSlider} onChange={e=>setTheme({...theme, showHeroSlider: e.target.checked})}/> Hero Slider</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showCategories} onChange={e=>setTheme({...theme, showCategories: e.target.checked})}/> Kategori Barı</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showFeatured} onChange={e=>setTheme({...theme, showFeatured: e.target.checked})}/> Öne Çıkanlar</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showKitchen} onChange={e=>setTheme({...theme, showKitchen: e.target.checked})}/> Mutfak Kısmı</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showShowcase} onChange={e=>setTheme({...theme, showShowcase: e.target.checked})}/> 3'lü Vitrin (Üst)</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="checkbox" checked={theme.showProducts} onChange={e=>setTheme({...theme, showProducts: e.target.checked})}/> Tüm Ürünler Listesi</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold col-span-2 bg-gray-100 p-1 rounded"><input type="checkbox" checked={theme.showBottomShowcase} onChange={e=>setTheme({...theme, showBottomShowcase: e.target.checked})}/> 2. Vitrin Alanı (Alt)</label>
                 </div>
             )}
          </div>
    );
}

export default SettingsPanel;
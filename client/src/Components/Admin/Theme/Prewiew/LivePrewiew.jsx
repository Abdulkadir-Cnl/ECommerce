// src/Components/Admin/Theme/Preview/LivePreview.jsx
import React from 'react';
import { FaEye, FaDesktop, FaMobileAlt, FaSyncAlt, FaExternalLinkAlt } from "react-icons/fa";

// Component/Content Imports
import HeroSlider from "../../../HeroSlider";
import FeaturedProducts from "../../../FeaturedProducts";
import CategoryShowcase from "../../../CategoryShowcase"; 
import ProductCard from "../../../ProductCard";
import CategoryBar from "../../../CategoryBar"; // Eklenmeli

const BASE_URL = "https://localhost:7011";

// İçerik render eden alt fonksiyon
const PreviewContent = ({ theme, allCategories, allProducts, previewMode, footerColumns }) => {
    const safeParse = (str) => { try { return JSON.parse(str || "[]"); } catch { return []; } };
    const selectedCategoryIds = safeParse(theme.homepageCategoryIds).map(Number);
    const kitchenList = safeParse(theme.kitchenMedia);

    return (
        <div className="w-full h-full bg-white overflow-y-auto">
            <div className="flex justify-center py-4 border-b">
                {theme.logoUrl ? <img src={`${BASE_URL}${theme.logoUrl}`} alt="Logo" className="h-12 object-contain"/> : <div className="bg-black text-white px-4 py-2 text-center font-bold">BAŞYAZICI</div>}
            </div>
            
            {theme.showHeroSlider && <HeroSlider images={theme.heroSliderImages}/>}
            
            {/* Kategori Barı için CategoryBar bileşenini kullanıyoruz (Daha Önce Düzenlendi) */}
            {theme.showCategories && (
                <CategoryBar allCategories={allCategories} selectedIds={theme.homepageCategoryIds} />
            )}

            {theme.showFeatured && (
                <div className="py-4 px-2">
                    <h3 className="text-center text-lg font-bold mb-4">Öne Çıkanlar</h3>
                    <FeaturedProducts allProducts={allProducts} selectedIds={theme.featuredProductIds}/>
                </div>
            )}

            {theme.showKitchen && (
                 <div className="py-4 px-2 bg-gray-50">
                     <h3 className="text-center text-lg font-bold mb-4">Mutfak</h3>
                     <div className="flex gap-2 overflow-x-auto">
                        {kitchenList.map((m,i)=>(
                            <div key={i} className="min-w-[120px] h-20 bg-black rounded overflow-hidden">
                                {m.type === 'video' ? 
                                    <video src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" autoPlay muted loop /> : // autoPlay eklendi
                                    <img src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" />
                                }
                            </div>
                        ))}
                     </div>
                 </div>
            )}
            
            {theme.showShowcase && (
                <div className="py-4 px-2">
                    <CategoryShowcase allCategories={allCategories} selectedIds={theme.showcaseCategoryIds} />
                </div>
            )}
            
            {theme.showProducts && (
                <div className="py-4 px-2">
                    <h3 className="text-center text-lg font-bold mb-4">Tüm Ürünler</h3>
                    <div className={`grid gap-2 ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {allProducts.slice(0,6).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}
            
            {theme.showBottomShowcase && (
                <div className="py-4 px-2 bg-gray-50/50">
                    <CategoryShowcase allCategories={allCategories} selectedIds={theme.bottomShowcaseCategoryIds} />
                </div>
            )}

            <div className="bg-gray-100 p-8 mt-4 text-xs">
                <div className={`grid gap-4 ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                    {footerColumns.map((col, i) => (
                        <div key={i}>
                            <h4 className="font-bold mb-2 uppercase">{col.title}</h4>
                            <ul className="space-y-1 text-gray-500">
                                {col.links.map((link, j) => <li key={j}>{link.text}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function LivePreview({ theme, allCategories, allProducts, previewMode, setPreviewMode, setPreviewKey, footerColumns, previewKey }) {
    return (
        <div className="flex-1 xl:col-span-3 bg-[#e5e7eb] flex flex-col relative overflow-hidden rounded-xl border shadow-inner sticky top-6 h-[calc(100vh-3rem)]">
            <div className="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                    <FaEye className="text-indigo-600 text-lg"/> Canlı Önizleme
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button onClick={() => setPreviewMode("desktop")} className={`p-2 rounded flex items-center gap-2 text-xs font-bold ${previewMode === "desktop" ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}><FaDesktop /> Masaüstü</button>
                    <button onClick={() => setPreviewMode("mobile")} className={`p-2 rounded flex items-center gap-2 text-xs font-bold ${previewMode === "mobile" ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}><FaMobileAlt /> Mobil</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setPreviewKey(p => p+1)} className="p-2 text-gray-500 hover:text-indigo-600 bg-white border rounded"><FaSyncAlt /></button>
                    <a href="/" target="_blank" className="p-2 text-gray-500 hover:text-indigo-600 bg-white border rounded"><FaExternalLinkAlt /></a>
                </div>
            </div>
            <div className="flex-1 flex justify-center items-start overflow-auto p-8 bg-gray-200/50">
                <div key={previewKey} className={`transition-all duration-500 bg-white shadow-2xl border-4 border-gray-800 overflow-hidden relative ${previewMode === "mobile" ? "w-[375px] h-[667px] rounded-[35px] border-[12px] mt-4" : "w-full h-full rounded-lg border-0 shadow-lg"}`}>
                    <PreviewContent 
                        theme={theme} 
                        allCategories={allCategories} 
                        allProducts={allProducts} 
                        previewMode={previewMode} 
                        footerColumns={footerColumns}
                    />
                </div>
            </div>
        </div>
    );
}

export default LivePreview;
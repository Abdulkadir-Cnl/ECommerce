// src/Components/Admin/Theme/Sections/ShowcasePanel.jsx
import React from 'react';
import CategoryShowcase from '../../../CategoryShowcase'; // Varsayılan konum

const BASE_URL = "https://localhost:7011";

function ShowcasePanel({ 
    theme, 
    setShowcaseOpen, 
    showcaseOpen, 
    showcaseIds, 
    addToShowcase, 
    removeFromShowcase, 
    allCategories, 
    showcaseSearch, 
    setShowcaseSearch, 
    filteredShowcaseCategories,
    setBottomShowcaseOpen,
    bottomShowcaseOpen,
    bottomShowcaseIds,
    addToBottomShowcase,
    removeFromBottomShowcase,
    bottomShowcaseSearch,
    setBottomShowcaseSearch,
    filteredBottomShowcaseCategories
}) {
    return (
        <>
            {/* ÜST VİTRİN */}
            <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
                <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setShowcaseOpen(!showcaseOpen)}>
                    3'lü Vitrin (Üst) Yönetimi ({showcaseIds.length}) 
                    <span>{showcaseOpen?"-":"+"}</span>
                </div>
                {showcaseOpen && (
                    <div className="p-4 border-t">
                        {showcaseIds.length > 0 && 
                            <div className="mb-4 bg-gray-50 p-2 rounded border">
                                <CategoryShowcase allCategories={allCategories} selectedIds={theme.showcaseCategoryIds} onRemove={removeFromShowcase} />
                            </div>
                        }
                        <div className="border p-2 rounded bg-white">
                            <input 
                                type="text" 
                                placeholder="Kategori ara (Örn: Pastırma)..." 
                                className="w-full text-xs p-2 border rounded mb-2" 
                                value={showcaseSearch} 
                                onChange={(e) => setShowcaseSearch(e.target.value)}
                            />
                            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                                {filteredShowcaseCategories.map(cat => { 
                                    const isSelected = showcaseIds.includes(cat.id); 
                                    if(isSelected) return null; 
                                    return ( 
                                        <div key={cat.id} className="flex items-center justify-between gap-2 p-1.5 rounded border bg-white hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <img src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : ""} className="w-6 h-6 rounded object-cover border"/>
                                                <span className="text-xs font-bold">{cat.ad || cat.name}</span>
                                            </div>
                                            <button onClick={()=>addToShowcase(cat.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">+ Ekle</button>
                                        </div> 
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ALT VİTRİN */}
            <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
                <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setBottomShowcaseOpen(!bottomShowcaseOpen)}>
                    2. Vitrin (Alt) Yönetimi ({bottomShowcaseIds.length}) 
                    <span>{bottomShowcaseOpen?"-":"+"}</span>
                </div>
                {bottomShowcaseOpen && (
                    <div className="p-4 border-t bg-white">
                        <p className="text-xs text-gray-500 mb-2 italic">Burada seçeceğiniz kategoriler ürün listesinin altında gösterilecektir.</p>
                        {bottomShowcaseIds.length > 0 && 
                            <div className="mb-4 bg-gray-50 p-2 rounded border">
                                <CategoryShowcase allCategories={allCategories} selectedIds={theme.bottomShowcaseCategoryIds} onRemove={removeFromBottomShowcase} />
                            </div>
                        }
                        <div className="border p-2 rounded bg-white">
                            <input 
                                type="text" 
                                placeholder="Kategori ara..." 
                                className="w-full text-xs p-2 border rounded mb-2" 
                                value={bottomShowcaseSearch} 
                                onChange={(e) => setBottomShowcaseSearch(e.target.value)}
                            />
                            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                                {filteredBottomShowcaseCategories.map(cat => { 
                                    const isSelected = bottomShowcaseIds.includes(cat.id); 
                                    if(isSelected) return null; 
                                    return ( 
                                        <div key={cat.id} className="flex items-center justify-between gap-2 p-1.5 rounded border bg-white hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <img src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : ""} className="w-6 h-6 rounded object-cover border"/>
                                                <span className="text-xs font-bold">{cat.ad || cat.name}</span>
                                            </div>
                                            <button onClick={()=>addToBottomShowcase(cat.id)} className="bg-indigo-600 text-white text-xs px-2 py-1 rounded font-bold">+ Ekle</button>
                                        </div> 
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ShowcasePanel;
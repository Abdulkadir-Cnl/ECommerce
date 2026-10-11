// src/Components/Admin/Theme/Sections/FeaturedProductsPanel.jsx
import React from 'react';

function FeaturedProductsPanel({ theme, featuredOpen, setFeaturedOpen, featuredIds, toggleFeaturedProduct, allProducts, productSearch, setProductSearch, filteredProducts }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setFeaturedOpen(!featuredOpen)}>
                Öne Çıkanlar ({featuredIds.length}) 
                <span>{featuredOpen?"-":"+"}</span>
            </div>
            {featuredOpen && (
                <div className="p-4 border-t">
                    <div className="border p-2 rounded bg-gray-50">
                        <input 
                            type="text" 
                            placeholder="Ürün ara..." 
                            className="w-full text-xs p-2 border rounded mb-2" 
                            value={productSearch} 
                            onChange={e=>setProductSearch(e.target.value)}
                        />
                        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                            {filteredProducts.slice(0, 50).map(prod => { 
                                const isSelected = featuredIds.includes(prod.id); 
                                return ( 
                                    <div 
                                        key={prod.id} 
                                        onClick={()=>toggleFeaturedProduct(prod.id)} 
                                        className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer ${isSelected?"border-orange-500 bg-orange-50":""}`}
                                    >
                                        <div className={`w-3 h-3 border rounded flex items-center justify-center ${isSelected?"border-orange-500":""}`}>
                                            {isSelected && <span className="text-white text-[8px]">✓</span>}
                                        </div>
                                        <span className="text-xs truncate">{prod.ad || prod.name}</span>
                                    </div> 
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeaturedProductsPanel;
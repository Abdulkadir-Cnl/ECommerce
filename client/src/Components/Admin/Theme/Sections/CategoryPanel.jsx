// src/Components/Admin/Theme/Sections/CategoryPanel.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

const BASE_URL = "https://localhost:7011";

function CategoryPanel({ theme, setTheme, categoryOpen, setCategoryOpen, allCategories, selectedCategoryIds, toggleCategory, newCatName, setNewCatName, newCatFile, setNewCatFile, handleAddCategory, isCatAdding, handleDeleteCategory, handleUpdateCategoryImage, loadData }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setCategoryOpen(!categoryOpen)}>
                Kategori Barı ({selectedCategoryIds.length}) 
                <span>{categoryOpen?"-":"+"}</span>
            </div>
            {categoryOpen && (
                <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 bg-gray-50 rounded mb-4">
                        {allCategories.map(cat => { 
                            const isSelected = selectedCategoryIds.includes(cat.id); 
                            return ( 
                                <div key={cat.id} className={`flex items-center gap-2 p-1 rounded border bg-white ${isSelected?"border-green-500 ring-1 ring-green-500":""}`}>
                                    <div onClick={()=>toggleCategory(cat.id)} className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer flex-shrink-0 ${isSelected?"bg-green-600":""}`}>
                                        {isSelected && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                    <div className="relative group w-8 h-8 flex-shrink-0">
                                        <img src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : ""} className="w-full h-full rounded object-cover border"/>
                                        <label className="absolute inset-0 bg-black/50 text-white text-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-center">
                                            Değiştir 
                                            <input type="file" className="hidden" onChange={(e)=>handleUpdateCategoryImage(cat.id, e.target.files[0])}/>
                                        </label>
                                    </div>
                                    <span className="text-xs truncate">{cat.ad || cat.name}</span>
                                    <button onClick={()=>handleDeleteCategory(cat.id)} className="text-red-500 px-1 ml-auto">
                                        <FaTrash size={12}/>
                                    </button>
                                </div> 
                            )
                        })}
                    </div>
                    <div className="bg-gray-100 p-2 rounded flex gap-2 items-end">
                        <div className="flex-1">
                            <input type="text" placeholder="Yeni Kategori Adı" className="w-full text-xs p-1 border rounded mb-1" value={newCatName} onChange={e=>setNewCatName(e.target.value)}/>
                            <input type="file" className="text-[10px] w-full" onChange={e=>setNewCatFile(e.target.files[0])}/>
                        </div>
                        <button 
                            onClick={handleAddCategory} 
                            disabled={isCatAdding} 
                            className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
                        >
                            {isCatAdding?"...":"Ekle"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryPanel;
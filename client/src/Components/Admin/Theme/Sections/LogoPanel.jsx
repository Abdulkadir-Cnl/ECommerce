// src/Components/Admin/Theme/Sections/LogoPanel.jsx
import React from 'react';
import { FaTrash, FaCheckCircle } from 'react-icons/fa';

const BASE_URL = "https://localhost:7011";

function LogoPanel({ theme, setTheme, logoOpen, setLogoOpen, logoFile, setLogoFile, handleLogoUpload, selectLogo, deleteLogo, logoList }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setLogoOpen(!logoOpen)}>
                Site Logosu ({logoList.length}) 
                <span>{logoOpen?"-":"+"}</span>
            </div>
            {logoOpen && (
                <div className="p-4 border-t">
                    <div className="flex gap-2 w-full mb-4">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e)=>setLogoFile(e.target.files[0])} 
                            className="text-sm flex-1 border p-1 rounded"
                        />
                        {logoFile && (
                            <button 
                                onClick={handleLogoUpload} 
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                                Yükle
                            </button>
                        )}
                    </div>
                    {logoList.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                            {logoList.map((url, i) => { 
                                const isActive = theme.logoUrl === url; 
                                return ( 
                                    <div 
                                        key={i} 
                                        className={`relative group border-2 p-1 rounded cursor-pointer transition-all ${isActive ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-400"}`} 
                                        onClick={() => selectLogo(url)}
                                    >
                                        <img src={`${BASE_URL}${url}`} className="h-12 w-full object-contain" />
                                        {isActive && <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] px-1 rounded-br">Seçili</div>}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteLogo(url); }} 
                                            className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 shadow hover:scale-110 transition" 
                                            title="Sil"
                                        >
                                            ✕
                                        </button>
                                    </div> 
                                ) 
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic text-center">Henüz logo yüklenmedi.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default LogoPanel;
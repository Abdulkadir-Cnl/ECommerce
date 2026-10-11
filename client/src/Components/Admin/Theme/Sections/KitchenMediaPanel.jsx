// src/Components/Admin/Theme/Sections/KitchenMediaPanel.jsx
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const BASE_URL = "https://localhost:7011";

function KitchenMediaPanel({ kitchenOpen, setKitchenOpen, kitchenList, removeKitchenMedia, kitchenFile, setKitchenFile, addKitchenMedia }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setKitchenOpen(!kitchenOpen)}>
                Mutfak ({kitchenList.length}) 
                <span>{kitchenOpen?"-":"+"}</span>
            </div>
            {kitchenOpen && (
                <div className="p-4 border-t">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {kitchenList.map((m, i) => (
                            <div key={i} className="group relative border rounded-lg overflow-hidden shadow-sm bg-gray-50 flex flex-col">
                                <div className="h-24 bg-black relative">
                                    {m.type === 'video' ? (
                                        <video src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <img src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="p-2 flex justify-between items-center bg-white border-t">
                                    <button 
                                        onClick={()=>removeKitchenMedia(i)} 
                                        className="text-red-500 hover:bg-red-50 p-1 rounded text-xs" 
                                        title="Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-[130px] hover:bg-gray-50 transition cursor-pointer relative group">
                            {!kitchenFile ? (
                                <>
                                    <span className="text-3xl text-gray-400 group-hover:text-purple-500 mb-1">+</span>
                                    <input 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        onChange={e=>setKitchenFile(e.target.files[0])} 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </>
                            ) : (
                                <button onClick={addKitchenMedia} className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold w-full">YÜKLE</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KitchenMediaPanel;
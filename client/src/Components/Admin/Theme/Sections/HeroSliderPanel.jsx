// src/Components/Admin/Theme/Sections/HeroSliderPanel.jsx
import React from 'react';

const BASE_URL = "https://localhost:7011";

function HeroSliderPanel({ theme, heroOpen, setHeroOpen, selectedFile, setSelectedFile, uploading, addImageToSlider, heroImages, removeHeroImage }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setHeroOpen(!heroOpen)}>
                Hero Slider ({heroImages.length}) 
                <span>{heroOpen?"-":"+"}</span>
            </div>
            {heroOpen && (
                <div className="p-4 border-t">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {heroImages.map((img, i) => (
                            <div key={i} className="relative group">
                                <img src={`${BASE_URL}${img}`} className="h-16 w-full object-cover rounded"/>
                                <button 
                                    onClick={()=>removeHeroImage(i)} 
                                    className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-xs"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="file" 
                            onChange={e=>setSelectedFile(e.target.files[0])} 
                            className="text-sm flex-1"
                        />
                        {selectedFile && (
                            <button 
                                onClick={addImageToSlider} 
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                                {uploading ? "..." : "Yükle"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HeroSliderPanel;
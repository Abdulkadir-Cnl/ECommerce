// src/Components/Admin/Theme/Sections/FooterPanel.jsx
import React from 'react';

function FooterPanel({ footerOpen, setFooterOpen, footerColumns, updateFooterColumnTitle, updateFooterLink, addFooterLink, removeFooterLink }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setFooterOpen(!footerOpen)}>
                Footer (Alt Bilgi) Yönetimi 
                <span>{footerOpen?"-":"+"}</span>
            </div>
            {footerOpen && (
                <div className="p-4 border-t bg-gray-50">
                    {footerColumns.map((col, colIndex) => (
                        <div key={colIndex} className="mb-6 border-b border-gray-300 pb-4 last:border-0">
                            <div className="mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Sütun {colIndex + 1} Başlığı</label>
                                <input 
                                    type="text" 
                                    value={col.title} 
                                    onChange={(e) => updateFooterColumnTitle(colIndex, e.target.value)} 
                                    className="w-full border p-2 rounded text-sm font-bold mt-1 bg-white shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Linkler</label>
                            <div className="space-y-2">
                                {col.links.map((link, linkIndex) => (
                                    <div key={linkIndex} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={link.text} 
                                            onChange={(e) => updateFooterLink(colIndex, linkIndex, 'text', e.target.value)} 
                                            className="flex-1 border p-1.5 rounded text-xs bg-white" 
                                            placeholder="Link Adı"
                                        />
                                        <input 
                                            type="text" 
                                            value={link.url} 
                                            onChange={(e) => updateFooterLink(colIndex, linkIndex, 'url', e.target.value)} 
                                            className="flex-1 border p-1.5 rounded text-xs text-blue-600 bg-white" 
                                            placeholder="URL"
                                        />
                                        <button onClick={() => removeFooterLink(colIndex, linkIndex)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addFooterLink(colIndex)} className="mt-2 text-xs text-blue-600 hover:underline font-bold bg-blue-50 px-2 py-1 rounded">+ Yeni Link Ekle</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FooterPanel;
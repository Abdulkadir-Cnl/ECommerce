// src/Components/Admin/Theme/Sections/PagesPanel.jsx
import React from 'react';

function PagesPanel({ pagesOpen, setPagesOpen, addPage, pageList, setEditingPage, deletePage }) {
    return (
        <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setPagesOpen(!pagesOpen)}>
                Özel Sayfa Yönetimi 
                <span>{pagesOpen?"-":"+"}</span>
            </div>
            {pagesOpen && (
                <div className="p-4 border-t bg-white">
                    <button onClick={addPage} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold">+ Yeni Sayfa Ekle (Tam Ekran)</button>
                    <div className="space-y-2">
                        {pageList.map(page => (
                            <div key={page.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div>
                                    <div className="font-bold text-sm text-gray-800">{page.title}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">/sayfa/{page.slug}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingPage(page)} className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold">DÜZENLE ✏️</button>
                                    <button onClick={() => deletePage(page.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">SİL 🗑️</button>
                                </div>
                            </div>
                        ))}
                        {pageList.length === 0 && <p className="text-center text-sm text-gray-400 italic">Henüz sayfa oluşturulmadı.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PagesPanel;
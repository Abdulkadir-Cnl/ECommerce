// src/Components/Admin/Theme/Preview/PageEditorModal.jsx
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 
import { toast } from "react-toastify";

// Not: modules tanımı ThemeEditor'dan geldi. Burada tekrar tanımlanmalı veya props olarak geçmeli.
const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
};

function PageEditorModal({ editingPage, setEditingPage, updatePage, saveTheme }) {
    if (!editingPage) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Sayfa Düzenle</h3>
                    <button onClick={() => setEditingPage(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sayfa Başlığı</label>
                        <input 
                            type="text" 
                            value={editingPage.title} 
                            onChange={(e) => updatePage(editingPage.id, "title", e.target.value)} 
                            className="w-full border p-3 rounded text-lg font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Örn: Hakkımızda"
                        />
                    </div>
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-center gap-2 border border-blue-100">
                        <span className="font-bold">Sayfa Linki:</span>
                        <span className="bg-white px-2 py-1 rounded border font-mono select-all">/sayfa/{editingPage.slug}</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sayfa İçeriği</label>
                        <div className="flex-1 border rounded bg-white overflow-hidden">
                            <ReactQuill 
                                value={editingPage.content} 
                                onChange={(val) => updatePage(editingPage.id, "content", val)} 
                                theme="snow" 
                                modules={modules} 
                                className="h-full" 
                                style={{ height: '400px' }} 
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setEditingPage(null)} className="px-6 py-2 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400">Kapat</button>
                    <button onClick={saveTheme} className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Kaydet</button>
                </div>
            </div>
        </div>
    );
}

export default PageEditorModal;
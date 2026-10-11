import { useState, useEffect } from "react";
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaFileAlt } from "react-icons/fa";
import api from "../../api"; // API yapınızın olduğu dosya
import { toast } from "react-toastify";

const BlogSettings = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'editor'
  const [editingPost, setEditingPost] = useState(null);

  // --- Form State ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // --- Verileri Yükle ---
  useEffect(() => {
    // Burada normalde API'den çekilir. Şimdilik localStorage veya boş dizi simülasyonu yapıyoruz.
    // Gerçek entegrasyonda: api.get("/Blog").then(res => setPosts(res.data));
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
    }
    setLoading(false);
  }, []);

  // --- Kaydetme İşlemi ---
  const handleSave = async () => {
    if (!title) return toast.warning("Lütfen bir başlık girin.");

    const newPost = {
      id: editingPost ? editingPost.id : Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      excerpt: content.replace(/<[^>]+>/g, '').substring(0, 100) + "..." // Basit özet
    };

    let updatedPosts;
    if (editingPost) {
        updatedPosts = posts.map(p => p.id === editingPost.id ? newPost : p);
        toast.success("Yazı güncellendi");
    } else {
        updatedPosts = [...posts, newPost];
        toast.success("Yazı eklendi");
    }

    setPosts(updatedPosts);
    localStorage.setItem("blogPosts", JSON.stringify(updatedPosts)); // Geçici kayıt
    
    // Temizle ve Dön
    setEditingPost(null);
    setTitle("");
    setContent("");
    setView("list");
  };

  // --- Silme İşlemi ---
  const handleDelete = (id) => {
      if(!window.confirm("Bu yazıyı silmek istediğine emin misin?")) return;
      const filtered = posts.filter(p => p.id !== id);
      setPosts(filtered);
      localStorage.setItem("blogPosts", JSON.stringify(filtered));
      toast.info("Yazı silindi.");
  };

  // --- Düzenleme Modunu Aç ---
  const openEditor = (post = null) => {
      if (post) {
          setEditingPost(post);
          setTitle(post.title);
          setContent(post.content);
      } else {
          setEditingPost(null);
          setTitle("");
          setContent("");
      }
      setView("editor");
  };

  // --- Editör Modülleri ---
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;

  // 1. GÖRÜNÜM: EDİTÖR SAYFASI
  if (view === "editor") {
      return (
          <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setView("list")} className="flex items-center gap-2 text-gray-500 hover:text-black transition">
                      <FaArrowLeft /> Geri Dön
                  </button>
                  <h2 className="text-2xl font-bold">{editingPost ? "Yazıyı Düzenle" : "Yeni Yazı Oluştur"}</h2>
                  <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow transition">
                      KAYDET
                  </button>
              </div>

              <div className="flex-1 flex flex-col gap-6 bg-white rounded-xl shadow-sm border p-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Yazı Başlığı</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: En Doğru Et Pişirme Teknikleri"
                        className="w-full border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-bold text-gray-700 mb-2">İçerik</label>
                      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <ReactQuill 
                            theme="snow" 
                            value={content} 
                            onChange={setContent} 
                            modules={modules}
                            className="h-full bg-white"
                            style={{ height: 'calc(100% - 42px)' }} // Toolbar payı
                        />
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // 2. GÖRÜNÜM: BOŞ DURUM (EMPTY STATE)
  if (posts.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-64 h-48 bg-gray-50 rounded-xl mb-8 flex items-center justify-center border-2 border-dashed border-gray-200">
                  {/* Temsili İllüstrasyon */}
                  <div className="space-y-2 opacity-20">
                      <div className="w-32 h-4 bg-indigo-400 rounded mx-auto"></div>
                      <div className="w-40 h-2 bg-gray-400 rounded mx-auto"></div>
                      <div className="w-40 h-2 bg-gray-400 rounded mx-auto"></div>
                      <div className="w-24 h-2 bg-gray-400 rounded mx-auto"></div>
                  </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">İlk Blog Gönderinizi Oluşturun!</h2>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                  Blog yazıları ile online mağazanıza trafik çekin ve ziyaretçilerinizi müşteriye dönüştürün.
              </p>
              
              <button 
                onClick={() => openEditor()}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                  <FaPlus /> Yeni Blog Yazısı
              </button>
          </div>
      );
  }

  // 3. GÖRÜNÜM: LİSTE (YAZILAR VARSA)
  return (
      <div className="p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8 border-b pb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Blog Gönderileri</h2>
                <p className="text-gray-500 mt-1">Toplam {posts.length} yazı yayında</p>
              </div>
              <button 
                onClick={() => openEditor()}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-bold shadow transition flex items-center gap-2"
              >
                  <FaPlus /> Yeni Yazı
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group overflow-hidden flex flex-col h-[300px]">
                      <div className="p-5 flex-1 overflow-hidden">
                          <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">{post.date}</div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight line-clamp-2">{post.title}</h3>
                          <div className="text-gray-500 text-sm line-clamp-4" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                      </div>
                      <div className="bg-gray-50 p-4 border-t flex justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditor(post)} className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-white transition" title="Düzenle">
                              <FaEdit size={18}/>
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="text-gray-600 hover:text-red-600 p-2 rounded hover:bg-white transition" title="Sil">
                              <FaTrash size={18}/>
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default BlogSettings;
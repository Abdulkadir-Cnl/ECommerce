import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
// İkonlar
import { FaEye, FaDesktop, FaMobileAlt, FaSyncAlt, FaExternalLinkAlt } from "react-icons/fa";
import HeroSlider from "../HeroSlider";
import FeaturedProducts from "../FeaturedProducts";
import CategoryShowcase from "../CategoryShowcase"; 
import ProductCard from "../ProductCard";
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 

const BASE_URL = "https://localhost:7011";

function ThemeEditor() {
  const [loading, setLoading] = useState(true);

  // --- Önizleme Modu State'leri ---
  const [previewMode, setPreviewMode] = useState("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  // --- Accordion Durumları ---
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [logoOpen, setLogoOpen] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false); 
  const [bottomShowcaseOpen, setBottomShowcaseOpen] = useState(false);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [footerOpen, setFooterOpen] = useState(false);

  // --- Editör Modu ---
  const [editingPage, setEditingPage] = useState(null); 

  // --- Veriler ---
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // --- Form State'leri ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatFile, setNewCatFile] = useState(null);
  const [isCatAdding, setIsCatAdding] = useState(false);
  const [kitchenFile, setKitchenFile] = useState(null);
  const [isKitchenUploading, setIsKitchenUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Arama
  const [productSearch, setProductSearch] = useState("");
  const [showcaseSearch, setShowcaseSearch] = useState(""); 
  const [bottomShowcaseSearch, setBottomShowcaseSearch] = useState("");

  // --- TEMA STATE ---
  const [theme, setTheme] = useState({
    id: 0,
    logoUrl: "",
    savedLogos: "[]",
    showHeroSlider: true,
    showCategories: true,
    showFeatured: true,
    showKitchen: true,
    showShowcase: true,
    showBottomShowcase: true,
    showProducts: true,
    heroSliderImages: "[]",
    heroMarqueeText: "",
    kitchenMedia: "[]",
    homepageCategoryIds: "[]",
    featuredProductIds: "[]",
    showcaseCategoryIds: "[]",
    bottomShowcaseCategoryIds: "[]",
    footerData: "[]",
    customPages: "[]",
  });

  const defaultFooterData = [
      { title: "Kurumsal", links: [{ text: "Hakkımızda", url: "/sayfa/hakkimizda" }, { text: "İletişim", url: "/sayfa/iletisim" }] },
      { title: "Hesabım", links: [{ text: "Giriş Yap", url: "/login" }, { text: "Üye Ol", url: "/register" }] },
      { title: "Bilgilendirme", links: [{ text: "Gizlilik Sözleşmesi", url: "/sayfa/gizlilik" }] },
      { title: "Önemli Bilgiler", links: [{ text: "Sıkça Sorulan Sorular", url: "/sayfa/sss" }] }
  ];

  const safeParse = (str) => { try { return JSON.parse(str || "[]"); } catch { return []; } };

  // --- VERİLERİ YÜKLE ---
  const loadData = async () => {
    try {
      const [themeRes, catRes, prodRes] = await Promise.all([
        api.get("/theme/homepage").catch(() => ({ data: null })),
        api.get("/Category").catch(() => ({ data: [] })),
        api.get("/Product").catch(() => ({ data: [] }))
      ]);

      setAllCategories(catRes.data || []);
      setAllProducts(prodRes.data || []);

      if (themeRes.data) {
        let loadedFooter = themeRes.data.footerData;
        if (!loadedFooter || loadedFooter === "[]") loadedFooter = JSON.stringify(defaultFooterData);

        setTheme({
            ...themeRes.data,
            customPages: themeRes.data.customPages || "[]",
            footerData: loadedFooter,
            logoUrl: themeRes.data.logoUrl || "",
            savedLogos: themeRes.data.savedLogos || "[]",
            showProducts: themeRes.data.showProducts ?? true,
            heroSliderImages: themeRes.data.heroSliderImages || "[]",
            heroMarqueeText: themeRes.data.heroMarqueeText || "",
            kitchenMedia: themeRes.data.kitchenMedia || "[]",
            homepageCategoryIds: themeRes.data.homepageCategoryIds || "[]",
            featuredProductIds: themeRes.data.featuredProductIds || "[]",
            showcaseCategoryIds: themeRes.data.showcaseCategoryIds || "[]",
            showBottomShowcase: themeRes.data.showBottomShowcase ?? true,
            bottomShowcaseCategoryIds: themeRes.data.bottomShowcaseCategoryIds || "[]",
        });
      }
    } catch (error) { console.error("Veri hatası:", error); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- PAGE & FOOTER FONKSİYONLARI ---
  const pageList = safeParse(theme.customPages);
  const addPage = () => {
      const list = [...pageList];
      const newPage = { id: Date.now(), title: "Yeni Sayfa", slug: "yeni-sayfa", content: "" };
      list.push(newPage);
      setTheme({ ...theme, customPages: JSON.stringify(list) });
      setEditingPage(newPage);
  };
  const updatePage = (id, field, value) => {
      const list = pageList.map(p => {
          if (p.id === id) {
              const updated = { ...p, [field]: value };
              if (field === "title") {
                  updated.slug = value.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
              }
              if (editingPage && editingPage.id === id) setEditingPage(updated); 
              return updated;
          }
          return p;
      });
      setTheme({ ...theme, customPages: JSON.stringify(list) });
  };
  const deletePage = (id) => {
      if(!window.confirm("Bu sayfayı silmek istediğine emin misin?")) return;
      const list = pageList.filter(p => p.id !== id);
      setTheme({ ...theme, customPages: JSON.stringify(list) });
      if(editingPage && editingPage.id === id) setEditingPage(null);
  };
  const getFooterColumns = () => { const parsed = safeParse(theme.footerData); return parsed.length > 0 ? parsed : defaultFooterData; };
  const updateFooterColumnTitle = (colIndex, newTitle) => { const data = [...getFooterColumns()]; if(data[colIndex]) data[colIndex].title = newTitle; setTheme({ ...theme, footerData: JSON.stringify(data) }); };
  const updateFooterLink = (colIndex, linkIndex, field, value) => { const data = [...getFooterColumns()]; if(data[colIndex] && data[colIndex].links[linkIndex]) { data[colIndex].links[linkIndex][field] = value; setTheme({ ...theme, footerData: JSON.stringify(data) }); } };
  const addFooterLink = (colIndex) => { const data = [...getFooterColumns()]; if(data[colIndex]) { data[colIndex].links.push({ text: "Yeni Link", url: "/" }); setTheme({ ...theme, footerData: JSON.stringify(data) }); } };
  const removeFooterLink = (colIndex, linkIndex) => { const data = [...getFooterColumns()]; if(data[colIndex]) { data[colIndex].links = data[colIndex].links.filter((_, i) => i !== linkIndex); setTheme({ ...theme, footerData: JSON.stringify(data) }); } };

  // --- DİĞER FONKSİYONLAR ---
  const handleLogoUpload = async () => { if(!logoFile) return; const fd = new FormData(); fd.append("file", logoFile); try { const res = await api.post("/theme/upload", fd); const list = safeParse(theme.savedLogos); if(!list.includes(res.data.path)) list.push(res.data.path); setTheme({ ...theme, logoUrl: res.data.path, savedLogos: JSON.stringify(list) }); toast.success("Logo yüklendi"); setLogoFile(null); } catch { toast.error("Hata"); } };
  const selectLogo = (url) => { setTheme({ ...theme, logoUrl: url }); toast.info("Logo seçildi"); };
  const deleteLogo = (url) => { if(!window.confirm("Silinsin mi?")) return; let list = safeParse(theme.savedLogos).filter(l => l !== url); let newActive = theme.logoUrl === url ? (list.length > 0 ? list[list.length - 1] : "") : theme.logoUrl; setTheme({ ...theme, savedLogos: JSON.stringify(list), logoUrl: newActive }); };
  const addImageToSlider = async () => { if (!selectedFile) return; setUploading(true); const fd = new FormData(); fd.append("file", selectedFile); try { const res = await api.post("/theme/upload", fd); const list = safeParse(theme.heroSliderImages); list.push(res.data.path); setTheme({ ...theme, heroSliderImages: JSON.stringify(list) }); toast.success("Eklendi"); setSelectedFile(null); } catch { toast.error("Hata"); } finally { setUploading(false); } };
  const removeHeroImage = (idx) => { const list = safeParse(theme.heroSliderImages).filter((_, i) => i !== idx); setTheme({ ...theme, heroSliderImages: JSON.stringify(list) }); };
  const handleAddCategory = async (e) => { e.preventDefault(); if (!newCatName) return; setIsCatAdding(true); const fd = new FormData(); fd.append("Ad", newCatName); if (newCatFile) fd.append("File", newCatFile); try { await api.post("/Category", fd); toast.success("Eklendi"); setNewCatName(""); setNewCatFile(null); loadData(); } catch { toast.error("Hata"); } finally { setIsCatAdding(false); } };
  const handleDeleteCategory = async (id) => { if(!window.confirm("Silinsin mi?")) return; try { await api.delete(`/Category/${id}`); toast.success("Silindi"); loadData(); } catch { toast.error("Hata"); } };
  const toggleCategory = (id) => { let list = safeParse(theme.homepageCategoryIds).map(Number); if(list.includes(id)) list = list.filter(x => x !== id); else list.push(id); setTheme({...theme, homepageCategoryIds: JSON.stringify(list)}); };
  const addToShowcase = (id) => { let list = safeParse(theme.showcaseCategoryIds).map(Number); if(!list.includes(id)) { list.push(id); setTheme({...theme, showcaseCategoryIds: JSON.stringify(list)}); } };
  const removeFromShowcase = (id) => { let list = safeParse(theme.showcaseCategoryIds).map(Number); list = list.filter(x => x !== id); setTheme({...theme, showcaseCategoryIds: JSON.stringify(list)}); };
  
  // ✅ Alt Vitrin Fonksiyonları
  const addToBottomShowcase = (id) => { let list = safeParse(theme.bottomShowcaseCategoryIds).map(Number); if(!list.includes(id)) { list.push(id); setTheme({...theme, bottomShowcaseCategoryIds: JSON.stringify(list)}); } };
  const removeFromBottomShowcase = (id) => { let list = safeParse(theme.bottomShowcaseCategoryIds).map(Number); list = list.filter(x => x !== id); setTheme({...theme, bottomShowcaseCategoryIds: JSON.stringify(list)}); };
  
  const toggleFeaturedProduct = (id) => { let list = safeParse(theme.featuredProductIds).map(Number); if(list.includes(id)) list = list.filter(x => x !== id); else list.push(id); setTheme({...theme, featuredProductIds: JSON.stringify(list)}); };
  const addKitchenMedia = async () => { if(!kitchenFile) return; setIsKitchenUploading(true); const fd = new FormData(); fd.append("file", kitchenFile); try { const res = await api.post("/theme/upload", fd); const list = safeParse(theme.kitchenMedia); list.push({type: kitchenFile.type.startsWith("video")?"video":"image", url: res.data.path}); setTheme({...theme, kitchenMedia: JSON.stringify(list)}); toast.success("Eklendi"); setKitchenFile(null); } catch { toast.error("Hata"); } finally { setIsKitchenUploading(false); } };
  const removeKitchenMedia = (idx) => { if(!window.confirm("Silinsin mi?")) return; const list = safeParse(theme.kitchenMedia).filter((_, i) => i !== idx); setTheme({...theme, kitchenMedia: JSON.stringify(list)}); };
  
  const saveTheme = async () => { try { await api.post("/theme/homepage", theme); toast.success("✅ Kaydedildi!"); } catch { toast.error("Hata"); } };

  if(loading) return <div className="p-10 text-center">Yükleniyor...</div>

  const footerColumns = getFooterColumns();
  const logoList = safeParse(theme.savedLogos);
  const heroImages = safeParse(theme.heroSliderImages);
  const selectedCategoryIds = safeParse(theme.homepageCategoryIds).map(Number);
  const featuredIds = safeParse(theme.featuredProductIds).map(Number);
  const showcaseIds = safeParse(theme.showcaseCategoryIds).map(Number);
  const bottomShowcaseIds = safeParse(theme.bottomShowcaseCategoryIds).map(Number); 
  const kitchenList = safeParse(theme.kitchenMedia);
  const filteredProducts = allProducts.filter(p => (p.ad || p.name || "").toLowerCase().includes(productSearch.toLowerCase()));
  const filteredShowcaseCategories = allCategories.filter(c => (c.ad || c.name || "").toLowerCase().includes(showcaseSearch.toLowerCase()));
  const filteredBottomShowcaseCategories = allCategories.filter(c => (c.ad || c.name || "").toLowerCase().includes(bottomShowcaseSearch.toLowerCase()));

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

  const PreviewContent = () => (
    <div key={previewKey} className="w-full h-full bg-white overflow-y-auto">
        <div className="flex justify-center py-4 border-b">
            {theme.logoUrl ? <img src={`${BASE_URL}${theme.logoUrl}`} alt="Logo" className="h-12 object-contain"/> : <div className="bg-black text-white px-4 py-2 text-center font-bold">BAŞYAZICI</div>}
        </div>
        
        {theme.showHeroSlider && (
          <HeroSlider images={theme.heroSliderImages} marqueeText={theme.heroMarqueeText} />
        )}
        
        {theme.showCategories && (
            <div className="py-4">
                <div className="flex justify-center gap-4 overflow-x-auto px-2 pb-2">
                    {selectedCategoryIds.map(id => {
                        const cat = allCategories.find(x => x.id === id);
                        if (!cat) return null;
                        return (
                            <div key={id} className="flex flex-col items-center min-w-[60px]">
                                <div className="w-14 h-14 rounded-full border-2 border-red-800 p-0.5 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : ""} className="w-full h-full rounded-full object-cover"/>
                                </div>
                                <span className="text-[10px] font-bold mt-2 text-gray-800 text-center">{cat.ad || cat.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {theme.showFeatured && (
            <div className="py-4 px-2">
                <h3 className="text-center text-lg font-bold mb-4">Öne Çıkanlar</h3>
                <FeaturedProducts allProducts={allProducts} selectedIds={theme.featuredProductIds}/>
            </div>
        )}

        {theme.showKitchen && (
             <div className="py-4 px-2 bg-gray-50">
                 <h3 className="text-center text-lg font-bold mb-4">Mutfak</h3>
                 <div className="flex gap-2 overflow-x-auto">
                    {kitchenList.map((m,i)=>(
                        <div key={i} className="min-w-[120px] h-20 bg-black rounded overflow-hidden">
                            {m.type === 'video' ? 
                                <video src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" /> : 
                                <img src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" />
                            }
                        </div>
                    ))}
                 </div>
             </div>
        )}
        
        {theme.showShowcase && (
            <div className="py-4 px-2">
                <CategoryShowcase allCategories={allCategories} selectedIds={theme.showcaseCategoryIds} />
            </div>
        )}
        
        {theme.showProducts && (
            <div className="py-4 px-2">
                <h3 className="text-center text-lg font-bold mb-4">Tüm Ürünler</h3>
                <div className={`grid gap-2 ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {allProducts.slice(0,6).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        )}
        
        {theme.showBottomShowcase && (
            <div className="py-4 px-2 bg-gray-50/50">
                <CategoryShowcase allCategories={allCategories} selectedIds={theme.bottomShowcaseCategoryIds} />
            </div>
        )}

        <div className="bg-gray-100 p-8 mt-4 text-xs">
            <div className={`grid gap-4 ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {footerColumns.map((col, i) => (
                    <div key={i}>
                        <h4 className="font-bold mb-2 uppercase">{col.title}</h4>
                        <ul className="space-y-1 text-gray-500">
                            {col.links.map((link, j) => <li key={j}>{link.text}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 p-6 max-w-[1920px] mx-auto pb-20 relative min-h-screen">
      
      {editingPage && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-800">Sayfa Düzenle</h3>
                      <button onClick={() => setEditingPage(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Sayfa Başlığı</label>
                          <input type="text" value={editingPage.title} onChange={(e) => updatePage(editingPage.id, "title", e.target.value)} className="w-full border p-3 rounded text-lg font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Örn: Hakkımızda"/>
                      </div>
                      <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-center gap-2 border border-blue-100">
                          <span className="font-bold">Sayfa Linki:</span>
                          <span className="bg-white px-2 py-1 rounded border font-mono select-all">/sayfa/{editingPage.slug}</span>
                      </div>
                      <div className="flex-1 flex flex-col">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Sayfa İçeriği</label>
                          <div className="flex-1 border rounded bg-white overflow-hidden">
                              <ReactQuill value={editingPage.content} onChange={(val) => updatePage(editingPage.id, "content", val)} theme="snow" modules={modules} className="h-full" style={{ height: '400px' }} />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => setEditingPage(null)} className="px-6 py-2 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400">Kapat</button>
                      <button onClick={saveTheme} className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Kaydet</button>
                  </div>
              </div>
          </div>
      )}

      {/* SOL PANEL */}
      <div className="space-y-6 order-last xl:order-first xl:col-span-2">
          <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Anasayfa Yönetimi</h1><button onClick={saveTheme} className="bg-black text-white px-4 py-2 rounded font-bold">KAYDET</button></div>

          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
             <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setSettingsOpen(!settingsOpen)}>
                Görünüm Ayarları
                <span>{settingsOpen?"-":"+"}</span>
             </div>
             {settingsOpen && (
                 <div className="p-4 border-t grid grid-cols-2 gap-3 text-gray-700 bg-white">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showHeroSlider} onChange={e=>setTheme({...theme, showHeroSlider: e.target.checked})}/> Hero Slider</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showCategories} onChange={e=>setTheme({...theme, showCategories: e.target.checked})}/> Kategori Barı</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showFeatured} onChange={e=>setTheme({...theme, showFeatured: e.target.checked})}/> Öne Çıkanlar</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showKitchen} onChange={e=>setTheme({...theme, showKitchen: e.target.checked})}/> Mutfak Kısmı</label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-black"><input type="checkbox" checked={theme.showShowcase} onChange={e=>setTheme({...theme, showShowcase: e.target.checked})}/> 3'lü Vitrin (Üst)</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="checkbox" checked={theme.showProducts} onChange={e=>setTheme({...theme, showProducts: e.target.checked})}/> Tüm Ürünler Listesi</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold col-span-2 bg-gray-100 p-1 rounded"><input type="checkbox" checked={theme.showBottomShowcase} onChange={e=>setTheme({...theme, showBottomShowcase: e.target.checked})}/> 2. Vitrin Alanı (Alt)</label>
                 </div>
             )}
          </div>

          {/* Logo, Hero Slider, Kategori Barı Panelleri... */}
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden"><div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setLogoOpen(!logoOpen)}>Site Logosu ({logoList.length}) <span>{logoOpen?"-":"+"}</span></div>{logoOpen && <div className="p-4 border-t"><div className="flex gap-2 w-full mb-4"><input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files[0])} className="text-sm flex-1 border p-1 rounded"/>{logoFile && <button onClick={handleLogoUpload} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Yükle</button>}</div>{logoList.length > 0 ? (<div className="grid grid-cols-4 gap-3">{logoList.map((url, i) => { const isActive = theme.logoUrl === url; return ( <div key={i} className={`relative group border-2 p-1 rounded cursor-pointer transition-all ${isActive ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-400"}`} onClick={() => selectLogo(url)}><img src={`${BASE_URL}${url}`} className="h-12 w-full object-contain" />{isActive && <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] px-1 rounded-br">Seçili</div>}<button onClick={(e) => { e.stopPropagation(); deleteLogo(url); }} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 shadow hover:scale-110 transition" title="Sil">✕</button></div> ) })}</div>) : (<p className="text-xs text-gray-400 italic text-center">Henüz logo yüklenmedi.</p>)}</div>}</div>
          
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setHeroOpen(!heroOpen)}>Hero Slider ({heroImages.length}) <span>{heroOpen?"-":"+"}</span></div>
            {heroOpen && (
              <div className="p-4 border-t">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {heroImages.map((img, i) => (<div key={i} className="relative group"><img src={`${BASE_URL}${img}`} className="h-16 w-full object-cover rounded"/><button onClick={()=>removeHeroImage(i)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-xs">X</button></div>))}
                </div>
                <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                    <label className="block text-xs font-bold text-blue-700 mb-1">Görseller Üstü Kayan Yazı</label>
                    <input type="text" className="w-full border border-blue-300 p-2 rounded text-sm" placeholder="Örn: En taze lokumlar..." value={theme.heroMarqueeText || ""} onChange={(e) => setTheme({...theme, heroMarqueeText: e.target.value})}/>
                </div>
                <div className="flex gap-2">
                  <input type="file" onChange={e=>setSelectedFile(e.target.files[0])} className="text-sm flex-1"/>
                  {selectedFile && <button onClick={addImageToSlider} className="bg-green-600 text-white px-3 py-1 rounded text-xs">{uploading?"...":"Yükle"}</button>}
                </div>
              </div>
            )}
          </div>
          
          {/* ÜST VİTRİN YÖNETİMİ */}
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setShowcaseOpen(!showcaseOpen)}>
                3'lü Vitrin (Üst) Yönetimi ({showcaseIds.length}) <span>{showcaseOpen?"-":"+"}</span>
            </div>
            {showcaseOpen && (
                <div className="p-4 border-t">
                    {showcaseIds.length > 0 && (
                        <div className="mb-4 bg-gray-50 p-2 rounded border">
                            <CategoryShowcase allCategories={allCategories} selectedIds={theme.showcaseCategoryIds} onRemove={removeFromShowcase} />
                        </div>
                    )}
                    <div className="border p-2 rounded bg-white">
                        <input type="text" placeholder="Kategori ara..." className="w-full text-xs p-2 border rounded mb-2" value={showcaseSearch} onChange={(e) => setShowcaseSearch(e.target.value)}/>
                        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                            {filteredShowcaseCategories.map(cat => {
                                const isSelected = showcaseIds.includes(cat.id);
                                if(isSelected) return null;
                                return (
                                    <div key={cat.id} className="flex items-center justify-between gap-2 p-1.5 rounded border bg-white hover:bg-gray-50">
                                        <div className="flex items-center gap-2"><img src={cat.imageUrl ? `${BASE_URL}${cat.imageUrl}` : ""} className="w-6 h-6 rounded object-cover border"/><span className="text-xs font-bold">{cat.ad || cat.name}</span></div>
                                        <button onClick={()=>addToShowcase(cat.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">+ Ekle</button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* ✅ ALT VİTRİN YÖNETİMİ (ÜSTTEKİYLE AYNI MANTIK) */}
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setBottomShowcaseOpen(!bottomShowcaseOpen)}>
                2. Vitrin (Alt) Yönetimi ({bottomShowcaseIds.length}) <span>{bottomShowcaseOpen?"-":"+"}</span>
            </div>
            {bottomShowcaseOpen && (
                <div className="p-4 border-t bg-white">
                    {/* Görsel Önizleme ve Silme Butonu Eklendi */}
                    {bottomShowcaseIds.length > 0 && (
                        <div className="mb-4 bg-gray-50 p-2 rounded border">
                            <CategoryShowcase 
                                allCategories={allCategories} 
                                selectedIds={theme.bottomShowcaseCategoryIds} 
                                onRemove={removeFromBottomShowcase} 
                            />
                        </div>
                    )}

                    <div className="border p-2 rounded bg-white">
                        <input type="text" placeholder="Kategori ara..." className="w-full text-xs p-2 border rounded mb-2" value={bottomShowcaseSearch} onChange={(e) => setBottomShowcaseSearch(e.target.value)}/>
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

          {/* Diğer Paneller (Öne Çıkanlar, Mutfak, Özel Sayfalar, Footer) */}
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden"><div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setFeaturedOpen(!featuredOpen)}>Öne Çıkanlar ({featuredIds.length}) <span>{featuredOpen?"-":"+"}</span></div>{featuredOpen && <div className="p-4 border-t"><div className="border p-2 rounded bg-gray-50"><input type="text" placeholder="Ürün ara..." className="w-full text-xs p-2 border rounded mb-2" value={productSearch} onChange={e=>setProductSearch(e.target.value)}/><div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">{filteredProducts.slice(0, 50).map(prod => { const isSelected = featuredIds.includes(prod.id); return ( <div key={prod.id} onClick={()=>toggleFeaturedProduct(prod.id)} className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer ${isSelected?"border-orange-500 bg-orange-50":""}`}><div className={`w-3 h-3 border rounded flex items-center justify-center ${isSelected?"border-orange-500":""}`}>{isSelected && <span className="text-white text-[8px]">✓</span>}</div><span className="text-xs truncate">{prod.ad || prod.name}</span></div> )})}</div></div></div>}</div>
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden"><div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setKitchenOpen(!kitchenOpen)}>Mutfak ({kitchenList.length}) <span>{kitchenOpen?"-":"+"}</span></div>{kitchenOpen && <div className="p-4 border-t"><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">{kitchenList.map((m, i) => (<div key={i} className="group relative border rounded-lg overflow-hidden shadow-sm bg-gray-50 flex flex-col"><div className="h-24 bg-black relative">{m.type === 'video' ? (<video src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover opacity-80" />) : (<img src={`${BASE_URL}${m.url}`} className="w-full h-full object-cover" />)}</div><div className="p-2 flex justify-between items-center bg-white border-t"><button onClick={()=>removeKitchenMedia(i)} className="text-red-500 hover:bg-red-50 p-1 rounded text-xs">🗑️</button></div></div>))}<div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-[130px] hover:bg-gray-50 transition cursor-pointer relative group">{!kitchenFile ? (<><span className="text-3xl text-gray-400 group-hover:text-purple-500 mb-1">+</span><input type="file" accept="image/*,video/*" onChange={e=>setKitchenFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" /></>) : (<button onClick={addKitchenMedia} className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold w-full">YÜKLE</button>)}</div></div></div>}</div>
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden"><div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setPagesOpen(!pagesOpen)}>Özel Sayfa Yönetimi <span>{pagesOpen?"-":"+"}</span></div>{pagesOpen && (<div className="p-4 border-t bg-white"><button onClick={addPage} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold">+ Yeni Sayfa Ekle</button><div className="space-y-2">{pageList.map(page => (<div key={page.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors"><div><div className="font-bold text-sm text-gray-800">{page.title}</div><div className="text-[10px] text-gray-500 font-mono">/sayfa/{page.slug}</div></div><div className="flex gap-2"><button onClick={() => setEditingPage(page)} className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold">DÜZENLE ✏️</button><button onClick={() => deletePage(page.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">SİL 🗑️</button></div></div>))}</div></div>)}</div>
          <div className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden"><div className="bg-gray-100 p-4 font-bold flex justify-between cursor-pointer text-gray-800" onClick={()=>setFooterOpen(!footerOpen)}>Footer Yönetimi <span>{footerOpen?"-":"+"}</span></div>{footerOpen && <div className="p-4 border-t bg-gray-50">{footerColumns.map((col, colIndex) => (<div key={colIndex} className="mb-6 border-b border-gray-300 pb-4 last:border-0"><div className="mb-2"><label className="text-xs font-bold text-gray-500 uppercase">Sütun {colIndex + 1} Başlığı</label><input type="text" value={col.title} onChange={(e) => updateFooterColumnTitle(colIndex, e.target.value)} className="w-full border p-2 rounded text-sm font-bold mt-1 bg-white"/></div><div className="space-y-2">{col.links.map((link, linkIndex) => (<div key={linkIndex} className="flex gap-2"><input type="text" value={link.text} onChange={(e) => updateFooterLink(colIndex, linkIndex, 'text', e.target.value)} className="flex-1 border p-1.5 rounded text-xs bg-white" placeholder="Link Adı"/><input type="text" value={link.url} onChange={(e) => updateFooterLink(colIndex, linkIndex, 'url', e.target.value)} className="flex-1 border p-1.5 rounded text-xs text-blue-600 bg-white" placeholder="URL"/><button onClick={() => removeFooterLink(colIndex, linkIndex)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button></div>))}</div><button onClick={() => addFooterLink(colIndex)} className="mt-2 text-xs text-blue-600 hover:underline font-bold bg-blue-50 px-2 py-1 rounded">+ Yeni Link Ekle</button></div>))}</div>}</div>

      </div>

      {/* SAĞ PANEL: CANLI ÖNİZLEME */}
      <div className="flex-1 xl:col-span-3 bg-[#e5e7eb] flex flex-col relative overflow-hidden rounded-xl border shadow-inner sticky top-6 h-[calc(100vh-3rem)]">
        <div className="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm"><FaEye className="text-indigo-600 text-lg"/> Canlı Önizleme</div>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button onClick={() => setPreviewMode("desktop")} className={`p-2 rounded flex items-center gap-2 text-xs font-bold ${previewMode === "desktop" ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}><FaDesktop /> Masaüstü</button>
                <button onClick={() => setPreviewMode("mobile")} className={`p-2 rounded flex items-center gap-2 text-xs font-bold ${previewMode === "mobile" ? "bg-white shadow text-indigo-600" : "text-gray-500"}`}><FaMobileAlt /> Mobil</button>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setPreviewKey(p => p+1)} className="p-2 text-gray-500 hover:text-indigo-600 bg-white border rounded"><FaSyncAlt /></button>
                <a href="/" target="_blank" className="p-2 text-gray-500 hover:text-indigo-600 bg-white border rounded"><FaExternalLinkAlt /></a>
            </div>
        </div>
        <div className="flex-1 flex justify-center items-start overflow-auto p-8 bg-gray-200/50">
            <div className={`transition-all duration-500 bg-white shadow-2xl border-4 border-gray-800 overflow-hidden relative ${previewMode === "mobile" ? "w-[375px] h-[667px] rounded-[35px] border-[12px] mt-4" : "w-full h-full rounded-lg border-0 shadow-lg"}`}>
                <PreviewContent />
            </div>
        </div>
      </div>

    </div>
  );
}

export default ThemeEditor;
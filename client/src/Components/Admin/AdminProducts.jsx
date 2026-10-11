import { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaPlus, FaSearch, FaFilter, FaInfoCircle,
  FaTrash, FaList, FaEdit
} from 'react-icons/fa';
import api from '../../api';
import AdminProductDetail from './AdminProductDetail';

// ---------------------------------------------------------------------------
// ⚠️ DİKKAT: Backend (API) adresinizi buraya yazmalısınız.
// Swagger'ı açtığınızda tarayıcıdaki adres neyse onu kullanın.
// Örn: "https://localhost:7011" veya "http://localhost:5000"
const API_BASE_URL = "https://localhost:7011"; // 7256 -> 7011
// ---------------------------------------------------------------------------

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    urun: true,
    satisFiyati: true,
    alisFiyati: true,
    envanter: true,
    satisKanallari: true,
    olusturulmaTarihi: false,
    guncellenmeTarihi: false
  });

  const columnLabels = {
    urun: 'Urun',
    satisFiyati: 'Satis Fiyati',
    alisFiyati: 'Alis Fiyati',
    envanter: 'Envanter',
    satisKanallari: 'Satis Kanallari',
    olusturulmaTarihi: 'Olusturulma Tarihi',
    guncellenmeTarihi: 'Guncellenme Tarihi',
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [showFilterRows, setShowFilterRows] = useState(false);

  // Filtreler
  const filterFieldOptions = [
    { value: 'marka', label: 'Marka' },
    { value: 'etiket', label: 'Etiket' },
    { value: 'kategori', label: 'Kategori' },
    { value: 'satisKanali', label: 'Satış Kanalı' },
    { value: 'createdAt', label: 'Oluşturma Tarihi' },
    { value: 'updatedAt', label: 'Güncelleme Tarihi' },
    { value: 'toplamStok', label: 'Toplam Stok' },
  ];

  const operatorOptions = [
    { value: 'contains', label: 'içeren' },
    { value: 'not_contains', label: 'içermeyen' },
  ];

  const makeDefaultCondition = () => ({
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    field: 'marka',
    operator: 'contains',
    brand: '',
  });

  const [draftConditions, setDraftConditions] = useState([makeDefaultCondition()]);
  const [appliedConditions, setAppliedConditions] = useState([]);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
        setShowFilterRows(false);
      }
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setIsColumnMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/Product');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Ürünler yüklenirken hata:", e);
      setProducts([]);
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const formatDateTimeTR = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString('tr-TR');
  };

  // ✅ RESİM URL DÜZELTİCİ FONKSİYON
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/40"; // Resim yoksa placeholder
    if (path.startsWith("http")) return path; // Zaten tam link ise (google.com/resim.jpg)
    
    // Eğer path "/uploads/..." gibi geliyorsa başına API adresini ekle
    // Çift slash olmaması için kontrol ediyoruz
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const brandOptions = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const set = new Set();
    for (const p of list) {
      const b = p?.marka?.ad ?? p?.marka;
      if (b && String(b).trim() !== '') set.add(String(b).trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [products]);

  // Filter Helpers
  const normalizeText = (v) => (v ?? '').toString().trim().toLocaleLowerCase('tr-TR');

  const getProductFieldValue = (p, field) => {
    switch (field) {
      case 'marka': return p?.marka?.ad || p?.marka;
      case 'etiket': return Array.isArray(p?.etiketler) ? p.etiketler.join(', ') : (p?.etiket ?? '');
      case 'kategori': return p?.kategori?.ad || p?.kategori;
      case 'satisKanali': return Array.isArray(p?.satisKanallari) ? p.satisKanallari.join(', ') : (p?.satisKanali ?? '');
      case 'toplamStok': return p?.stok;
      case 'createdAt': return p?.createdAt || p?.olusturulmaTarihi || p?.createdDate || p?.createdOn;
      case 'updatedAt': return p?.updatedAt || p?.guncellenmeTarihi || p?.updatedDate || p?.updatedOn;
      default: return p?.[field];
    }
  };

  const productPassesCondition = (p, cond) => {
    const left = normalizeText(getProductFieldValue(p, cond.field));
    const right = normalizeText(cond.brand);
    if (cond.operator === 'contains') return right === '' ? true : left.includes(right);
    if (cond.operator === 'not_contains') return right === '' ? true : !left.includes(right);
    return true;
  };

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const st = normalizeText(searchText);
    const searched = st
      ? list.filter(p => {
          const ad = normalizeText(p?.ad);
          const barcode = normalizeText(p?.barcode || (p?.id ? `SKU-${p.id}` : ''));
          return ad.includes(st) || barcode.includes(st);
        })
      : list;

    if (!appliedConditions || appliedConditions.length === 0) return searched;
    return searched.filter(p => appliedConditions.every(c => productPassesCondition(p, c)));
  }, [products, searchText, appliedConditions]);

  const safeProducts = filteredProducts || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = safeProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const updateCondition = (id, patch) => {
    setDraftConditions(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };
  const addCondition = () => setDraftConditions(prev => [...prev, makeDefaultCondition()]);
  const removeCondition = (id) => setDraftConditions(prev => {
      const next = prev.filter(x => x.id !== id);
      return next.length === 0 ? [makeDefaultCondition()] : next;
  });
  const applyFilters = () => {
    setAppliedConditions([...draftConditions]);
    setIsFilterOpen(false);
    setShowFilterRows(false);
    setCurrentPage(1);
  };
  const clearFilters = () => {
    setDraftConditions([makeDefaultCondition()]);
    setAppliedConditions([]);
    setCurrentPage(1);
  };

  // --- DETAY / EKLEME ---
  if (selectedProduct || isCreating) {
    return (
      <AdminProductDetail
        product={selectedProduct}
        onBack={() => {
          setSelectedProduct(null);
          setIsCreating(false);
          fetchProducts();
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Ürünler</h2>
          <FaInfoCircle className="text-gray-400 text-sm cursor-help hover:text-gray-600" />
        </div>
        <button onClick={() => setIsCreating(true)} className="px-5 py-2.5 bg-[#6366f1] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all">
          <FaPlus className="text-xs" /> Ürün Ekle
        </button>
      </div>

      {/* TABLO CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden relative">

        {/* TOOLBAR */}
        <div className="p-4 border-b border-gray-200 bg-white shrink-0 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative w-96">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} placeholder="Tabloda arama yapın" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
            </div>

            <div className="relative flex items-center gap-2" ref={filterRef}>
              <button onClick={() => { const next = !isFilterOpen; setIsFilterOpen(next); if (next) setShowFilterRows(false); }} className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-gray-100' : 'bg-white'}`}>
                <FaFilter className="text-gray-500" /> Filtre
                {appliedConditions.length > 0 && <span className="ml-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{appliedConditions.length}</span>}
              </button>

              {appliedConditions.length > 0 && (
                <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">Filtreleri Temizle</button>
              )}

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5 animate-fade-in origin-top-left">
                  {!showFilterRows ? (
                    <div className="flex justify-between items-center">
                      <button onClick={() => setShowFilterRows(true)} className="text-indigo-600 font-bold text-sm flex items-center gap-1"><FaPlus className="text-xs" /> Filtre Ekle</button>
                      <button onClick={() => { setIsFilterOpen(false); setShowFilterRows(false); }} className="px-4 py-2 border rounded-lg text-sm font-bold">Kapat</button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {draftConditions.map((cond) => (
                          <div key={cond.id} className="flex items-center gap-3">
                            <select value={cond.field} onChange={(e) => updateCondition(cond.id, { field: e.target.value })} className="flex-1 border rounded-lg py-2.5 px-3 text-sm outline-none">
                              {filterFieldOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={cond.operator} onChange={(e) => updateCondition(cond.id, { operator: e.target.value })} className="w-32 border rounded-lg py-2.5 px-3 text-sm outline-none">
                              {operatorOptions.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                            </select>
                            <select value={cond.brand} onChange={(e) => updateCondition(cond.id, { brand: e.target.value })} className="flex-1 border rounded-lg py-2.5 px-3 text-sm outline-none">
                              <option value="">Marka seçin</option>
                              {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <button onClick={() => removeCondition(cond.id)} className="text-gray-400 hover:text-red-500 p-2"><FaTrash /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t mt-4">
                        <button onClick={addCondition} className="text-indigo-600 font-bold text-sm flex items-center gap-1"><FaPlus className="text-xs" /> Koşul Ekle</button>
                        <div className="flex gap-2">
                          <button onClick={() => { setIsFilterOpen(false); setShowFilterRows(false); }} className="px-4 py-2 border rounded-lg text-sm font-bold">Kapat</button>
                          <button onClick={applyFilters} className="px-6 py-2 bg-[#d8b4fe] text-purple-900 font-bold rounded-lg text-sm">Uygula</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={columnMenuRef}>
            <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)} className={`p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${isColumnMenuOpen ? 'bg-gray-100' : 'bg-white'}`}>
              <FaList />
            </button>
            {isColumnMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-2 animate-fade-in origin-top-right">
                <div className="space-y-1">
                  {Object.keys(visibleColumns).map((key) => (
                    <div key={key} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => toggleColumn(key)}>
                      <span className="text-sm text-gray-700 font-medium">{columnLabels[key] || key}</span>
                      <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ${visibleColumns[key] ? 'bg-indigo-500' : ''}`}>
                        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${visibleColumns[key] ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABLO */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200 shadow-sm">
                <th className="p-4 w-10"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" /></th>
                {visibleColumns.urun && <th className="p-4">Ürün</th>}
                {visibleColumns.satisFiyati && <th className="p-4">Satış Fiyatı</th>}
                {visibleColumns.alisFiyati && <th className="p-4">            </th>}
                {visibleColumns.envanter && <th className="p-4">Envanter</th>}
                {visibleColumns.olusturulmaTarihi && <th className="p-4">Oluşturulma Tarihi</th>}
                {visibleColumns.guncellenmeTarihi && <th className="p-4">Güncellenme Tarihi</th>}
                {visibleColumns.satisKanallari && <th className="p-4 text-right pr-8">Satış Kanalları</th>}
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {currentProducts?.map((p) => (
                <tr 
                  key={p.id} 
                  className="hover:bg-indigo-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedProduct(p)} 
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  </td>

                  {visibleColumns.urun && (
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                          {/* DÜZELTİLDİ: Resmi API adresinden çekmesi için fonksiyon kullanıldı */}
                          <img 
                            src={getImageUrl(p.resimUrl)} 
                            alt="" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-[13px]">{p.ad}</div>
                          <div className="text-xs text-gray-400 font-medium mt-0.5">{p.barcode || 'SKU-' + p.id}</div>
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.satisFiyati && (
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-xs">{(Number(p.fiyat) * 1.2).toFixed(2)} ₺</span>
                        <span className="font-bold text-gray-900">{Number(p.fiyat).toFixed(2)} ₺</span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.alisFiyati && <td className="p-4 text-gray-400">-</td>}
                  {visibleColumns.envanter && <td className="p-4 text-gray-600 font-medium">{p.stok} adet</td>}
                  {visibleColumns.olusturulmaTarihi && <td className="p-4 text-gray-500">{formatDateTimeTR(p.createdAt)}</td>}
                  {visibleColumns.guncellenmeTarihi && <td className="p-4 text-gray-500">{formatDateTimeTR(p.updatedAt)}</td>}
                  {visibleColumns.satisKanallari && (
                    <td className="p-4 text-right pr-8">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> 1 Satış Kanalı
                      </div>
                    </td>
                  )}
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setSelectedProduct(p)} 
                        className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Düzenle"
                    >
                        <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-gray-400">Sonuç bulunamadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-white mt-auto shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Satır:</span>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1 outline-none">
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {safeProducts.length === 0 ? "0 / 0" : `${indexOfFirstItem + 1} - ${Math.min(indexOfLastItem, safeProducts.length)} / ${safeProducts.length}`}
          </div>
          <div className="flex gap-1">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50">‹</button>
            <span className="px-4 py-1 bg-[#f3e8ff] border border-purple-200 text-purple-700 font-bold">{totalPages === 0 ? 0 : currentPage}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50">›</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminProducts;
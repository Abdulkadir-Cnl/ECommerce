import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../api";
import { getPageSeo } from "../seoApi";
import { useBasket } from "../Context/BasketContext";
import { toast } from "react-toastify";

// ⚠️ DİKKAT: Backend (API) adresinizi buraya yazın (Swagger adresi)
const API_BASE_URL = "https://localhost:7011"; // 7256 -> 7011

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToBasket } = useBasket();

  const [product, setProduct] = useState(null);
  const [seo, setSeo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedGram, setSelectedGram] = useState(750);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Ürün
        const productRes = await api.get(`/Product/${id}`);
        setProduct(productRes.data);

        // ÜRÜN BAZLI SEO
        const seoRes = await getPageSeo("product", Number(id));
        setSeo(seoRes);
      } catch (err) {
        console.error("Hata:", err);
        toast.error("Ürün yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  // ✅ RESİM URL DÜZELTİCİ FONKSİYON
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path; // Zaten tam link ise dokunma
    // API adresi + dosya yolu
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const handleAddToBasket = () => {
    addToBasket(
      {
        id: product.id,
        ad: product.ad,
        fiyat: product.fiyat,
        // Sepete eklerken de tam yolu kullanmak isterseniz getImageUrl kullanabilirsiniz
        // Ancak genellikle sepet iconu için küçük resim yeterlidir, backend yolu tutulabilir.
        // Görüntüleme aşamasında düzeltebiliriz. Şimdilik orijinali kalsın.
        resimUrl: product.resimUrl,
      },
      quantity
    );
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!product) return <div className="p-10 text-center">Ürün bulunamadı</div>;

  // SEO ve Görünüm için resim linkini hazırla
  const fullImageUrl = getImageUrl(product.resimUrl);

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>
          {seo?.title?.trim()
            ? seo.title
            : `${product.ad} | Başyazıcı Kasap`}
        </title>

        <meta
          name="description"
          content={
            seo?.description?.trim()
              ? seo.description
              : product.aciklama?.substring(0, 160)
          }
        />

        {seo?.keywords?.trim() && (
          <meta name="keywords" content={seo.keywords} />
        )}

        {/* canonical */}
        <link
          rel="canonical"
          href={`${window.location.origin}/urun/${product.id}`}
        />

        {/* og */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seo?.title || product.ad} />
        <meta
          property="og:description"
          content={seo?.description || product.aciklama}
        />
        {/* SEO Görseli için de tam yol veriyoruz */}
        {fullImageUrl && (
          <meta property="og:image" content={fullImageUrl} />
        )}
      </Helmet>
      {/* ======================================= */}

      {/* ===== TASARIM ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 mb-6 hover:text-gray-600 transition-colors"
        >
          ← Mağazaya Geri Dön
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* SOL TARAF - RESİM */}
          <div className="flex justify-center items-center bg-gray-50 rounded-xl p-10 border border-gray-100">
            {product.resimUrl ? (
              <img
                src={fullImageUrl} 
                alt={product.ad}
                className="max-h-[420px] w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 font-medium">
                Görsel Yok
              </div>
            )}
          </div>

          {/* SAĞ TARAF - BİLGİLER */}
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium tracking-wide uppercase">
              {product.kategoriAdi || "Genel"}
            </p>

            <h1 className="text-4xl font-bold mb-3 text-gray-900">{product.ad}</h1>

            <div className="text-3xl font-bold text-[#6b2c3e] mb-6">
              {product.fiyat.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </div>

            {/* AÇIKLAMA VARSA GÖSTER */}
            {product.aciklama && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                    {product.aciklama}
                </p>
            )}

            <div className="mb-6">
              <p className="font-medium mb-2 text-gray-800">Gramaj Seçenekleri</p>
              <div className="flex gap-3">
                {[750, 350].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGram(g)}
                    className={`px-6 py-2 border rounded-lg transition-all ${
                      selectedGram === g
                        ? "bg-[#6b2c3e] text-white border-[#6b2c3e] shadow-md"
                        : "bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {g} gr
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex gap-4 h-12">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 h-full hover:bg-gray-100 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="px-4 font-bold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 h-full hover:bg-gray-100 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToBasket}
                  className="flex-1 bg-[#6b2c3e] hover:bg-[#5a2433] text-white font-bold rounded-lg px-6 transition-colors shadow-lg shadow-red-100"
                >
                  SEPETE EKLE
                </button>
              </div>
            </div>
            
            {/* EK BİLGİLER */}
            <div className="text-xs text-gray-400 mt-8 space-y-1">
                <p>Ürün Kodu: {product.barcode || `SKU-${product.id}`}</p>
                <p>Kategori: {product.kategoriAdi || '-'}</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;
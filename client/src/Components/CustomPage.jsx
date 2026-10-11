import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet"; 
import api from "../Api";

function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.get("/theme/homepage");
        if (res.data && res.data.customPages) {
          const pages = JSON.parse(res.data.customPages || "[]");
          const found = pages.find((p) => p.slug === slug);
          setPage(found);
        }
      } catch (err) {
        console.error("Sayfa yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!page) return <div className="p-10 text-center text-red-500">Sayfa bulunamadı.</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-[60vh]">
      {/* Tarayıcı Sekme Başlığı */}
      <Helmet>
        <title>{page.title} | Başyazıcı</title>
      </Helmet>

      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">{page.title}</h1>
      
      {/* Zengin Metin İçeriği (HTML Render) */}
      {/* 'ql-editor' class'ı ReactQuill stillerini uygular */}
      <div 
        className="prose max-w-none text-gray-700 leading-relaxed ql-editor"
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </div>
  );
}

export default CustomPage;
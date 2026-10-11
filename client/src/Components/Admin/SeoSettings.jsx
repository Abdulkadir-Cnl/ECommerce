import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const SeoSettings = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [indexable, setIndexable] = useState(true);

  useEffect(() => {
    loadSeo();
  }, []);

  // SITE SEO ÇEK
  const loadSeo = async () => {
    try {
      const res = await api.get("/seo/page", {
        params: { type: "site", id: 0 },
      });

      if (res.data) {
        setTitle(res.data.title || "");
        setDescription(res.data.description || "");
        setKeywords(res.data.keywords || "");
        setIndexable(res.data.indexable ?? true);
      }
    } catch {
      // ilk seferde boş olabilir
    }
  };

  // SITE SEO KAYDET
  const handleSave = async () => {
    try {
      const payload = {
        pageType: "site",      // 🔴 ZORUNLU
        entityId: 0,           // 🔴 ZORUNLU (site için 0)
        title,
        description,
        keywords
      };
  
      await api.post("/seo/page", payload);
  
      toast.success("SEO ayarları kaydedildi");
    } catch (err) {
      console.error(err);
      toast.error("SEO ayarları kaydedilemedi");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-8">
      <h1 className="text-2xl font-bold mb-8">SEO ve Alan Adı</h1>

      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">
            Site Başlığı (Title)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Meta Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 h-28 resize-none"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Anahtar Kelimeler
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={indexable}
            onChange={(e) => setIndexable(e.target.checked)}
          />
          <span className="font-medium">
            Arama motorlarında indexlensin
          </span>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 bg-black text-white px-8 py-3 rounded-lg font-bold"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default SeoSettings;

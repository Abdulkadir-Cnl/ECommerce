import api from "./api";

/*
  ÜRÜN SEO endpoint:
  GET /api/seo/product/1

  SEO yoksa backend null döner → fallback kullanılır
*/

export const getPageSeo = async (type, id) => {
  try {
    if (type === "product") {
      const res = await api.get(`/seo/product/${id}`);

      if (!res.data) {
        return getFallbackSeo(type);
      }

      return {
        title: res.data.title,
        description: res.data.description,
        keywords: "", // SeoMeta'da yok
        canonical: res.data.canonical,
        ogImage: res.data.ogImage,
      };
    }

    return getFallbackSeo(type);
  } catch (err) {
    console.error("SEO yüklenemedi:", err);
    return getFallbackSeo(type);
  }
};

const getFallbackSeo = (type) => {
  if (type === "product") {
    return {
      title: "Ürün Detayı | Başyazıcı Kasap",
      description:
        "Ürün detaylarını inceleyin, sepete ekleyin ve güvenle satın alın.",
      keywords: "ürün, et, kasap, alışveriş",
    };
  }

  return {
    title: "Başyazıcı Kasap",
    description: "Kaliteli et ürünleri, güvenli ödeme.",
    keywords: "kasap, et, sucuk",
  };
};

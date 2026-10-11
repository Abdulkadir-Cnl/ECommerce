import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

const BASE_URL = "https://localhost:7011";
const BasketContext = createContext();

const getToken = () => {
  const t = localStorage.getItem("token");
  return t && t !== "null" && t !== "undefined" ? t : null;
};

// URL Birleştirme Yardımcı Fonksiyonu
const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    return `${BASE_URL}/${relativeUrl}`;
}

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  useEffect(() => {
    loadBasket();
  }, []);

  const loadBasket = async () => {
    const token = getToken();

    // GUEST
    if (!token) {
      const local = JSON.parse(localStorage.getItem("guestBasket")) || [];
      setBasketItems(
        local.map(item => ({
          ...item,
          resimUrl: getImageUrl(item.resimUrl) 
        }))
      );
      return;
    }

    // LOGIN
    try {
      const res = await api.get("/Basket", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = (res.data.items || []).map(item => ({
        ...item,
        resimUrl: getImageUrl(item.resimUrl)
      }));

      setBasketItems(items);
    } catch {
      setBasketItems([]);
    }
  };
  
  const updateQuantity = async (productId, quantityChange) => {
    const token = getToken();
    let newItems;
    let local = JSON.parse(localStorage.getItem("guestBasket")) || [];

    const existingItem = local.find(x => x.productId === productId);
    if (!existingItem) return;

    const newQuantity = existingItem.quantity + quantityChange;

    if (newQuantity <= 0) {
      newItems = local.filter(x => x.productId !== productId);
      
      if (token) {
        try {
          await api.delete(`/Basket/remove/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("Backend'den kaldırma hatası:", error);
        }
      }

    } else {
      newItems = local.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      );

      if (token) {
        try {
          await api.post(
            `/Basket/add?productId=${productId}&quantity=${quantityChange}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error("Backend adet güncelleme hatası:", error);
        }
      }
    }

    localStorage.setItem("guestBasket", JSON.stringify(newItems));
    loadBasket();
  };

  const addToBasket = async (product, quantity = 1) => {
    const existing = basketItems.find(x => x.productId === product.id);
    
    if (!existing) {
        const token = getToken();
        
        if (token) {
            try {
                await api.post(
                `/Basket/add?productId=${product.id}&quantity=${quantity}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Sepet API hatası:", error);
            }
        }

        let local = JSON.parse(localStorage.getItem("guestBasket")) || [];
        local.push({
            productId: product.id,
            productName: product.ad,
            price: Number(product.fiyat),
            quantity,
            resimUrl: product.resimUrl, 
        });
        localStorage.setItem("guestBasket", JSON.stringify(local));
        loadBasket();

    } else {
        await updateQuantity(product.id, quantity);
    }
    
    toast.success("Sepete eklendi");
  };

  const removeFromBasket = async (productId) => {
    const token = getToken();

    if (token) {
      try {
        await api.delete(`/Basket/remove/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
          console.error("Sepetten kaldırma API hatası:", error);
      }
    }

    let local = JSON.parse(localStorage.getItem("guestBasket")) || [];
    local = local.filter(x => x.productId !== productId);
    localStorage.setItem("guestBasket", JSON.stringify(local));
    loadBasket();
    
    if (local.length === 0) {
       toast.info("Sepetiniz boşaltıldı.");
    }
  };

  const clearBasket = async () => {
    const token = getToken();

    if (token) {
      try {
        await api.delete('/Basket/clear', { 
            headers: { Authorization: `Bearer ${token}` } 
        });
      } catch (error) {
        console.error("Sepet temizleme API hatası:", error);
      }
    }
    
    localStorage.removeItem("guestBasket");
    setBasketItems([]);
    toast.info("Sepetiniz temizlendi.");
  }

  // --- HESAPLAMALAR ---
  const totalPrice = basketItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // 🔴 ÇÖZÜM: Sepetteki toplam ürün adedini hesapla
  const basketCount = basketItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <BasketContext.Provider
      value={{
        basketItems,
        basketCount, // 👈 Navbar'ın görebilmesi için buraya eklendi
        addToBasket,
        removeFromBasket,
        updateQuantity,
        totalPrice,
        isBasketOpen,
        setIsBasketOpen,
        clearBasket, 
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
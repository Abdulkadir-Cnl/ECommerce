// src/Context/BasketContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);

  // Sayfa yüklendiğinde sepeti getir
  useEffect(() => {
    fetchBasket();
  }, []);

  const fetchBasket = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // SENARYO 1: Üye Girişi Yapılmış -> API'den Çek
      try {
        // Backend'inde sepeti getiren endpoint '/Basket' ise:
        const response = await api.get('/Basket', {
             headers: { Authorization: `Bearer ${token}` }
        });
        setBasketItems(response.data.items || response.data); 
      } catch (error) {
        console.error("Sepet çekilemedi:", error);
      }
    } else {
      // SENARYO 2: Misafir -> LocalStorage'dan Çek
      const localBasket = JSON.parse(localStorage.getItem('guestBasket')) || [];
      setBasketItems(localBasket);
    }
  };

  // --- SEPETE EKLEME FONKSİYONU ---
  const addToBasket = async (product, quantity = 1) => {
    const token = localStorage.getItem('token');

    if (token) {
      // A. ÜYE İSE: Backend'e istek at
      try {
        await api.post(`/Basket/add?productId=${product.id}&quantity=${quantity}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Ürün sepete eklendi");
        fetchBasket(); // Sepeti güncelle
      } catch (error) {
        console.error(error);
        toast.error("Sepete eklenirken hata oluştu.");
      }
    } else {
      // B. MİSAFİR İSE: LocalStorage kullan
      let currentBasket = JSON.parse(localStorage.getItem('guestBasket')) || [];
      
      // Ürün zaten var mı kontrol et
      const existingItemIndex = currentBasket.findIndex(item => item.productId === product.id);

      if (existingItemIndex > -1) {
        currentBasket[existingItemIndex].quantity += quantity;
      } else {
        // Backend yapına uygun obje oluşturuyoruz
        currentBasket.push({
          productId: product.id,
          productName: product.ad,
          price: product.fiyat,
          imageUrl: product.resimUrl,
          quantity: quantity
        });
      }

      localStorage.setItem('guestBasket', JSON.stringify(currentBasket));
      setBasketItems(currentBasket);
      toast.success("Ürün sepete eklendi");
    }
  };

  // Sepetteki toplam ürün sayısı (Badge için)
  const basketCount = basketItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <BasketContext.Provider value={{ basketItems, addToBasket, basketCount, fetchBasket }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
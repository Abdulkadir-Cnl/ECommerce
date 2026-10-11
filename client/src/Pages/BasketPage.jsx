import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaArrowRight, FaShoppingBag, FaMinus, FaPlus } from "react-icons/fa";
import { useBasket } from "../Context/BasketContext";

function BasketPage() {
  const { 
    basketItems, 
    totalPrice, 
    removeFromBasket, 
    updateQuantity // YENİ: Adet güncellemek için
  } = useBasket();
  const navigate = useNavigate();

  /* =======================
     SEPET BOŞ (İstek 2 Çözümü)
  ======================= */
  if (!basketItems || basketItems.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <FaShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">
          Sepetiniz boş
        </h2>
        <p className="text-gray-500 mb-6">
          Sepetinize henüz ürün eklemediniz
        </p>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition"
        >
          <FaArrowLeft />
          Alışverişe Dön
        </button>
      </div>
    );
  }

  /* =======================
     SEPET DOLU
  ======================= */
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Sepetim ({basketItems.length} Ürün)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ÜRÜN LİSTESİ */}
        <div className="lg:col-span-2 space-y-4">
          {basketItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 border rounded p-4 bg-white shadow-sm"
            >
              {/* FOTO */}
              <div className="w-24 h-24 border rounded overflow-hidden shrink-0">
                <img
                  src={item.resimUrl || "/no-image.png"}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* BİLGİ */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Birim Fiyat: {item.price.toFixed(2)} ₺
                </p>
                <p className="font-bold mt-2 text-xl">
                  {(item.price * item.quantity).toFixed(2)} ₺
                </p>
              </div>
              
              {/* ADET KONTROLÜ (İstek 1 Çözümü) */}
              <div className="flex items-center border border-gray-300 rounded-lg text-base text-gray-800 font-semibold shrink-0">
                  <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-3 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 transition"
                      disabled={item.quantity <= 1} // Minimum 1 adet
                  >
                      <FaMinus size={12} />
                  </button>
                  <span className="px-5 select-none border-x border-gray-200 h-full flex items-center">{item.quantity}</span>
                  <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-3 hover:bg-gray-100 rounded-r-lg transition"
                  >
                      <FaPlus size={12} />
                  </button>
              </div>

              {/* SİL */}
              <button
                onClick={() => removeFromBasket(item.productId)}
                className="text-red-600 hover:text-red-800 p-3 shrink-0"
                title="Ürünü tamamen kaldır"
              >
                <FaTrash size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* SİPARİŞ ÖZETİ */}
        <div className="border rounded p-6 h-fit bg-white shadow-lg">
          <h2 className="text-xl font-bold mb-5">
            Sipariş Özeti
          </h2>

          <div className="flex justify-between text-base mb-3 text-gray-700">
            <span>Ara Toplam</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>
          
          <div className="flex justify-between text-base mb-6 text-gray-700 border-b pb-4">
            <span>Kargo</span>
            <span className="font-semibold text-green-600">ÜCRETSİZ</span>
          </div>

          <div className="flex justify-between font-extrabold text-2xl mb-6">
            <span>Toplam</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-red-600 text-white py-3 rounded font-semibold mb-3 hover:bg-red-700 transition"
          >
            <FaArrowRight className="inline mr-2" />
            Ödemeye Git
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 py-3 rounded font-semibold hover:bg-gray-50 transition"
          >
            Alışverişe Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasketPage;
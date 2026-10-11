import { FaTrash, FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useBasket } from "../Context/BasketContext";

const BasketSidebar = () => {
  const {
    basketItems,
    removeFromBasket,
    updateQuantity, // YENİ: Adet güncellemek için
    isBasketOpen,
    setIsBasketOpen,
    totalPrice,
  } = useBasket();

  const navigate = useNavigate();

  const goBasket = () => {
    setIsBasketOpen(false);
    navigate("/basket");
  };

  const goCheckout = () => {
    setIsBasketOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* KARARTMA */}
      {isBasketOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsBasketOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 right-0 h-full w-96 bg-white z-50
          transform transition-transform duration-300
          ${isBasketOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">Sepetim</h3>
          <button onClick={() => setIsBasketOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* ÜRÜNLER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {basketItems.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p className="mb-4">Sepetiniz boş</p>
                <button
                  onClick={() => {
                    setIsBasketOpen(false);
                    navigate("/");
                  }}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Alışverişe Dön
                </button>
              </div>
            )}

            {basketItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 border rounded p-2"
              >
                <div className="w-16 h-16 border rounded overflow-hidden shrink-0">
                  <img
                    src={item.resimUrl || "/no-image.png"}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {item.productName}
                  </p>
                  <p className="font-bold mt-1 text-sm">
                    {(item.price * item.quantity).toFixed(2)} ₺
                  </p>
                </div>
                
                {/* ADET KONTROLÜ */}
                <div className="flex items-center border rounded-full text-xs text-gray-700 font-medium shrink-0">
                    <button 
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-2 hover:bg-gray-100 rounded-l-full disabled:opacity-50"
                        disabled={item.quantity <= 1} // Minimum 1 adet
                    >
                        <FaMinus size={10} />
                    </button>
                    <span className="px-3 select-none">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-2 hover:bg-gray-100 rounded-r-full"
                    >
                        <FaPlus size={10} />
                    </button>
                </div>

                {/* TAMAMEN SİL */}
                <button
                  onClick={() => removeFromBasket(item.productId)}
                  className="text-red-600 hover:text-red-800 ml-1 shrink-0"
                  title="Ürünü tamamen kaldır"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          {basketItems.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between font-semibold">
                <span>Toplam</span>
                <span>{totalPrice.toFixed(2)} ₺</span>
              </div>

              <button
                onClick={goBasket}
                className="w-full border py-2 rounded font-semibold hover:bg-gray-50 transition"
              >
                Sepet Sayfasına Git
              </button>

              <button
                onClick={goCheckout}
                className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
              >
                Ödemeye Git
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BasketSidebar;
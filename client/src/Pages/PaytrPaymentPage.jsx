// src/Pages/PaytrPaymentPage.jsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import IframeResizer from "@iframe-resizer/react"; 

const PaytrPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // CheckoutPage'den gelen token'ı yakalar

  useEffect(() => {
    if (!token) {
      navigate("/"); // Token yoksa güvenlik amacıyla ana sayfaya atar
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden p-4">
        <h2 className="text-lg font-semibold text-center mb-4 border-b pb-2">
          Güvenli Ödeme Sayfası
        </h2>

        {/* PayTR Iframe'i: Kullanıcı kart bilgilerini burada girer */}
        <IframeResizer
          src={`https://www.paytr.com/odeme/guvenli/${token}`} 
          style={{ width: "1px", minWidth: "100%", border: "none" }}
          scrolling="no"
          frameBorder="0"
        />
        
        <p className="text-center text-xs text-gray-400 mt-4">
          256-bit SSL ile güvenli olarak korunmaktadır.
        </p>
      </div>
    </div>
  );
};

export default PaytrPaymentPage;
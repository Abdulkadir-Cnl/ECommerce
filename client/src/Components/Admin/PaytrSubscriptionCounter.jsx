import { useEffect, useState } from "react";
import { FaCreditCard, FaExclamationTriangle } from "react-icons/fa";

const PaytrSubscriptionCounter = () => {
  // 🔴 PAYTR ABONELİK BİTİŞ TARİHİ
  // SADECE BURAYI DEĞİŞTİRMEN YETERLİ
  const SUBSCRIPTION_END_DATE = "2025-03-31"; // YYYY-MM-DD

  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    const calculateRemainingDays = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(SUBSCRIPTION_END_DATE);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate - today;
      const diffDays = Math.max(
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        0
      );

      setRemainingDays(diffDays);
    };

    calculateRemainingDays();

    // ⏱️ Gün değişimini yakala
    const interval = setInterval(calculateRemainingDays, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const isExpired = remainingDays === 0;
  const isCritical = remainingDays <= 7 && remainingDays > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 text-xl">
          <FaCreditCard />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            PayTR Aboneliği
          </h2>
          <p className="text-sm text-gray-500">
            Ödeme altyapısı durumu
          </p>
        </div>
      </div>

      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isExpired
            ? "bg-red-50 border-red-200"
            : isCritical
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div>
          <p className="text-xs font-bold uppercase text-gray-500 mb-1">
            Kalan Süre
          </p>

          {isExpired ? (
            <p className="text-xl font-extrabold text-red-600">
              Süresi Doldu
            </p>
          ) : (
            <p className="text-2xl font-extrabold text-gray-800">
              {remainingDays} gün
            </p>
          )}
        </div>

        {(isCritical || isExpired) && (
          <FaExclamationTriangle
            className={`text-2xl ${
              isExpired ? "text-red-500" : "text-yellow-500"
            }`}
          />
        )}
      </div>

      {isCritical && !isExpired && (
        <p className="text-xs text-yellow-700 mt-3 font-semibold">
          ⚠️ PayTR aboneliğiniz yakında sona erecek.
        </p>
      )}

      {isExpired && (
        <p className="text-xs text-red-700 mt-3 font-semibold">
          ❌ PayTR aboneliği sona erdi. Ödeme alınamaz.
        </p>
      )}
    </div>
  );
};

export default PaytrSubscriptionCounter;

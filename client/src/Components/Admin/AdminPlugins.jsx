import { FaFacebook, FaGoogle, FaTag, FaEllipsisV } from "react-icons/fa";

const plugins = [
  {
    id: 1,
    name: "Facebook Piksel",
    value: "877446391228945",
    description:
      "Yeni müşteri kitlelerinizi keşfedin. Facebook Pixel ile kampanya performansını ve dönüşümleri takip edin.",
    icon: <FaFacebook className="text-blue-600 text-xl" />,
  },
  {
    id: 2,
    name: "Facebook Conversion API",
    value: "EAAQweXlygfsBPp9RBCZA1H0wkm2UPkQIE...",
    description:
      "Tarayıcı kısıtlamalarından bağımsız olarak dönüşüm verilerini Facebook'a güvenli biçimde gönderin.",
    icon: <FaFacebook className="text-blue-800 text-xl" />,
  },
  {
    id: 3,
    name: "Google Analytics Ölçüm Kimliği",
    value: "G-QLLMGJ6YHQ",
    description:
      "GA4 ile sitenizin trafik ve e-ticaret dönüşümlerini izleyin.",
    icon: <FaGoogle className="text-orange-500 text-xl" />,
  },
  {
    id: 4,
    name: "Google Analytics Measurement Protocol API",
    value: "DmDi80YQTe6jicRbtC4yXg",
    description:
      "Sunucu taraflı satın alma verilerini Google Analytics'e gönderin.",
    icon: <FaGoogle className="text-yellow-500 text-xl" />,
  },
  {
    id: 5,
    name: "Google Tag Manager",
    value: "GTM-52MB22DB",
    description:
      "Tüm izleme ve pazarlama etiketlerini tek panelden yönetin.",
    icon: <FaTag className="text-indigo-600 text-xl" />,
  },
];

const AdminPlugins = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Web Veri İzleme ve Analiz Araçları
      </h1>

      <div className="space-y-4">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className="bg-white rounded-xl border p-5 flex justify-between items-start hover:shadow transition"
          >
            <div className="flex gap-4">
              <div className="mt-1">{plugin.icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-lg">{plugin.name}</h2>
                  <span className="text-sm px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    {plugin.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {plugin.description}
                </p>
              </div>
            </div>

            <button className="text-gray-500 hover:text-gray-800">
              <FaEllipsisV />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPlugins;

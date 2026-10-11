import { useRef } from "react";

function VideoItem({ src }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="overflow-hidden rounded-lg cursor-pointer h-full w-full bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        muted            // 🔇 SESSİZ
        playsInline
        preload="metadata"
        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

function VideoSection({ media }) {
  const list = JSON.parse(media || "[]");

  if (list.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 border-l-4 border-red-700 pl-3">
        Mutfağımızdan Kareler
      </h2>

      {/* 🔴 DEĞİŞİKLİK: Ekran boyutuna göre otomatik sığan Grid yapısı */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {list.map((m, i) => (
          // h-40 yaparak yüksekliği biraz kıstık, böylece ekrana daha çok şey sığar
          <div key={i} className="h-40 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
            {m.type === "video" ? (
              <VideoItem
                src={`https://localhost:7011${m.url}`}
              />
            ) : (
              <img
                src={`https://localhost:7011${m.url}`}
                className="w-full h-full object-cover"
                alt="Media"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoSection;
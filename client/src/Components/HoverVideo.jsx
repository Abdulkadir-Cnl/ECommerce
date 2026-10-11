import { useRef } from 'react';

function HoverVideo({ videoSrc, posterSrc, className }) {
  const videoRef = useRef(null);

  // Mouse üzerine gelince (Hover Start)
  const handleMouseEnter = () => {
    if (videoRef.current) {
      // Video oynatma işlemi bazen asenkron olabilir, hatayı önlemek için promise kontrolü
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Otomatik oynatma engellenirse veya video yüklenmemişse konsola yaz
          console.log("Video oynatılamadı (Hover):", error);
        });
      }
    }
  };

  // Mouse üzerinden gidince (Hover End)
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      // İstersen video başa dönsün diye şu satırı açabilirsin:
      videoRef.current.currentTime = 0; 
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-md cursor-pointer group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Ayarları:
        - muted: SESSİZ (İsteğin üzerine zorunlu)
        - loop: Video bitince başa döner
        - playsInline: Mobilde tam ekran olmadan olduğu yerde oynar
        - poster: Video yüklenene kadar veya oynamıyorken görünecek kapak resmi
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        muted 
        loop
        playsInline
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Opsiyonel: Üzerine gelince çıkan bir ikon veya karartma efekti */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none"></div>
    </div>
  );
}

export default HoverVideo;
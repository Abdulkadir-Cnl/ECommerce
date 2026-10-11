import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function HeroSlider({ images, marqueeText }) {
  let list = [];
  try {
    if (Array.isArray(images)) list = images;
    else if (typeof images === "string") list = JSON.parse(images || "[]");
  } catch (error) { list = []; }

  if (!list || list.length === 0) return null;

  return (
    <div className="w-full select-none relative overflow-hidden">
      {/* ✅ YAZI KATMANI: Logo barının hemen altı, görsellerin üstü */}
      {marqueeText && (
        <div className="absolute top-0 left-0 w-full bg-black/50 backdrop-blur-sm py-0 z-20 border-b border-white/10 pointer-events-none">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block text-white font-bold text-sm tracking-wide uppercase italic">
                <span className="mx-10">{marqueeText}</span>
                <span className="mx-10">{marqueeText}</span>
                <span className="mx-10">{marqueeText}</span>
                <span className="mx-10">{marqueeText}</span>
            </div>
          </div>
        </div>
      )}

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        loop={list.length > 1}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        observer={true} 
        observeParents={true}
        key={list.length + (marqueeText ? 1 : 0)} 
        slidesPerView={1}
        className="w-full"
      >
        {list.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="w-full h-[420px] md:h-[480px] overflow-hidden bg-gray-100">
              <img
                src={`https://localhost:7011${img}`}
                alt={`Banner ${i + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default HeroSlider;
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_SLIDES } from "@/lib/constants";
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSlider = ({ customSlides }) => {
  const slides = customSlides?.length > 0 ? customSlides.map(s => ({
    image: s.image_data || s.image,
    category: s.category,
    title: s.title,
    subtitle: s.subtitle
  })) : DEFAULT_SLIDES;

  return (
    <div className="relative w-full h-[70vh]">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: '.prev-btn', nextEl: '.next-btn' }}
        className="h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full bg-cover bg-center" style={{ backgroundImage: `url("${slide.image}")` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050A14] via-[#050A14]/60 to-transparent" />
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl">
                  <span className="inline-block px-4 py-1 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest mb-4">{slide.category}</span>
                  <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#F5F5F0] mb-4">{slide.title}</h1>
                  <p className="text-xl text-[#A0A5B0] italic">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14]">
        <ChevronLeft size={20} />
      </button>
      <button className="next-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14]">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default HeroSlider;

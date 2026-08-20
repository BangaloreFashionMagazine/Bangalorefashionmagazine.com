import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API, BFM_LOGO } from "@/lib/config";

const TalentHeroSlider = () => {
  const [heroData, setHeroData] = useState({ slides: [], settings: {}, has_slides: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);

  // Fetch hero data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await axios.get(`${API}/hero-data`);
        setHeroData(res.data);
      } catch (err) {
        console.error("Failed to load hero data", err);
      }
    };
    fetchHeroData();
  }, []);

  const { slides, settings, has_slides } = heroData;
  const slideCount = slides.length;

  // Autoplay
  useEffect(() => {
    if (!settings.autoplay || slideCount <= 1 || isPaused) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }

    autoplayRef.current = setInterval(() => {
      goToNext();
    }, (settings.slide_duration || 5) * 1000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [settings.autoplay, settings.slide_duration, slideCount, isPaused, currentSlide]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [currentSlide, isTransitioning]);

  const goToPrev = useCallback(() => {
    const newIndex = currentSlide === 0 ? slideCount - 1 : currentSlide - 1;
    goToSlide(newIndex);
  }, [currentSlide, slideCount, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentSlide === slideCount - 1 ? 0 : currentSlide + 1;
    goToSlide(newIndex);
  }, [currentSlide, slideCount, goToSlide]);

  // Transition classes based on settings
  const getTransitionClass = () => {
    switch (settings.transition) {
      case "slide":
        return "transition-transform duration-700 ease-in-out";
      case "zoom":
        return "transition-all duration-[1500ms] ease-out";
      default: // fade
        return "transition-opacity duration-700 ease-in-out";
    }
  };

  // If no slides, show default hero
  if (!has_slides) {
    return (
      <div 
        className="relative w-full overflow-hidden"
        style={{ height: settings.hero_height || "70vh", backgroundColor: settings.default_bg_color || "#050A14" }}
      >
        {/* BFM Logo */}
        <div className="absolute top-6 left-6 z-20">
          <img src={BFM_LOGO} alt="BFM" className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30" />
        </div>

        {/* Default Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-[#050A14] to-[#0A1628]" />
        
        {/* Gold accent lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">Est. 2024</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#F5F5F0] mb-4 leading-tight">
            {settings.default_headline || "BANGALORE FASHION MAGAZINE"}
          </h1>
          <p className="text-[#A0A5B0] text-lg md:text-xl mb-8 tracking-wider">
            {settings.default_description || "DISCOVER. CREATE. GET FEATURED."}
          </p>
          <Link 
            to={settings.default_cta_link || "/join"}
            className="px-8 py-4 bg-[#D4AF37] text-[#050A14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#F5F5F0] transition-colors"
          >
            {settings.default_cta_text || "JOIN BFM"}
          </Link>
        </div>
      </div>
    );
  }

  // Render slides
  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: settings.hero_height || "70vh" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* BFM Logo */}
      {settings.logo_position !== "hidden" && (
        <div className={`absolute z-20 ${
          settings.logo_position === "top-center" ? "top-6 left-1/2 -translate-x-1/2" :
          settings.logo_position === "top-right" ? "top-6 right-6" :
          "top-6 left-6"
        }`}>
          <Link to="/">
            <img src={BFM_LOGO} alt="BFM" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors" />
          </Link>
        </div>
      )}

      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentSlide;
        
        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 ${getTransitionClass()} ${
              settings.transition === "fade" 
                ? isActive ? "opacity-100" : "opacity-0"
                : settings.transition === "zoom"
                ? isActive ? "opacity-100 scale-100" : "opacity-0 scale-105"
                : ""
            }`}
            style={{
              transform: settings.transition === "slide" 
                ? `translateX(${(idx - currentSlide) * 100}%)` 
                : undefined,
              zIndex: isActive ? 1 : 0
            }}
          >
            {/* Image with smart positioning */}
            <div className="absolute inset-0">
              <img 
                src={slide.image_data}
                alt={slide.talent_name}
                className={`w-full h-full ${
                  slide.fit_mode === "contain" ? "object-contain" :
                  slide.fit_mode === "original" ? "object-none" :
                  "object-cover"
                }`}
                style={{ 
                  objectPosition: `${slide.focal_point_x || 50}% ${slide.focal_point_y || 30}%`
                }}
              />
              
              {/* Ken Burns zoom effect for zoom transition */}
              {settings.transition === "zoom" && isActive && (
                <div 
                  className="absolute inset-0 animate-ken-burns"
                  style={{
                    backgroundImage: `url(${slide.image_data})`,
                    backgroundSize: "cover",
                    backgroundPosition: `${slide.focal_point_x || 50}% ${slide.focal_point_y || 30}%`
                  }}
                />
              )}
            </div>

            {/* Overlay */}
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: slide.overlay_color || "rgba(0,0,0,0.3)" }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-12 pb-16 sm:pb-24 z-10">
              <div className="max-w-2xl">
                {/* Talent Name */}
                {slide.show_talent_name && (
                  <h2 
                    className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
                    style={{ color: slide.text_color || "#FFFFFF" }}
                  >
                    {slide.talent_name}
                  </h2>
                )}
                
                {/* Category */}
                {slide.show_talent_category && (
                  <p className="text-[#D4AF37] text-lg sm:text-xl uppercase tracking-wider mb-4">
                    {slide.talent_category}
                  </p>
                )}

                {/* Headline */}
                {slide.show_headline && slide.title && slide.title !== slide.talent_name && (
                  <p 
                    className="text-lg sm:text-xl mb-6"
                    style={{ color: slide.text_color || "#FFFFFF" }}
                  >
                    {slide.title}
                  </p>
                )}

                {/* CTA Button */}
                {slide.show_cta_button && (
                  <div className="flex gap-4">
                    <Link 
                      to={slide.cta_link || `/talent/${slide.talent_id}`}
                      className="px-6 py-3 bg-[#D4AF37] text-[#050A14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#F5F5F0] transition-colors"
                    >
                      {slide.cta_text || "View Profile"}
                    </Link>
                    <Link 
                      to="/join"
                      className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#D4AF37] hover:text-[#050A14] transition-colors"
                    >
                      Join BFM
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {settings.show_arrows && slideCount > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {settings.show_dots && slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide 
                  ? "bg-[#D4AF37] w-8" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-6 right-6 z-20 text-white/60 text-sm font-mono">
        {currentSlide + 1} / {slideCount}
      </div>

      {/* Ken Burns Animation Style */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-ken-burns {
          animation: ken-burns ${(settings.slide_duration || 5) * 1000}ms ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TalentHeroSlider;

import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, Mail, Lock, User, Shield, Award, Image, Download, Star, Check, X, Phone, Instagram, Trash2, Vote, ExternalLink, Volume2, VolumeX, Music, Video, Upload, BarChart3, TrendingUp, Eye, MousePointer, ShoppingBag, Package, MapPin, Send, Search, Share2, History } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Helmet, HelmetProvider } from "react-helmet-async";
import QRCode from "qrcode";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import TalentHeroSlider from "@/components/TalentHeroSlider";
import { API, BFM_LOGO, TALENT_CATEGORIES, MAGAZINE_CATEGORIES, CATEGORY_DISPLAY, CATEGORY_DB, getCategoryDisplay, getCategoryForDB, DEFAULT_SLIDES, STORE_SUBCATEGORIES } from "@/lib/config";
import { autoCompressImage } from "@/lib/imageOptimization";
import DesignerStorePageComponent from "@/pages/DesignerStorePage";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import TalentDashboard from "@/pages/TalentDashboard";
import ResetPassword from "@/pages/ResetPassword";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Welcome Splash Screen (auto-dismisses after 1 second)
const WelcomeSplash = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000); // Auto-close after 1 second
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F0] flex items-center justify-center animate-fadeIn">
      <div className="text-center">
        <img 
          src={BFM_LOGO} 
          alt="BFM Magazine" 
          className="w-64 h-64 object-contain mx-auto animate-scaleIn" 
        />
      </div>
    </div>
  );
};

// Logo Watermark Component (for images)
const LogoWatermark = ({ size = "small", position = "bottom-right" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };
  const positionClasses = {
    "bottom-right": "bottom-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2"
  };
  
  return (
    <div className={`absolute ${positionClasses[position]} ${sizeClasses[size]} bg-white/80 rounded-full p-1 shadow-md`}>
      <img src={BFM_LOGO} alt="BFM" className="w-full h-full object-contain rounded-full" />
    </div>
  );
};

// Navbar
const Navbar = ({ user, talent, onLogout }) => {
  const [showTalentMenu, setShowTalentMenu] = useState(false);
  const [showMagazineMenu, setShowMagazineMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user && (user.is_admin || user.email === "admin@bangalorefashionmag.com");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050A14]/95 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={BFM_LOGO} alt="BFM" className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30" />
            <div className="flex items-center gap-1">
              <span className="font-serif text-lg font-bold text-[#F5F5F0]">BFM</span>
              <span className="font-serif text-lg text-[#D4AF37]">Magazine</span>
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#D4AF37]">
            {mobileMenuOpen ? <X size={24} /> : <span className="text-2xl">☰</span>}
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-xs uppercase tracking-wider text-[#F5F5F0] hover:text-[#D4AF37]">Home</Link>
            
            {/* Talents Dropdown */}
            <div className="relative" onMouseEnter={() => setShowTalentMenu(true)} onMouseLeave={() => setShowTalentMenu(false)}>
              <button className="text-xs uppercase tracking-wider text-[#A0A5B0] hover:text-[#D4AF37] flex items-center gap-1">
                Talents <span className="text-[10px]">▾</span>
              </button>
              {showTalentMenu && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg shadow-xl z-50 py-2">
                  {TALENT_CATEGORIES.filter(cat => cat !== "All Talents").map(cat => (
                    <Link 
                      key={cat} 
                      to={`/talents/${encodeURIComponent(cat)}`} 
                      onClick={() => setShowTalentMenu(false)}
                      className="block px-4 py-2 text-sm text-[#A0A5B0] hover:text-[#D4AF37] hover:bg-[#050A14] transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Magazine Dropdown */}
            <div className="relative" onMouseEnter={() => setShowMagazineMenu(true)} onMouseLeave={() => setShowMagazineMenu(false)}>
              <button className="text-xs uppercase tracking-wider text-[#A0A5B0] hover:text-[#D4AF37] flex items-center gap-1">
                Magazine <span className="text-[10px]">▾</span>
              </button>
              {showMagazineMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg shadow-xl z-50 py-2">
                  {MAGAZINE_CATEGORIES.map(cat => (
                    <Link 
                      key={cat} 
                      to={`/magazine/${encodeURIComponent(cat.toLowerCase().replace(/ /g, '-'))}`} 
                      onClick={() => setShowMagazineMenu(false)}
                      className="block px-4 py-2 text-sm text-[#A0A5B0] hover:text-[#D4AF37] hover:bg-[#050A14] transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link to="/designer-store" className="text-xs uppercase tracking-wider text-[#A0A5B0] hover:text-[#D4AF37]">Designer Store</Link>
            <Link to="/about" className="text-xs uppercase tracking-wider text-[#A0A5B0] hover:text-[#D4AF37]">About Us</Link>
            {user ? (
              <>
                {/* Admin link hidden - access via /admin directly */}
                <span className="text-xs text-[#D4AF37]">{user.name}</span>
                <button onClick={onLogout} className="text-xs uppercase text-[#A0A5B0] hover:text-[#D4AF37]">Logout</button>
              </>
            ) : talent ? (
              <>
                <Link to="/talent-dashboard" className="text-xs uppercase text-[#D4AF37]">{talent.name}</Link>
                <button onClick={onLogout} className="text-xs uppercase text-[#A0A5B0] hover:text-[#D4AF37]">Logout</button>
              </>
            ) : (
              <>
                <Link to="/talent-login" className="text-xs uppercase text-[#A0A5B0] hover:text-[#D4AF37]">Talent Login</Link>
                <Link to="/join" className="px-3 py-1.5 border border-[#D4AF37] text-[#D4AF37] text-xs uppercase rounded hover:bg-[#D4AF37] hover:text-[#050A14]">Join Us</Link>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1628] border-t border-[#D4AF37]/20 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#F5F5F0]">Home</Link>
            
            {/* Talents Section */}
            <div className="px-4 py-2">
              <p className="text-[#D4AF37] text-sm mb-2 font-semibold">Talents</p>
              {TALENT_CATEGORIES.filter(cat => cat !== "All Talents").map(cat => (
                <Link key={cat} to={`/talents/${encodeURIComponent(cat)}`} onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 pl-4 text-sm text-[#A0A5B0] hover:text-[#D4AF37]">{cat}</Link>
              ))}
            </div>
            
            {/* Magazine Section */}
            <div className="px-4 py-2 border-t border-[#D4AF37]/10">
              <p className="text-[#D4AF37] text-sm mb-2 font-semibold">Magazine</p>
              {MAGAZINE_CATEGORIES.map(cat => (
                <Link key={cat} to={`/magazine/${encodeURIComponent(cat.toLowerCase().replace(/ /g, '-'))}`} onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 pl-4 text-sm text-[#A0A5B0] hover:text-[#D4AF37]">{cat}</Link>
              ))}
            </div>
            
            <div className="border-t border-[#D4AF37]/10 pt-2">
              <Link to="/designer-store" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">Designer Store</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">About Us</Link>
            </div>
            
            {user ? (
              <div className="border-t border-[#D4AF37]/10 pt-2">
                {/* Admin link hidden - access via /admin directly */}
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">{user.name}</Link>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block px-4 py-2 text-red-400">Logout</button>
              </div>
            ) : talent ? (
              <div className="border-t border-[#D4AF37]/10 pt-2">
                <Link to="/talent-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">My Profile</Link>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block px-4 py-2 text-red-400">Logout</button>
              </div>
            ) : (
              <div className="border-t border-[#D4AF37]/10 pt-2">
                <Link to="/talent-login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">Talent Login</Link>
                <Link to="/join" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37] font-bold">Join Us</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Slider
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
              {/* Text overlay at bottom only - no dark shade on image */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/80 to-transparent h-48" />
              <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12">
                <div className="max-w-2xl">
                  <span className="inline-block px-4 py-1 bg-[#050A14]/70 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest mb-4">{slide.category}</span>
                  <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#F5F5F0] mb-4 drop-shadow-lg">{slide.title}</h1>
                  <p className="text-xl text-[#F5F5F0] italic drop-shadow-md">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] bg-[#050A14]/50">
        <ChevronLeft size={20} />
      </button>
      <button className="next-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] bg-[#050A14]/50">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

// Party Updates Section (only shows if there are active party events)
const PartyUpdatesSection = ({ partyEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  if (!partyEvents || partyEvents.length === 0) return null;
  
  // Track party view when user hovers/clicks
  const trackPartyView = (partyId) => {
    const sessionId = sessionStorage.getItem('bfm_session_id') || 'unknown';
    axios.post(`${API}/analytics/track`, {
      event_type: 'party_view',
      party_id: partyId,
      page: '/home',
      session_id: sessionId
    }).catch(() => {});
  };
  
  return (
    <section className="py-10 bg-gradient-to-b from-[#0A1628] to-[#050A14]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">What's Happening</span>
          <h2 className="font-serif text-3xl font-bold text-[#F5F5F0] mt-2">Party Updates</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partyEvents.map((event, i) => (
            <div 
              key={i} 
              className="bg-[#0A1628] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              onClick={() => {
                trackPartyView(event.id);
                setSelectedEvent(event);
              }}
            >
              {event.image && (
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#D4AF37] text-sm font-bold">{event.event_date}</span>
                  {event.entry_code && (
                    <span className="px-3 py-1 bg-[#D4AF37] text-[#050A14] text-xs font-bold rounded-full">
                      Entry: {event.entry_code}
                    </span>
                  )}
                </div>
                <h3 className="text-[#F5F5F0] font-bold text-xl mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-[#A0A5B0] text-sm mb-3 line-clamp-1">{event.venue}</p>
                {event.description && (
                  <p className="text-[#A0A5B0] text-sm mb-4 line-clamp-2">{event.description}</p>
                )}
                <p className="text-[#D4AF37]/60 text-xs">Click for full details</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Full Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedEvent.image && (
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-64 sm:h-80 object-cover"
                />
              )}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#D4AF37] text-sm font-bold">{selectedEvent.event_date}</span>
                {selectedEvent.entry_code && (
                  <span className="px-4 py-1.5 bg-[#D4AF37] text-[#050A14] text-sm font-bold rounded-full">
                    Entry Code: {selectedEvent.entry_code}
                  </span>
                )}
              </div>
              <h2 className="text-[#F5F5F0] font-serif text-2xl sm:text-3xl font-bold mb-3">{selectedEvent.title}</h2>
              <p className="text-[#D4AF37]/80 text-lg mb-4">{selectedEvent.venue}</p>
              {selectedEvent.description && (
                <p className="text-[#A0A5B0] leading-relaxed mb-6">{selectedEvent.description}</p>
              )}
              {selectedEvent.booking_info && (
                <div className="p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/20 mb-4">
                  <p className="text-[#D4AF37] text-xs uppercase tracking-wider mb-2">Booking Information</p>
                  <p className="text-[#F5F5F0]">{selectedEvent.booking_info}</p>
                </div>
              )}
              {selectedEvent.contact && (
                <div className="p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/20">
                  <p className="text-[#D4AF37] text-xs uppercase tracking-wider mb-2">Contact</p>
                  <p className="text-[#F5F5F0]">{selectedEvent.contact}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Contest Winners Section (only shows if contests exist)
const ContestWinnersSection = ({ awards }) => {
  const [activeImages, setActiveImages] = useState({});
  const [selectedAward, setSelectedAward] = useState(null);
  const navigate = useNavigate();
  
  if (!awards || awards.length === 0) return null;

  const handlePrev = (e, awardId, images) => {
    e.stopPropagation();
    setActiveImages(prev => ({
      ...prev,
      [awardId]: ((prev[awardId] || 0) - 1 + images.length) % images.length
    }));
  };

  const handleNext = (e, awardId, images) => {
    e.stopPropagation();
    setActiveImages(prev => ({
      ...prev,
      [awardId]: ((prev[awardId] || 0) + 1) % images.length
    }));
  };

  const handleWinnerClick = (award) => {
    if (award.talent_id) {
      // Navigate to the talent's category page and open their profile
      navigate(`/talent/${award.talent_id}`);
    } else {
      // Show full details modal
      setSelectedAward(award);
    }
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-[#050A14] to-[#0A1628]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">Recognition</span>
          <h2 className="font-serif text-3xl font-bold text-[#F5F5F0] mt-2">Contest Winners</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, i) => {
            const images = (award.winner_images || [award.winner_image]).filter(Boolean);
            const activeIdx = activeImages[award.id] || 0;
            
            return (
              <div 
                key={i} 
                className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/60 transition-all"
                onClick={() => handleWinnerClick(award)}
              >
                {images.length > 0 && (
                  <div className="relative group">
                    <img 
                      src={images[activeIdx]} 
                      alt={`${award.winner_name} - ${activeIdx + 1}`} 
                      className="w-full h-64 object-cover transition-opacity duration-300 hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-[#D4AF37] px-3 py-1 rounded-full">
                        {award.talent_id ? 'View Profile' : 'View Details'}
                      </span>
                    </div>
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => handlePrev(e, award.id, images)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={(e) => handleNext(e, award.id, images)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`w-2 h-2 rounded-full transition-all ${idx === activeIdx ? 'bg-[#D4AF37] w-4' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-[#D4AF37]" size={18} />
                    <span className="text-[#D4AF37] text-sm uppercase">{award.title}</span>
                  </div>
                  <h3 className="text-[#F5F5F0] font-bold text-xl">{award.winner_name}</h3>
                  {award.category && <p className="text-[#A0A5B0] text-xs mt-1">{award.category}</p>}
                  {award.description && <p className="text-[#A0A5B0] text-sm mt-2 line-clamp-2">{award.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Full Detail Modal for non-talent awards */}
      {selectedAward && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedAward(null)}
        >
          <div 
            className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {(selectedAward.winner_images?.[0] || selectedAward.winner_image) && (
                <img 
                  src={selectedAward.winner_images?.[0] || selectedAward.winner_image} 
                  alt={selectedAward.winner_name} 
                  className="w-full h-64 sm:h-80 object-cover"
                />
              )}
              <button 
                onClick={() => setSelectedAward(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="text-[#D4AF37]" size={24} />
                <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{selectedAward.title}</span>
              </div>
              <h2 className="text-[#F5F5F0] font-serif text-2xl sm:text-3xl font-bold mb-2">{selectedAward.winner_name}</h2>
              {selectedAward.category && (
                <p className="text-[#D4AF37]/80 text-sm mb-4">{selectedAward.category}</p>
              )}
              {selectedAward.description && (
                <p className="text-[#A0A5B0] leading-relaxed">{selectedAward.description}</p>
              )}
              {selectedAward.winner_images?.length > 1 && (
                <div className="mt-6">
                  <p className="text-[#A0A5B0] text-sm mb-3">All Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAward.winner_images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${selectedAward.winner_name} ${idx + 1}`} className="w-full aspect-square object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Advertisement Sidebar
const AdvertisementSidebar = ({ ads }) => {
  const [enlargedAd, setEnlargedAd] = useState(null);
  
  if (!ads || ads.length === 0) return null;
  
  // Track ad click
  const trackAdClick = (adId) => {
    const sessionId = sessionStorage.getItem('bfm_session_id') || 'unknown';
    axios.post(`${API}/analytics/track`, {
      event_type: 'ad_click',
      ad_id: adId,
      page: window.location.pathname,
      session_id: sessionId
    }).catch(() => {});
  };
  
  const handleAdClick = (e, ad) => {
    e.preventDefault();
    e.stopPropagation();
    trackAdClick(ad.id);
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    } else {
      setEnlargedAd(ad);
    }
  };
  
  return (
    <>
      <div className="w-full lg:w-64 space-y-4">
        <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center">Sponsored</p>
        {ads.map((ad, i) => (
          <div 
            key={i} 
            className="block cursor-pointer"
            onClick={(e) => handleAdClick(e, ad)}
          >
            <img src={ad.image_data} alt={ad.title} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
          </div>
        ))}
      </div>
      
      {/* Enlarged Ad Modal */}
      {enlargedAd && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setEnlargedAd(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setEnlargedAd(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#D4AF37] text-xl"
            >
              ✕ Close
            </button>
            <img 
              src={enlargedAd.image_data} 
              alt={enlargedAd.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {enlargedAd.title && (
              <p className="text-white text-center mt-2">{enlargedAd.title}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Clickable Ad Image Component (shows enlarged view if no link)
const ClickableAdImage = ({ ad, className = "", imgClassName = "" }) => {
  const [showEnlarged, setShowEnlarged] = useState(false);
  
  const trackAdClick = (adId) => {
    const sessionId = sessionStorage.getItem('bfm_session_id') || 'unknown';
    axios.post(`${API}/analytics/track`, {
      event_type: 'ad_click',
      ad_id: adId,
      page: window.location.pathname,
      session_id: sessionId
    }).catch(() => {});
  };
  
  const handleClick = (e) => {
    e.preventDefault();
    trackAdClick(ad.id);
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    } else {
      setShowEnlarged(true);
    }
  };
  
  return (
    <>
      <div 
        className={`${className} cursor-pointer`}
        onClick={handleClick}
      >
        <img src={ad.image_data} alt={ad.title || "Sponsored"} className={imgClassName} />
      </div>
      
      {showEnlarged && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowEnlarged(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setShowEnlarged(false)}
              className="absolute -top-10 right-0 text-white hover:text-[#D4AF37] text-xl"
            >
              ✕ Close
            </button>
            <img 
              src={ad.image_data} 
              alt={ad.title || "Sponsored"} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {ad.title && (
              <p className="text-white text-center mt-2">{ad.title}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Share Leaderboard Component
const ShareLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    axios.get(`${API}/share-leaderboard`)
      .then(res => {
        setLeaderboard(res.data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return null;
  if (leaderboard.length === 0) return null;
  
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  return (
    <div className="bg-gradient-to-r from-[#0A1628] to-[#050A14] py-8 border-y border-[#D4AF37]/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5F0] mb-2">
            <span className="text-[#D4AF37]">🏆</span> Top Shared Talents
          </h2>
          <p className="text-[#A0A5B0] text-sm">Most active talents spreading the BFM word</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {leaderboard.slice(0, 5).map((talent, i) => (
            <Link 
              key={talent.talent_id}
              to={`/talents/${encodeURIComponent(talent.category)}?talent=${talent.talent_id}&ref=share`}
              className="group"
            >
              <div className="relative bg-[#050A14] rounded-xl p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all w-36 md:w-44">
                {/* Rank Badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#050A14] font-bold text-sm shadow-lg">
                  {getRankBadge(i + 1)}
                </div>
                
                {/* Profile Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all mb-3">
                  {talent.profile_image ? (
                    <img src={talent.profile_image} alt={talent.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-2xl">
                      {talent.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <p className="text-[#F5F5F0] font-medium text-sm text-center truncate">{talent.name}</p>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                  <span className="text-[#25D366] flex items-center gap-1">
                    <Share2 size={12} /> {talent.total_shares}
                  </span>
                  <span className="text-[#D4AF37] flex items-center gap-1">
                    <Star size={12} /> {talent.votes || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {leaderboard.length > 5 && (
          <div className="text-center mt-4">
            <p className="text-[#A0A5B0] text-xs">And {leaderboard.length - 5} more top sharers!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Talent Detail Modal
const TalentDetailModal = ({ talent, onClose, onVote, shareEnabled = true }) => {
  const [voting, setVoting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullTalent, setFullTalent] = useState(talent);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [sharePreviewUrl, setSharePreviewUrl] = useState(null);
  const [shareFormat, setShareFormat] = useState('feed');
  const [customCaption, setCustomCaption] = useState('');
  const [customHashtags, setCustomHashtags] = useState('#BFMMagazine #BangaloreFashion');
  const { toast } = useToast();
  
  // Fetch full talent data including portfolio images
  useEffect(() => {
    if (talent?.id) {
      setLoading(true);
      axios.get(`${API}/talent/${talent.id}`)
        .then(res => {
          setFullTalent(res.data);
          setLoading(false);
        })
        .catch(() => {
          setFullTalent(talent);
          setLoading(false);
        });
    }
  }, [talent?.id]);
  
  if (!talent) return null;

  const handleVote = async () => {
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Track share in analytics
  const trackShare = async (shareType) => {
    try {
      await axios.post(`${API}/track-share`, {
        talent_id: talent.id,
        talent_name: talent.name,
        share_type: shareType
      });
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  };

  // Generate REAL QR code using qrcode library
  const generateQRCode = async (url, size = 100) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: {
          dark: '#050A14',
          light: '#FFFFFF'
        }
      });
      return qrDataUrl;
    } catch (err) {
      console.error('QR generation failed:', err);
      return null;
    }
  };

  // Create formatted image for sharing - branding at BOTTOM only, face visible
  const createFormattedImage = async (format, caption = '', hashtags = '') => {
    const imageUrl = fullTalent.profile_image || talent.profile_image;
    if (!imageUrl) return null;

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Load talent image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });

    // Load BFM logo
    const logo = new window.Image();
    logo.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = () => resolve();
      logo.src = BFM_LOGO;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set dimensions based on format
    if (format === 'story') {
      canvas.width = 1080;
      canvas.height = 1920;
    } else {
      canvas.width = 1080;
      canvas.height = 1350;
    }

    // Calculate image positioning - keep face visible at TOP, branding at BOTTOM
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, drawX, drawY;
    
    // Fill canvas width, position from top (face area)
    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      drawX = 0;
      // Position from TOP so face is visible, branding covers lower body
      drawY = 0;
    }
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Gradient overlay ONLY at bottom (preserves face at top)
    const brandingHeight = format === 'story' ? 450 : 350;
    const gradient = ctx.createLinearGradient(0, canvas.height - brandingHeight - 100, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.3, 'rgba(0,0,0,0.7)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - brandingHeight - 100, canvas.width, brandingHeight + 100);

    // === BOTTOM BRANDING SECTION ===
    const bottomY = canvas.height - brandingHeight;
    
    // BFM Logo (left side)
    if (logo.complete && logo.naturalWidth > 0) {
      const logoSize = 70;
      ctx.save();
      ctx.beginPath();
      ctx.arc(50 + logoSize/2, bottomY + 45, logoSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, 50, bottomY + 10, logoSize, logoSize);
      ctx.restore();
      
      // Gold border around logo
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(50 + logoSize/2, bottomY + 45, logoSize/2 + 3, 0, Math.PI * 2);
      ctx.stroke();
      
      // Magazine name next to logo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BANGALORE', 135, bottomY + 35);
      ctx.fillStyle = '#D4AF37';
      ctx.font = '18px sans-serif';
      ctx.fillText('FASHION MAGAZINE', 135, bottomY + 60);
    }

    // REAL QR Code (right side) - links to talent profile with tracking
    const qrSize = 90;
    const qrX = canvas.width - qrSize - 40;
    const qrY = bottomY + 5;
    
    // Generate tracking URL for the talent profile
    const baseUrl = window.location.origin;
    const trackingUrl = `${baseUrl}/talents/${encodeURIComponent(talent.category)}?talent=${talent.id}&ref=share`;
    
    // Generate real QR code
    const qrDataUrl = await generateQRCode(trackingUrl, qrSize);
    
    if (qrDataUrl) {
      // Load and draw the real QR code
      const qrImg = new window.Image();
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
        qrImg.src = qrDataUrl;
      });
      
      // White background for QR
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
      
      // Draw the real QR code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }
    
    // "Scan to view" text under QR
    ctx.fillStyle = '#A0A5B0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to view profile', qrX + qrSize/2, qrY + qrSize + 18);

    // Talent Info
    ctx.fillStyle = '#D4AF37';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FEATURED TALENT', 50, bottomY + 115);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px serif';
    ctx.fillText(talent.name, 50, bottomY + 170);
    
    ctx.fillStyle = '#D4AF37';
    ctx.font = '24px sans-serif';
    ctx.fillText(getCategoryDisplay(talent.category).toUpperCase(), 50, bottomY + 205);

    // Custom Caption (if provided)
    if (caption.trim()) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 20px sans-serif';
      ctx.fillText(`"${caption}"`, 50, bottomY + 245);
    }

    // Custom Hashtags (if provided)
    if (hashtags.trim()) {
      ctx.fillStyle = '#D4AF37';
      ctx.font = '16px sans-serif';
      const hashtagY = caption.trim() ? bottomY + 280 : bottomY + 245;
      ctx.fillText(hashtags, 50, hashtagY);
    }

    // Website CTA at very bottom
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Discover more talents at', 50, canvas.height - 45);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('bangalorefashionmagazine.com', 50, canvas.height - 22);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  };

  // Generate preview
  const generatePreview = async (format) => {
    setShareFormat(format);
    const blob = await createFormattedImage(format, customCaption, customHashtags);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setSharePreviewUrl(url);
      setShowSharePreview(true);
      setShowShareMenu(false);
    }
  };

  // Share from preview
  const handleShareFromPreview = async () => {
    setSharing(true);
    try {
      const blob = await createFormattedImage(shareFormat, customCaption, customHashtags);
      const fileName = `${talent.name.replace(/\s+/g, '_')}_BFM_${shareFormat}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      await trackShare(shareFormat);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${talent.name} - BFM Magazine` });
        toast({ title: "Shared successfully!" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Image downloaded!", description: `Share to ${shareFormat === 'whatsapp' ? 'WhatsApp' : shareFormat === 'story' ? 'Instagram Story' : 'Instagram Feed'}` });
      }
      setShowSharePreview(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast({ title: "Could not share", variant: "destructive" });
      }
    }
    setSharing(false);
  };

  // Combine profile image with portfolio for gallery display
  const allImages = [fullTalent.profile_image, ...(fullTalent.portfolio_images || [])].filter(Boolean);

  const openGallery = (index) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      {/* Dynamic SEO Meta Tags for Talent Profile */}
      <Helmet>
        <title>{talent.name} | {getCategoryDisplay(talent.category)} | BFM Magazine</title>
        <meta name="description" content={fullTalent.bio || `${talent.name} - ${getCategoryDisplay(talent.category)} featured on Bangalore Fashion Magazine. View portfolio and vote for your favorite talent.`} />
        <meta property="og:title" content={`${talent.name} | BFM Magazine`} />
        <meta property="og:description" content={fullTalent.bio || `${getCategoryDisplay(talent.category)} featured on Bangalore Fashion Magazine`} />
        <meta property="og:image" content={fullTalent.profile_image || talent.profile_image || BFM_LOGO} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${talent.name} | BFM Magazine`} />
        <meta name="twitter:description" content={fullTalent.bio || `${getCategoryDisplay(talent.category)} featured on Bangalore Fashion Magazine`} />
        <meta name="twitter:image" content={fullTalent.profile_image || talent.profile_image || BFM_LOGO} />
      </Helmet>
      
      <div className="bg-[#0A1628] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20 relative" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[#050A14] rounded-full text-[#F5F5F0] hover:text-[#D4AF37] z-10">
          <X size={24} />
        </button>
        
        <div className="p-6">
          {/* 1. BFM Logo + Magazine Title at Top */}
          <div className="text-center mb-4">
            <img src={BFM_LOGO} alt="BFM" className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/30 mx-auto mb-2" />
            <h1 className="font-serif text-xl md:text-2xl font-bold text-[#D4AF37]">BFM Magazine</h1>
          </div>
          
          {/* 2. Category */}
          <div className="text-center mb-2">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider rounded">{getCategoryDisplay(talent.category)}</span>
          </div>
          
          {/* 3. Model Name */}
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F5F5F0]">{talent.name}</h2>
            <div className="w-16 h-[1px] bg-[#D4AF37]/60 mx-auto mt-3"></div>
          </div>
          
          {/* About Section - Only show if bio exists */}
          {fullTalent.bio && (
            <div className="mb-6 text-center">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-2">About</h3>
              <p className="text-[#A0A5B0] max-w-2xl mx-auto">{fullTalent.bio}</p>
            </div>
          )}
          
          {/* 4. Photo Gallery - Profile + Portfolio Images */}
          <div className="mb-6">
            <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-4 text-center">Photo Gallery</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent"></div>
                <span className="ml-3 text-[#A0A5B0]">Loading photos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img 
                      src={img} 
                      alt={`${talent.name} - Photo ${i + 1}`} 
                      className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all"
                      onClick={() => openGallery(i)}
                    />
                    <LogoWatermark size="small" position="bottom-right" />
                  </div>
                ))}
              </div>
            )}
            {!loading && allImages.length === 0 && (
              <p className="text-[#A0A5B0] text-center py-8">No photos available</p>
            )}
          </div>

          {/* Portfolio Video */}
          {fullTalent.portfolio_video && (
            <div className="mb-6">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-4 text-center">Portfolio Video</h3>
              <div className="relative">
                <video 
                  src={fullTalent.portfolio_video} 
                  controls 
                  className="w-full max-h-64 rounded-lg bg-black mx-auto"
                  style={{ maxWidth: '500px', margin: '0 auto', display: 'block' }}
                />
                <LogoWatermark size="small" position="bottom-right" />
              </div>
            </div>
          )}
          
          {/* 5. Voting & Share Section - At the END below all images */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-[#D4AF37]/20">
            <span className="text-[#F5F5F0]"><strong className="text-[#D4AF37] text-2xl">{talent.votes || 0}</strong> votes</span>
            <button 
              onClick={handleVote} 
              disabled={voting}
              className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] disabled:opacity-50 flex items-center gap-2"
            >
              <Vote size={18} />
              {voting ? "Voting..." : "Vote"}
            </button>
            {shareEnabled && (
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)} 
                  disabled={sharing}
                  className="px-4 py-2 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#128C7E] disabled:opacity-50 flex items-center gap-2"
                >
                  <Share2 size={18} />
                  {sharing ? "..." : "Share"}
                </button>
                {/* Enhanced Share Menu with Caption & Hashtags */}
                {showShareMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0A1628] border border-[#D4AF37]/30 rounded-xl shadow-xl p-4 w-72 z-20" onClick={e => e.stopPropagation()}>
                    <h4 className="text-[#D4AF37] font-bold text-sm mb-3">Customize Your Share</h4>
                    
                    {/* Custom Caption */}
                    <div className="mb-3">
                      <label className="text-[#A0A5B0] text-xs block mb-1">Caption (optional)</label>
                      <input 
                        type="text"
                        value={customCaption}
                        onChange={(e) => setCustomCaption(e.target.value)}
                        placeholder="Add your message..."
                        className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm"
                      />
                    </div>
                    
                    {/* Custom Hashtags */}
                    <div className="mb-4">
                      <label className="text-[#A0A5B0] text-xs block mb-1">Hashtags</label>
                      <input 
                        type="text"
                        value={customHashtags}
                        onChange={(e) => setCustomHashtags(e.target.value)}
                        placeholder="#BFMMagazine #Fashion"
                        className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm"
                      />
                    </div>
                    
                    {/* Format Selection with Preview */}
                    <p className="text-[#A0A5B0] text-xs mb-2">Choose format & preview:</p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => generatePreview('whatsapp')}
                        className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded-lg flex items-center gap-2 text-sm border border-[#D4AF37]/10"
                      >
                        <span className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center text-white text-xs font-bold">W</span>
                        <span className="flex-1">WhatsApp</span>
                        <span className="text-[#A0A5B0] text-xs">Preview →</span>
                      </button>
                      <button 
                        onClick={() => generatePreview('story')}
                        className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded-lg flex items-center gap-2 text-sm border border-[#D4AF37]/10"
                      >
                        <span className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white text-xs font-bold">S</span>
                        <span className="flex-1">Insta Story (9:16)</span>
                        <span className="text-[#A0A5B0] text-xs">Preview →</span>
                      </button>
                      <button 
                        onClick={() => generatePreview('feed')}
                        className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded-lg flex items-center gap-2 text-sm border border-[#D4AF37]/10"
                      >
                        <span className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white text-xs font-bold">F</span>
                        <span className="flex-1">Insta Feed (4:5)</span>
                        <span className="text-[#A0A5B0] text-xs">Preview →</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setShowShareMenu(false)}
                      className="w-full mt-3 py-1 text-[#A0A5B0] text-xs hover:text-[#F5F5F0]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Share Preview Modal */}
        {showSharePreview && sharePreviewUrl && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowSharePreview(false)}>
            <div className="bg-[#0A1628] rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden border border-[#D4AF37]/30" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-[#D4AF37]/20">
                <h3 className="text-[#F5F5F0] font-bold text-center">Preview Your Share</h3>
                <p className="text-[#A0A5B0] text-xs text-center mt-1">
                  {shareFormat === 'story' ? 'Instagram Story (9:16)' : shareFormat === 'feed' ? 'Instagram Feed (4:5)' : 'WhatsApp'}
                </p>
              </div>
              <div className="p-4 flex justify-center">
                <img 
                  src={sharePreviewUrl} 
                  alt="Share Preview" 
                  className="max-h-[60vh] w-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="p-4 border-t border-[#D4AF37]/20 flex gap-3">
                <button 
                  onClick={() => setShowSharePreview(false)}
                  className="flex-1 py-2 bg-[#050A14] text-[#F5F5F0] rounded-lg hover:bg-[#D4AF37]/20"
                >
                  Edit
                </button>
                <button 
                  onClick={handleShareFromPreview}
                  disabled={sharing}
                  className="flex-1 py-2 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#128C7E] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  {sharing ? "Sharing..." : "Share Now"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Full Image Gallery with Swipe */}
        {galleryOpen && (
          <ImageGalleryInline 
            images={allImages} 
            initialIndex={galleryIndex} 
            onClose={() => setGalleryOpen(false)}
            talentName={talent.name}
            talentId={talent.id}
            shareEnabled={shareEnabled}
          />
        )}
      </div>
    </div>
  );
};

// Inline Image Gallery Component with Navigation and Share
const ImageGalleryInline = ({ images, initialIndex = 0, onClose, talentName = "BFM Talent", talentId = null, shareEnabled = true }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
    setTouchStart(null);
  };

  // Track share in analytics
  const trackShare = async (shareType) => {
    if (!talentId) return;
    try {
      await axios.post(`${API}/track-share`, {
        talent_id: talentId,
        talent_name: talentName,
        share_type: shareType
      });
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  };

  // Create formatted image - matches Instagram promo style with BFM logo
  const createFormattedImage = async (format) => {
    const imageUrl = images[currentIndex];
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Load talent image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });

    // Load BFM logo
    const logo = new window.Image();
    logo.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = () => resolve(); // Continue even if logo fails
      logo.src = BFM_LOGO;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (format === 'story') {
      canvas.width = 1080;
      canvas.height = 1920;
    } else {
      canvas.width = 1080;
      canvas.height = 1350;
    }

    // Draw talent image as full background
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2 - (canvas.height * 0.1);
    }
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Gradient overlay from bottom
    const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom content area
    const bottomY = canvas.height - (format === 'story' ? 280 : 200);
    
    // BFM Logo & Branding
    if (logo.complete && logo.naturalWidth > 0) {
      const logoSize = 60;
      ctx.save();
      ctx.beginPath();
      ctx.arc(50 + logoSize/2, bottomY + logoSize/2, logoSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, 50, bottomY, logoSize, logoSize);
      ctx.restore();
      
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(50 + logoSize/2, bottomY + logoSize/2, logoSize/2 + 2, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BANGALORE', 120, bottomY + 25);
      ctx.fillStyle = '#D4AF37';
      ctx.font = '16px sans-serif';
      ctx.fillText('FASHION MAGAZINE', 120, bottomY + 45);
    }

    // Talent Info
    ctx.fillStyle = '#D4AF37';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FEATURED TALENT', 50, bottomY + 90);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px serif';
    ctx.fillText(talentName, 50, bottomY + 140);

    // Website CTA
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '16px sans-serif';
    ctx.fillText('Discover this talent on', 50, canvas.height - 55);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('bangalorefashionmagazine.com', 50, canvas.height - 30);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  };

  // Share handler
  const handleShare = async (format) => {
    setSharing(true);
    setShowShareMenu(false);
    
    try {
      const blob = await createFormattedImage(format);
      const fileName = `${talentName.replace(/\s+/g, '_')}_BFM_${format}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      await trackShare(format);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${talentName} - BFM Magazine` });
        toast({ title: "Shared successfully!" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        const platformName = format === 'whatsapp' ? 'WhatsApp' : format === 'story' ? 'Instagram Story' : 'Instagram Feed';
        toast({ title: "Image downloaded!", description: `Share to ${platformName}` });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast({ title: "Could not share", variant: "destructive" });
      }
    }
    setSharing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"><X size={24} /></button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">{currentIndex + 1} / {images.length}</div>
      
      {/* Share button with dropdown - top left (only if sharing enabled) */}
      {shareEnabled && (
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }} 
            disabled={sharing}
            className="p-3 bg-[#25D366] rounded-full text-white hover:bg-[#128C7E] disabled:opacity-50"
          >
            <Share2 size={20} />
          </button>
          {showShareMenu && (
            <div className="absolute top-full left-0 mt-2 bg-[#0A1628] border border-[#D4AF37]/30 rounded-lg shadow-xl p-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => handleShare('whatsapp')}
                disabled={sharing}
                className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <span className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center text-white text-xs font-bold">W</span>
                WhatsApp
              </button>
              <button 
                onClick={() => handleShare('story')}
                disabled={sharing}
                className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded flex items-center gap-2 text-sm disabled:opacity-50"
              >
              <span className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white text-xs font-bold">S</span>
              Insta Story (9:16)
            </button>
            <button 
              onClick={() => handleShare('feed')}
              disabled={sharing}
              className="w-full px-3 py-2 text-left text-[#F5F5F0] hover:bg-[#D4AF37]/20 rounded flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <span className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white text-xs font-bold">F</span>
              Insta Feed (4:5)
            </button>
          </div>
        )}
        </div>
      )}

      {images.length > 1 && <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"><ChevronLeft size={32} /></button>}
      <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
        <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-lg" draggable={false} />
        <LogoWatermark size="medium" position="bottom-right" />
      </div>
      {images.length > 1 && <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"><ChevronRight size={32} /></button>}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentIndex ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Talent Card with Voting
const TalentCard = ({ talent, onVote, onClick }) => {
  const [voting, setVoting] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const handleVote = async (e) => {
    e.stopPropagation();
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Use thumbnail endpoint for grid view, fallback to placeholder on error
  const getImageSrc = () => {
    if (imgError) return "https://via.placeholder.com/300x400?text=No+Image";
    // If profile_image is already a URL, use it directly
    if (talent.profile_image && talent.profile_image.startsWith("http")) {
      return talent.profile_image;
    }
    // Otherwise, use the thumbnail endpoint
    return `${API}/talent/${talent.id}/thumb`;
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer w-full"
      onClick={() => onClick(talent)}
      data-testid={`talent-card-${talent.id}`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden relative">
        <img 
          src={getImageSrc()} 
          alt={talent.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <LogoWatermark size="small" position="bottom-right" />
      </div>
      {/* Reduced overlay darkness */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/70 via-[#050A14]/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">{getCategoryDisplay(talent.category)}</span>
        {/* Increased font weight for name */}
        <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#F5F5F0] tracking-wide truncate">{talent.name}</h3>
        {/* Gold divider line under name */}
        <div className="w-10 sm:w-12 h-[1px] bg-[#D4AF37]/60 mt-1 mb-1.5 sm:mt-1.5 sm:mb-2"></div>
        {/* Smaller, more subtle votes section */}
        <div className="flex items-center justify-between">
          <span className="text-[#F5F5F0]/60 text-[10px] sm:text-xs">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37]/80 text-[8px] sm:text-[10px] rounded hover:bg-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-50 transition-colors">
            {voting ? "..." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Small Talent Card for category pages (7-10 per row)
const TalentCardSmall = ({ talent, onVote, onClick }) => {
  const [voting, setVoting] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const handleVote = async (e) => {
    e.stopPropagation();
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Use thumbnail endpoint for grid view, fallback to placeholder on error
  const getImageSrc = () => {
    if (imgError) return "https://via.placeholder.com/150x200?text=No+Image";
    // If profile_image is already a URL, use it directly
    if (talent.profile_image && talent.profile_image.startsWith("http")) {
      return talent.profile_image;
    }
    // Otherwise, use the thumbnail endpoint
    return `${API}/talent/${talent.id}/thumb`;
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer w-full"
      onClick={() => onClick(talent)}
      data-testid={`talent-card-small-${talent.id}`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden relative">
        <img 
          src={getImageSrc()} 
          alt={talent.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
        <h3 className="font-serif text-[10px] sm:text-xs md:text-sm font-bold text-[#F5F5F0] truncate">{talent.name}</h3>
        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
          <span className="text-[#F5F5F0]/60 text-[8px] sm:text-[10px]">{talent.votes || 0}</span>
          <button onClick={handleVote} disabled={voting} className="px-1 sm:px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[6px] sm:text-[8px] rounded hover:bg-[#D4AF37]/40 disabled:opacity-50 transition-colors">
            {voting ? ".." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Talents Page by Category (Public - No Search/Filter)
const TalentsPage = ({ ads, shareEnabled = true }) => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const decodedCategory = decodeURIComponent(category || "All Talents");
  
  // Handle special categories
  const isAllTalents = decodedCategory === "All Talents";
  const isFeatured = decodedCategory === "Featured Talents";
  
  // Convert URL category (new name) to database category (old name)
  const dbCategory = getCategoryForDB(decodedCategory);
  const hasAds = ads && ads.length > 0;

  // Track view if coming from shared link (ref=share)
  useEffect(() => {
    const ref = searchParams.get('ref');
    const talentId = searchParams.get('talent');
    
    if (ref === 'share' && talentId) {
      // Track the share view
      axios.post(`${API}/track-share-view`, { talent_id: talentId, ref: 'share' })
        .catch(err => console.error('Failed to track share view:', err));
      
      // Store referrer in localStorage for sign-up credit
      localStorage.setItem('referrer_talent_id', talentId);
      localStorage.setItem('referrer_timestamp', Date.now().toString());
      
      // Auto-open the talent modal
      axios.get(`${API}/talent/${talentId}`)
        .then(res => setSelectedTalent(res.data))
        .catch(err => console.error('Failed to load shared talent:', err));
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    let url = `${API}/talents?approved_only=true&lightweight=true`;
    
    if (isFeatured) {
      url += `&featured=true`;
    } else if (!isAllTalents) {
      url += `&category=${encodeURIComponent(dbCategory)}`;
    }
    
    axios.get(url)
      .then(res => {
        setTalents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [dbCategory, isAllTalents, isFeatured]);

  // Filter talents by search query
  const filteredTalents = talents.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVote = async (talentId) => {
    try {
      await axios.post(`${API}/vote`, { talent_id: talentId });
      toast({ title: "Vote recorded!" });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to vote", variant: "destructive" });
    }
  };

  // Grid classes
  const gridClass = hasAds 
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3";

  return (
    <div className="min-h-screen bg-[#050A14] pt-16 sm:pt-20 pb-8 sm:pb-12">
      {/* Dynamic SEO for Category Pages */}
      <Helmet>
        <title>{decodedCategory} | BFM Magazine Bangalore</title>
        <meta name="description" content={`Browse ${decodedCategory.toLowerCase()} on BFM Magazine. Discover top fashion talent in Bangalore and vote for your favorites.`} />
        <meta property="og:title" content={`${decodedCategory} | BFM Magazine`} />
        <meta property="og:description" content={`Browse ${decodedCategory.toLowerCase()} featured on Bangalore Fashion Magazine`} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F5F0]">
                {isFeatured && <Star className="inline-block w-6 h-6 text-[#D4AF37] mr-2" />}
                {decodedCategory}
              </h1>
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A5B0]" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm placeholder-[#A0A5B0] focus:outline-none focus:border-[#D4AF37]/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A5B0] hover:text-[#F5F5F0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Results count when searching */}
            {searchQuery && (
              <p className="text-[#A0A5B0] text-sm mb-3">
                Found {filteredTalents.length} talent{filteredTalents.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
            {loading ? (
              <p className="text-[#A0A5B0]">Loading...</p>
            ) : filteredTalents.length === 0 ? (
              <p className="text-[#A0A5B0]">
                {searchQuery ? `No talents found matching "${searchQuery}"` : "No approved talents in this category yet."}
              </p>
            ) : (
              <div className={gridClass}>
                {filteredTalents.map(t => <TalentCardSmall key={t.id} talent={t} onVote={handleVote} onClick={setSelectedTalent} />)}
              </div>
            )}
          </div>
          {/* Ads sidebar */}
          {hasAds && (
            <div className="hidden lg:block w-40 xl:w-48 flex-shrink-0">
              <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center mb-3">Sponsored</p>
              <div className="flex flex-col gap-3">
                {ads.map((ad, i) => (
                  <ClickableAdImage 
                    key={i} 
                    ad={ad} 
                    className="block"
                    imgClassName="w-full aspect-[4/5] object-cover rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Talent Detail Modal */}
      {selectedTalent && (
        <TalentDetailModal 
          talent={selectedTalent} 
          onClose={() => setSelectedTalent(null)} 
          onVote={handleVote}
          shareEnabled={shareEnabled}
        />
      )}
    </div>
  );
};

// Admin Login
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
      toast({ title: "Login successful!" });
      navigate("/admin");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-6">
          <Shield className="inline-block text-[#D4AF37] mb-2" size={40} />
          <h2 className="text-2xl font-bold text-[#F5F5F0]">Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Email" />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] pr-12" placeholder="Password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A5B0] hover:text-[#D4AF37]">
              {showPassword ? <X size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/reset-password" className="text-[#D4AF37] text-sm hover:underline">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

// Talent Login
const TalentLoginPage = ({ onTalentLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/talent/login`, { email, password });
      localStorage.setItem("talentToken", res.data.token);
      localStorage.setItem("talent", JSON.stringify(res.data.talent));
      onTalentLogin(res.data.talent);
      toast({ title: "Login successful!" });
      navigate("/talent-dashboard");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-6">
          <Camera className="inline-block text-[#D4AF37] mb-2" size={40} />
          <h2 className="text-2xl font-bold text-[#F5F5F0]">Talent Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Email" />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] pr-12" placeholder="Password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A5B0] hover:text-[#D4AF37]">
              {showPassword ? <X size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <p className="text-[#A0A5B0] text-sm mt-2">Forgot password? Contact admin.</p>
          <p className="text-[#A0A5B0] text-sm">New talent? <Link to="/join" className="text-[#D4AF37] hover:underline">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

// Forgot Password
const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/talent/forgot-password`, { email });
      const code = res.data.otp;
      setDisplayOtp(code);
      setOtp(code); // Auto-fill
      toast({ title: "OTP Generated!", description: `Your OTP is: ${code}` });
      setStep(2);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Email not found", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/talent/reset-password`, { email, reset_code: otp, new_password: newPassword });
      toast({ title: "Success!", description: "Password reset. Please login." });
      navigate("/talent-login");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Reset failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-6">
          <Lock className="inline-block text-[#D4AF37] mb-2" size={40} />
          <h2 className="text-2xl font-bold text-[#F5F5F0]">Reset Password</h2>
        </div>
        
        {step === 1 ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Enter your email" />
            <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
              {loading ? "Sending..." : "Get OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            {displayOtp && (
              <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-center">
                <p className="text-green-400 text-sm">Your OTP Code:</p>
                <p className="text-green-400 text-4xl font-bold tracking-widest my-2">{displayOtp}</p>
              </div>
            )}
            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-center text-xl tracking-widest" placeholder="Enter OTP" />
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="New Password" />
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Confirm Password" />
            <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <Link to="/talent-login" className="text-[#D4AF37] text-sm hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

// Talent Profile Page (for direct links from contest winners)
const TalentProfilePage = () => {
  const { talentId } = useParams();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await axios.get(`${API}/talent/${talentId}`);
        setTalent(res.data);
        setShowModal(true);
        
        // Track talent view
        const sessionId = sessionStorage.getItem('bfm_session_id') || 'unknown';
        axios.post(`${API}/analytics/track`, {
          event_type: 'talent_view',
          talent_id: talentId,
          page: `/talent/${talentId}`,
          session_id: sessionId
        }).catch(() => {});
      } catch (err) {
        toast({ title: "Error", description: "Talent not found", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (talentId) fetchTalent();
  }, [talentId]);

  const handleVote = async (id) => {
    try {
      await axios.post(`${API}/talents/${id}/vote`);
      const res = await axios.get(`${API}/talent/${talentId}`);
      setTalent(res.data);
      toast({ title: "Vote recorded!" });
    } catch (err) {
      toast({ title: "Already voted", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-[#D4AF37]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14]">
      <Navbar />
      <div className="pt-20 container mx-auto px-4">
        {talent && showModal && (
          <TalentDetailModal 
            talent={talent} 
            onClose={() => window.history.back()} 
            onVote={handleVote} 
          />
        )}
        {!talent && (
          <div className="text-center py-20">
            <h1 className="text-2xl text-[#F5F5F0]">Talent not found</h1>
            <Link to="/" className="text-[#D4AF37] hover:underline mt-4 inline-block">Go back home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Join Us (Talent Registration)
const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", instagram_id: "", category: "", store_subcategories: [], bio: ""
  });
  const [profileImage, setProfileImage] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioVideo, setPortfolioVideo] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Payment state
  const [paymentSettings, setPaymentSettings] = useState({ payment_enabled: false, registration_fee: 499 });
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'success'
  const [talentId, setTalentId] = useState(null);
  
  // Fetch payment settings on mount
  useEffect(() => {
    axios.get(`${API}/payment-settings`).then(res => setPaymentSettings(res.data)).catch(() => {});
  }, []);
  
  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  // Handle payment
  const initiatePayment = async (talentIdParam) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({ title: "Error", description: "Could not load payment gateway", variant: "destructive" });
      return;
    }
    
    try {
      // Create order
      const orderRes = await axios.post(`${API}/create-order`, {
        amount: paymentSettings.registration_fee * 100, // Convert to paise
        talent_id: talentIdParam,
        talent_name: formData.name,
        talent_email: formData.email,
        talent_phone: formData.phone
      });
      
      const options = {
        key: orderRes.data.key_id,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Bangalore Fashion Magazine",
        description: "Talent Registration Fee",
        order_id: orderRes.data.order_id,
        handler: async function(response) {
          // Verify payment
          try {
            console.log("Verifying payment:", response);
            const verifyRes = await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              talent_id: talentIdParam
            });
            console.log("Verification response:", verifyRes.data);
            setPaymentStep('success');
            toast({ title: "Payment Successful!", description: "Your registration is pending admin approval." });
          } catch (err) {
            console.error("Payment verification error:", err.response?.data || err);
            const errorMsg = err.response?.data?.detail || "Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id;
            toast({ title: "Payment verification failed", description: errorMsg, variant: "destructive" });
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email
        },
        theme: {
          color: "#D4AF37"
        },
        modal: {
          ondismiss: function() {
            toast({ title: "Payment cancelled", description: "You can complete payment later", variant: "destructive" });
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Could not initiate payment", variant: "destructive" });
    }
  };
  
  const toggleStoreCategory = (catId) => {
    setFormData(prev => ({
      ...prev,
      store_subcategories: prev.store_subcategories.includes(catId)
        ? prev.store_subcategories.filter(c => c !== catId)
        : [...prev.store_subcategories, catId]
    }));
  };
  
  const selectAllCategories = () => {
    setFormData(prev => ({
      ...prev,
      store_subcategories: STORE_SUBCATEGORIES.map(c => c.id)
    }));
  };

  const declarationText = `User Declaration, Complete Disclaimer & Absolute Consent

By registering on Bangalore Fashion Magazine, I expressly acknowledge, understand, and agree that the platform functions solely as a digital intermediary and listing platform under the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.

I fully agree and confirm that:

Bangalore Fashion Magazine only provides a platform for talent discovery and visibility and does not act as an agent, employer, guarantor, broker, manager, or representative of any user.

The platform does not verify, authenticate, endorse, guarantee, or take responsibility for the identity, background, credentials, conduct, availability, pricing, legality, or authenticity of any user, profile, image, video, message, or communication.

Bangalore Fashion Magazine shall not be responsible or liable in any manner whatsoever for:

• Any misuse, unauthorized use, copying, downloading, editing, morphed use, or redistribution of images, videos, or content uploaded by me

• Any fraud, cheating, impersonation, misrepresentation, or false commitments by any user or third party

• Any financial loss, payment dispute, advance payment issue, non-payment, or contractual disagreement

• Any harassment, abuse, misconduct, threats, exploitation, or professional or personal harm

• Any offline or online interaction, meeting, collaboration, photoshoot, event, show, campaign, or engagement arranged through the platform

• Any technical issue, data loss, hacking incident, account compromise, or unauthorized access

I understand that all interactions and engagements are undertaken entirely at my own risk, and I am solely responsible for conducting my own verification, background checks, and due diligence before entering into any professional or personal arrangement.

I declare that all information, images, and content uploaded by me are lawful, original, or duly authorized, and I alone shall be responsible for any legal consequences arising from copyright infringement, privacy violation, or unlawful use.

I acknowledge that my profile will be displayed only after admin approval, and the platform reserves the absolute right to approve, reject, suspend, modify, or remove any profile or content at its sole discretion, without notice and without assigning any reason.

I accept full responsibility for safeguarding my login credentials and understand that password reset via email-based OTP is provided for convenience only, and the platform shall not be responsible for misuse arising from compromised email or device access.

I agree to indemnify, defend, and hold harmless Bangalore Fashion Magazine, its owners, directors, employees, partners, and affiliates from any and all claims, damages, losses, liabilities, legal actions, costs, or expenses arising out of my actions, content, communications, or engagements on or through the platform.

I confirm that I have read, understood, and voluntarily accepted this declaration and agree that my electronic acceptance shall be legally valid and binding under Indian law. I waive any present or future claim against Bangalore Fashion Magazine to the maximum extent permitted by law.`;

  const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await autoCompressImage(reader.result, 500);
        setProfileImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolio = (e) => {
    const files = Array.from(e.target.files);
    if (portfolio.length + files.length > 7) {
      toast({ title: "Error", description: "Maximum 7 portfolio images", variant: "destructive" });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await autoCompressImage(reader.result, 500);
        setPortfolio(prev => [...prev, compressed].slice(0, 7));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortfolio = (index) => setPortfolio(prev => prev.filter((_, i) => i !== index));

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({ title: "Error", description: "Please upload a video file", variant: "destructive" });
      return;
    }
    
    // Check file size (max 50MB for base64)
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Error", description: "Video must be less than 50MB", variant: "destructive" });
      return;
    }
    
    // Create video element to check duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      setVideoDuration(Math.round(duration));
      
      if (duration > 45) {
        toast({ title: "Error", description: "Video must be 45 seconds or less. Your video is " + Math.round(duration) + " seconds.", variant: "destructive" });
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioVideo(reader.result);
        toast({ title: "Video uploaded!", description: `Duration: ${Math.round(duration)} seconds` });
      };
      reader.readAsDataURL(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = () => {
    setPortfolioVideo("");
    setVideoDuration(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileImage) {
      toast({ title: "Error", description: "Profile image is required", variant: "destructive" });
      return;
    }
    if (!agreedToTerms) {
      toast({ title: "Error", description: "You must agree to the declaration to register", variant: "destructive" });
      return;
    }
    // Validate store_subcategories for Designer Store (at least one required)
    if (formData.category === "Designer Store" && formData.store_subcategories.length === 0) {
      toast({ title: "Error", description: "Please select at least one store category", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/talent/register`, { 
        ...formData, 
        profile_image: profileImage, 
        portfolio_images: portfolio, 
        portfolio_video: portfolioVideo,
        agreed_to_terms: true, 
        agreed_at: new Date().toISOString(),
        payment_status: paymentSettings.payment_enabled ? 'pending' : 'not_required'
      });
      
      const newTalentId = response.data.id;
      setTalentId(newTalentId);
      
      // Track referral if user came from a shared link
      const referrerId = localStorage.getItem('referrer_talent_id');
      const referrerTimestamp = localStorage.getItem('referrer_timestamp');
      if (referrerId && referrerTimestamp) {
        // Only credit referral if it's within 7 days
        const daysSinceReferral = (Date.now() - parseInt(referrerTimestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceReferral <= 7) {
          axios.post(`${API}/track-referral`, {
            referrer_id: referrerId,
            new_talent_id: newTalentId,
            new_talent_name: formData.name
          }).catch(err => console.error('Failed to track referral:', err));
        }
        // Clear referral data
        localStorage.removeItem('referrer_talent_id');
        localStorage.removeItem('referrer_timestamp');
      }
      
      // If payment is enabled, initiate payment
      if (paymentSettings.payment_enabled) {
        setPaymentStep('payment');
        await initiatePayment(newTalentId);
      } else {
        // No payment required
        toast({ title: "Registration Successful!", description: "Please wait for admin approval." });
        navigate("/talent-login");
      }
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <h2 className="text-2xl font-bold text-[#F5F5F0] text-center mb-6">Join as Talent</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Full Name *" />
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Email *" />
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Password *" />
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Phone *" />
            <input type="text" value={formData.instagram_id} onChange={e => setFormData({...formData, instagram_id: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Instagram ID" />
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, store_subcategories: []})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]">
              <option value="">Select Category *</option>
              {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          {/* Designer Store Sub-category Selection (Multi-select) */}
          {formData.category === "Designer Store" && (
            <div className="bg-[#050A14] border border-[#D4AF37]/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[#D4AF37] font-bold">Select Your Store Categories *</label>
                <button type="button" onClick={selectAllCategories} className="text-sm text-[#A0A5B0] hover:text-[#D4AF37]">
                  Select All
                </button>
              </div>
              <p className="text-[#A0A5B0] text-sm mb-4">Select all categories you want to sell in (you can select multiple)</p>
              <div className="grid grid-cols-2 gap-3">
                {STORE_SUBCATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleStoreCategory(cat.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.store_subcategories.includes(cat.id) 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                        : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className={`font-bold ${formData.store_subcategories.includes(cat.id) ? 'text-[#D4AF37]' : 'text-[#F5F5F0]'}`}>
                      {cat.label}
                    </span>
                    {formData.store_subcategories.includes(cat.id) && (
                      <span className="ml-2 text-[#D4AF37]">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {formData.store_subcategories.length > 0 && (
                <p className="text-[#D4AF37] text-sm mt-3">
                  Selected: {formData.store_subcategories.join(", ")}
                </p>
              )}
            </div>
          )}
          
          <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-20" placeholder="Bio (optional)" />
          
          <div>
            <label className="text-[#A0A5B0] text-sm mb-2 block">Profile Image * (Required) - Click to crop</label>
            <div className="flex items-center gap-4">
              <ImageUploadWithCrop 
                onImageSelect={(img) => setProfileImage(img)} 
                aspectRatio={1}
                buttonText="Upload Profile Photo"
              />
              {profileImage && <img src={profileImage} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-[#D4AF37]/30" />}
            </div>
          </div>
          
          <div>
            <label className="text-[#A0A5B0] text-sm mb-2 block">Portfolio Images ({portfolio.length}/7) - Click to crop each</label>
            <div className="flex flex-wrap gap-3 items-center">
              {portfolio.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-20 w-16 object-cover rounded" />
                  <button type="button" onClick={() => removePortfolio(i)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {portfolio.length < 7 && (
                <ImageUploadWithCrop 
                  onImageSelect={(img) => setPortfolio(prev => [...prev, img].slice(0, 7))} 
                  aspectRatio={3/4}
                  buttonText={`Add Image (${portfolio.length}/7)`}
                />
              )}
            </div>
          </div>

          {/* Portfolio Video */}
          <div>
            <label className="text-[#A0A5B0] text-sm mb-2 block">Portfolio Video (max 45 seconds, optional)</label>
            {!portfolioVideo ? (
              <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoUpload} 
                  className="hidden" 
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video size={32} className="mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-[#A0A5B0] text-sm">Click to upload video</p>
                  <p className="text-[#A0A5B0] text-xs mt-1">Max 45 seconds, MP4/MOV recommended</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <video 
                  src={portfolioVideo} 
                  controls 
                  className="w-full max-h-48 rounded-lg bg-black"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#D4AF37] text-sm">Duration: {videoDuration} seconds</span>
                  <button 
                    type="button" 
                    onClick={removeVideo} 
                    className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Remove Video
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Info Banner */}
          {paymentSettings.payment_enabled && (
            <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F5F5F0] font-bold">Registration Fee Required</p>
                  <p className="text-[#A0A5B0] text-sm">Complete payment to submit your registration</p>
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] text-2xl font-bold">₹{paymentSettings.registration_fee}</p>
                  <p className="text-[#A0A5B0] text-xs">One-time fee</p>
                </div>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Processing..." : paymentSettings.payment_enabled ? `Register & Pay ₹${paymentSettings.registration_fee}` : "Register"}
          </button>
        </form>

        {/* Declaration Checkbox */}
        <div className="mt-6 p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/20">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="agreeTerms" 
              checked={agreedToTerms} 
              onChange={e => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#D4AF37]"
            />
            <label htmlFor="agreeTerms" className="text-[#A0A5B0] text-sm">
              I have read and agree to the{" "}
              <button type="button" onClick={() => setShowDeclaration(true)} className="text-[#D4AF37] underline">
                User Declaration, Disclaimer & Consent
              </button>
            </label>
          </div>
          {!agreedToTerms && (
            <p className="text-red-400 text-xs mt-2">* You must agree to the declaration to register</p>
          )}
        </div>

        {/* Declaration Modal */}
        {showDeclaration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowDeclaration(false)}>
            <div className="bg-[#0A1628] rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-[#D4AF37]/20 p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-[#D4AF37] text-xl font-bold mb-4">User Declaration, Complete Disclaimer & Absolute Consent</h2>
              <div className="text-[#A0A5B0] text-sm whitespace-pre-wrap leading-relaxed">{declarationText}</div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => { setAgreedToTerms(true); setShowDeclaration(false); }} className="flex-1 px-4 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold">
                  I Agree
                </button>
                <button onClick={() => setShowDeclaration(false)} className="px-4 py-3 bg-[#050A14] text-[#A0A5B0] rounded border border-[#D4AF37]/20">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-[#A0A5B0] text-sm">Already registered? <Link to="/talent-login" className="text-[#D4AF37]">Login</Link></p>
      </div>
    </div>
  );
};

// Magazine Page
const MagazinePage = () => {
  const { section } = useParams();
  const [magazines, setMagazines] = useState([]);
  const [spotlightTalents, setSpotlightTalents] = useState([]);
  const [editorials, setEditorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const { toast } = useToast();
  
  const sectionTitle = {
    'latest-issues': 'Latest Issues',
    'talent-spotlight': 'Talent Spotlight',
    'editorials': 'Editorials'
  }[section] || 'Magazine';

  useEffect(() => {
    setLoading(true);
    
    if (section === 'latest-issues') {
      // Fetch magazine issues
      axios.get(`${API}/homepage-data`)
        .then(res => {
          if (res.data.magazine) {
            setMagazines([res.data.magazine]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (section === 'talent-spotlight') {
      // Fetch featured/spotlight talents
      axios.get(`${API}/talents?approved_only=true&featured=true&lightweight=true`)
        .then(res => {
          setSpotlightTalents(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (section === 'editorials') {
      // Fetch hero images as editorials
      axios.get(`${API}/homepage-data`)
        .then(res => {
          setEditorials(res.data.hero_images || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [section]);

  const handleVote = async (talentId) => {
    try {
      await axios.post(`${API}/vote`, { talent_id: talentId });
      toast({ title: "Vote recorded!" });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to vote", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">BFM Magazine</span>
          <h1 className="font-serif text-4xl font-bold text-[#F5F5F0] mt-2">{sectionTitle}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <p className="text-[#A0A5B0]">Loading...</p>
          </div>
        ) : (
          <>
            {/* Latest Issues */}
            {section === 'latest-issues' && (
              <div className="max-w-4xl mx-auto">
                {magazines.length === 0 ? (
                  <p className="text-[#A0A5B0] text-center">No magazine issues available yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {magazines.map((mag, i) => (
                      <div key={i} className="bg-[#0A1628] rounded-xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                        <div className="aspect-[3/4] bg-gradient-to-br from-[#D4AF37]/20 to-[#0A1628] flex items-center justify-center">
                          <div className="text-center p-6">
                            <Image className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
                            <h3 className="text-[#F5F5F0] font-serif text-xl mb-2">{mag.title || "BFM Magazine"}</h3>
                            <p className="text-[#A0A5B0] text-sm">{mag.file_name || "Latest Edition"}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          {mag.file_data && (
                            <a 
                              href={mag.file_data} 
                              download={mag.file_name || "magazine.pdf"}
                              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors"
                            >
                              <Download size={18} /> Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Talent Spotlight */}
            {section === 'talent-spotlight' && (
              <div>
                {spotlightTalents.length === 0 ? (
                  <p className="text-[#A0A5B0] text-center">No spotlight talents featured yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {spotlightTalents.map(t => (
                      <TalentCardSmall key={t.id} talent={t} onVote={handleVote} onClick={setSelectedTalent} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Editorials */}
            {section === 'editorials' && (
              <div className="max-w-6xl mx-auto">
                {editorials.length === 0 ? (
                  <p className="text-[#A0A5B0] text-center">No editorials available yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editorials.map((editorial, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                        <div className="aspect-[4/5]">
                          <img 
                            src={editorial.image_data || editorial.image} 
                            alt={editorial.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="inline-block px-3 py-1 bg-[#D4AF37] text-[#050A14] text-xs font-bold rounded-full mb-2">
                              {editorial.category || "Editorial"}
                            </span>
                            <h3 className="text-[#F5F5F0] font-serif text-xl font-bold">{editorial.title}</h3>
                            {editorial.subtitle && (
                              <p className="text-[#A0A5B0] text-sm mt-1">{editorial.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Talent Detail Modal */}
      {selectedTalent && (
        <TalentDetailModal 
          talent={selectedTalent} 
          onClose={() => setSelectedTalent(null)} 
          onVote={handleVote} 
        />
      )}
    </div>
  );
};

// Talent Dashboard
// About Page
const AboutPage = () => (
  <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
    <div className="container mx-auto max-w-4xl">
      <h1 className="font-serif text-4xl font-bold text-[#F5F5F0] mb-8 text-center">About Us</h1>
      <div className="space-y-6">
        <p className="text-[#A0A5B0] text-lg leading-relaxed">
          We are a premier fashion talent management and creative collaboration platform headquartered in Bangalore, curating exceptional talent for the evolving world of fashion and visual culture. With over a decade of industry expertise, we are committed to discovering, refining, and representing professionals who define excellence and influence the future of Indian fashion.
        </p>
        <p className="text-[#A0A5B0] text-lg leading-relaxed">
          Our platform brings together an exclusive collective of models, fashion designers, makeup artists, photographers, videographers, hair stylists, fashion stylists, creative directors, costume designers, master tailors, influencers, and talent agencies—carefully selected for their craft, vision, and professionalism. We provide a seamless ecosystem where creativity meets opportunity across fashion shows, luxury brand campaigns, editorial productions, films, and digital media.
        </p>
        <p className="text-[#A0A5B0] text-lg leading-relaxed">
          We believe true luxury lies in precision, credibility, and meaningful collaboration. Through curated profiles, verified talent, and discreet access to opportunities, we enable brands and creatives to connect with confidence and clarity. Every collaboration is approached with intention, aesthetic integrity, and an uncompromising standard of quality.
        </p>
        <p className="text-[#A0A5B0] text-lg leading-relaxed">
          Rooted in innovation and guided by timeless sophistication, our mission is to elevate Indian talent, foster global-ready collaborations, and shape a refined creative community that sets new benchmarks for the fashion industry.
        </p>
      </div>
    </div>
  </div>
);

// Home Page
const HomePage = ({ user, talent, onLogout, heroImages, awards, ads, magazine, video, partyEvents }) => {
  const [enlargedAd, setEnlargedAd] = useState(null);
  
  const handleAdClick = (e, ad) => {
    e.preventDefault();
    e.stopPropagation();
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    } else {
      setEnlargedAd(ad);
    }
  };
  
  return (
  <div className="min-h-screen bg-[#050A14]">
    <Navbar user={user} talent={talent} onLogout={onLogout} />
    
    {/* Enlarged Ad Modal */}
    {enlargedAd && (
      <div 
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        onClick={() => setEnlargedAd(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh]">
          <button 
            onClick={() => setEnlargedAd(null)}
            className="absolute -top-10 right-0 text-white hover:text-[#D4AF37] text-xl"
          >
            ✕ Close
          </button>
          <img 
            src={enlargedAd.image_data} 
            alt={enlargedAd.title || "Sponsored"} 
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {enlargedAd.title && (
            <p className="text-white text-center mt-2">{enlargedAd.title}</p>
          )}
        </div>
      </div>
    )}
    
    {/* Main Content with Sticky Ads Sidebar */}
    <div className="flex">
      {/* Main Content Area */}
      <div className={ads && ads.length > 0 ? "w-full lg:w-[calc(100%-220px)]" : "w-full"}>
        
        {/* New Talent Hero Slider */}
        <TalentHeroSlider />
        
        {/* Mobile Ads - smaller, shown below hero on mobile only */}
        {ads && ads.length > 0 && (
          <div className="lg:hidden bg-[#0A1628] py-3 border-y border-[#D4AF37]/20">
            <div className="container mx-auto px-4">
              <p className="text-[#A0A5B0] text-[10px] uppercase tracking-wider text-center mb-2">Sponsored</p>
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                {ads.map((ad, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={(e) => handleAdClick(e, ad)}
                  >
                    <div className="w-16 h-16 overflow-hidden rounded border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all">
                      <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Magazine Download Section - Right below hero */}
        {magazine && magazine.file_data && (
          <div className="bg-[#0A1628] py-4 border-b border-[#D4AF37]/20">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <h3 className="text-[#D4AF37] font-serif text-base">{magazine.title || "Download Our Magazine"}</h3>
                <a href={magazine.file_data} download={magazine.file_name || "magazine.pdf"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors text-sm">
                  <Download size={16} /> Download PDF
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Party Updates Section - Can have N number of parties */}
        <PartyUpdatesSection partyEvents={partyEvents} />
        
        {/* Featured Video Section */}
        {video && video.video_url && (
          <div className="bg-[#0A1628] py-8 border-y border-[#D4AF37]/20">
            <div className="container mx-auto px-4">
              <h3 className="text-[#D4AF37] font-serif text-xl text-center mb-4">{video.title || "Featured Video"}</h3>
              <div className="max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden border border-[#D4AF37]/20">
                {video.video_type === "youtube" && (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.video_url.includes("youtu.be") ? video.video_url.split("/").pop().split("?")[0] : video.video_url.includes("v=") ? video.video_url.split("v=")[1].split("&")[0] : video.video_url}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                  />
                )}
                {video.video_type === "vimeo" && (
                  <iframe
                    src={`https://player.vimeo.com/video/${video.video_url.split("/").pop()}`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Share Leaderboard - Top Shared Talents */}
        <ShareLeaderboard />
        
        {/* Contact Section */}
        <div className="bg-[#0A1628] py-6 border-y border-[#D4AF37]/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
              <p className="text-[#D4AF37] font-serif text-lg">For Booking Talents</p>
              <a href="https://instagram.com/bangalorefashionmagazine" target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">
                <Instagram size={20} /> @bangalorefashionmagazine
              </a>
              <a href="mailto:bfm1magazine@gmail.com" 
                className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">
                <Mail size={20} /> bfm1magazine@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Contest Winners Section */}
        <div className="container mx-auto px-4">
          <ContestWinnersSection awards={awards} />
        </div>
      </div>
      
      {/* Sticky Ads Sidebar - Desktop Only */}
      {ads && ads.length > 0 && (
        <div className="hidden lg:block w-[220px] flex-shrink-0 bg-[#0A1628] border-l border-[#D4AF37]/20">
          <div className="sticky top-16 p-3 max-h-[calc(100vh-64px)] overflow-y-auto">
            <p className="text-[#A0A5B0] text-[10px] uppercase tracking-wider text-center mb-3">Sponsored</p>
            <div className="flex flex-col gap-3">
              {ads.map((ad, i) => (
                <div 
                  key={i} 
                  className="block cursor-pointer"
                  onClick={(e) => handleAdClick(e, ad)}
                >
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all">
                    <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Bottom Ads Section - Horizontal with spacing (shown when there are many ads) */}
    {ads && ads.length > 3 && (
      <div className="bg-[#050A14] py-8 sm:py-12 mt-6 sm:mt-8">
        <div className="container mx-auto px-4">
          <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center mb-4 sm:mb-6">Our Sponsors</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {ads.map((ad, i) => (
              <div 
                key={i} 
                className="w-24 sm:w-32 md:w-40 cursor-pointer"
                onClick={(e) => handleAdClick(e, ad)}
              >
                <div className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all">
                  <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

// Main App
function App() {
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [ads, setAds] = useState([]);
  const [magazine, setMagazine] = useState(null);
  const [music, setMusic] = useState(null);
  const [video, setVideo] = useState(null);
  const [partyEvents, setPartyEvents] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [audioRef] = useState(() => typeof Audio !== 'undefined' ? new Audio() : null);
  const [showSplash, setShowSplash] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("talent");
    if (u) try { setUser(JSON.parse(u)); } catch {}
    if (t) try { setTalent(JSON.parse(t)); } catch {}
    
    // Show splash screen only once per session (skip for admin pages)
    const splashShown = sessionStorage.getItem("splashShown");
    const isAdminPage = window.location.pathname.includes('/admin');
    if (!splashShown && !isAdminPage) {
      setShowSplash(true);
    }
    
    // Fetch share settings
    axios.get(`${API}/share-settings`).then(res => {
      setShareEnabled(res.data.share_enabled !== false);
    }).catch(() => {});
    
    // Fetch public data - single API call for faster loading
    axios.get(`${API}/homepage-data`).then(res => {
      setHeroImages(res.data.hero_images || []);
      setAwards(res.data.awards || []);
      setAds(res.data.ads || []);
      setMagazine(res.data.magazine);
      if (res.data.music?.id && res.data.music?.file_data) {
        setMusic(res.data.music);
      }
      if (res.data.video?.id) {
        setVideo(res.data.video);
      }
      setPartyEvents(res.data.party_events || []);
    }).catch(console.error);
  }, []);

  // Analytics tracking - generate session ID and track page views
  useEffect(() => {
    // Generate or get session ID
    let sessionId = sessionStorage.getItem('bfm_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('bfm_session_id', sessionId);
    }

    // Track page view
    const trackPageView = () => {
      const path = window.location.pathname;
      axios.post(`${API}/analytics/track`, {
        event_type: 'page_view',
        page: path,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      }).catch(() => {}); // Silent fail
    };

    trackPageView();

    // Track on route changes (for SPA navigation)
    const handleRouteChange = () => {
      setTimeout(trackPageView, 100);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Handle music playback
  useEffect(() => {
    if (music?.file_data && audioRef) {
      audioRef.src = music.file_data;
      audioRef.loop = true;
      audioRef.volume = 0.3;
    }
  }, [music, audioRef]);

  const toggleMute = () => {
    if (audioRef) {
      if (isMuted) {
        audioRef.play().catch(e => console.log("Audio play failed:", e));
        setIsMuted(false);
      } else {
        audioRef.pause();
        setIsMuted(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setTalent(null);
    window.location.href = "/";
  };

  const closeSplash = () => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Default SEO Meta Tags */}
        <Helmet>
          <title>BFM Magazine | Bangalore Fashion Magazine</title>
          <meta name="description" content="Discover top fashion talent in Bangalore - Models, Designers, Photographers, Makeup Artists and more. Vote for your favorites on BFM Magazine." />
          <meta property="og:title" content="BFM Magazine | Bangalore Fashion Magazine" />
          <meta property="og:description" content="Discover top fashion talent in Bangalore - Models, Designers, Photographers, and more." />
          <meta property="og:image" content={BFM_LOGO} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        
        {/* Welcome Splash Screen */}
        {showSplash && <WelcomeSplash onClose={closeSplash} />}
        
        {/* Music Control Button */}
        {music && (
          <button 
            onClick={toggleMute}
            className="fixed bottom-6 right-6 z-50 p-3 bg-[#D4AF37] text-[#050A14] rounded-full shadow-lg hover:bg-[#F5F5F0] transition-all"
            title={isMuted ? "Play Music" : "Mute Music"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        )}
        
        <Routes>
          <Route path="/" element={<HomePage user={user} talent={talent} onLogout={handleLogout} heroImages={heroImages} awards={awards} ads={ads} magazine={magazine} video={video} partyEvents={partyEvents} />} />
          <Route path="/talent/:talentId" element={<TalentProfilePage />} />
          <Route path="/login" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><LoginPage onLogin={setUser} /></>} />
          <Route path="/talent-login" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentLoginPage onTalentLogin={setTalent} /></>} />
          <Route path="/forgot-password" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><ForgotPasswordPage /></>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/join" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><JoinPage /></>} />
          <Route path="/about" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AboutPage /></>} />
          <Route path="/designer-store" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><DesignerStorePageComponent /></>} />
          <Route path="/talents/:category" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentsPage ads={ads} shareEnabled={shareEnabled} /></>} />
          <Route path="/magazine/:section" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><MagazinePage /></>} />
          <Route path="/talent-dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentDashboard talent={talent} onUpdate={setTalent} /></>} />
          <Route path="/admin" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AdminDashboard /></>} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

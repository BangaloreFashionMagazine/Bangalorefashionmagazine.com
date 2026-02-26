import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, Mail, Lock, User, Shield, Award, Image, Download, Star, Check, X, Phone, Instagram, Trash2, Vote, ExternalLink, Volume2, VolumeX, Music, Video, Upload, BarChart3, TrendingUp, Eye, MousePointer, ShoppingBag, Package, MapPin, Send } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { API, BFM_LOGO, TALENT_CATEGORIES, CATEGORY_DISPLAY, CATEGORY_DB, getCategoryDisplay, getCategoryForDB, DEFAULT_SLIDES, STORE_SUBCATEGORIES } from "@/lib/config";
import DesignerStorePageComponent from "@/pages/DesignerStorePage";
import AdminDashboard from "@/pages/Admin/AdminDashboard";

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
            <div className="relative">
              <button onClick={() => setShowTalentMenu(!showTalentMenu)} className="text-xs uppercase tracking-wider text-[#A0A5B0] hover:text-[#D4AF37]">
                Talents ▾
              </button>
              {showTalentMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg shadow-xl z-50">
                  {TALENT_CATEGORIES.filter(cat => cat !== "Designer Store").map(cat => (
                    <Link key={cat} to={`/talents/${encodeURIComponent(cat)}`} onClick={() => setShowTalentMenu(false)}
                      className="block px-4 py-2 text-sm text-[#A0A5B0] hover:text-[#D4AF37] hover:bg-[#050A14]">
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
                {isAdmin && <Link to="/admin" className="px-3 py-1.5 bg-[#D4AF37] text-[#050A14] text-xs uppercase rounded flex items-center gap-1"><Shield size={12} /> Admin</Link>}
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
                <Link to="/login" className="text-xs uppercase text-[#D4AF37]">Admin</Link>
                <Link to="/talent-login" className="text-xs uppercase text-[#A0A5B0] hover:text-[#D4AF37]">Talent Login</Link>
                <Link to="/join" className="px-3 py-1.5 border border-[#D4AF37] text-[#D4AF37] text-xs uppercase rounded hover:bg-[#D4AF37] hover:text-[#050A14]">Join Us</Link>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1628] border-t border-[#D4AF37]/20 py-4 space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#F5F5F0]">Home</Link>
            <div className="px-4 py-2">
              <p className="text-[#D4AF37] text-sm mb-2">Talents</p>
              {TALENT_CATEGORIES.filter(cat => cat !== "Designer Store").map(cat => (
                <Link key={cat} to={`/talents/${encodeURIComponent(cat)}`} onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 pl-4 text-sm text-[#A0A5B0]">{cat}</Link>
              ))}
            </div>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">About Us</Link>
            <Link to="/designer-store" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">Designer Store</Link>
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">Admin Panel</Link>}
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">{user.name}</Link>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block px-4 py-2 text-red-400">Logout</button>
              </>
            ) : talent ? (
              <>
                <Link to="/talent-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">My Profile</Link>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block px-4 py-2 text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37]">Admin Login</Link>
                <Link to="/talent-login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">Talent Login</Link>
                <Link to="/join" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#D4AF37] font-bold">Join Us</Link>
              </>
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
            <div key={i} className="bg-[#0A1628] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all"
              onClick={() => trackPartyView(event.id)}>
              {event.image && (
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
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
                <h3 className="text-[#F5F5F0] font-bold text-xl mb-2">{event.title}</h3>
                <p className="text-[#A0A5B0] text-sm mb-3">{event.venue}</p>
                {event.description && (
                  <p className="text-[#A0A5B0] text-sm mb-4">{event.description}</p>
                )}
                {event.booking_info && (
                  <div className="p-3 bg-[#050A14] rounded-lg border border-[#D4AF37]/10">
                    <p className="text-[#D4AF37] text-xs uppercase tracking-wider mb-1">Booking Info</p>
                    <p className="text-[#F5F5F0] text-sm">{event.booking_info}</p>
                  </div>
                )}
                {event.contact && (
                  <p className="text-[#A0A5B0] text-xs mt-3">Contact: {event.contact}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contest Winners Section (only shows if contests exist)
const ContestWinnersSection = ({ awards }) => {
  const [activeImages, setActiveImages] = useState({});
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
                className={`bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden ${award.talent_id ? 'cursor-pointer hover:border-[#D4AF37]/60 transition-all' : ''}`}
                onClick={() => handleWinnerClick(award)}
              >
                {images.length > 0 && (
                  <div className="relative group">
                    <img 
                      src={images[activeIdx]} 
                      alt={`${award.winner_name} - ${activeIdx + 1}`} 
                      className="w-full h-64 object-cover transition-opacity duration-300" 
                    />
                    {award.talent_id && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-[#D4AF37] px-3 py-1 rounded-full">View Profile</span>
                      </div>
                    )}
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
                  {award.description && <p className="text-[#A0A5B0] text-sm mt-2">{award.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Advertisement Sidebar
const AdvertisementSidebar = ({ ads }) => {
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
  
  return (
    <div className="w-full lg:w-64 space-y-4">
      <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center">Sponsored</p>
      {ads.map((ad, i) => (
        <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block"
          onClick={() => trackAdClick(ad.id)}>
          <img src={ad.image_data} alt={ad.title} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
        </a>
      ))}
    </div>
  );
};

// Talent Detail Modal
const TalentDetailModal = ({ talent, onClose, onVote }) => {
  const [voting, setVoting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  if (!talent) return null;

  const handleVote = async () => {
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Combine profile image with portfolio for gallery display
  const allImages = [talent.profile_image, ...(talent.portfolio_images || [])].filter(Boolean);

  const openGallery = (index) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
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
          {talent.bio && (
            <div className="mb-6 text-center">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-2">About</h3>
              <p className="text-[#A0A5B0] max-w-2xl mx-auto">{talent.bio}</p>
            </div>
          )}
          
          {/* 4. Photo Gallery - Profile + Portfolio Images */}
          <div className="mb-6">
            <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-4 text-center">Photo Gallery</h3>
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
            {allImages.length === 0 && (
              <p className="text-[#A0A5B0] text-center py-8">No photos available</p>
            )}
          </div>

          {/* Portfolio Video */}
          {talent.portfolio_video && (
            <div className="mb-6">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-4 text-center">Portfolio Video</h3>
              <div className="relative">
                <video 
                  src={talent.portfolio_video} 
                  controls 
                  className="w-full max-h-64 rounded-lg bg-black mx-auto"
                  style={{ maxWidth: '500px', margin: '0 auto', display: 'block' }}
                />
                <LogoWatermark size="small" position="bottom-right" />
              </div>
            </div>
          )}
          
          {/* 5. Voting Section - At the END below all images */}
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
          </div>
        </div>
        
        {/* Full Image Gallery with Swipe */}
        {galleryOpen && (
          <ImageGalleryInline 
            images={allImages} 
            initialIndex={galleryIndex} 
            onClose={() => setGalleryOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

// Inline Image Gallery Component with Navigation
const ImageGalleryInline = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);

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

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"><X size={24} /></button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">{currentIndex + 1} / {images.length}</div>
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
  
  const handleVote = async (e) => {
    e.stopPropagation();
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer"
      onClick={() => onClick(talent)}
      data-testid={`talent-card-${talent.id}`}
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img src={talent.profile_image || "https://via.placeholder.com/300x400"} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <LogoWatermark size="small" position="bottom-right" />
      </div>
      {/* Reduced overlay darkness */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/70 via-[#050A14]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-wider mb-1">{getCategoryDisplay(talent.category)}</span>
        {/* Increased font weight for name */}
        <h3 className="font-serif text-xl font-bold text-[#F5F5F0] tracking-wide">{talent.name}</h3>
        {/* Gold divider line under name */}
        <div className="w-12 h-[1px] bg-[#D4AF37]/60 mt-1.5 mb-2"></div>
        {/* Smaller, more subtle votes section */}
        <div className="flex items-center justify-between">
          <span className="text-[#F5F5F0]/60 text-xs">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37]/80 text-[10px] rounded hover:bg-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-50 transition-colors">
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
  
  const handleVote = async (e) => {
    e.stopPropagation();
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer"
      onClick={() => onClick(talent)}
      data-testid={`talent-card-small-${talent.id}`}
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img src={talent.profile_image || "https://via.placeholder.com/150x200"} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <h3 className="font-serif text-xs sm:text-sm font-bold text-[#F5F5F0] truncate">{talent.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[#F5F5F0]/60 text-[10px]">{talent.votes || 0}</span>
          <button onClick={handleVote} disabled={voting} className="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] rounded hover:bg-[#D4AF37]/40 disabled:opacity-50 transition-colors">
            {voting ? ".." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Talents Page by Category
const TalentsPage = ({ ads }) => {
  const { category } = useParams();
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const decodedCategory = decodeURIComponent(category || "");
  // Convert URL category (new name) to database category (old name)
  const dbCategory = getCategoryForDB(decodedCategory);
  const hasAds = ads && ads.length > 0;

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/talents?approved_only=true&category=${encodeURIComponent(dbCategory)}`)
      .then(res => {
        setTalents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [dbCategory]);

  const handleVote = async (talentId) => {
    try {
      await axios.post(`${API}/vote`, { talent_id: talentId });
      toast({ title: "Vote recorded!" });
      // Refresh
      const res = await axios.get(`${API}/talents?approved_only=true&category=${encodeURIComponent(dbCategory)}`);
      setTalents(res.data);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to vote", variant: "destructive" });
    }
  };

  // Grid classes: 7 per row with ads, 10 without ads on large screens
  const gridClass = hasAds 
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3";

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-[#F5F5F0] mb-6">{decodedCategory || "All Talents"}</h1>
            {loading ? (
              <p className="text-[#A0A5B0]">Loading...</p>
            ) : talents.length === 0 ? (
              <p className="text-[#A0A5B0]">No approved talents in this category yet.</p>
            ) : (
              <div className={gridClass}>
                {talents.map(t => <TalentCardSmall key={t.id} talent={t} onVote={handleVote} onClick={setSelectedTalent} />)}
              </div>
            )}
          </div>
          {/* Ads sidebar - smaller on category pages */}
          {hasAds && (
            <div className="hidden lg:block w-48 flex-shrink-0">
              <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center mb-3">Sponsored</p>
              <div className="flex flex-col gap-3">
                {ads.map((ad, i) => (
                  <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
                  </a>
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
  
  // Store sub-categories
  const STORE_SUBCATEGORIES = [
    { id: "Everyday Chic", label: "Everyday Chic (Casuals)", icon: "👕" },
    { id: "After Dark", label: "After Dark (Party)", icon: "✨" },
    { id: "Heritage Luxe", label: "Heritage Luxe (Ethnic)", icon: "🪔" },
    { id: "Accessories Room", label: "Accessories Room", icon: "👜" }
  ];
  
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

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
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
      reader.onloadend = () => setPortfolio(prev => [...prev, reader.result].slice(0, 7));
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
      await axios.post(`${API}/talent/register`, { 
        ...formData, 
        profile_image: profileImage, 
        portfolio_images: portfolio, 
        portfolio_video: portfolioVideo,
        agreed_to_terms: true, 
        agreed_at: new Date().toISOString() 
      });
      toast({ title: "Registration Successful!", description: "Please wait for admin approval." });
      navigate("/talent-login");
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
          
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
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

// Talent Dashboard
const TalentDashboard = ({ talent, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(talent || {});
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioVideo, setPortfolioVideo] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch fresh talent data from API
    if (talent?.id) {
      setFetching(true);
      axios.get(`${API}/talent/${talent.id}`)
        .then(res => {
          setFormData(res.data);
          setPortfolio(res.data.portfolio_images || []);
          setPortfolioVideo(res.data.portfolio_video || "");
          localStorage.setItem("talent", JSON.stringify(res.data));
          onUpdate(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [talent?.id]);

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({...formData, profile_image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioAdd = (e) => {
    const files = Array.from(e.target.files);
    if (portfolio.length + files.length > 7) {
      toast({ title: "Max 7 images", variant: "destructive" });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPortfolio(prev => [...prev, reader.result].slice(0, 7));
      reader.readAsDataURL(file);
    });
  };

  const removePortfolio = (i) => setPortfolio(prev => prev.filter((_, idx) => idx !== i));

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast({ title: "Error", description: "Please upload a video file", variant: "destructive" });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Error", description: "Video must be less than 50MB", variant: "destructive" });
      return;
    }
    
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/talent/${talent.id}`, {
        name: formData.name, phone: formData.phone, instagram_id: formData.instagram_id,
        category: formData.category, bio: formData.bio, profile_image: formData.profile_image,
        portfolio_images: portfolio,
        portfolio_video: portfolioVideo
      });
      localStorage.setItem("talent", JSON.stringify(res.data));
      onUpdate(res.data);
      toast({ title: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!talent) return <div className="min-h-screen bg-[#050A14] pt-20 text-center text-[#F5F5F0]">Please login</div>;
  if (fetching) return <div className="min-h-screen bg-[#050A14] pt-20 text-center text-[#F5F5F0]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-3 md:px-4">
      <div className="max-w-4xl mx-auto bg-[#0A1628] rounded-2xl p-4 md:p-8 border border-[#D4AF37]/20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F5F5F0]">My Profile</h1>
            <p className="text-sm mt-1">
              Status: {talent.is_approved ? <span className="text-green-500">Approved ✓</span> : <span className="text-yellow-500">Pending Approval</span>}
            </p>
          </div>
          <button onClick={() => setEditing(!editing)} className="w-full md:w-auto px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-[#050A14]">
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <img src={formData.profile_image || "https://via.placeholder.com/200"} alt="" className="w-full aspect-square object-cover rounded-xl" />
            {editing && (
              <div className="mt-3">
                <ImageUploadWithCrop 
                  onImageSelect={(img) => setFormData({...formData, profile_image: img})} 
                  aspectRatio={1}
                  buttonText="Change Profile Photo"
                />
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-3">
            {editing ? (
              <>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Name" />
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Phone" />
                <input type="text" value={formData.instagram_id} onChange={e => setFormData({...formData, instagram_id: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Instagram" />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                  {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] h-20" placeholder="Bio" />
                
                <div>
                  <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Images ({portfolio.length}/7) - Click to crop</p>
                  <div className="flex flex-wrap gap-3 items-center mb-2">
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
                        buttonText={`Add (${portfolio.length}/7)`}
                      />
                    )}
                  </div>
                </div>

                {/* Portfolio Video */}
                <div>
                  <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Video (max 45 seconds) - Original size</p>
                  {!portfolioVideo ? (
                    <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="dash-video-upload" />
                      <label htmlFor="dash-video-upload" className="cursor-pointer">
                        <Video size={24} className="mx-auto text-[#D4AF37] mb-1" />
                        <p className="text-[#A0A5B0] text-sm">Upload video (max 45 sec)</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <video src={portfolioVideo} controls className="w-full max-h-40 rounded-lg bg-black" />
                      <button type="button" onClick={removeVideo} className="mt-2 px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
                
                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-[#F5F5F0]"><strong>Name:</strong> {talent.name}</p>
                <p className="text-[#F5F5F0]"><strong>Email:</strong> {talent.email}</p>
                <p className="text-[#F5F5F0]"><strong>Phone:</strong> {talent.phone}</p>
                <p className="text-[#F5F5F0]"><strong>Instagram:</strong> @{talent.instagram_id}</p>
                <p className="text-[#F5F5F0]"><strong>Category:</strong> {getCategoryDisplay(talent.category)}</p>
                {talent.category === "Designer Store" && talent.store_subcategories && talent.store_subcategories.length > 0 && (
                  <p className="text-[#F5F5F0]"><strong>Store Categories:</strong> <span className="text-[#D4AF37]">{talent.store_subcategories.join(", ")}</span></p>
                )}
                <p className="text-[#F5F5F0]"><strong>Votes:</strong> {talent.votes || 0}</p>
                {talent.bio && <p className="text-[#F5F5F0]"><strong>Bio:</strong> {talent.bio}</p>}
                {portfolio.length > 0 && (
                  <div>
                    <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Images</p>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.map((img, i) => <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded" />)}
                    </div>
                  </div>
                )}
                {portfolioVideo && (
                  <div>
                    <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Video</p>
                    <video src={portfolioVideo} controls className="w-full max-h-40 rounded-lg bg-black" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* My Products Section - Only for Designer Store category */}
      {talent?.category === "Designer Store" && (
        <DesignerProductsSection designerId={talent.id} designerCategories={talent.store_subcategories || []} />
      )}
    </div>
  );
};

// Designer Products Section Component
const DesignerProductsSection = ({ designerId, designerCategories = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", store_category: designerCategories[0] || "", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/store/products?designer_id=${designerId}&active_only=false`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  useEffect(() => { fetchProducts(); }, [designerId]);
  
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    if (!newProduct.store_category) {
      toast({ title: "Please select a category for this product", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/store/products`, { 
        ...newProduct, 
        price: parseFloat(newProduct.price), 
        discount_percent: parseInt(newProduct.discount_percent) || 0,
        designer_id: designerId 
      });
      toast({ title: "Product added!" });
      setNewProduct({ name: "", description: "", store_category: designerCategories[0] || "", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "" });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) { toast({ title: err.response?.data?.detail || "Failed to add product", variant: "destructive" }); }
    setSubmitting(false);
  };
  
  const updateProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axios.put(`${API}/store/products/${editingProduct.id}`, { 
        name: editingProduct.name,
        description: editingProduct.description,
        store_category: editingProduct.store_category,
        size: editingProduct.size,
        material: editingProduct.material,
        price: parseFloat(editingProduct.price),
        discount_percent: parseInt(editingProduct.discount_percent) || 0,
        shipping_info: editingProduct.shipping_info,
        images: editingProduct.images,
        video: editingProduct.video
      });
      toast({ title: "Product updated!" });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) { toast({ title: err.response?.data?.detail || "Failed to update product", variant: "destructive" }); }
    setSubmitting(false);
  };
  
  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/store/products/${productId}`);
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (err) { toast({ title: "Failed to delete", variant: "destructive" }); }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#F5F5F0]">My Products ({products.length}/10)</h2>
          {products.length < 10 && !editingProduct && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm">
              {showAddForm ? "Cancel" : "+ Add Product"}
            </button>
          )}
        </div>
        
        {/* Add/Edit Form */}
        {(showAddForm || editingProduct) && (
          <div className="bg-[#050A14] rounded-lg p-4 mb-6 border border-[#D4AF37]/20">
            <h3 className="text-[#D4AF37] font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            
            {/* Category Selection */}
            {designerCategories.length > 0 && (
              <div className="mb-4">
                <label className="text-[#A0A5B0] text-sm mb-2 block">Product Category *</label>
                <div className="flex flex-wrap gap-2">
                  {designerCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => editingProduct ? setEditingProduct({...editingProduct, store_category: cat}) : setNewProduct({...newProduct, store_category: cat})}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        (editingProduct ? editingProduct.store_category : newProduct.store_category) === cat
                          ? 'bg-[#D4AF37] text-[#050A14] border-[#D4AF37]'
                          : 'border-[#D4AF37]/30 text-[#A0A5B0] hover:border-[#D4AF37]'
                      }`}
                    >
                      {cat === "Everyday Chic" && "👕"} {cat === "After Dark" && "✨"} {cat === "Heritage Luxe" && "🪔"} {cat === "Accessories Room" && "👜"} {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Product Name *" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Price (₹) *" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Discount % (0-100)" min="0" max="100" value={editingProduct ? editingProduct.discount_percent : newProduct.discount_percent} onChange={e => editingProduct ? setEditingProduct({...editingProduct, discount_percent: e.target.value}) : setNewProduct({...newProduct, discount_percent: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Size" value={editingProduct ? editingProduct.size : newProduct.size} onChange={e => editingProduct ? setEditingProduct({...editingProduct, size: e.target.value}) : setNewProduct({...newProduct, size: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Material" value={editingProduct ? editingProduct.material : newProduct.material} onChange={e => editingProduct ? setEditingProduct({...editingProduct, material: e.target.value}) : setNewProduct({...newProduct, material: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Shipping Info" value={editingProduct ? editingProduct.shipping_info : newProduct.shipping_info} onChange={e => editingProduct ? setEditingProduct({...editingProduct, shipping_info: e.target.value}) : setNewProduct({...newProduct, shipping_info: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <textarea placeholder="Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-4" rows={2} />
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Product Images (up to 5)</label>
              <div className="flex flex-wrap gap-2">
                {(editingProduct ? editingProduct.images : newProduct.images).map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    <button onClick={() => editingProduct ? setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)}) : setNewProduct({...newProduct, images: newProduct.images.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
                  </div>
                ))}
                {(editingProduct ? editingProduct.images : newProduct.images).length < 5 && (
                  <ImageUploadWithCrop onImageSelect={(img) => editingProduct ? setEditingProduct({...editingProduct, images: [...editingProduct.images, img]}) : setNewProduct({...newProduct, images: [...newProduct.images, img]})} buttonText="Add Image" />
                )}
              </div>
            </div>
            {/* Video Upload */}
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Product Video (max 45 seconds, optional)</label>
              {(editingProduct ? editingProduct.video : newProduct.video) ? (
                <div className="flex items-center gap-2">
                  <video src={editingProduct ? editingProduct.video : newProduct.video} className="h-20 rounded" />
                  <button onClick={() => editingProduct ? setEditingProduct({...editingProduct, video: ""}) : setNewProduct({...newProduct, video: ""})} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">Remove</button>
                </div>
              ) : (
                <input type="file" accept="video/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 50 * 1024 * 1024) { toast({ title: "Video must be under 50MB", variant: "destructive" }); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (editingProduct) setEditingProduct({...editingProduct, video: reader.result});
                      else setNewProduct({...newProduct, video: reader.result});
                    };
                    reader.readAsDataURL(file);
                  }
                }} className="text-[#A0A5B0]" />
              )}
            </div>
            <div className="flex gap-3">
              {editingProduct ? (
                <>
                  <button onClick={updateProduct} disabled={submitting} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="px-6 py-2 border border-[#A0A5B0] text-[#A0A5B0] rounded">Cancel</button>
                </>
              ) : (
                <button onClick={addProduct} disabled={submitting} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50">
                  {submitting ? "Adding..." : "Add Product"}
                </button>
              )}
            </div>
          </div>
        )}
        
        {loading ? (
          <p className="text-[#A0A5B0]">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-[#A0A5B0]">You haven't added any products yet. Add your first product to start selling!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                <div className="relative">
                  <img src={p.images?.[0] || "https://via.placeholder.com/200"} alt={p.name} className="w-full h-40 object-cover" />
                  {p.discount_percent > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{p.discount_percent}% OFF</div>
                  )}
                  <div className="absolute top-2 left-2 bg-[#0A1628]/80 text-[#D4AF37] text-xs px-2 py-1 rounded">{p.store_category || "Everyday Chic"}</div>
                  {p.video && <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-1"><Video size={12} className="text-white" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="text-[#F5F5F0] font-bold">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[#D4AF37] font-bold">₹{(p.discount_percent > 0 ? p.discounted_price : p.price)?.toLocaleString()}</p>
                    {p.discount_percent > 0 && <p className="text-[#A0A5B0] text-sm line-through">₹{p.price?.toLocaleString()}</p>}
                  </div>
                  {p.size && <p className="text-[#A0A5B0] text-sm">Size: {p.size}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditingProduct({...p, price: p.price.toString(), discount_percent: (p.discount_percent || 0).toString(), store_category: p.store_category || "Everyday Chic", images: p.images || [], video: p.video || ""})} className="flex-1 px-3 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded text-sm flex items-center justify-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
const HomePage = ({ user, talent, onLogout, heroImages, awards, ads, magazine, video, partyEvents }) => (
  <div className="min-h-screen bg-[#050A14]">
    <Navbar user={user} talent={talent} onLogout={onLogout} />
    
    {/* Main Content with Sticky Ads Sidebar */}
    <div className="flex">
      {/* Main Content Area */}
      <div className={ads && ads.length > 0 ? "w-full lg:w-[calc(100%-220px)]" : "w-full"}>
        
        {/* Hero Slider */}
        <HeroSlider customSlides={heroImages} />
        
        {/* Mobile Ads - smaller, shown below hero on mobile only */}
        {ads && ads.length > 0 && (
          <div className="lg:hidden bg-[#0A1628] py-3 border-y border-[#D4AF37]/20">
            <div className="container mx-auto px-4">
              <p className="text-[#A0A5B0] text-[10px] uppercase tracking-wider text-center mb-2">Sponsored</p>
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                {ads.map((ad, i) => (
                  <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-20">
                    <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full rounded border border-[#D4AF37]/10" />
                  </a>
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
        <div className="hidden lg:block w-[220px] bg-[#0A1628] border-l border-[#D4AF37]/20">
          <div className="sticky top-16 p-3 max-h-[calc(100vh-64px)] overflow-y-auto">
            <p className="text-[#A0A5B0] text-[10px] uppercase tracking-wider text-center mb-3">Sponsored</p>
            <div className="flex flex-col gap-3">
              {ads.map((ad, i) => (
                <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Bottom Ads Section - Horizontal with spacing (shown when there are many ads) */}
    {ads && ads.length > 3 && (
      <div className="bg-[#050A14] py-12 mt-8">
        <div className="container mx-auto px-4">
          <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center mb-6">Our Sponsors</p>
          <div className="flex flex-wrap justify-center gap-8">
            {ads.map((ad, i) => (
              <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="w-40 md:w-48">
                <img src={ad.image_data} alt={ad.title || "Ad"} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
              </a>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

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
    
    // Fetch public data
    Promise.all([
      axios.get(`${API}/hero-images`),
      axios.get(`${API}/awards?active_only=true`),
      axios.get(`${API}/advertisements`),
      axios.get(`${API}/magazine`),
      axios.get(`${API}/music`),
      axios.get(`${API}/video`),
      axios.get(`${API}/party-events`)
    ]).then(([h, a, ad, mag, mus, vid, party]) => {
      setHeroImages(h.data);
      setAwards(a.data);
      setAds(ad.data);
      setMagazine(mag.data?.id ? mag.data : null);
      if (mus.data?.id && mus.data?.file_data) {
        setMusic(mus.data);
      }
      if (vid.data?.id) {
        setVideo(vid.data);
      }
      setPartyEvents(party.data || []);
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
    <BrowserRouter>
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
        <Route path="/join" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><JoinPage /></>} />
        <Route path="/about" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AboutPage /></>} />
        <Route path="/designer-store" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><DesignerStorePageComponent /></>} />
        <Route path="/talents/:category" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentsPage ads={ads} /></>} />
        <Route path="/talent-dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentDashboard talent={talent} onUpdate={setTalent} /></>} />
        <Route path="/admin" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AdminDashboard /></>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

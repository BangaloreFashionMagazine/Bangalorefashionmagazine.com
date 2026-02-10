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
import { ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, Mail, Lock, User, Shield, Award, Image, Download, Star, Check, X, Phone, Instagram, Trash2, Vote, ExternalLink, Volume2, VolumeX, Music, Video, Upload } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// BFM Logo URL
const BFM_LOGO = "/bfm-logo.jpeg";

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

const TALENT_CATEGORIES = [
  "Model - Female",
  "Model - Male",
  "Designers",
  "Makeup & Hair",
  "Photography",
  "Event Management",
  "Other"
];

const DEFAULT_SLIDES = [
  { image: "https://images.unsplash.com/photo-1700150594432-7024e06005c4?w=1200", category: "Editorial", title: "Spring Collection 2025", subtitle: "Editorial Fashion Photography" },
  { image: "https://images.unsplash.com/photo-1700150624576-c6c0641e54fe?w=1200", category: "Haute Couture", title: "Haute Couture Series", subtitle: "Luxury Fashion Campaign" },
  { image: "https://images.unsplash.com/photo-1611232657592-dedbfa563955?w=1200", category: "Contemporary", title: "Modern Elegance", subtitle: "Contemporary Fashion" },
  { image: "https://images.unsplash.com/photo-1679503350214-b435e5e11813?w=1200", category: "Classic", title: "Timeless Beauty", subtitle: "Classic Fashion Photography" }
];

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
                  {TALENT_CATEGORIES.map(cat => (
                    <Link key={cat} to={`/talents/${encodeURIComponent(cat)}`} onClick={() => setShowTalentMenu(false)}
                      className="block px-4 py-2 text-sm text-[#A0A5B0] hover:text-[#D4AF37] hover:bg-[#050A14]">
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
              {TALENT_CATEGORIES.map(cat => (
                <Link key={cat} to={`/talents/${encodeURIComponent(cat)}`} onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 pl-4 text-sm text-[#A0A5B0]">{cat}</Link>
              ))}
            </div>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[#A0A5B0]">About Us</Link>
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
  
  return (
    <section className="py-10 bg-gradient-to-b from-[#0A1628] to-[#050A14]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">What's Happening</span>
          <h2 className="font-serif text-3xl font-bold text-[#F5F5F0] mt-2">Party Updates</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partyEvents.map((event, i) => (
            <div key={i} className="bg-[#0A1628] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all">
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
  
  return (
    <div className="w-full lg:w-64 space-y-4">
      <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center">Sponsored</p>
      {ads.map((ad, i) => (
        <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
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
          {/* Header with Name and Category */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider rounded mb-3">{talent.category}</span>
            <h2 className="font-serif text-3xl font-bold text-[#F5F5F0]">{talent.name}</h2>
          </div>
          
          {/* About Section - Only show if bio exists */}
          {talent.bio && (
            <div className="mb-6 text-center">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-2">About</h3>
              <p className="text-[#A0A5B0] max-w-2xl mx-auto">{talent.bio}</p>
            </div>
          )}
          
          {/* Voting Section */}
          <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-[#D4AF37]/20">
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
          
          {/* Photo Gallery - Profile + Portfolio Images */}
          <div>
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
            <div className="mt-6">
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase mb-1">{talent.category}</span>
        <h3 className="font-serif text-lg font-bold text-[#F5F5F0]">{talent.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] text-sm">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded hover:bg-[#D4AF37] hover:text-[#050A14] disabled:opacity-50">
            {voting ? "..." : "Vote"}
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

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/talents?approved_only=true&category=${encodeURIComponent(decodedCategory)}`)
      .then(res => {
        setTalents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [decodedCategory]);

  const handleVote = async (talentId) => {
    try {
      await axios.post(`${API}/vote`, { talent_id: talentId });
      toast({ title: "Vote recorded!" });
      // Refresh
      const res = await axios.get(`${API}/talents?approved_only=true&category=${encodeURIComponent(decodedCategory)}`);
      setTalents(res.data);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to vote", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold text-[#F5F5F0] mb-8">{decodedCategory || "All Talents"}</h1>
            {loading ? (
              <p className="text-[#A0A5B0]">Loading...</p>
            ) : talents.length === 0 ? (
              <p className="text-[#A0A5B0]">No approved talents in this category yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {talents.map(t => <TalentCard key={t.id} talent={t} onVote={handleVote} onClick={setSelectedTalent} />)}
              </div>
            )}
          </div>
          <AdvertisementSidebar ads={ads} />
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
          <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Username" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Password" />
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
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Password" />
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
    name: "", email: "", password: "", phone: "", instagram_id: "", category: "", bio: ""
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
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]">
              <option value="">Select Category</option>
              {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
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
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F0]">My Profile</h1>
            <p className="text-sm mt-1">
              Status: {talent.is_approved ? <span className="text-green-500">Approved ✓</span> : <span className="text-yellow-500">Pending Approval</span>}
            </p>
          </div>
          <button onClick={() => setEditing(!editing)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-[#050A14]">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <img src={formData.profile_image || "https://via.placeholder.com/200"} alt="" className="w-full aspect-square object-cover rounded-xl" />
            {editing && (
              <div className="mt-2">
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
                <p className="text-[#F5F5F0]"><strong>Category:</strong> {talent.category}</p>
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
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [allTalents, setAllTalents] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [ads, setAds] = useState([]);
  const [magazine, setMagazine] = useState(null);
  const [music, setMusic] = useState(null);
  const [partyEvents, setPartyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loadedTabs, setLoadedTabs] = useState({});
  const [categoryFilter, setCategoryFilter] = useState(""); // Category filter for All Talents
  const { toast } = useToast();

  // Forms
  const [newHero, setNewHero] = useState({ title: "", subtitle: "", category: "", order: 1, image_data: "" });
  const [newAward, setNewAward] = useState({ title: "", winner_name: "", winner_images: [], description: "", category: "", talent_id: "" });
  const [newAd, setNewAd] = useState({ title: "", link: "", order: 1, image_data: "" });
  const [newMagazine, setNewMagazine] = useState({ title: "", file_data: "", file_name: "" });
  const [newMusic, setNewMusic] = useState({ title: "", file_data: "", file_name: "" });
  const [newVideo, setNewVideo] = useState({ title: "", video_url: "", video_type: "youtube" });
  const [video, setVideo] = useState(null);
  const [newPartyEvent, setNewPartyEvent] = useState({ title: "", venue: "", event_date: "", description: "", image: "", entry_code: "", booking_info: "", contact: "", is_active: true });

  // Tab-specific data fetchers
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/talents/pending`);
      setPending(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAllTalents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/talents?approved_only=false&lightweight=true`);
      setAllTalents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hero-images`);
      setHeroImages(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/awards?active_only=false`);
      setAwards(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/advertisements`);
      setAds(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchMagazine = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/magazine`);
      setMagazine(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchMusic = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/music`);
      setMusic(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchVideo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/video`);
      setVideo(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchPartyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/party-events`);
      setPartyEvents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Load data for current tab
  const loadTabData = async (tabName, force = false) => {
    if (loadedTabs[tabName] && !force) return;
    
    switch(tabName) {
      case 'pending': await fetchPending(); break;
      case 'talents': await fetchAllTalents(); break;
      case 'hero': await fetchHeroImages(); break;
      case 'video': await fetchVideo(); break;
      case 'contests': await Promise.all([fetchAwards(), fetchAllTalents()]); break;
      case 'ads': await fetchAds(); break;
      case 'magazine': await fetchMagazine(); break;
      case 'music': await fetchMusic(); break;
      case 'party': await fetchPartyEvents(); break;
      default: break;
    }
    setLoadedTabs(prev => ({...prev, [tabName]: true}));
  };

  // Fetch pending on mount, then lazy-load other tabs
  useEffect(() => { loadTabData('pending'); }, []);
  
  // Load data when tab changes
  useEffect(() => { loadTabData(tab); }, [tab]);

  const approve = async (id) => { await axios.put(`${API}/admin/talent/${id}/approve`); toast({ title: "Approved!" }); fetchPending(); fetchAllTalents(); setSelectedTalent(null); };
  const reject = async (id) => { await axios.put(`${API}/admin/talent/${id}/reject`); toast({ title: "Rejected" }); fetchPending(); setSelectedTalent(null); };
  const updateRank = async (id, rank) => { 
    await axios.put(`${API}/admin/talent/${id}/rank?rank=${rank}`); 
    toast({ title: `Rank updated to ${rank}` });
    fetchAllTalents(); 
  };
  const deleteTalent = async (id) => { if (window.confirm("Delete?")) { await axios.delete(`${API}/admin/talent/${id}`); fetchPending(); fetchAllTalents(); setSelectedTalent(null); } };
  const exportTalents = () => window.open(`${API}/admin/talents/export`, '_blank');

  const openTalentDetail = async (talent) => {
    // Show immediately with existing data
    setSelectedTalent(talent);
    setEditData({...talent});
    setEditMode(false);
    
    // Fetch password in background
    try {
      const res = await axios.get(`${API}/admin/talent/${talent.id}/full`);
      setEditData(prev => ({...prev, password: res.data.password}));
    } catch (err) {
      console.error(err);
    }
  };

  const saveTalentEdit = async () => {
    try {
      await axios.put(`${API}/talent/${selectedTalent.id}`, editData);
      toast({ title: "Talent updated!" });
      fetchAllTalents();
      setSelectedTalent(null);
      setEditMode(false);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Update failed", variant: "destructive" });
    }
  };

  // Hero Images
  const handleHeroImg = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setNewHero({...newHero, image_data: r.result}); r.readAsDataURL(file); }
  };
  const addHero = async () => {
    if (!newHero.image_data || !newHero.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/hero-images`, newHero);
    setNewHero({ title: "", subtitle: "", category: "", order: heroImages.length + 1, image_data: "" });
    toast({ title: "Hero image added!" }); fetchHeroImages();
  };
  const deleteHero = async (id) => { await axios.delete(`${API}/admin/hero-images/${id}`); fetchHeroImages(); };
  const updateHeroOrder = async (id, order) => {
    await axios.put(`${API}/admin/hero-images/${id}`, { order });
    fetchHeroImages();
  };

  // Awards (Contest Winners)
  const addAward = async () => {
    if (!newAward.title || !newAward.winner_name || !(newAward.winner_images || []).length) { 
      toast({ title: "Please fill title, name and add at least 1 image", variant: "destructive" }); 
      return; 
    }
    await axios.post(`${API}/admin/awards`, {
      ...newAward, 
      winner_image: (newAward.winner_images || [])[0],
      talent_id: newAward.talent_id || ""
    });
    setNewAward({ title: "", winner_name: "", winner_images: [], description: "", category: "", talent_id: "" });
    toast({ title: "Winner added!" }); 
    fetchAwards();
  };
  const deleteAward = async (id) => { await axios.delete(`${API}/admin/awards/${id}`); fetchAwards(); };

  // Ads
  const handleAdImg = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setNewAd({...newAd, image_data: r.result}); r.readAsDataURL(file); }
  };
  const addAd = async () => {
    if (!newAd.image_data || !newAd.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/advertisements`, newAd);
    setNewAd({ title: "", link: "", order: ads.length + 1, image_data: "" });
    toast({ title: "Ad added!" }); fetchAds();
  };
  const deleteAd = async (id) => { await axios.delete(`${API}/admin/advertisements/${id}`); fetchAds(); };

  // Magazine
  const handleMagazineFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => setNewMagazine({...newMagazine, file_data: reader.result, file_name: file.name});
      reader.readAsDataURL(file);
    } else {
      toast({ title: "Please select a PDF file", variant: "destructive" });
    }
  };
  const uploadMagazine = async () => {
    if (!newMagazine.file_data || !newMagazine.title) { toast({ title: "Please add title and PDF file", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/magazine`, newMagazine);
    setNewMagazine({ title: "", file_data: "", file_name: "" });
    toast({ title: "Magazine uploaded!" }); fetchMagazine();
  };
  const deleteMagazine = async () => { 
    if (window.confirm("Delete magazine?")) {
      await axios.delete(`${API}/admin/magazine`); 
      fetchMagazine(); 
    }
  };

  // Music
  const handleMusicFile = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/wav")) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMusic({...newMusic, file_data: reader.result, file_name: file.name});
      reader.readAsDataURL(file);
    } else {
      toast({ title: "Please select an MP3 or WAV file", variant: "destructive" });
    }
  };
  const uploadMusic = async () => {
    if (!newMusic.file_data || !newMusic.title) { toast({ title: "Please add title and audio file", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/music`, newMusic);
    setNewMusic({ title: "", file_data: "", file_name: "" });
    toast({ title: "Music uploaded!" }); fetchMusic();
  };
  const deleteMusic = async () => { 
    if (window.confirm("Delete music?")) {
      await axios.delete(`${API}/admin/music`); 
      fetchMusic(); 
    }
  };

  // Video
  const uploadVideo = async () => {
    if (!newVideo.video_url || !newVideo.title) { toast({ title: "Please add title and video URL", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/video`, newVideo);
    setNewVideo({ title: "", video_url: "", video_type: "youtube" });
    toast({ title: "Video uploaded!" }); fetchVideo();
  };
  const deleteVideo = async () => { 
    if (window.confirm("Delete video?")) {
      await axios.delete(`${API}/admin/video`); 
      fetchVideo(); 
    }
  };

  const tabs = [
    { id: "pending", label: "Pending", icon: Users },
    { id: "talents", label: "All Talents", icon: Star },
    { id: "hero", label: "Hero Images", icon: Image },
    { id: "party", label: "Party Updates", icon: Calendar },
    { id: "video", label: "Featured Video", icon: Video },
    { id: "contests", label: "Contest & Winners", icon: Award },
    { id: "ads", label: "Advertisements", icon: ExternalLink },
    { id: "magazine", label: "Magazine", icon: Download },
    { id: "music", label: "Background Music", icon: Music },
    { id: "export", label: "Export", icon: Download }
  ];

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-6">Admin Dashboard</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm ${tab === t.id ? "bg-[#D4AF37] text-[#050A14]" : "bg-[#0A1628] text-[#A0A5B0]"}`}>
              <t.icon size={16} /> {t.label}
              {t.id === "pending" && pending.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pending.length}</span>}
            </button>
          ))}
        </div>

        {/* Pending */}
        {tab === "pending" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Pending Approvals</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Click on a profile to view full details before approving.</p>
            {loading ? <p className="text-[#A0A5B0]">Loading...</p> : pending.length === 0 ? <p className="text-[#A0A5B0]">No pending registrations</p> : (
              <div className="space-y-4">
                {pending.map(t => (
                  <div key={t.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                    <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#0D1B2A] transition-colors" onClick={() => openTalentDetail(t)}>
                      <img src={t.profile_image || "https://via.placeholder.com/80"} className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]/30" />
                      <div className="flex-1">
                        <p className="text-[#F5F5F0] font-bold text-lg">{t.name}</p>
                        <p className="text-[#D4AF37] text-sm">{t.category}</p>
                        <p className="text-[#A0A5B0] text-xs mt-1">{t.email} • {t.phone || "No phone"}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {t.agreed_to_terms ? (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                              <Check size={14} /> Terms Agreed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-sm">
                              <X size={14} /> Terms NOT Agreed
                            </span>
                          )}
                        </div>
                        <p className="text-[#A0A5B0] text-xs">
                          {t.portfolio_images?.length || 0} portfolio images
                        </p>
                      </div>
                    </div>
                    <div className="flex border-t border-[#D4AF37]/10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openTalentDetail(t); }} 
                        className="flex-1 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-sm font-medium"
                      >
                        View Full Details
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); approve(t.id); }} 
                        className="flex-1 py-3 text-green-500 hover:bg-green-500/10 transition-colors text-sm font-medium border-l border-[#D4AF37]/10"
                      >
                        <Check size={16} className="inline mr-1" /> Approve
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); reject(t.id); }} 
                        className="flex-1 py-3 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium border-l border-[#D4AF37]/10"
                      >
                        <X size={16} className="inline mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Talents */}
        {tab === "talents" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20 overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F0]">All Talents</h2>
                <p className="text-[#A0A5B0] text-sm">Change rank number and press Enter or click outside to save. Lower rank = shown first.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[#A0A5B0] text-sm">Filter by Category:</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                >
                  <option value="">All Categories</option>
                  {TALENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                <span className="ml-3 text-[#A0A5B0]">Loading talents...</span>
              </div>
            ) : allTalents.filter(t => !categoryFilter || t.category === categoryFilter).length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">{categoryFilter ? `No talents found in "${categoryFilter}" category.` : "No talents found."}</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#A0A5B0]">
                  <th className="pb-2">Rank</th><th className="pb-2">Name</th><th className="pb-2">Category</th><th className="pb-2">Status</th><th className="pb-2">Terms</th><th className="pb-2">Votes</th><th className="pb-2">Actions</th>
                </tr></thead>
                <tbody>
                  {allTalents
                    .filter(t => !categoryFilter || t.category === categoryFilter)
                    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                    .map(t => (
                    <tr key={t.id} className="border-t border-[#D4AF37]/10">
                      <td className="py-2">
                        <input 
                          type="number" 
                          defaultValue={t.rank} 
                          onBlur={e => { const val = parseInt(e.target.value); if (val !== t.rank) updateRank(t.id, val || 999); }}
                          onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } }}
                          className="w-16 px-2 py-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-center" 
                        />
                      </td>
                      <td className="py-2"><button onClick={() => openTalentDetail(t)} className="text-[#D4AF37] hover:underline font-medium">{t.name}</button></td>
                      <td className="py-2 text-[#A0A5B0]">{t.category}</td>
                      <td className="py-2">{t.is_approved ? <span className="text-green-500">Approved</span> : <span className="text-yellow-500">Pending</span>}</td>
                      <td className="py-2">{t.agreed_to_terms ? <span className="text-green-500" title={`Agreed on ${t.agreed_at ? new Date(t.agreed_at).toLocaleDateString() : 'N/A'}`}><Check size={16} /></span> : <span className="text-red-400" title="Not agreed"><X size={16} /></span>}</td>
                      <td className="py-2 text-[#D4AF37]">{t.votes}</td>
                      <td className="py-2">
                        {!t.is_approved && <button onClick={() => approve(t.id)} className="p-1 text-green-500 mr-2"><Check size={16} /></button>}
                        <button onClick={() => deleteTalent(t.id)} className="p-1 text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Talent Detail Modal for Admin */}
        {selectedTalent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedTalent(null)}>
            <div className="bg-[#0A1628] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20 relative" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold text-[#F5F5F0]">Talent Details</h2>
                  <div className="flex gap-2 items-center">
                    {!editMode ? (
                      <button data-testid="edit-talent-btn" onClick={(e) => { e.stopPropagation(); setEditMode(true); }} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Edit</button>
                    ) : (
                      <>
                        <button data-testid="save-talent-btn" onClick={(e) => { e.stopPropagation(); saveTalentEdit(); }} className="px-4 py-2 bg-green-500 text-white rounded font-bold">Save</button>
                        <button data-testid="cancel-edit-btn" onClick={(e) => { e.stopPropagation(); setEditMode(false); setEditData({...selectedTalent}); }} className="px-4 py-2 bg-gray-500 text-white rounded font-bold">Cancel</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div>
                    <img src={editData.profile_image || "https://via.placeholder.com/400"} alt={editData.name} className="w-full aspect-[3/4] object-cover rounded-xl" />
                    {editMode && (
                      <div className="mt-2">
                        <label className="text-[#A0A5B0] text-sm">Change Profile Image</label>
                        <input type="file" accept="image/*" onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditData({...editData, profile_image: reader.result});
                            reader.readAsDataURL(file);
                          }
                        }} className="text-[#A0A5B0] text-sm mt-1" />
                      </div>
                    )}
                    
                    {/* Portfolio Images */}
                    <div className="mt-4">
                      <p className="text-[#D4AF37] text-sm uppercase mb-2">Portfolio ({(editData.portfolio_images || []).length}/7 images)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(editData.portfolio_images || []).map((img, i) => (
                          <div key={i} className="relative group">
                            <img src={img} alt={`Portfolio ${i+1}`} className="w-full aspect-square object-cover rounded" />
                            {editMode && (
                              <button onClick={() => setEditData({...editData, portfolio_images: editData.portfolio_images.filter((_, idx) => idx !== i)})} 
                                className="absolute top-0 right-0 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100">
                                <X size={12} className="text-white" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {editMode && (editData.portfolio_images || []).length < 7 && (
                        <input type="file" accept="image/*" multiple onChange={e => {
                          const files = Array.from(e.target.files);
                          const currentCount = (editData.portfolio_images || []).length;
                          if (currentCount + files.length > 7) {
                            toast({ title: "Max 7 portfolio images", variant: "destructive" });
                            return;
                          }
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditData(prev => ({...prev, portfolio_images: [...(prev.portfolio_images || []), reader.result].slice(0, 7)}));
                            reader.readAsDataURL(file);
                          });
                        }} className="text-[#A0A5B0] text-sm mt-2" />
                      )}
                    </div>

                    {/* Portfolio Video */}
                    <div className="mt-4">
                      <p className="text-[#D4AF37] text-sm uppercase mb-2">Portfolio Video (max 45 sec)</p>
                      {editData.portfolio_video ? (
                        <div>
                          <video src={editData.portfolio_video} controls className="w-full max-h-32 rounded bg-black" />
                          {editMode && (
                            <button onClick={() => setEditData({...editData, portfolio_video: ""})} className="text-red-500 text-sm mt-1">Remove Video</button>
                          )}
                        </div>
                      ) : (
                        editMode ? (
                          <input type="file" accept="video/*" onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = () => {
                              if (video.duration > 45) {
                                toast({ title: "Video must be 45 seconds or less", variant: "destructive" });
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => setEditData(prev => ({...prev, portfolio_video: reader.result}));
                              reader.readAsDataURL(file);
                            };
                            video.src = URL.createObjectURL(file);
                          }} className="text-[#A0A5B0] text-sm" />
                        ) : <p className="text-[#A0A5B0] text-sm">No video uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Details Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#A0A5B0] text-sm">Name</label>
                      {editMode ? (
                        <input type="text" value={editData.name || ""} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0] text-lg font-bold">{editData.name}</p>
                      )}
                    </div>

                    {/* Login Credentials Section */}
                    <div className="p-3 bg-[#050A14] rounded-lg border border-[#D4AF37]/30">
                      <p className="text-[#D4AF37] text-xs uppercase mb-2">Login Credentials</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[#A0A5B0] text-xs">Email (Username)</label>
                          <p className="text-[#F5F5F0] font-mono text-sm">{editData.email}</p>
                        </div>
                        <div>
                          <label className="text-[#A0A5B0] text-xs">Password</label>
                          <p className="text-[#F5F5F0] font-mono text-sm bg-[#0A1628] px-2 py-1 rounded">{editData.password || "Not available"}</p>
                        </div>
                        {/* Password Reset - Always visible */}
                        <div className="mt-2 pt-2 border-t border-[#D4AF37]/20">
                          <label className="text-[#A0A5B0] text-xs">Set New Password</label>
                          <input type="text" placeholder="Enter new password (min 6 chars)" id={`newpw-${editData.id}`}
                            className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm mt-1" />
                          <button onClick={async () => {
                            const pwInput = document.getElementById(`newpw-${editData.id}`);
                            const newPw = pwInput?.value;
                            if (!newPw || newPw.length < 6) {
                              toast({ title: "Password must be at least 6 characters", variant: "destructive" });
                              return;
                            }
                            try {
                              await axios.put(`${API}/admin/talent/${editData.id}/password`, { password: newPw });
                              toast({ title: "Password updated successfully!" });
                              setEditData({...editData, password: newPw});
                              pwInput.value = '';
                            } catch (err) {
                              toast({ title: "Failed to update password", description: err.response?.data?.detail || "Unknown error", variant: "destructive" });
                            }
                          }} className="mt-2 px-3 py-1 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold hover:bg-[#F5F5F0]">
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Phone</label>
                      {editMode ? (
                        <input type="text" value={editData.phone || ""} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0]">{editData.phone || "N/A"}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Instagram</label>
                      {editMode ? (
                        <input type="text" value={editData.instagram_id || ""} onChange={e => setEditData({...editData, instagram_id: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0]">{editData.instagram_id || "N/A"}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Category</label>
                      {editMode ? (
                        <select value={editData.category || ""} onChange={e => setEditData({...editData, category: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                          {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <p className="text-[#D4AF37]">{editData.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Bio</label>
                      {editMode ? (
                        <textarea value={editData.bio || ""} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] h-24" />
                      ) : (
                        <p className="text-[#A0A5B0]">{editData.bio || "No bio"}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#A0A5B0] text-sm">Rank</label>
                        <p className="text-[#F5F5F0]">{editData.rank}</p>
                      </div>
                      <div>
                        <label className="text-[#A0A5B0] text-sm">Votes</label>
                        <p className="text-[#D4AF37] font-bold">{editData.votes}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Status</label>
                      <p className={editData.is_approved ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>
                        {editData.is_approved ? "Approved" : "Pending Approval"}
                      </p>
                    </div>

                    {/* Declaration Agreement Status */}
                    <div className="p-3 bg-[#050A14] rounded-lg border border-[#D4AF37]/20">
                      <label className="text-[#A0A5B0] text-sm">Declaration & Consent</label>
                      {editData.agreed_to_terms ? (
                        <div className="mt-1">
                          <p className="text-green-500 font-bold flex items-center gap-2">
                            <Check size={16} /> Agreed to Terms
                          </p>
                          <p className="text-[#A0A5B0] text-xs mt-1">
                            Agreed on: {editData.agreed_at ? new Date(editData.agreed_at).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-400 font-bold mt-1">Not Agreed (Old registration)</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[#D4AF37]/20">
                      {!editData.is_approved && (
                        <button onClick={() => approve(editData.id)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-bold flex items-center justify-center gap-2">
                          <Check size={18} /> Approve
                        </button>
                      )}
                      {editData.is_approved && (
                        <button onClick={() => reject(editData.id)} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded font-bold">
                          Revoke Approval
                        </button>
                      )}
                      <button onClick={() => deleteTalent(editData.id)} className="px-4 py-2 bg-red-500 text-white rounded font-bold flex items-center gap-2">
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Images */}
        {tab === "hero" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Hero Slider Images ({heroImages.length}/10)</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add up to 10 images for the homepage slider. Lower order number = displayed first.</p>
            {heroImages.length < 10 && (
              <>
                <div className="grid md:grid-cols-4 gap-3 mb-4">
                  <input type="text" placeholder="Title" value={newHero.title} onChange={e => setNewHero({...newHero, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                  <input type="text" placeholder="Subtitle" value={newHero.subtitle} onChange={e => setNewHero({...newHero, subtitle: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                  <input type="text" placeholder="Category" value={newHero.category} onChange={e => setNewHero({...newHero, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                  <input type="number" placeholder="Order (1=first)" value={newHero.order} onChange={e => setNewHero({...newHero, order: parseInt(e.target.value) || 1})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <ImageUploadWithCrop 
                    onImageSelect={(img) => setNewHero({...newHero, image_data: img})} 
                    aspectRatio={16/9}
                    buttonText="Choose Hero Image"
                  />
                  {newHero.image_data && <img src={newHero.image_data} className="h-16 rounded" alt="Preview" />}
                  <button onClick={addHero} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add</button>
                </div>
              </>
            )}
            {heroImages.length >= 10 && (
              <p className="text-yellow-500 text-sm mb-4">Maximum 10 hero images reached. Delete some to add more.</p>
            )}
            {heroImages.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">No hero images added yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {heroImages.sort((a, b) => (a.order || 99) - (b.order || 99)).map(h => (
                  <div key={h.id} className="bg-[#050A14] rounded-lg overflow-hidden">
                    <img src={h.image_data} className="w-full h-24 object-cover" alt={h.title} />
                    <div className="p-2">
                      <p className="text-[#F5F5F0] font-medium text-xs truncate">{h.title || "No title"}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[#A0A5B0] text-xs">Order:</span>
                        <input type="number" value={h.order || 1} onChange={e => updateHeroOrder(h.id, parseInt(e.target.value) || 1)} 
                          className="w-12 px-1 py-0.5 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-xs text-center" />
                        <button onClick={() => deleteHero(h.id)} className="ml-auto p-1 text-red-500 hover:bg-red-500/20 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Video */}
        {tab === "video" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Featured Video</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add a YouTube or Vimeo video to display below the hero slider on homepage.</p>
            
            {video ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Video:</p>
                <p className="text-[#F5F5F0]">{video.title}</p>
                <p className="text-[#A0A5B0] text-sm">{video.video_type === "youtube" ? "YouTube" : "Vimeo"}</p>
                <div className="mt-3 aspect-video max-w-md">
                  {video.video_type === "youtube" && (
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.video_url.includes("youtu.be") ? video.video_url.split("/").pop().split("?")[0] : video.video_url.includes("v=") ? video.video_url.split("v=")[1].split("&")[0] : video.video_url}`}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  )}
                  {video.video_type === "vimeo" && (
                    <iframe 
                      src={`https://player.vimeo.com/video/${video.video_url.split("/").pop()}`}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  )}
                </div>
                <button onClick={deleteVideo} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Delete Video
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No video added yet.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Video Title (e.g. BFM Fashion Show 2024)" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <select value={newVideo.video_type} onChange={e => setNewVideo({...newVideo, video_type: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
              <input type="text" placeholder="Video URL (e.g. https://www.youtube.com/watch?v=xxxxx)" value={newVideo.video_url} onChange={e => setNewVideo({...newVideo, video_url: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <button onClick={uploadVideo} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Video size={18} /> Add Video
              </button>
            </div>
          </div>
        )}

        {/* Party Updates */}
        {tab === "party" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Party Updates & Events</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add party events, entry codes for bookers, and booking info. Only active events show on homepage.</p>
            
            {/* Add New Party Event Form */}
            <div className="bg-[#050A14] rounded-lg p-4 mb-6 border border-[#D4AF37]/10">
              <h3 className="text-[#D4AF37] font-bold mb-4">Add New Party Event</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <input type="text" placeholder="Event Title *" value={newPartyEvent.title} onChange={e => setNewPartyEvent({...newPartyEvent, title: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Venue *" value={newPartyEvent.venue} onChange={e => setNewPartyEvent({...newPartyEvent, venue: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Event Date * (e.g. Feb 15, 2026)" value={newPartyEvent.event_date} onChange={e => setNewPartyEvent({...newPartyEvent, event_date: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Entry Code (e.g. BFM2026)" value={newPartyEvent.entry_code} onChange={e => setNewPartyEvent({...newPartyEvent, entry_code: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Contact Info (e.g. Call 9876543210)" value={newPartyEvent.contact} onChange={e => setNewPartyEvent({...newPartyEvent, contact: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Booking Info (e.g. Book via website)" value={newPartyEvent.booking_info} onChange={e => setNewPartyEvent({...newPartyEvent, booking_info: e.target.value})} 
                  className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              </div>
              <textarea placeholder="Description (optional)" value={newPartyEvent.description} onChange={e => setNewPartyEvent({...newPartyEvent, description: e.target.value})} 
                className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-4 h-20" />
              <div className="flex items-center gap-4 mb-4">
                <ImageUploadWithCrop 
                  onImageSelect={(img) => setNewPartyEvent({...newPartyEvent, image: img})} 
                  buttonText="Add Event Image"
                />
                {newPartyEvent.image && <img src={newPartyEvent.image} className="h-16 rounded" alt="Preview" />}
              </div>
              <button onClick={async () => {
                if (!newPartyEvent.title || !newPartyEvent.venue || !newPartyEvent.event_date) {
                  toast({ title: "Please fill title, venue and date", variant: "destructive" });
                  return;
                }
                await axios.post(`${API}/admin/party-events`, newPartyEvent);
                setNewPartyEvent({ title: "", venue: "", event_date: "", description: "", image: "", entry_code: "", booking_info: "", contact: "", is_active: true });
                toast({ title: "Party event added!" });
                fetchPartyEvents();
              }} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Event</button>
            </div>

            {/* Existing Events */}
            {partyEvents.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">No party events added yet. Add one above to show on homepage.</p>
            ) : (
              <div className="space-y-4">
                {partyEvents.map(event => (
                  <div key={event.id} className={`bg-[#050A14] rounded-lg overflow-hidden border ${event.is_active ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <div className="flex gap-4 p-4">
                      {event.image && <img src={event.image} className="w-24 h-24 object-cover rounded" alt={event.title} />}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-[#F5F5F0] font-bold">{event.title}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded ${event.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {event.is_active ? 'Active' : 'Hidden'}
                          </span>
                          {event.entry_code && <span className="px-2 py-0.5 bg-[#D4AF37] text-[#050A14] text-xs font-bold rounded">Entry: {event.entry_code}</span>}
                        </div>
                        <p className="text-[#D4AF37] text-sm">{event.event_date} • {event.venue}</p>
                        {event.description && <p className="text-[#A0A5B0] text-sm mt-1">{event.description}</p>}
                        {event.booking_info && <p className="text-[#A0A5B0] text-xs mt-1">Booking: {event.booking_info}</p>}
                        {event.contact && <p className="text-[#A0A5B0] text-xs">Contact: {event.contact}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={async () => {
                          await axios.put(`${API}/admin/party-events/${event.id}`, { is_active: !event.is_active });
                          toast({ title: event.is_active ? "Event hidden" : "Event activated" });
                          fetchPartyEvents();
                        }} className={`px-3 py-1 text-xs rounded ${event.is_active ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                          {event.is_active ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={async () => {
                          if (window.confirm("Delete this event?")) {
                            await axios.delete(`${API}/admin/party-events/${event.id}`);
                            toast({ title: "Event deleted" });
                            fetchPartyEvents();
                          }
                        }} className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contest & Winners */}
        {tab === "contests" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Contest & Winners (Model of the Week)</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add contest winners with up to 5 images each. Link to a talent profile to make the winner card clickable.</p>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <input type="text" placeholder="Contest Title (e.g. Model of the Week)" value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Winner Name" value={newAward.winner_name} onChange={e => setNewAward({...newAward, winner_name: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Category" value={newAward.category} onChange={e => setNewAward({...newAward, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Description" value={newAward.description} onChange={e => setNewAward({...newAward, description: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Link to Talent Profile (click on winner card leads to profile)</label>
              <select 
                value={newAward.talent_id || ""} 
                onChange={e => setNewAward({...newAward, talent_id: e.target.value})}
                className="w-full md:w-1/2 px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
              >
                <option value="">-- No linked profile (not clickable) --</option>
                {allTalents.filter(t => t.is_approved).map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.category}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Winner Images (up to 5)</label>
              <div className="flex flex-wrap gap-3 items-center">
                {(newAward.winner_images || []).map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} className="h-20 w-16 object-cover rounded" alt={`Image ${i+1}`} />
                    <button onClick={() => setNewAward({...newAward, winner_images: (newAward.winner_images || []).filter((_, idx) => idx !== i)})} 
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"><X size={12} /></button>
                  </div>
                ))}
                {(newAward.winner_images || []).length < 5 && (
                  <ImageUploadWithCrop 
                    onImageSelect={(img) => setNewAward({...newAward, winner_images: [...(newAward.winner_images || []), img]})} 
                    aspectRatio={3/4}
                    buttonText={`Add Image (${(newAward.winner_images || []).length}/5)`}
                  />
                )}
              </div>
            </div>
            <button onClick={addAward} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Winner</button>
            
            {awards.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8 mt-6">No contest winners added yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {awards.map(a => (
                  <div key={a.id} className="bg-[#050A14] rounded overflow-hidden">
                    <div className="flex gap-1 p-2 bg-[#0A1628]">
                      {(a.winner_images || [a.winner_image]).filter(Boolean).slice(0, 5).map((img, i) => (
                        <img key={i} src={img} alt={`${a.winner_name} ${i+1}`} className="h-24 w-20 object-cover rounded" />
                      ))}
                    </div>
                    <div className="p-3">
                      <p className="text-[#D4AF37] text-sm">{a.title}</p>
                      <p className="text-[#F5F5F0] font-bold">{a.winner_name}</p>
                      {a.category && <p className="text-[#A0A5B0] text-xs">{a.category}</p>}
                      {a.talent_id && <p className="text-green-500 text-xs mt-1">✓ Linked to profile</p>}
                      {!a.talent_id && <p className="text-yellow-500 text-xs mt-1">Not linked to profile</p>}
                      <button onClick={() => deleteAward(a.id)} className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ads */}
        {tab === "ads" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Advertisements</h2>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <input type="text" placeholder="Title" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Link (optional)" value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Order" value={newAd.order} onChange={e => setNewAd({...newAd, order: parseInt(e.target.value)})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <ImageUploadWithCrop 
                onImageSelect={(img) => setNewAd({...newAd, image_data: img})} 
                buttonText="Choose Ad Image"
              />
              {newAd.image_data && <img src={newAd.image_data} className="h-16 rounded" alt="Preview" />}
              <button onClick={addAd} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Ad</button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {ads.map(a => (
                <div key={a.id} className="relative group">
                  <img src={a.image_data} className="w-full h-32 object-cover rounded" alt={a.title} />
                  <button onClick={() => deleteAd(a.id)} className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100"><Trash2 size={14} className="text-white" /></button>
                  <p className="text-[#F5F5F0] text-sm mt-1">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Magazine */}
        {tab === "magazine" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Monthly Magazine</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Upload your monthly magazine PDF. This will be available for download on the homepage.</p>
            
            {magazine ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Magazine:</p>
                <p className="text-[#F5F5F0]">{magazine.title}</p>
                <p className="text-[#A0A5B0] text-sm">{magazine.file_name}</p>
                <p className="text-[#A0A5B0] text-xs mt-1">Uploaded: {new Date(magazine.created_at).toLocaleDateString()}</p>
                <button onClick={deleteMagazine} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Delete Magazine
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No magazine uploaded yet.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Magazine Title (e.g. January 2026 Edition)" value={newMagazine.title} onChange={e => setNewMagazine({...newMagazine, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <div>
                <input type="file" accept="application/pdf" onChange={handleMagazineFile} className="text-[#A0A5B0]" />
                {newMagazine.file_name && <p className="text-[#D4AF37] text-sm mt-2">Selected: {newMagazine.file_name}</p>}
              </div>
              <button onClick={uploadMagazine} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Download size={18} /> Upload Magazine
              </button>
            </div>
          </div>
        )}

        {/* Background Music */}
        {tab === "music" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Background Music</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Upload background music that plays when visitors browse the site. They can mute it if they want.</p>
            
            {music ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Music:</p>
                <p className="text-[#F5F5F0]">{music.title}</p>
                <p className="text-[#A0A5B0] text-sm">{music.file_name}</p>
                <audio controls className="mt-2 w-full">
                  <source src={music.file_data} type="audio/mpeg" />
                </audio>
                <button onClick={deleteMusic} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Delete Music
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No background music uploaded yet.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Music Title (e.g. Chill Beats)" value={newMusic.title} onChange={e => setNewMusic({...newMusic, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <div>
                <input type="file" accept="audio/mp3,audio/mpeg,audio/wav" onChange={handleMusicFile} className="text-[#A0A5B0]" />
                {newMusic.file_name && <p className="text-[#D4AF37] text-sm mt-2">Selected: {newMusic.file_name}</p>}
              </div>
              <button onClick={uploadMusic} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Music size={18} /> Upload Music
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        {tab === "export" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Export Talent Data</h2>
            <p className="text-[#A0A5B0] mb-4">Download all talents: Name, Email, Phone, Instagram, Category, Status, Rank, Votes</p>
            <button onClick={exportTalents} className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold">
              <Download size={18} /> Download CSV
            </button>
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
    <HeroSlider customSlides={heroImages} />
    
    {/* Party Updates Section - Only visible when there are active events */}
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

    {/* Magazine Download Section */}
    {magazine && magazine.file_data && (
      <div className="bg-[#050A14] py-8 border-b border-[#D4AF37]/20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-[#D4AF37] font-serif text-xl mb-2">Download Our Latest Magazine</h3>
          <p className="text-[#F5F5F0] text-lg mb-4">{magazine.title}</p>
          <a href={magazine.file_data} download={magazine.file_name || "magazine.pdf"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors">
            <Download size={20} /> Download PDF
          </a>
        </div>
      </div>
    )}

    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <ContestWinnersSection awards={awards} />
        </div>
        {ads && ads.length > 0 && (
          <div className="w-full lg:w-72 py-8">
            <div className="sticky top-20">
              <p className="text-[#A0A5B0] text-xs uppercase tracking-wider text-center mb-4">Sponsored</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {ads.map((ad, i) => (
                  <a key={i} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={ad.image_data} alt={ad.title || "Advertisement"} className="w-full rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
        <Route path="/talents/:category" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentsPage ads={ads} /></>} />
        <Route path="/talent-dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentDashboard talent={talent} onUpdate={setTalent} /></>} />
        <Route path="/admin" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AdminDashboard /></>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

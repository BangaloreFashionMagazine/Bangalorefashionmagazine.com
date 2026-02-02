import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, Mail, Lock, User, Shield, Award, Image, Download, Star, Check, X, Phone, Instagram, Trash2, Vote, ExternalLink } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TALENT_CATEGORIES = [
  "Model - Female",
  "Model - Male",
  "Designers",
  "Makeup & Hair",
  "Photography",
  "Event Management"
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
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#F5F5F0]">BFM</span>
            <span className="font-serif text-lg text-[#D4AF37]">Magazine</span>
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

// Awards Section (only shows if awards exist)
const AwardsSection = ({ awards }) => {
  if (!awards || awards.length === 0) return null;
  
  return (
    <section className="py-16 bg-gradient-to-b from-[#050A14] to-[#0A1628]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">Recognition</span>
          <h2 className="font-serif text-3xl font-bold text-[#F5F5F0] mt-2">Awards & Achievements</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, i) => (
            <div key={i} className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
              {award.winner_image && (
                <img src={award.winner_image} alt={award.winner_name} className="w-full h-64 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-[#D4AF37]" size={18} />
                  <span className="text-[#D4AF37] text-sm uppercase">{award.title}</span>
                </div>
                <h3 className="text-[#F5F5F0] font-bold text-xl">{award.winner_name}</h3>
                {award.description && <p className="text-[#A0A5B0] text-sm mt-1">{award.description}</p>}
              </div>
            </div>
          ))}
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
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!talent) return null;

  const handleVote = async () => {
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Combine profile image with portfolio for gallery display
  const allImages = [talent.profile_image, ...(talent.portfolio_images || [])].filter(Boolean);

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
                <img 
                  key={i} 
                  src={img} 
                  alt={`${talent.name} - Photo ${i + 1}`} 
                  className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
            {allImages.length === 0 && (
              <p className="text-[#A0A5B0] text-center py-8">No photos available</p>
            )}
          </div>
        </div>
        
        {/* Full Image View Overlay */}
        {selectedImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
              <X size={24} />
            </button>
          </div>
        )}
      </div>
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
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img src={talent.profile_image || "https://via.placeholder.com/300x400"} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase mb-1">{talent.category}</span>
        <h3 className="font-serif text-lg font-bold text-[#F5F5F0]">{talent.name}</h3>
        {talent.instagram_id && (
          <p className="text-[#A0A5B0] text-xs flex items-center gap-1">
            <Instagram size={12} /> @{talent.instagram_id}
          </p>
        )}
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
const TalentsPage = ({ category, ads }) => {
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const { toast } = useToast();
  const decodedCategory = decodeURIComponent(category);

  useEffect(() => {
    axios.get(`${API}/talents?approved_only=true&category=${encodeURIComponent(decodedCategory)}`)
      .then(res => setTalents(res.data))
      .catch(err => console.error(err));
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
            <h1 className="font-serif text-3xl font-bold text-[#F5F5F0] mb-8">{decodedCategory}</h1>
            {talents.length === 0 ? (
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
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" placeholder="Email" />
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
          <Link to="/forgot-password" className="text-[#D4AF37] text-sm hover:underline">Forgot Password?</Link>
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

// Join Us (Talent Registration)
const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", instagram_id: "", category: "Model - Female", bio: ""
  });
  const [profileImage, setProfileImage] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileImage) {
      toast({ title: "Error", description: "Profile image is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/talent/register`, { ...formData, profile_image: profileImage, portfolio_images: portfolio });
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
              {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
            className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-20" placeholder="Bio (optional)" />
          
          <div>
            <label className="text-[#A0A5B0] text-sm mb-2 block">Profile Image * (Required)</label>
            <input type="file" accept="image/*" onChange={handleProfileImage} className="text-[#A0A5B0]" />
            {profileImage && <img src={profileImage} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />}
          </div>
          
          <div>
            <label className="text-[#A0A5B0] text-sm mb-2 block">Portfolio Images ({portfolio.length}/7)</label>
            <input type="file" accept="image/*" multiple onChange={handlePortfolio} className="text-[#A0A5B0]" disabled={portfolio.length >= 7} />
            <div className="flex flex-wrap gap-2 mt-2">
              {portfolio.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-16 object-cover rounded" />
                  <button type="button" onClick={() => removePortfolio(i)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-[#A0A5B0] text-sm">Already registered? <Link to="/talent-login" className="text-[#D4AF37]">Login</Link></p>
      </div>
    </div>
  );
};

// Talent Dashboard
const TalentDashboard = ({ talent, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(talent || {});
  const [portfolio, setPortfolio] = useState(talent?.portfolio_images || []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (talent) {
      setFormData(talent);
      setPortfolio(talent.portfolio_images || []);
    }
  }, [talent]);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/talent/${talent.id}`, {
        name: formData.name, phone: formData.phone, instagram_id: formData.instagram_id,
        category: formData.category, bio: formData.bio, profile_image: formData.profile_image,
        portfolio_images: portfolio
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
            {editing && <input type="file" accept="image/*" onChange={handleProfileImage} className="mt-2 text-[#A0A5B0] text-sm" />}
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
                  <p className="text-[#A0A5B0] text-sm mb-2">Portfolio ({portfolio.length}/7)</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {portfolio.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="h-16 w-16 object-cover rounded" />
                        <button type="button" onClick={() => removePortfolio(i)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {portfolio.length < 7 && <input type="file" accept="image/*" multiple onChange={handlePortfolioAdd} className="text-[#A0A5B0] text-sm" />}
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
                    <p className="text-[#A0A5B0] text-sm mb-2">Portfolio</p>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.map((img, i) => <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded" />)}
                    </div>
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Forms
  const [newHero, setNewHero] = useState({ title: "", subtitle: "", category: "", order: 1, image_data: "" });
  const [newAward, setNewAward] = useState({ title: "", winner_name: "", winner_image: "", description: "", category: "" });
  const [newAd, setNewAd] = useState({ title: "", link: "", order: 1, image_data: "" });

  const fetchData = async () => {
    try {
      const [p, a, h, aw, ad] = await Promise.all([
        axios.get(`${API}/admin/talents/pending`),
        axios.get(`${API}/talents?approved_only=false`),
        axios.get(`${API}/hero-images`),
        axios.get(`${API}/awards?active_only=false`),
        axios.get(`${API}/advertisements`)
      ]);
      setPending(p.data);
      setAllTalents(a.data);
      setHeroImages(h.data);
      setAwards(aw.data);
      setAds(ad.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (id) => { await axios.put(`${API}/admin/talent/${id}/approve`); toast({ title: "Approved!" }); fetchData(); };
  const reject = async (id) => { await axios.put(`${API}/admin/talent/${id}/reject`); toast({ title: "Rejected" }); fetchData(); };
  const updateRank = async (id, rank) => { await axios.put(`${API}/admin/talent/${id}/rank?rank=${rank}`); fetchData(); };
  const deleteTalent = async (id) => { if (window.confirm("Delete?")) { await axios.delete(`${API}/admin/talent/${id}`); fetchData(); } };
  const exportTalents = () => window.open(`${API}/admin/talents/export`, '_blank');

  // Hero Images
  const handleHeroImg = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setNewHero({...newHero, image_data: r.result}); r.readAsDataURL(file); }
  };
  const addHero = async () => {
    if (!newHero.image_data || !newHero.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/hero-images`, newHero);
    setNewHero({ title: "", subtitle: "", category: "", order: heroImages.length + 1, image_data: "" });
    toast({ title: "Hero image added!" }); fetchData();
  };
  const deleteHero = async (id) => { await axios.delete(`${API}/admin/hero-images/${id}`); fetchData(); };

  // Awards
  const handleAwardImg = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setNewAward({...newAward, winner_image: r.result}); r.readAsDataURL(file); }
  };
  const addAward = async () => {
    if (!newAward.title || !newAward.winner_name) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/awards`, newAward);
    setNewAward({ title: "", winner_name: "", winner_image: "", description: "", category: "" });
    toast({ title: "Award created!" }); fetchData();
  };
  const deleteAward = async (id) => { await axios.delete(`${API}/admin/awards/${id}`); fetchData(); };

  // Ads
  const handleAdImg = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setNewAd({...newAd, image_data: r.result}); r.readAsDataURL(file); }
  };
  const addAd = async () => {
    if (!newAd.image_data || !newAd.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/advertisements`, newAd);
    setNewAd({ title: "", link: "", order: ads.length + 1, image_data: "" });
    toast({ title: "Ad added!" }); fetchData();
  };
  const deleteAd = async (id) => { await axios.delete(`${API}/admin/advertisements/${id}`); fetchData(); };

  const tabs = [
    { id: "pending", label: "Pending", icon: Users },
    { id: "talents", label: "All Talents", icon: Star },
    { id: "hero", label: "Hero Images", icon: Image },
    { id: "awards", label: "Awards", icon: Award },
    { id: "ads", label: "Advertisements", icon: ExternalLink },
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
            {pending.length === 0 ? <p className="text-[#A0A5B0]">No pending</p> : (
              <div className="space-y-3">
                {pending.map(t => (
                  <div key={t.id} className="flex items-center gap-4 p-3 bg-[#050A14] rounded">
                    <img src={t.profile_image || "https://via.placeholder.com/50"} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-[#F5F5F0] font-bold">{t.name}</p>
                      <p className="text-[#A0A5B0] text-sm">{t.category} • {t.email}</p>
                    </div>
                    <button onClick={() => approve(t.id)} className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white"><Check size={16} /></button>
                    <button onClick={() => reject(t.id)} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Talents */}
        {tab === "talents" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20 overflow-x-auto">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">All Talents</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#A0A5B0]">
                <th className="pb-2">Rank</th><th className="pb-2">Name</th><th className="pb-2">Category</th><th className="pb-2">Status</th><th className="pb-2">Votes</th><th className="pb-2">Actions</th>
              </tr></thead>
              <tbody>
                {allTalents.map(t => (
                  <tr key={t.id} className="border-t border-[#D4AF37]/10">
                    <td className="py-2"><input type="number" value={t.rank} onChange={e => updateRank(t.id, parseInt(e.target.value))} className="w-16 px-2 py-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-center" /></td>
                    <td className="py-2 text-[#F5F5F0]">{t.name}</td>
                    <td className="py-2 text-[#A0A5B0]">{t.category}</td>
                    <td className="py-2">{t.is_approved ? <span className="text-green-500">Approved</span> : <span className="text-yellow-500">Pending</span>}</td>
                    <td className="py-2 text-[#D4AF37]">{t.votes}</td>
                    <td className="py-2">
                      {!t.is_approved && <button onClick={() => approve(t.id)} className="p-1 text-green-500 mr-2"><Check size={16} /></button>}
                      <button onClick={() => deleteTalent(t.id)} className="p-1 text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hero Images */}
        {tab === "hero" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Hero Slider Images</h2>
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <input type="text" placeholder="Title" value={newHero.title} onChange={e => setNewHero({...newHero, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Subtitle" value={newHero.subtitle} onChange={e => setNewHero({...newHero, subtitle: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Category" value={newHero.category} onChange={e => setNewHero({...newHero, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Order" value={newHero.order} onChange={e => setNewHero({...newHero, order: parseInt(e.target.value)})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <input type="file" accept="image/*" onChange={handleHeroImg} className="text-[#A0A5B0]" />
              {newHero.image_data && <img src={newHero.image_data} className="h-16 rounded" />}
              <button onClick={addHero} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add</button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {heroImages.map(h => (
                <div key={h.id} className="relative group">
                  <img src={h.image_data} className="w-full h-32 object-cover rounded" />
                  <button onClick={() => deleteHero(h.id)} className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100"><Trash2 size={14} className="text-white" /></button>
                  <p className="text-[#F5F5F0] text-sm mt-1">{h.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {tab === "awards" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Awards</h2>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <input type="text" placeholder="Award Title (e.g. Model of the Week)" value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Winner Name" value={newAward.winner_name} onChange={e => setNewAward({...newAward, winner_name: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Category" value={newAward.category} onChange={e => setNewAward({...newAward, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Description" value={newAward.description} onChange={e => setNewAward({...newAward, description: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <input type="file" accept="image/*" onChange={handleAwardImg} className="text-[#A0A5B0]" />
              {newAward.winner_image && <img src={newAward.winner_image} className="h-16 rounded" />}
              <button onClick={addAward} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Create Award</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {awards.map(a => (
                <div key={a.id} className="bg-[#050A14] rounded overflow-hidden">
                  {a.winner_image && <img src={a.winner_image} className="w-full h-40 object-cover" />}
                  <div className="p-3">
                    <p className="text-[#D4AF37] text-sm">{a.title}</p>
                    <p className="text-[#F5F5F0] font-bold">{a.winner_name}</p>
                    <button onClick={() => deleteAward(a.id)} className="text-red-500 text-sm mt-2">Delete</button>
                  </div>
                </div>
              ))}
            </div>
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
              <input type="file" accept="image/*" onChange={handleAdImg} className="text-[#A0A5B0]" />
              {newAd.image_data && <img src={newAd.image_data} className="h-16 rounded" />}
              <button onClick={addAd} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Ad</button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {ads.map(a => (
                <div key={a.id} className="relative group">
                  <img src={a.image_data} className="w-full h-32 object-cover rounded" />
                  <button onClick={() => deleteAd(a.id)} className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100"><Trash2 size={14} className="text-white" /></button>
                  <p className="text-[#F5F5F0] text-sm mt-1">{a.title}</p>
                </div>
              ))}
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
      <h1 className="font-serif text-4xl font-bold text-[#F5F5F0] mb-6">About Us</h1>
      <div className="prose prose-invert">
        <p className="text-[#A0A5B0] text-lg mb-4">Bangalore Fashion Magazine is the premier platform for fashion talent in Bangalore and beyond.</p>
        <p className="text-[#A0A5B0]">We connect models, photographers, designers, makeup artists, stylists, and event managers with opportunities in the fashion industry.</p>
      </div>
    </div>
  </div>
);

// Home Page
const HomePage = ({ user, talent, onLogout, heroImages, awards, ads }) => (
  <div className="min-h-screen bg-[#050A14]">
    <Navbar user={user} talent={talent} onLogout={onLogout} />
    <HeroSlider customSlides={heroImages} />
    <div className="flex">
      <div className="flex-1">
        <AwardsSection awards={awards} />
      </div>
      {ads && ads.length > 0 && (
        <div className="hidden lg:block w-64 p-4">
          <AdvertisementSidebar ads={ads} />
        </div>
      )}
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

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("talent");
    if (u) try { setUser(JSON.parse(u)); } catch {}
    if (t) try { setTalent(JSON.parse(t)); } catch {}
    
    // Fetch public data
    Promise.all([
      axios.get(`${API}/hero-images`),
      axios.get(`${API}/awards?active_only=true`),
      axios.get(`${API}/advertisements`)
    ]).then(([h, a, ad]) => {
      setHeroImages(h.data);
      setAwards(a.data);
      setAds(ad.data);
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setTalent(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage user={user} talent={talent} onLogout={handleLogout} heroImages={heroImages} awards={awards} ads={ads} />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/talent-login" element={<TalentLoginPage onTalentLogin={setTalent} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/about" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AboutPage /></>} />
        <Route path="/talents/:category" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentsPage category={window.location.pathname.split('/talents/')[1]} ads={ads} /></>} />
        <Route path="/talent-dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentDashboard talent={talent} onUpdate={setTalent} /></>} />
        <Route path="/admin" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AdminDashboard /></>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

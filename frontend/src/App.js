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
import { LogIn, ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, ArrowRight, Mail, Lock, Vote, User, Shield, Award, Image, Download, Star, Check, X, Phone, Instagram, Edit, Trash2, Plus, Save } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TALENT_CATEGORIES = ["Model", "Photographer", "Designer", "Makeup Artist", "Stylist", "Other"];

// Default hero slides (used when no custom images)
const DEFAULT_SLIDES = [
  { image: "https://images.unsplash.com/photo-1700150594432-7024e06005c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY5NTE1OTYwfDA&ixlib=rb-4.1.0&q=85", category: "Editorial", title: "Spring Collection 2025", subtitle: "Editorial Fashion Photography" },
  { image: "https://images.unsplash.com/photo-1700150624576-c6c0641e54fe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY5NTE1OTYwfDA&ixlib=rb-4.1.0&q=85", category: "Haute Couture", title: "Haute Couture Series", subtitle: "Luxury Fashion Campaign" },
  { image: "https://images.unsplash.com/photo-1611232657592-dedbfa563955?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDB8fHx8MTc2OTUxNTk2Nnww&ixlib=rb-4.1.0&q=85", category: "Contemporary", title: "Modern Elegance", subtitle: "Contemporary Fashion" },
  { image: "https://images.unsplash.com/photo-1679503350214-b435e5e11813?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDB8fHx8MTc2OTUxNTk2Nnww&ixlib=rb-4.1.0&q=85", category: "Classic", title: "Timeless Beauty", subtitle: "Classic Fashion Photography" }
];

// Navigation Component
const Navbar = ({ user, talent, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050A14]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-[#F5F5F0]">Bangalore Fashion</span>
            <span className="font-serif text-xl text-[#D4AF37]">Magazine</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-serif text-xs uppercase tracking-[0.15em] text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">Home</Link>
            <Link to="/talents" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Talents</Link>
            <Link to="/services" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Services</Link>
            <Link to="/about" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Our Story</Link>
            
            {user ? (
              <>
                {(user.is_admin || user.email === "admin@bangalorefashionmag.com") && (
                  <Link to="/admin" className="px-4 py-2 bg-[#D4AF37] text-[#050A14] font-serif text-xs uppercase tracking-[0.15em] rounded-lg hover:bg-[#F5F5F0] transition-all flex items-center gap-1">
                    <Shield size={14} />
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <User size={14} />
                  {user.name}
                </Link>
                <button onClick={onLogout} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] font-serif text-xs uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
                  Logout
                </button>
              </>
            ) : talent ? (
              <>
                <Link to="/talent-dashboard" className="font-serif text-xs uppercase tracking-[0.15em] text-[#D4AF37] hover:text-[#F5F5F0] transition-colors flex items-center gap-1">
                  <Camera size={14} />
                  {talent.name}
                </Link>
                <button onClick={onLogout} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] font-serif text-xs uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-serif text-xs uppercase tracking-[0.15em] text-[#D4AF37] hover:text-[#F5F5F0] transition-colors">Admin Login</Link>
                <Link to="/talent-login" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Talent Login</Link>
                <Link to="/talent-register" className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] font-serif text-xs uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
                  Join as Talent
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Slider Component
const HeroSlider = ({ customSlides }) => {
  const slides = customSlides && customSlides.length > 0 ? customSlides.map(s => ({
    image: s.image_data || s.image,
    category: s.category,
    title: s.title,
    subtitle: s.subtitle
  })) : DEFAULT_SLIDES;

  return (
    <div className="relative w-full h-screen">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
        navigation={{ prevEl: '.swiper-button-prev-custom', nextEl: '.swiper-button-next-custom' }}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full flex items-center justify-center bg-[#050A14]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${slide.image}")` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050A14] via-[#050A14]/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-[#050A14]/30"></div>
              </div>
              <div className="relative z-10 container mx-auto px-4 lg:px-8">
                <div className="max-w-4xl">
                  <div className="inline-block mb-6 px-6 py-2 border border-[#D4AF37]/40">
                    <span className="font-serif text-xs uppercase tracking-[0.3em] text-[#D4AF37]">{slide.category}</span>
                  </div>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-[#F5F5F0] tracking-tight">{slide.title}</h1>
                  <p className="font-accent text-xl md:text-2xl lg:text-3xl mb-10 text-[#A0A5B0] italic">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination-custom absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3"></div>
      <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
        <ChevronLeft size={24} />
      </button>
      <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

// Awards Section
const AwardsSection = ({ awards }) => {
  if (!awards || awards.length === 0) return null;
  
  return (
    <section className="py-20 bg-gradient-to-b from-[#050A14] to-[#0A1628]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Recognition</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#F5F5F0] mt-4">Awards & Achievements</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((award, index) => (
            <div key={index} className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all">
              {award.winner_image && (
                <div className="h-64 overflow-hidden">
                  <img src={award.winner_image} alt={award.winner_name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="text-[#D4AF37]" size={20} />
                  <span className="text-[#D4AF37] font-serif text-sm uppercase tracking-wider">{award.title}</span>
                </div>
                <h3 className="text-[#F5F5F0] font-serif text-2xl font-bold mb-2">{award.winner_name}</h3>
                {award.description && <p className="text-[#A0A5B0]">{award.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Talent Section with real data
const TalentSection = ({ talents }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const filteredTalents = selectedCategory === "All" 
    ? talents 
    : talents.filter(t => t.category === selectedCategory);

  return (
    <section className="py-20 bg-[#050A14]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Our Network</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#F5F5F0] mt-4">Associated Talents</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-6 py-2 font-serif text-xs uppercase tracking-[0.15em] border transition-all ${selectedCategory === "All" ? "bg-[#D4AF37] text-[#050A14] border-[#D4AF37]" : "border-[#D4AF37]/40 text-[#A0A5B0] hover:text-[#D4AF37]"}`}
          >
            All
          </button>
          {TALENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 font-serif text-xs uppercase tracking-[0.15em] border transition-all ${selectedCategory === cat ? "bg-[#D4AF37] text-[#050A14] border-[#D4AF37]" : "border-[#D4AF37]/40 text-[#A0A5B0] hover:text-[#D4AF37]"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {filteredTalents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A0A5B0]">No talents available in this category yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTalents.map((talent, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all">
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={talent.profile_image || "https://via.placeholder.com/300x400?text=No+Image"} 
                    alt={talent.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] font-serif text-xs uppercase tracking-wider mb-2">{talent.category}</span>
                  <h3 className="font-serif text-xl font-bold text-[#F5F5F0]">{talent.name}</h3>
                  {talent.instagram_id && (
                    <p className="text-[#A0A5B0] text-sm flex items-center gap-1 mt-1">
                      <Instagram size={14} />
                      @{talent.instagram_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    { icon: Users, title: "Model Management", description: "Professional model representation and career development" },
    { icon: Palette, title: "Designer Showcase", description: "Platform for emerging and established designers" },
    { icon: Sparkles, title: "Makeup & Hair", description: "Expert beauty services for photoshoots and events" },
    { icon: Camera, title: "Photography", description: "High-end fashion photography services" },
    { icon: Briefcase, title: "Styling", description: "Personal and editorial styling services" },
    { icon: Calendar, title: "Event Management", description: "Fashion shows and industry events" }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0A1628] to-[#050A14]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-serif text-xs uppercase tracking-[0.3em] text-[#D4AF37]">What We Offer</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#F5F5F0] mt-4">Our Services</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group p-8 bg-[#050A14] border border-[#D4AF37]/10 rounded-xl hover:border-[#D4AF37]/40 transition-all">
              <service.icon className="w-12 h-12 text-[#D4AF37] mb-6" />
              <h3 className="font-serif text-xl font-bold text-[#F5F5F0] mb-3">{service.title}</h3>
              <p className="text-[#A0A5B0]">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Admin Login Page
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
      const response = await axios.post(`${API}/auth/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (onLogin) onLogin(response.data.user);
        toast({ title: "Success", description: "Login successful!" });
        navigate(response.data.user.is_admin ? "/admin" : "/dashboard");
      }
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-full mb-4">
            <Shield className="text-[#050A14]" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-2">Admin Login</h2>
          <p className="text-[#A0A5B0]">Sign in to manage the platform</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A5B0]" size={20} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="admin@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A5B0]" size={20} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="Enter password" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors disabled:opacity-50">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-[#A0A5B0]">Are you a talent? <Link to="/talent-login" className="text-[#D4AF37] hover:underline">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

// Talent Login Page
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
      const response = await axios.post(`${API}/talent/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem("talentToken", response.data.token);
        localStorage.setItem("talent", JSON.stringify(response.data.talent));
        if (onTalentLogin) onTalentLogin(response.data.talent);
        toast({ title: "Success", description: "Login successful!" });
        navigate("/talent-dashboard");
      }
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-full mb-4">
            <Camera className="text-[#050A14]" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-2">Talent Login</h2>
          <p className="text-[#A0A5B0]">Access your portfolio</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
              placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
              placeholder="Enter password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors disabled:opacity-50">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <p className="text-[#A0A5B0]"><Link to="/talent-forgot-password" className="text-[#D4AF37] hover:underline">Forgot Password?</Link></p>
          <p className="text-[#A0A5B0]">Don't have an account? <Link to="/talent-register" className="text-[#D4AF37] hover:underline">Register here</Link></p>
          <p className="text-[#A0A5B0]">Are you an admin? <Link to="/login" className="text-[#D4AF37] hover:underline">Admin Login</Link></p>
        </div>
      </div>
    </div>
  );
};

// Talent Forgot Password Page
const TalentForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code & new password
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/talent/forgot-password`, { email });
      setGeneratedCode(response.data.reset_code || "");
      toast({ title: "Success", description: "Reset code generated! Check below." });
      setStep(2);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to request reset", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/talent/reset-password`, { email, reset_code: resetCode, new_password: newPassword });
      toast({ title: "Success", description: "Password reset successful! You can now login." });
      navigate("/talent-login");
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to reset password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] py-12 px-4">
      <div className="max-w-md w-full bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-full mb-4">
            <Lock className="text-[#050A14]" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-2">Reset Password</h2>
          <p className="text-[#A0A5B0]">{step === 1 ? "Enter your email to get reset code" : "Enter reset code and new password"}</p>
        </div>

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleRequestReset}>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="your@email.com" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors disabled:opacity-50">
              {loading ? "Requesting..." : "Get Reset Code"}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-lg mb-4">
              <p className="text-green-400 text-sm text-center">Your Reset Code:</p>
              <p className="text-green-400 text-3xl font-bold text-center my-2">{generatedCode || "Loading..."}</p>
              <p className="text-green-400 text-xs text-center">(Copy this code and enter below)</p>
            </div>
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Reset Code</label>
              <input type="text" required value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="Enter 6-digit code" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">New Password</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="Enter new password" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Confirm Password</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
                placeholder="Confirm new password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors disabled:opacity-50">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/talent-login" className="text-[#D4AF37] hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

// Talent Registration Page
const TalentRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", instagram_id: "", category: "Model", bio: ""
  });
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/talent/register`, { ...formData, profile_image: profileImage });
      toast({ title: "Success", description: "Registration successful! Please wait for admin approval." });
      navigate("/talent-login");
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] py-24 px-4">
      <div className="max-w-2xl mx-auto bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-2">Join as Talent</h2>
          <p className="text-[#A0A5B0]">Register your profile and get discovered</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Password *</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Phone *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Instagram ID *</label>
              <input type="text" required value={formData.instagram_id} onChange={(e) => setFormData({...formData, instagram_id: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none" placeholder="username (without @)" />
            </div>
            <div>
              <label className="block text-sm text-[#A0A5B0] mb-2">Category *</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none">
                {TALENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Bio</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] focus:border-[#D4AF37] outline-none h-24" placeholder="Tell us about yourself..." />
          </div>
          <div>
            <label className="block text-sm text-[#A0A5B0] mb-2">Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-[#A0A5B0]" />
            {profileImage && <img src={profileImage} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-lg" />}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#D4AF37] text-[#050A14] py-3 rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-[#A0A5B0] text-sm">Already registered? <Link to="/talent-login" className="text-[#D4AF37] hover:underline">Login here</Link></p>
      </div>
    </div>
  );
};

// Talent Dashboard
const TalentDashboard = ({ talent, onTalentUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(talent || {});
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (talent) {
      setFormData(talent);
      setPortfolioImages(talent.portfolio_images || []);
    }
  }, [talent]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({...formData, profile_image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (portfolioImages.length + files.length > 7) {
      toast({ title: "Error", description: "Maximum 7 portfolio images allowed", variant: "destructive" });
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioImages(prev => {
          if (prev.length >= 7) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortfolioImage = (index) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API}/talent/${talent.id}`, {
        name: formData.name,
        phone: formData.phone,
        instagram_id: formData.instagram_id,
        category: formData.category,
        bio: formData.bio,
        profile_image: formData.profile_image,
        portfolio_images: portfolioImages
      });
      localStorage.setItem("talent", JSON.stringify(response.data));
      if (onTalentUpdate) onTalentUpdate(response.data);
      toast({ title: "Success", description: "Profile updated!" });
      setEditing(false);
    } catch (error) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!talent) return <div className="min-h-screen bg-[#050A14] pt-24 text-center text-[#F5F5F0]">Please login first</div>;

  return (
    <div className="min-h-screen bg-[#050A14] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#F5F5F0]">My Profile</h1>
              <p className="text-[#A0A5B0] mt-1">
                Status: {talent.is_approved ? <span className="text-green-500">Approved ✓</span> : <span className="text-yellow-500">Pending Approval</span>}
              </p>
            </div>
            <button onClick={() => setEditing(!editing)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#050A14]">
                <img src={formData.profile_image || "https://via.placeholder.com/300?text=No+Image"} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {editing && (
                <div className="mt-4">
                  <label className="block text-sm text-[#A0A5B0] mb-2">Profile Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-[#A0A5B0] text-sm" />
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-4">
              {editing ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#A0A5B0] mb-1">Name</label>
                      <input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A0A5B0] mb-1">Phone</label>
                      <input type="tel" value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A0A5B0] mb-1">Instagram</label>
                      <input type="text" value={formData.instagram_id || ""} onChange={(e) => setFormData({...formData, instagram_id: e.target.value})}
                        className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A0A5B0] mb-1">Category</label>
                      <select value={formData.category || ""} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]">
                        {TALENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#A0A5B0] mb-1">Bio</label>
                    <textarea value={formData.bio || ""} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-24" />
                  </div>
                  
                  {/* Portfolio Images Section */}
                  <div>
                    <label className="block text-sm text-[#A0A5B0] mb-2">Portfolio Images ({portfolioImages.length}/7)</label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {portfolioImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button 
                            onClick={() => removePortfolioImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {portfolioImages.length < 7 && (
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handlePortfolioImageAdd} 
                        className="text-[#A0A5B0] text-sm" 
                      />
                    )}
                    <p className="text-xs text-[#A0A5B0] mt-1">Upload up to 7 portfolio images</p>
                  </div>

                  <button onClick={handleSave} disabled={loading}
                    className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Name</p>
                      <p className="text-[#F5F5F0] font-bold">{talent.name}</p>
                    </div>
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Email</p>
                      <p className="text-[#F5F5F0]">{talent.email}</p>
                    </div>
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Phone</p>
                      <p className="text-[#F5F5F0]">{talent.phone}</p>
                    </div>
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Instagram</p>
                      <p className="text-[#F5F5F0]">@{talent.instagram_id}</p>
                    </div>
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Category</p>
                      <p className="text-[#F5F5F0]">{talent.category}</p>
                    </div>
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Rank</p>
                      <p className="text-[#F5F5F0]">#{talent.rank}</p>
                    </div>
                  </div>
                  {talent.bio && (
                    <div className="p-4 bg-[#050A14] rounded-lg">
                      <p className="text-[#A0A5B0] text-sm">Bio</p>
                      <p className="text-[#F5F5F0]">{talent.bio}</p>
                    </div>
                  )}
                  
                  {/* Portfolio Images Display */}
                  {portfolioImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[#A0A5B0] text-sm mb-3">Portfolio ({portfolioImages.length} images)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {portfolioImages.map((img, index) => (
                          <img key={index} src={img} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingTalents, setPendingTalents] = useState([]);
  const [allTalents, setAllTalents] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // New hero image form
  const [newHero, setNewHero] = useState({ title: "", subtitle: "", category: "", order: 1, image_data: "" });
  // New award form
  const [newAward, setNewAward] = useState({ title: "", winner_name: "", description: "", winner_image: "" });

  const fetchData = async () => {
    try {
      const [pending, all, heroes, awardsList] = await Promise.all([
        axios.get(`${API}/admin/talents/pending`),
        axios.get(`${API}/talents?approved_only=false`),
        axios.get(`${API}/hero-images`),
        axios.get(`${API}/awards?active_only=false`)
      ]);
      setPendingTalents(pending.data);
      setAllTalents(all.data);
      setHeroImages(heroes.data);
      setAwards(awardsList.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const approveTalent = async (id) => {
    try {
      await axios.put(`${API}/admin/talent/${id}/approve`);
      toast({ title: "Success", description: "Talent approved!" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  const rejectTalent = async (id) => {
    try {
      await axios.put(`${API}/admin/talent/${id}/reject`);
      toast({ title: "Success", description: "Talent rejected" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    }
  };

  const updateRank = async (id, rank) => {
    try {
      await axios.put(`${API}/admin/talent/${id}/rank?rank=${rank}`);
      toast({ title: "Success", description: "Rank updated!" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update rank", variant: "destructive" });
    }
  };

  const deleteTalent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this talent?")) return;
    try {
      await axios.delete(`${API}/admin/talent/${id}`);
      toast({ title: "Success", description: "Talent deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const exportTalents = () => {
    window.open(`${API}/admin/talents/export`, '_blank');
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewHero({...newHero, image_data: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const addHeroImage = async () => {
    if (!newHero.image_data || !newHero.title) {
      toast({ title: "Error", description: "Please fill all fields and select an image", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/admin/hero-images`, newHero);
      toast({ title: "Success", description: "Hero image added!" });
      setNewHero({ title: "", subtitle: "", category: "", order: heroImages.length + 1, image_data: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add hero image", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteHeroImage = async (id) => {
    try {
      await axios.delete(`${API}/admin/hero-images/${id}`);
      toast({ title: "Success", description: "Hero image deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleAwardImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAward({...newAward, winner_image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const addAward = async () => {
    if (!newAward.title || !newAward.winner_name) {
      toast({ title: "Error", description: "Please fill title and winner name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/admin/awards`, newAward);
      toast({ title: "Success", description: "Award created!" });
      setNewAward({ title: "", winner_name: "", description: "", winner_image: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create award", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAward = async (id) => {
    try {
      await axios.delete(`${API}/admin/awards/${id}`);
      toast({ title: "Success", description: "Award deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const tabs = [
    { id: "pending", label: "Pending Approvals", icon: Users },
    { id: "talents", label: "All Talents", icon: Star },
    { id: "hero", label: "Hero Images", icon: Image },
    { id: "awards", label: "Awards", icon: Award },
    { id: "export", label: "Export Data", icon: Download }
  ];

  return (
    <div className="min-h-screen bg-[#050A14] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-8">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? "bg-[#D4AF37] text-[#050A14]" : "bg-[#0A1628] text-[#A0A5B0] hover:text-[#D4AF37]"}`}>
              <tab.icon size={18} />
              {tab.label}
              {tab.id === "pending" && pendingTalents.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTalents.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === "pending" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-xl font-bold text-[#F5F5F0] mb-4">Pending Talent Approvals</h2>
            {pendingTalents.length === 0 ? (
              <p className="text-[#A0A5B0]">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingTalents.map(talent => (
                  <div key={talent.id} className="flex items-center gap-4 p-4 bg-[#050A14] rounded-lg">
                    <img src={talent.profile_image || "https://via.placeholder.com/60"} alt={talent.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="text-[#F5F5F0] font-bold">{talent.name}</h3>
                      <p className="text-[#A0A5B0] text-sm">{talent.category} • {talent.email}</p>
                      <p className="text-[#A0A5B0] text-sm">@{talent.instagram_id} • {talent.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveTalent(talent.id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                        <Check size={20} />
                      </button>
                      <button onClick={() => rejectTalent(talent.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Talents Tab */}
        {activeTab === "talents" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-xl font-bold text-[#F5F5F0] mb-4">All Talents (Rank & Manage)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#A0A5B0] text-sm">
                    <th className="pb-4">Rank</th>
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Contact</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTalents.map(talent => (
                    <tr key={talent.id} className="border-t border-[#D4AF37]/10">
                      <td className="py-4">
                        <input type="number" value={talent.rank} min="1"
                          onChange={(e) => updateRank(talent.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-center" />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={talent.profile_image || "https://via.placeholder.com/40"} alt={talent.name} className="w-10 h-10 rounded-full object-cover" />
                          <span className="text-[#F5F5F0]">{talent.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-[#A0A5B0]">{talent.category}</td>
                      <td className="py-4">
                        {talent.is_approved ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-sm">Approved</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-sm">Pending</span>
                        )}
                      </td>
                      <td className="py-4 text-[#A0A5B0] text-sm">
                        <div>@{talent.instagram_id}</div>
                        <div>{talent.phone}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {!talent.is_approved && (
                            <button onClick={() => approveTalent(talent.id)} className="p-1 text-green-500 hover:bg-green-500/20 rounded">
                              <Check size={18} />
                            </button>
                          )}
                          <button onClick={() => deleteTalent(talent.id)} className="p-1 text-red-500 hover:bg-red-500/20 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hero Images Tab */}
        {activeTab === "hero" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-xl font-bold text-[#F5F5F0] mb-4">Hero Slider Images</h2>
            
            {/* Add new hero image */}
            <div className="mb-8 p-4 bg-[#050A14] rounded-lg">
              <h3 className="text-[#D4AF37] font-bold mb-4">Add New Hero Image</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Title" value={newHero.title} onChange={(e) => setNewHero({...newHero, title: e.target.value})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                <input type="text" placeholder="Subtitle" value={newHero.subtitle} onChange={(e) => setNewHero({...newHero, subtitle: e.target.value})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                <input type="text" placeholder="Category" value={newHero.category} onChange={(e) => setNewHero({...newHero, category: e.target.value})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                <input type="number" placeholder="Order" value={newHero.order} onChange={(e) => setNewHero({...newHero, order: parseInt(e.target.value)})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleHeroImageChange} className="text-[#A0A5B0]" />
                {newHero.image_data && <img src={newHero.image_data} alt="Preview" className="h-20 rounded" />}
                <button onClick={addHeroImage} disabled={loading}
                  className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] disabled:opacity-50">
                  {loading ? "Adding..." : "Add Image"}
                </button>
              </div>
            </div>

            {/* Current hero images */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {heroImages.map((img, index) => (
                <div key={img.id || index} className="relative group">
                  <img src={img.image_data} alt={img.title} className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <button onClick={() => deleteHeroImage(img.id)} className="p-2 bg-red-500 text-white rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-[#F5F5F0] font-bold text-sm">{img.title}</p>
                    <p className="text-[#A0A5B0] text-xs">Order: {img.order}</p>
                  </div>
                </div>
              ))}
            </div>
            {heroImages.length === 0 && <p className="text-[#A0A5B0]">No custom hero images. Using default images.</p>}
          </div>
        )}

        {/* Awards Tab */}
        {activeTab === "awards" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-xl font-bold text-[#F5F5F0] mb-4">Awards & Recognition</h2>
            
            {/* Add new award */}
            <div className="mb-8 p-4 bg-[#050A14] rounded-lg">
              <h3 className="text-[#D4AF37] font-bold mb-4">Create New Award</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Award Title (e.g., Model of the Week)" value={newAward.title} onChange={(e) => setNewAward({...newAward, title: e.target.value})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                <input type="text" placeholder="Winner Name" value={newAward.winner_name} onChange={(e) => setNewAward({...newAward, winner_name: e.target.value})}
                  className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
              </div>
              <textarea placeholder="Description (optional)" value={newAward.description} onChange={(e) => setNewAward({...newAward, description: e.target.value})}
                className="mt-4 w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-20" />
              <div className="mt-4 flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleAwardImageChange} className="text-[#A0A5B0]" />
                {newAward.winner_image && <img src={newAward.winner_image} alt="Preview" className="h-20 rounded" />}
                <button onClick={addAward} disabled={loading}
                  className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] disabled:opacity-50">
                  {loading ? "Creating..." : "Create Award"}
                </button>
              </div>
            </div>

            {/* Current awards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award, index) => (
                <div key={award.id || index} className="bg-[#050A14] rounded-lg overflow-hidden">
                  {award.winner_image && <img src={award.winner_image} alt={award.winner_name} className="w-full h-48 object-cover" />}
                  <div className="p-4">
                    <p className="text-[#D4AF37] text-sm uppercase tracking-wider">{award.title}</p>
                    <p className="text-[#F5F5F0] font-bold text-lg">{award.winner_name}</p>
                    {award.description && <p className="text-[#A0A5B0] text-sm mt-1">{award.description}</p>}
                    <button onClick={() => deleteAward(award.id)} className="mt-2 text-red-500 text-sm hover:underline">Delete Award</button>
                  </div>
                </div>
              ))}
            </div>
            {awards.length === 0 && <p className="text-[#A0A5B0]">No awards created yet.</p>}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-xl font-bold text-[#F5F5F0] mb-4">Export Talent Data</h2>
            <p className="text-[#A0A5B0] mb-6">Download all talent information including Name, Email, Phone, Instagram ID, Category, Status, and Rank.</p>
            <button onClick={exportTalents}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors">
              <Download size={20} />
              Download Excel (CSV)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// User Dashboard
const UserDashboard = ({ user, onLogout }) => {
  if (!user) return <div className="min-h-screen bg-[#050A14] pt-24 text-center text-[#F5F5F0]">Please login first</div>;
  
  // Check if this is the main admin email
  const isMainAdmin = user.email === "admin@bangalorefashionmag.com";
  const showAdminAccess = user.is_admin || isMainAdmin;
  
  return (
    <div className="min-h-screen bg-[#050A14] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0A1628] rounded-2xl p-8 border border-[#D4AF37]/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-4">
              <User className="text-[#050A14]" size={40} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#F5F5F0]">Welcome, {user.name}!</h1>
            <p className="text-[#A0A5B0]">{user.email}</p>
            {showAdminAccess && <span className="inline-block mt-2 px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-sm">Admin</span>}
          </div>
          {showAdminAccess && (
            <div className="text-center">
              <Link to="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] transition-colors">
                <Shield size={20} />
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomePage = ({ user, talent, onLogout, talents, heroImages, awards }) => {
  return (
    <div className="min-h-screen bg-[#050A14]">
      <Navbar user={user} talent={talent} onLogout={onLogout} />
      <HeroSlider customSlides={heroImages} />
      <AwardsSection awards={awards} />
      <TalentSection talents={talents} />
      <ServicesSection />
    </div>
  );
};

// Main App
function App() {
  const [user, setUser] = useState(null);
  const [talent, setTalent] = useState(null);
  const [talents, setTalents] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
    // Check for logged in talent
    const storedTalent = localStorage.getItem("talent");
    if (storedTalent) {
      try { setTalent(JSON.parse(storedTalent)); } catch (e) {}
    }
    // Fetch public data
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const [talentsRes, heroRes, awardsRes] = await Promise.all([
        axios.get(`${API}/talents?approved_only=true`),
        axios.get(`${API}/hero-images`),
        axios.get(`${API}/awards?active_only=true`)
      ]);
      setTalents(talentsRes.data);
      setHeroImages(heroRes.data);
      setAwards(awardsRes.data);
    } catch (error) {
      console.error("Error fetching public data:", error);
    }
  };

  const handleLogin = (userData) => setUser(userData);
  const handleTalentLogin = (talentData) => setTalent(talentData);
  const handleTalentUpdate = (talentData) => setTalent(talentData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("talentToken");
    localStorage.removeItem("talent");
    sessionStorage.clear();
    setUser(null);
    setTalent(null);
    window.location.href = "/";
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage user={user} talent={talent} onLogout={handleLogout} talents={talents} heroImages={heroImages} awards={awards} />} />
          <Route path="/talents" element={<HomePage user={user} talent={talent} onLogout={handleLogout} talents={talents} heroImages={heroImages} awards={awards} />} />
          <Route path="/services" element={<HomePage user={user} talent={talent} onLogout={handleLogout} talents={talents} heroImages={heroImages} awards={awards} />} />
          <Route path="/about" element={<HomePage user={user} talent={talent} onLogout={handleLogout} talents={talents} heroImages={heroImages} awards={awards} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/talent-login" element={<TalentLoginPage onTalentLogin={handleTalentLogin} />} />
          <Route path="/talent-register" element={<TalentRegisterPage />} />
          <Route path="/talent-forgot-password" element={<TalentForgotPasswordPage />} />
          <Route path="/talent-dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><TalentDashboard talent={talent} onTalentUpdate={handleTalentUpdate} /></>} />
          <Route path="/dashboard" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><UserDashboard user={user} onLogout={handleLogout} /></>} />
          <Route path="/admin" element={<><Navbar user={user} talent={talent} onLogout={handleLogout} /><AdminDashboard /></>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

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
import { LogIn, ChevronLeft, ChevronRight, Users, Palette, Sparkles, Camera, Briefcase, Calendar, ArrowRight, Mail, Lock, Vote, User } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050A14]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-[#F5F5F0]">Bangalore Fashion</span>
            <span className="font-serif text-xl text-[#D4AF37]">Magazine</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-serif text-xs uppercase tracking-[0.15em] text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">Home</Link>
            <Link to="/talents" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Associated Talents</Link>
            <Link to="/services" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Services</Link>
            <Link to="/about" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Our Story</Link>
            <Link to="/contact" className="font-serif text-xs uppercase tracking-[0.15em] text-[#A0A5B0] hover:text-[#D4AF37] transition-colors">Inquire</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="font-serif text-xs uppercase tracking-[0.15em] text-[#D4AF37] hover:text-[#F5F5F0] transition-colors flex items-center gap-2">
                  <User size={16} />
                  {user.name}
                </Link>
                <button 
                  onClick={onLogout}
                  className="px-6 py-2 border border-[#D4AF37] text-[#D4AF37] font-serif text-xs uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-serif text-xs uppercase tracking-[0.15em] text-[#D4AF37] hover:text-[#F5F5F0] transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2 border border-[#D4AF37] text-[#D4AF37] font-serif text-xs uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#050A14] transition-all">Join Us</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Slider Component
const HeroSlider = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1700150594432-7024e06005c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY5NTE1OTYwfDA&ixlib=rb-4.1.0&q=85",
      category: "Editorial",
      title: "Spring Collection 2025",
      subtitle: "Editorial Fashion Photography"
    },
    {
      image: "https://images.unsplash.com/photo-1700150624576-c6c0641e54fe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzY5NTE1OTYwfDA&ixlib=rb-4.1.0&q=85",
      category: "Haute Couture",
      title: "Haute Couture Series",
      subtitle: "Luxury Fashion Campaign"
    },
    {
      image: "https://images.unsplash.com/photo-1611232657592-dedbfa563955?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDB8fHx8MTc2OTUxNTk2Nnww&ixlib=rb-4.1.0&q=85",
      category: "Contemporary",
      title: "Modern Elegance",
      subtitle: "Contemporary Fashion"
    },
    {
      image: "https://images.unsplash.com/photo-1679503350214-b435e5e11813?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDB8fHx8MTc2OTUxNTk2Nnww&ixlib=rb-4.1.0&q=85",
      category: "Classic",
      title: "Timeless Beauty",
      subtitle: "Classic Fashion Photography"
    }
  ];

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
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${slide.image}")` }}
              >
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
              <div className="absolute top-24 right-8 w-32 h-32 border-t border-r border-[#D4AF37]/20"></div>
              <div className="absolute bottom-24 left-8 w-32 h-32 border-b border-l border-[#D4AF37]/20"></div>
              <div className="absolute bottom-8 right-8 font-serif text-6xl md:text-8xl lg:text-9xl font-bold uppercase opacity-5 pointer-events-none text-[#D4AF37]">BFM</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="swiper-button-prev-custom absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 border border-[#D4AF37]/40 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 group">
        <ChevronLeft className="text-[#D4AF37] group-hover:text-[#050A14] group-hover:scale-110 transition-all" />
      </button>
      <button className="swiper-button-next-custom absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 border border-[#D4AF37]/40 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 group">
        <ChevronRight className="text-[#D4AF37] group-hover:text-[#050A14] group-hover:scale-110 transition-all" />
      </button>
      <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"></div>
    </div>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    { icon: Users, title: "Model Management", desc: "Professional representation and career development for aspiring and established models" },
    { icon: Palette, title: "Designer Showcase", desc: "Platform for emerging and established designers to display their collections" },
    { icon: Sparkles, title: "Makeup & Hair Artistry", desc: "Expert makeup and hair styling services for fashion shows, editorials, and shoots" },
    { icon: Camera, title: "Photography & Videography", desc: "Professional photography and video production for fashion campaigns and content" },
    { icon: Briefcase, title: "Fashion Styling & Consulting", desc: "Expert styling services and fashion consultancy for brands and individuals" },
    { icon: Calendar, title: "Event Management", desc: "Organization and management of fashion shows, launches, and industry events" }
  ];

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Comprehensive solutions for fashion industry professionals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-8 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all duration-300 group cursor-pointer">
              <div className="mb-4 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm uppercase tracking-wider font-medium hover:bg-[#D4AF37] hover:text-white transition-all duration-300 group">
            Learn More
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#8B1538] to-[#5a0d23] text-white">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Ready to Start Your Fashion Journey?</h2>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">Join India's leading fashion talent management agency and take your career to new heights</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-full text-sm uppercase tracking-wider font-medium hover:bg-[#D4AF37] hover:text-white transition-all duration-300 group">
            Join As Talent
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 px-10 py-4 border-2 border-white text-white rounded-full text-sm uppercase tracking-wider font-medium hover:bg-white hover:text-black transition-all duration-300 group">
            Contact Us
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Talent Section
const TalentSection = () => {
  const categories = [
    "All Talent", "Models (Male)", "Models (Female)", "Designers", "Makeup Artists", 
    "Photographers", "Videographers", "Hair Stylists", "Stylists", "Fashion Consultants",
    "Creative Directors", "Agencies", "Event Organisers"
  ];
  const [activeCategory, setActiveCategory] = useState("All Talent");

  return (
    <section className="py-24 md:py-32 bg-[#050A14]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-serif text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-4">Curated Excellence</p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#F5F5F0] tracking-tight">Featured Artists</h2>
          <p className="font-accent text-xl md:text-2xl text-[#A0A5B0] max-w-3xl mx-auto italic">Discover the best of the best among fashion's finest artisans</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-full font-serif text-xs uppercase tracking-[0.15em] transition-all duration-500 border ${
                activeCategory === cat 
                  ? "bg-[#D4AF37] text-[#050A14] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  : "bg-transparent text-[#A0A5B0] border-[#A0A5B0]/30 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:shadow-2xl bg-[#F5F5F5]">
            <div className="aspect-[3/4] overflow-hidden">
              <img alt="John Model" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://via.placeholder.com/400x533" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <User size={20} />
                </div>
                <span className="text-sm uppercase tracking-wide font-medium">Model</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">John Model</h3>
              <p className="text-sm font-light mb-2 opacity-90">Professional</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-16">
          <Link to="/talents" data-testid="view-portfolio-btn" className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C168] to-[#D4AF37] text-[#050A14] rounded-full font-serif text-sm uppercase tracking-[0.15em] font-semibold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-500 group">
            Explore Our Talents
            <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Voting Section
const VotingSection = () => {
  return (
    <section className="py-24 md:py-32 bg-[#0A101E] text-[#F5F5F0] relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-6">
            <Vote className="text-[#D4AF37]" size={18} />
            <span className="text-[#D4AF37] font-serif text-xs uppercase tracking-[0.3em] animate-pulse">The People's Choice</span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#F5F5F0] tracking-tight">Curate the Season</h2>
          <p className="font-accent text-xl md:text-2xl text-[#A0A5B0] max-w-2xl mx-auto italic">Vote for your favorite fashion talent!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden group transition-all duration-300 hover:bg-white/20">
            <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-yellow-400 text-black">1</div>
            <div className="aspect-square bg-gray-800">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <Users className="text-gray-600" size={48} />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">Top Model</h3>
              <p className="text-sm text-gray-400 mb-3">0 votes</p>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105">Vote Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Login Page - Enhanced with Remember Me and Social Login
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password, rememberMe });
      if (response.data.token) {
        if (rememberMe) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          sessionStorage.setItem("token", response.data.token);
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
        }
        toast({ title: "Success", description: "Login successful!" });
        navigate("/");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.detail || "Login failed. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({ 
      title: "Coming Soon", 
      description: `${provider} login will be available soon!`
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              data-testid="google-login-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>
            
            <button 
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              data-testid="facebook-login-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continue with Facebook</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  id="email" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-black"
                  placeholder="your@email.com"
                  data-testid="login-email-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  id="password" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-black"
                  placeholder="Enter your password"
                  data-testid="login-password-input"
                />
              </div>
            </div>
            
            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37] cursor-pointer"
                  data-testid="remember-me-checkbox"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#D4AF37] font-medium hover:underline">Forgot password?</Link>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-[#D4AF37] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-btn"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-[#D4AF37] font-medium hover:underline">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, formData);
      toast({ title: "Success", description: "Account created! Please login." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Join Us</h2>
            <p className="text-gray-600">Create your account</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none text-black"
              data-testid="register-name-input"
            />
            <input 
              type="email" 
              placeholder="Email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none text-black"
              data-testid="register-email-input"
            />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none text-black"
              data-testid="register-password-input"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none text-black"
              data-testid="register-confirm-password-input"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-[#D4AF37] transition-colors"
              data-testid="register-submit-btn"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">Already have an account? <Link to="/login" className="text-[#D4AF37] font-medium hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page for Logged In Users
const DashboardPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#050A14]">
      <Navbar user={user} onLogout={onLogout} />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[#0A1628] border border-[#D4AF37]/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-4">
                <User className="text-[#050A14]" size={40} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#F5F5F0] mb-2">Welcome, {user?.name}!</h1>
              <p className="text-[#A0A5B0]">{user?.email}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl p-6">
                <h3 className="text-[#D4AF37] font-serif text-lg mb-2">Account Status</h3>
                <p className="text-[#F5F5F0] text-2xl font-bold">Active</p>
              </div>
              <div className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl p-6">
                <h3 className="text-[#D4AF37] font-serif text-lg mb-2">Member Since</h3>
                <p className="text-[#F5F5F0] text-2xl font-bold">2025</p>
              </div>
            </div>
            
            <div className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl p-6">
              <h3 className="text-[#D4AF37] font-serif text-xl mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/" className="flex items-center gap-3 p-4 bg-[#0A1628] rounded-lg hover:bg-[#D4AF37]/10 transition-colors">
                  <Camera className="text-[#D4AF37]" size={24} />
                  <span className="text-[#F5F5F0]">Browse Talents</span>
                </Link>
                <Link to="/services" className="flex items-center gap-3 p-4 bg-[#0A1628] rounded-lg hover:bg-[#D4AF37]/10 transition-colors">
                  <Briefcase className="text-[#D4AF37]" size={24} />
                  <span className="text-[#F5F5F0]">Our Services</span>
                </Link>
                <Link to="/contact" className="flex items-center gap-3 p-4 bg-[#0A1628] rounded-lg hover:bg-[#D4AF37]/10 transition-colors">
                  <Mail className="text-[#D4AF37]" size={24} />
                  <span className="text-[#F5F5F0]">Contact Us</span>
                </Link>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={onLogout}
                className="px-8 py-3 border border-red-500 text-red-500 font-serif text-sm uppercase tracking-[0.15em] hover:bg-red-500 hover:text-white transition-all rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomeWithAuth = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#050A14]">
      <Navbar user={user} onLogout={onLogout} />
      <HeroSlider />
      <TalentSection />
      <VotingSection />
      <ServicesSection />
      <CTASection />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  // Check for logged in user on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeWithAuth user={user} onLogout={handleLogout} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
          <Route path="/talents" element={<HomeWithAuth user={user} onLogout={handleLogout} />} />
          <Route path="/services" element={<HomeWithAuth user={user} onLogout={handleLogout} />} />
          <Route path="/about" element={<HomeWithAuth user={user} onLogout={handleLogout} />} />
          <Route path="/contact" element={<HomeWithAuth user={user} onLogout={handleLogout} />} />
          <Route path="/forgot-password" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

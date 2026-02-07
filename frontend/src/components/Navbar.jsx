import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, X } from "lucide-react";
import { TALENT_CATEGORIES } from "@/lib/constants";

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

export default Navbar;

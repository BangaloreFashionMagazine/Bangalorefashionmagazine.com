import { Instagram, Mail, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ContestWinnersSection from "@/components/ContestWinnersSection";

const HomePage = ({ user, talent, onLogout, heroImages, awards, ads, magazine, video }) => (
  <div className="min-h-screen bg-[#050A14]">
    <Navbar user={user} talent={talent} onLogout={onLogout} />
    <HeroSlider customSlides={heroImages} />
    
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

export default HomePage;

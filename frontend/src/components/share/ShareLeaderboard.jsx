import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, Trophy } from "lucide-react";
import { API } from "@/lib/config";

const ShareLeaderboard = () => {
  const [topTalents, setTopTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch top 3 viewed talents this week
    axios.get(`${API}/analytics/top-viewed-talents`)
      .then(res => {
        setTopTalents(res.data.top_talents || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch top talents:", err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return null;
  if (topTalents.length === 0) return null;
  
  const medals = ["🥇", "🥈", "🥉"];
  const ringColors = [
    "ring-yellow-400 ring-4", // Gold
    "ring-gray-300 ring-3",   // Silver
    "ring-amber-600 ring-2"   // Bronze
  ];
  
  return (
    <div className="bg-gradient-to-r from-[#0A1628] to-[#050A14] py-10 border-y border-[#D4AF37]/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Trophy className="text-[#D4AF37]" size={24} />
            <h2 className="text-[#D4AF37] text-xl font-serif">This Week's Top Profiles</h2>
          </div>
          <p className="text-[#A0A5B0] text-sm">Most viewed talents this week</p>
        </div>
        
        {/* Top 3 Talents */}
        <div className="flex justify-center items-end gap-4 md:gap-8">
          {/* 2nd Place */}
          {topTalents[1] && (
            <Link 
              to={`/talent/${topTalents[1].slug || topTalents[1].id}`}
              className="flex flex-col items-center group"
            >
              <div className="relative">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ${ringColors[1]} transition-transform group-hover:scale-105`}>
                  {topTalents[1].profile_image ? (
                    <img 
                      src={topTalents[1].profile_image} 
                      alt={topTalents[1].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-2xl">{topTalents[1].name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">{medals[1]}</div>
              </div>
              <p className="mt-4 text-[#F5F5F0] text-sm font-medium text-center max-w-[100px] truncate">
                {topTalents[1].name}
              </p>
              <p className="text-[#A0A5B0] text-xs">2nd</p>
            </Link>
          )}
          
          {/* 1st Place - Center & Larger */}
          {topTalents[0] && (
            <Link 
              to={`/talent/${topTalents[0].slug || topTalents[0].id}`}
              className="flex flex-col items-center group -mt-4"
            >
              <div className="relative">
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ${ringColors[0]} transition-transform group-hover:scale-105 shadow-lg shadow-yellow-400/20`}>
                  {topTalents[0].profile_image ? (
                    <img 
                      src={topTalents[0].profile_image} 
                      alt={topTalents[0].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-3xl">{topTalents[0].name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">{medals[0]}</div>
              </div>
              <p className="mt-4 text-[#D4AF37] text-base font-bold text-center max-w-[120px] truncate">
                {topTalents[0].name}
              </p>
              <p className="text-[#D4AF37] text-xs font-medium">1st</p>
            </Link>
          )}
          
          {/* 3rd Place */}
          {topTalents[2] && (
            <Link 
              to={`/talent/${topTalents[2].slug || topTalents[2].id}`}
              className="flex flex-col items-center group"
            >
              <div className="relative">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ${ringColors[2]} transition-transform group-hover:scale-105`}>
                  {topTalents[2].profile_image ? (
                    <img 
                      src={topTalents[2].profile_image} 
                      alt={topTalents[2].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-2xl">{topTalents[2].name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">{medals[2]}</div>
              </div>
              <p className="mt-4 text-[#F5F5F0] text-sm font-medium text-center max-w-[100px] truncate">
                {topTalents[2].name}
              </p>
              <p className="text-[#A0A5B0] text-xs">3rd</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareLeaderboard;

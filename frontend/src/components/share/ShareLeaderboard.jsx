import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, Star } from "lucide-react";
import { API } from "@/lib/config";

const ShareLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyViews, setWeeklyViews] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch share leaderboard
    axios.get(`${API}/share-leaderboard`)
      .then(res => {
        setLeaderboard(res.data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    
    // Fetch weekly profile views
    axios.get(`${API}/analytics/weekly-profile-views`)
      .then(res => {
        setWeeklyViews(res.data.weekly_profile_views || 0);
      })
      .catch(err => {
        console.error("Failed to fetch weekly views:", err);
      });
  }, []);
  
  if (loading) return null;
  
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  return (
    <div className="bg-gradient-to-r from-[#0A1628] to-[#050A14] py-8 border-y border-[#D4AF37]/20">
      <div className="container mx-auto px-4">
        {/* Weekly Profile Views Stats */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <Eye className="text-[#D4AF37]" size={24} />
            <div>
              <p className="text-[#A0A5B0] text-xs uppercase tracking-wider">This Week's Profile Views</p>
              <p className="text-[#D4AF37] text-3xl font-bold">{weeklyViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {leaderboard.length > 0 && (
          <>
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
                <p className="text-[#A0A5B0] text-xs">And {leaderboard.length - 5} more top talents!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShareLeaderboard;

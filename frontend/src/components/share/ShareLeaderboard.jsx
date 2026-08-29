import { useState, useEffect } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import { API } from "@/lib/config";

const ShareLeaderboard = () => {
  const [weeklyViews, setWeeklyViews] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch weekly profile views
    axios.get(`${API}/analytics/weekly-profile-views`)
      .then(res => {
        setWeeklyViews(res.data.weekly_profile_views || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch weekly views:", err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return null;
  
  return (
    <div className="bg-gradient-to-r from-[#0A1628] to-[#050A14] py-8 border-y border-[#D4AF37]/20">
      <div className="container mx-auto px-4">
        {/* Weekly Profile Views Stats */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
            <Eye className="text-[#D4AF37]" size={24} />
            <div>
              <p className="text-[#A0A5B0] text-xs uppercase tracking-wider">This Week's Profile Views</p>
              <p className="text-[#D4AF37] text-3xl font-bold">{weeklyViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLeaderboard;

import { useState, useEffect } from "react";
import { Flame, Star, Sparkles, Award } from "lucide-react";
import { API } from "@/lib/config";
import axios from "axios";

// Badge tiers based on share ranking
const BADGE_TIERS = {
  TOP_SHARER: { rank: 1, icon: Flame, label: "Top Sharer", color: "text-orange-500", bg: "bg-orange-500/20", border: "border-orange-500/50" },
  RISING_STAR: { rank: [2, 3], icon: Star, label: "Rising Star", color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400/50" },
  ACTIVE_PROMOTER: { minShares: 5, icon: Sparkles, label: "Active Promoter", color: "text-purple-400", bg: "bg-purple-400/20", border: "border-purple-400/50" },
};

// Cache for leaderboard data
let leaderboardCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute

export const fetchLeaderboardData = async () => {
  const now = Date.now();
  if (leaderboardCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return leaderboardCache;
  }
  
  try {
    const res = await axios.get(`${API}/share-leaderboard`);
    leaderboardCache = res.data.leaderboard || [];
    cacheTimestamp = now;
    return leaderboardCache;
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    return [];
  }
};

export const getTalentBadge = (talentId, leaderboard) => {
  if (!leaderboard || leaderboard.length === 0) return null;
  
  const index = leaderboard.findIndex(t => t.talent_id === talentId);
  if (index === -1) {
    // Check if talent has enough shares but not in top 10
    return null;
  }
  
  const rank = index + 1;
  const talent = leaderboard[index];
  
  if (rank === 1) {
    return { ...BADGE_TIERS.TOP_SHARER, shares: talent.total_shares };
  }
  if (rank <= 3) {
    return { ...BADGE_TIERS.RISING_STAR, shares: talent.total_shares };
  }
  if (talent.total_shares >= 5) {
    return { ...BADGE_TIERS.ACTIVE_PROMOTER, shares: talent.total_shares };
  }
  
  return null;
};

// Small badge for talent cards
export const ShareBadgeSmall = ({ talentId, leaderboard }) => {
  const badge = getTalentBadge(talentId, leaderboard);
  
  if (!badge) return null;
  
  const Icon = badge.icon;
  
  return (
    <div 
      className={`absolute top-1 right-1 z-10 flex items-center gap-0.5 px-1 py-0.5 rounded-full ${badge.bg} ${badge.border} border backdrop-blur-sm`}
      title={`${badge.label} - ${badge.shares} shares`}
    >
      <Icon size={10} className={badge.color} />
    </div>
  );
};

// Medium badge for profile cards
export const ShareBadgeMedium = ({ talentId, leaderboard }) => {
  const badge = getTalentBadge(talentId, leaderboard);
  
  if (!badge) return null;
  
  const Icon = badge.icon;
  
  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg} ${badge.border} border`}
      title={`${badge.shares} shares`}
    >
      <Icon size={12} className={badge.color} />
      <span className={`text-[10px] font-medium ${badge.color}`}>{badge.label}</span>
    </div>
  );
};

// Large badge for profile modal
export const ShareBadgeLarge = ({ talentId, leaderboard }) => {
  const badge = getTalentBadge(talentId, leaderboard);
  
  if (!badge) return null;
  
  const Icon = badge.icon;
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg} ${badge.border} border`}
    >
      <Icon size={16} className={badge.color} />
      <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
      <span className="text-[10px] text-[#A0A5B0]">({badge.shares} shares)</span>
    </div>
  );
};

// Hook for components that need leaderboard data
export const useShareLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLeaderboardData()
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      });
  }, []);
  
  return { leaderboard, loading };
};

export default ShareBadgeSmall;

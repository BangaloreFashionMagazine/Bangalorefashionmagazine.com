import { useState } from "react";
import { getCategoryDisplay } from "@/lib/constants";

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
      <div className="aspect-[3/4] overflow-hidden">
        <img src={talent.profile_image || "https://via.placeholder.com/300x400"} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      {/* Reduced overlay darkness - from-[#050A14]/70 instead of full opacity */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/70 via-[#050A14]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-wider mb-1">{getCategoryDisplay(talent.category)}</span>
        {/* Increased font weight for name - font-bold + tracking */}
        <h3 className="font-serif text-xl font-bold text-[#F5F5F0] tracking-wide">{talent.name}</h3>
        {/* Gold divider line under name */}
        <div className="w-12 h-[1px] bg-[#D4AF37]/60 mt-1.5 mb-2"></div>
        {/* Smaller, more subtle votes section */}
        <div className="flex items-center justify-between">
          <span className="text-[#F5F5F0]/60 text-xs">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37]/80 text-[10px] rounded hover:bg-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-50 transition-colors">
            {voting ? "..." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;

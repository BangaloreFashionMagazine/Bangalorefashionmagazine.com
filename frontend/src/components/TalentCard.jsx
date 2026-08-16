import { useState } from "react";
import { getCategoryDisplay } from "@/lib/constants";
import { API } from "@/lib/config";

const TalentCard = ({ talent, onVote, onClick }) => {
  const [voting, setVoting] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const handleVote = async (e) => {
    e.stopPropagation();
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  // Use thumbnail endpoint for grid view, fallback to placeholder on error
  const getImageSrc = () => {
    if (imgError) return "https://via.placeholder.com/150x200?text=No+Image";
    // If profile_image is already a URL, use it directly
    if (talent.profile_image && talent.profile_image.startsWith("http")) {
      return talent.profile_image;
    }
    // Otherwise, use the thumbnail endpoint
    return `${API}/talent/${talent.id}/thumb`;
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-[#0A1628] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer w-full"
      onClick={() => onClick(talent)}
      data-testid={`talent-card-${talent.id}`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img 
          src={getImageSrc()} 
          alt={talent.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
      {/* Reduced overlay darkness */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/70 via-[#050A14]/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">{getCategoryDisplay(talent.category)}</span>
        {/* Increased font weight for name */}
        <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#F5F5F0] tracking-wide truncate">{talent.name}</h3>
        {/* Gold divider line under name */}
        <div className="w-10 sm:w-12 h-[1px] bg-[#D4AF37]/60 mt-1 mb-1.5 sm:mt-1.5 sm:mb-2"></div>
        {/* Smaller, more subtle votes section */}
        <div className="flex items-center justify-between">
          <span className="text-[#F5F5F0]/60 text-[10px] sm:text-xs">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37]/80 text-[8px] sm:text-[10px] rounded hover:bg-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-50 transition-colors">
            {voting ? "..." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;

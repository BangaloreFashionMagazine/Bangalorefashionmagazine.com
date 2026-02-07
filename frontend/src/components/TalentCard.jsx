import { useState } from "react";

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase mb-1">{talent.category}</span>
        <h3 className="font-serif text-lg font-bold text-[#F5F5F0]">{talent.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] text-sm">{talent.votes || 0} votes</span>
          <button onClick={handleVote} disabled={voting} className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded hover:bg-[#D4AF37] hover:text-[#050A14] disabled:opacity-50">
            {voting ? "..." : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;

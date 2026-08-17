import { Award, X } from "lucide-react";
import { useState } from "react";

const ContestWinnersSection = ({ awards }) => {
  const [selectedWinner, setSelectedWinner] = useState(null);
  
  if (!awards || awards.length === 0) return null;
  
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#050A14] to-[#0A1628]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-widest">Recognition</span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F5F5F0] mt-2">Contest Winners</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {awards.map((award, i) => (
            <div 
              key={i} 
              className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-[#D4AF37]/50 transition-all"
              onClick={() => setSelectedWinner(award)}
            >
              {award.winner_image && (
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img src={award.winner_image} alt={award.winner_name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-[#D4AF37] flex-shrink-0" size={18} />
                  <span className="text-[#D4AF37] text-xs sm:text-sm uppercase truncate">{award.title}</span>
                </div>
                <h3 className="text-[#F5F5F0] font-bold text-lg md:text-xl line-clamp-2">{award.winner_name}</h3>
                {award.category && <p className="text-[#A0A5B0] text-xs mt-1">{award.category}</p>}
                {award.description && <p className="text-[#A0A5B0] text-sm mt-2 line-clamp-3 flex-1">{award.description}</p>}
                <p className="text-[#D4AF37]/60 text-xs mt-3">Click to view full details</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Full Detail Modal */}
      {selectedWinner && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedWinner(null)}
        >
          <div 
            className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedWinner.winner_image && (
                <img 
                  src={selectedWinner.winner_image} 
                  alt={selectedWinner.winner_name} 
                  className="w-full h-64 sm:h-80 object-cover"
                />
              )}
              <button 
                onClick={() => setSelectedWinner(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="text-[#D4AF37]" size={24} />
                <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{selectedWinner.title}</span>
              </div>
              <h2 className="text-[#F5F5F0] font-serif text-2xl sm:text-3xl font-bold mb-2">{selectedWinner.winner_name}</h2>
              {selectedWinner.category && (
                <p className="text-[#D4AF37]/80 text-sm mb-4">{selectedWinner.category}</p>
              )}
              {selectedWinner.description && (
                <p className="text-[#A0A5B0] leading-relaxed">{selectedWinner.description}</p>
              )}
              {selectedWinner.date && (
                <p className="text-[#A0A5B0]/60 text-sm mt-4">Award Date: {selectedWinner.date}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContestWinnersSection;

import { Award } from "lucide-react";

const ContestWinnersSection = ({ awards }) => {
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
            <div key={i} className="bg-[#050A14] border border-[#D4AF37]/20 rounded-xl overflow-hidden flex flex-col">
              {award.winner_image && (
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img src={award.winner_image} alt={award.winner_name} className="w-full h-full object-cover" />
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContestWinnersSection;

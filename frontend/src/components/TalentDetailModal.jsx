import { useState } from "react";
import { X, Vote } from "lucide-react";

const TalentDetailModal = ({ talent, onClose, onVote }) => {
  const [voting, setVoting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!talent) return null;

  const handleVote = async () => {
    setVoting(true);
    await onVote(talent.id);
    setVoting(false);
  };

  const allImages = [talent.profile_image, ...(talent.portfolio_images || [])].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#0A1628] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[#050A14] rounded-full text-[#F5F5F0] hover:text-[#D4AF37] z-10">
          <X size={24} />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase tracking-wider rounded mb-3">{talent.category}</span>
            <h2 className="font-serif text-3xl font-bold text-[#F5F5F0]">{talent.name}</h2>
          </div>
          
          {talent.bio && (
            <div className="mb-6 text-center">
              <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-2">About</h3>
              <p className="text-[#A0A5B0] max-w-2xl mx-auto">{talent.bio}</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-[#D4AF37]/20">
            <span className="text-[#F5F5F0]"><strong className="text-[#D4AF37] text-2xl">{talent.votes || 0}</strong> votes</span>
            <button 
              onClick={handleVote} 
              disabled={voting}
              className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold hover:bg-[#F5F5F0] disabled:opacity-50 flex items-center gap-2"
            >
              <Vote size={18} />
              {voting ? "Voting..." : "Vote"}
            </button>
          </div>
          
          <div>
            <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider mb-4 text-center">Photo Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allImages.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt={`${talent.name} - Photo ${i + 1}`} 
                  className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
            {allImages.length === 0 && (
              <p className="text-[#A0A5B0] text-center py-8">No photos available</p>
            )}
          </div>
        </div>
        
        {selectedImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
              <X size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDetailModal;

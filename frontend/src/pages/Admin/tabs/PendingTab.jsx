import { Check, X } from "lucide-react";

const PendingTab = ({ pending, loading, openTalentDetail, approve, reject }) => {
  return (
    <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
      <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Pending Approvals</h2>
      <p className="text-[#A0A5B0] text-sm mb-4">Click on a profile to view full details before approving.</p>
      {loading ? <p className="text-[#A0A5B0]">Loading...</p> : pending.length === 0 ? <p className="text-[#A0A5B0]">No pending registrations</p> : (
        <div className="space-y-4">
          {pending.map(t => (
            <div key={t.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#0D1B2A] transition-colors" onClick={() => openTalentDetail(t)}>
                <img src={t.profile_image || "https://via.placeholder.com/80"} className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]/30" />
                <div className="flex-1">
                  <p className="text-[#F5F5F0] font-bold text-lg">{t.name}</p>
                  <p className="text-[#D4AF37] text-sm">{t.category}</p>
                  <p className="text-[#A0A5B0] text-xs mt-1">{t.email} • {t.phone || "No phone"}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {t.agreed_to_terms ? (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check size={14} /> Terms Agreed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <X size={14} /> Terms NOT Agreed
                      </span>
                    )}
                  </div>
                  <p className="text-[#A0A5B0] text-xs">
                    {t.portfolio_images?.length || 0} portfolio images
                  </p>
                </div>
              </div>
              <div className="flex border-t border-[#D4AF37]/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); openTalentDetail(t); }} 
                  className="flex-1 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-sm font-medium"
                >
                  View Full Details
                </button>
                <button onClick={(e) => { e.stopPropagation(); approve(t.id); }} className="flex-1 py-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Check size={16} /> Approve
                </button>
                <button onClick={(e) => { e.stopPropagation(); reject(t.id); }} className="flex-1 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTab;

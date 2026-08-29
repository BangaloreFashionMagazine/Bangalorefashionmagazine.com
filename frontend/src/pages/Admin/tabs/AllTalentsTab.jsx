import { Download } from "lucide-react";
import { API, getCategoryDisplay } from "@/lib/config";

const AllTalentsTab = ({
  allTalents,
  loading,
  categoryFilter,
  setCategoryFilter,
  talentSearchAdmin,
  setTalentSearchAdmin,
  openTalentDetail,
  updateRank,
  deleteTalent,
  fetchAllTalents,
  toast
}) => {
  // Options are derived from the categories actually present on fetched talents
  // (raw database form), so the filter value always matches real talent.category
  // values - never from the display-name list, which uses different strings.
  const availableCategories = [...new Set(allTalents.map(t => t.category).filter(Boolean))].sort();

  const filteredTalents = allTalents.filter(t =>
    (!categoryFilter || t.category === categoryFilter) &&
    (!talentSearchAdmin || t.name.toLowerCase().includes(talentSearchAdmin.toLowerCase()))
  );

  const toggleFeatured = async (talent) => {
    try {
      const axios = (await import('axios')).default;
      await axios.put(`${API}/admin/talent/${talent.id}/featured?featured=${!talent.is_featured}`);
      toast({ title: talent.is_featured ? "Removed from Featured" : "Added to Featured!" });
      fetchAllTalents();
    } catch (err) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const togglePaid = async (talent) => {
    try {
      const axios = (await import('axios')).default;
      await axios.put(`${API}/admin/talent/${talent.id}/mark-paid`, { paid: !talent.is_paid_manual });
      toast({ title: talent.is_paid_manual ? "Marked as Unpaid" : "Marked as Paid!" });
      fetchAllTalents();
    } catch (err) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const exportTalents = async () => {
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`${API}/admin/talents/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'talents_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  return (
    <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
        <h2 className="text-lg font-bold text-[#F5F5F0]">All Registered Talents ({allTalents.length})</h2>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={talentSearchAdmin}
              onChange={(e) => setTalentSearchAdmin(e.target.value)}
              className="px-3 py-2 pl-8 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm w-48"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A5B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
          >
            <option value="">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{getCategoryDisplay(cat)}</option>
            ))}
          </select>
          {(talentSearchAdmin || categoryFilter) && (
            <button
              onClick={() => { setTalentSearchAdmin(''); setCategoryFilter(''); }}
              className="px-3 py-2 text-[#A0A5B0] hover:text-[#D4AF37] text-sm"
            >
              Clear
            </button>
          )}
          <button onClick={exportTalents}
            className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Filter Results Info */}
      {(talentSearchAdmin || categoryFilter) && (
        <div className="mb-4 text-[#A0A5B0] text-sm">
          Showing {filteredTalents.length} of {allTalents.length} talents
          {talentSearchAdmin && <span className="text-[#D4AF37]"> matching "{talentSearchAdmin}"</span>}
          {categoryFilter && <span className="text-[#D4AF37]"> in {getCategoryDisplay(categoryFilter)}</span>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent mr-3"></div>
          <span className="ml-3 text-[#A0A5B0]">Loading talents...</span>
        </div>
      ) : filteredTalents.length === 0 ? (
        <p className="text-[#A0A5B0] text-center py-8">
          {(categoryFilter || talentSearchAdmin) ? `No talents found matching your filters.` : "No talents found."}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTalents.map(t => (
            <div key={t.id} className="bg-[#050A14] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer hover:bg-[#0D1B2A] transition-colors" onClick={() => openTalentDetail(t)}>
              <img src={t.profile_image || "https://via.placeholder.com/60"} className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#F5F5F0] font-bold">{t.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${t.is_approved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>{t.is_approved ? "Approved" : "Pending"}</span>
                  {t.is_featured && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">⭐ Featured</span>}
                  {t.is_paid_manual && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">✓ Paid</span>}
                  {t.rank && <span className="text-xs px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded">Rank #{t.rank}</span>}
                </div>
                <p className="text-[#D4AF37] text-sm">{getCategoryDisplay(t.category)}</p>
                <p className="text-[#A0A5B0] text-xs truncate">{t.email} {t.phone ? `• ${t.phone}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFeatured(t); }}
                  className={`px-2 py-1 rounded text-xs ${t.is_featured ? "bg-purple-500/30 text-purple-400" : "bg-[#0A1628] text-[#A0A5B0] hover:text-purple-400"}`}
                  title={t.is_featured ? "Remove from Spotlight" : "Add to Talent Spotlight"}
                >
                  {t.is_featured ? "★ Featured" : "☆ Feature"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePaid(t); }}
                  className={`px-2 py-1 rounded text-xs ${t.is_paid_manual ? "bg-green-500/30 text-green-400" : "bg-[#0A1628] text-[#A0A5B0] hover:text-green-400"}`}
                  title={t.is_paid_manual ? "Mark as Unpaid" : "Mark as Paid (It's Me)"}
                >
                  {t.is_paid_manual ? "✓ Paid" : "Mark Paid"}
                </button>
                <input type="number" min="1" max="9999" placeholder="Rank" onClick={(e) => e.stopPropagation()} value={t.rank || ""} onChange={(e) => updateRank(t.id, parseInt(e.target.value) || null)} className="px-2 py-1 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm w-20" />
                <span className="text-[#A0A5B0] text-sm">{t.votes || 0} votes</span>
                <button onClick={(e) => { e.stopPropagation(); deleteTalent(t.id); }} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTalentsTab;

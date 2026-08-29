import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Trophy, Plus, Edit, Trash2, Eye, Users, Calendar, Clock, 
  Search, X, Check, Award, Share2, ExternalLink, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

// Create admin axios instance
const adminApi = axios.create();
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ContestManagementTab = () => {
  const { toast } = useToast();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [showTalentSearch, setShowTalentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    banner_image: "",
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "23:59",
    rules: "",
    voting_instructions: "",
    status: "draft",
    is_featured: false,
    participant_ids: []
  });

  const statusColors = {
    draft: "bg-gray-500/20 text-gray-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    live: "bg-green-500/20 text-green-400",
    closed: "bg-red-500/20 text-red-400",
    winner_announced: "bg-[#D4AF37]/20 text-[#D4AF37]"
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await adminApi.get(`${API}/admin/contests`);
      setContests(res.data);
    } catch (err) {
      toast({ title: "Failed to load contests", variant: "destructive" });
    }
    setLoading(false);
  };

  const searchTalents = async () => {
    try {
      const res = await adminApi.get(`${API}/admin/talents/search?q=${searchQuery}&category=${searchCategory}`);
      setSearchResults(res.data);
    } catch (err) {
      toast({ title: "Search failed", variant: "destructive" });
    }
  };

  const createContest = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    try {
      await adminApi.post(`${API}/admin/contests`, formData);
      toast({ title: "Contest created!" });
      setShowCreateModal(false);
      resetForm();
      fetchContests();
    } catch (err) {
      toast({ title: "Failed to create contest", variant: "destructive" });
    }
  };

  const updateContest = async () => {
    try {
      await adminApi.put(`${API}/admin/contests/${selectedContest.id}`, formData);
      toast({ title: "Contest updated!" });
      setShowEditModal(false);
      fetchContests();
    } catch (err) {
      toast({ title: "Failed to update contest", variant: "destructive" });
    }
  };

  const deleteContest = async (id) => {
    if (!confirm("Delete this contest? This will also delete all votes.")) return;
    try {
      await adminApi.delete(`${API}/admin/contests/${id}`);
      toast({ title: "Contest deleted" });
      fetchContests();
    } catch (err) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const announceWinner = async (contestId) => {
    if (!confirm("Announce winner based on current votes?")) return;
    try {
      const res = await adminApi.post(`${API}/admin/contests/${contestId}/announce-winner`);
      toast({ title: `Winner: ${res.data.winner?.name} with ${res.data.votes} votes!` });
      fetchContests();
    } catch (err) {
      toast({ title: err.response?.data?.detail || "Failed to announce winner", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", description: "", banner_image: "", start_date: "", start_time: "00:00",
      end_date: "", end_time: "23:59", rules: "", voting_instructions: "",
      status: "draft", is_featured: false, participant_ids: []
    });
  };

  const openEditModal = (contest) => {
    setSelectedContest(contest);
    setFormData({
      name: contest.name || "",
      description: contest.description || "",
      banner_image: contest.banner_image || "",
      start_date: contest.start_date || "",
      start_time: contest.start_time || "00:00",
      end_date: contest.end_date || "",
      end_time: contest.end_time || "23:59",
      rules: contest.rules || "",
      voting_instructions: contest.voting_instructions || "",
      status: contest.status || "draft",
      is_featured: contest.is_featured || false,
      participant_ids: contest.participant_ids || []
    });
    setShowEditModal(true);
  };

  const addParticipant = (talent) => {
    if (!formData.participant_ids.includes(talent.id)) {
      setFormData(prev => ({
        ...prev,
        participant_ids: [...prev.participant_ids, talent.id]
      }));
    }
  };

  const removeParticipant = (talentId) => {
    setFormData(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.filter(id => id !== talentId)
    }));
  };

  const copyContestLink = (contest) => {
    const url = `${window.location.origin}/contest/${contest.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Contest link copied!" });
  };

  if (loading) return <div className="text-center py-8 text-[#A0A5B0]">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Trophy className="text-[#D4AF37]" /> Contest Management
          </h2>
          <p className="text-[#A0A5B0] text-sm">Create and manage voting contests</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold"
        >
          <Plus size={18} /> Create Contest
        </button>
      </div>

      {/* Contest List */}
      <div className="space-y-4">
        {contests.length === 0 ? (
          <div className="text-center py-12 bg-[#0A1628] rounded-xl border border-[#D4AF37]/20">
            <Trophy className="mx-auto text-[#D4AF37]/30 mb-4" size={48} />
            <p className="text-[#A0A5B0]">No contests yet. Create your first contest!</p>
          </div>
        ) : (
          contests.map(contest => (
            <div key={contest.id} className="bg-[#0A1628] rounded-xl border border-[#D4AF37]/20 overflow-hidden">
              {/* Contest Header */}
              <div className="p-4 border-b border-[#D4AF37]/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {contest.banner_image && (
                    <img src={contest.banner_image} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div>
                    <h3 className="text-[#F5F5F0] font-bold text-lg">{contest.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-[#A0A5B0]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {contest.start_date} - {contest.end_date}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[contest.status]}`}>
                        {contest.status?.replace("_", " ").toUpperCase()}
                      </span>
                      {contest.is_featured && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[#D4AF37]/20 text-[#D4AF37]">Featured</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyContestLink(contest)} className="p-2 text-[#A0A5B0] hover:text-[#D4AF37]" title="Copy Link">
                    <Share2 size={18} />
                  </button>
                  <button onClick={() => openEditModal(contest)} className="p-2 text-[#A0A5B0] hover:text-[#D4AF37]" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteContest(contest.id)} className="p-2 text-[#A0A5B0] hover:text-red-400" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Participants & Votes */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A0A5B0] text-sm">
                    {contest.participants?.length || 0} Participants • {contest.total_votes || 0} Total Votes
                  </span>
                  {contest.status === "live" && (
                    <button
                      onClick={() => fetchContests()}
                      className="text-[#D4AF37] text-sm flex items-center gap-1"
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  )}
                </div>

                {/* Vote Table */}
                {contest.participants && contest.participants.length > 0 && (
                  <div className="bg-[#050A14] rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0A1628]">
                        <tr className="text-[#A0A5B0]">
                          <th className="p-3 text-left">Rank</th>
                          <th className="p-3 text-left">Talent</th>
                          <th className="p-3 text-center">Votes</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contest.participants.map((p, idx) => (
                          <tr key={p.id} className="border-t border-[#D4AF37]/10">
                            <td className="p-3 text-[#D4AF37] font-bold">
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {p.profile_image && (
                                  <img src={p.profile_image} className="w-8 h-8 rounded-full object-cover" />
                                )}
                                <span className="text-[#F5F5F0]">{p.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-[#F5F5F0] font-bold">{p.votes || 0}</td>
                            <td className="p-3 text-center">
                              {idx === 0 && p.votes > 0 && (
                                <span className="text-green-400 text-xs">Leading</span>
                              )}
                              {contest.winner_id === p.id && (
                                <span className="text-[#D4AF37] text-xs flex items-center justify-center gap-1">
                                  <Award size={14} /> Winner
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {contest.status === "closed" && !contest.winner_id && (
                    <button
                      onClick={() => announceWinner(contest.id)}
                      className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                      <Award size={16} /> Announce Winner
                    </button>
                  )}
                  <a
                    href={`/contest/${contest.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-sm flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> View Public Page
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full border border-[#D4AF37]/20 my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between sticky top-0 bg-[#0A1628] z-10">
              <h3 className="text-[#F5F5F0] font-bold text-lg">
                {showEditModal ? "Edit Contest" : "Create Contest"}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="text-[#A0A5B0]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-1">Contest Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  placeholder="e.g., BFM Model of the Month"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] h-20"
                  placeholder="Contest description..."
                />
              </div>

              {/* Banner Image */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  placeholder="https://..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A0A5B0] text-sm block mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm block mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm block mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A0A5B0] text-sm block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0]"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live (Voting Open)</option>
                    <option value="closed">Closed</option>
                    <option value="winner_announced">Winner Announced</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-[#F5F5F0] text-sm">Featured on Homepage</label>
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-1">Rules</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] h-20"
                  placeholder="Contest rules..."
                />
              </div>

              {/* Voting Instructions */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-1">Voting Instructions</label>
                <textarea
                  value={formData.voting_instructions}
                  onChange={(e) => setFormData({ ...formData, voting_instructions: e.target.value })}
                  className="w-full px-4 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] h-20"
                  placeholder="How to vote..."
                />
              </div>

              {/* Participants */}
              <div>
                <label className="text-[#A0A5B0] text-sm block mb-2">Participating Talents ({formData.participant_ids.length})</label>
                
                {/* Search Talents */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search talents..."
                    className="flex-1 px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] text-sm"
                  />
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="Model - Female">Model - Female</option>
                    <option value="Model - Male">Model - Male</option>
                    <option value="Photographers">Photographers</option>
                    <option value="Makeup Artists">Makeup Artists</option>
                  </select>
                  <button
                    onClick={searchTalents}
                    className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-sm"
                  >
                    <Search size={16} />
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-3 max-h-40 overflow-y-auto bg-[#050A14] rounded-lg p-2 space-y-1">
                    {searchResults.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 hover:bg-[#0A1628] rounded">
                        <div className="flex items-center gap-2">
                          {t.profile_image && <img src={t.profile_image} className="w-8 h-8 rounded-full object-cover" />}
                          <span className="text-[#F5F5F0] text-sm">{t.name}</span>
                          <span className="text-[#A0A5B0] text-xs">{t.category}</span>
                        </div>
                        <button
                          onClick={() => addParticipant(t)}
                          disabled={formData.participant_ids.includes(t.id)}
                          className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-xs disabled:opacity-30"
                        >
                          {formData.participant_ids.includes(t.id) ? "Added" : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Participants */}
                <div className="flex flex-wrap gap-2">
                  {formData.participant_ids.map(pid => {
                    const talent = searchResults.find(t => t.id === pid) || 
                                   (selectedContest?.participants?.find(p => p.id === pid));
                    return (
                      <span key={pid} className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm flex items-center gap-1">
                        {talent?.name || pid.slice(0, 8)}
                        <button onClick={() => removeParticipant(pid)} className="hover:text-red-400">
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={showEditModal ? updateContest : createContest}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold"
                >
                  {showEditModal ? "Update Contest" : "Create Contest"}
                </button>
                <button
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                  className="px-6 py-3 bg-[#050A14] text-[#A0A5B0] rounded-lg border border-[#D4AF37]/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestManagementTab;

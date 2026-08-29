import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Trophy, Plus, Edit, Trash2, Eye, EyeOff, Users, Calendar, Clock, 
  Search, X, Check, Award, Share2, ExternalLink, RefreshCw, Upload, TrendingUp, BarChart3,
  Image, Palette, Type, Move, Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";
import { autoCompressImage } from "@/lib/imageOptimization";

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
  const [showAnalytics, setShowAnalytics] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

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
    is_visible: true,
    participant_ids: [],
    share_template_story: {
      logo_position: "bottom",
      logo_size: 120,
      text_color: "#FFFFFF",
      overlay_color: "rgba(0,0,0,0.5)",
      overlay_position: "bottom",
      custom_text: "Vote Now!",
      show_contest_name: true,
      show_vote_count: false,
      font_size: 32
    },
    share_template_feed: {
      logo_position: "bottom",
      logo_size: 100,
      text_color: "#FFFFFF",
      overlay_color: "rgba(0,0,0,0.5)",
      overlay_position: "bottom",
      custom_text: "Vote Now!",
      show_contest_name: true,
      show_vote_count: false,
      font_size: 28
    }
  });

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState("story"); // story or feed
  const previewCanvasRef = useRef(null);

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

  const defaultShareTemplate = {
    logo_position: "bottom",
    logo_size: 120,
    text_color: "#FFFFFF",
    overlay_color: "rgba(0,0,0,0.5)",
    overlay_position: "bottom",
    custom_text: "Vote Now!",
    show_contest_name: true,
    show_vote_count: false,
    font_size: 32
  };

  const resetForm = () => {
    setFormData({
      name: "", description: "", banner_image: "", start_date: "", start_time: "00:00",
      end_date: "", end_time: "23:59", rules: "", voting_instructions: "",
      status: "draft", is_featured: false, is_visible: true, participant_ids: [],
      share_template_story: { ...defaultShareTemplate },
      share_template_feed: { ...defaultShareTemplate, logo_size: 100, font_size: 28 }
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
      is_visible: contest.is_visible !== false,
      participant_ids: contest.participant_ids || [],
      share_template_story: contest.share_template_story || { ...defaultShareTemplate },
      share_template_feed: contest.share_template_feed || { ...defaultShareTemplate, logo_size: 100, font_size: 28 }
    });
    setShowEditModal(true);
  };

  const fetchAnalytics = async (contestId) => {
    setLoadingAnalytics(true);
    setShowAnalytics(contestId);
    try {
      const res = await adminApi.get(`${API}/admin/contests/${contestId}/analytics`);
      setAnalyticsData(res.data);
    } catch (err) {
      toast({ title: "Failed to load analytics", variant: "destructive" });
    }
    setLoadingAnalytics(false);
  };

  const toggleVisibility = async (contest) => {
    const newVisibility = contest.is_visible === false ? true : false;
    try {
      await adminApi.put(`${API}/admin/contests/${contest.id}`, { is_visible: newVisibility });
      toast({ title: newVisibility ? "Contest is now visible" : "Contest hidden from public" });
      fetchContests();
    } catch (err) {
      toast({ title: "Failed to update visibility", variant: "destructive" });
    }
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
                      {contest.is_visible === false && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Hidden</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleVisibility(contest)} 
                    className={`p-2 rounded ${contest.is_visible === false ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}
                    title={contest.is_visible === false ? "Hidden - Click to show" : "Visible - Click to hide"}
                  >
                    {contest.is_visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => fetchAnalytics(contest.id)}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm flex items-center gap-2"
                  >
                    <BarChart3 size={16} /> Vote Analytics
                  </button>
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
                <label className="text-[#A0A5B0] text-sm block mb-1">Banner Image</label>
                <div className="space-y-2">
                  {formData.banner_image && (
                    <div className="relative">
                      <img src={formData.banner_image} className="w-full h-32 object-cover rounded-lg" alt="Banner" />
                      <button
                        onClick={() => setFormData({ ...formData, banner_image: "" })}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#D4AF37]/30 rounded-lg cursor-pointer hover:border-[#D4AF37] text-[#A0A5B0] hover:text-[#D4AF37]">
                    <Upload size={20} />
                    <span>{uploadingBanner ? "Uploading..." : "Upload Banner Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBanner}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setUploadingBanner(true);
                        try {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const compressed = await autoCompressImage(reader.result, 1200);
                            setFormData(prev => ({ ...prev, banner_image: compressed }));
                            toast({ title: "Banner uploaded!" });
                            setUploadingBanner(false);
                          };
                          reader.readAsDataURL(file);
                        } catch (err) {
                          toast({ title: "Upload failed", variant: "destructive" });
                          setUploadingBanner(false);
                        }
                      }}
                    />
                  </label>
                </div>
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

              {/* Status & Visibility */}
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
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-[#F5F5F0] text-sm">Visible to Public</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-[#F5F5F0] text-sm">Featured on Homepage</label>
                  </div>
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
                    <option value="Model">Model</option>
                    <option value="Model - Female">Model - Female</option>
                    <option value="Model - Male">Model - Male</option>
                    <option value="Photography">Photography</option>
                    <option value="Makeup & Hair">Makeup & Hair</option>
                    <option value="Designers">Designers</option>
                    <option value="Designer Store">Designer Store</option>
                    <option value="Other">Other</option>
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

              {/* Instagram Share Template Settings */}
              <div className="border border-[#D4AF37]/30 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowShareSettings(!showShareSettings)}
                  className="w-full p-4 flex items-center justify-between bg-[#050A14] hover:bg-[#0A1628] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <Image size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[#F5F5F0] font-medium">Instagram Share Settings</h4>
                      <p className="text-[#A0A5B0] text-xs">Customize how voters share on Instagram</p>
                    </div>
                  </div>
                  <Settings2 size={20} className={`text-[#D4AF37] transition-transform ${showShareSettings ? 'rotate-180' : ''}`} />
                </button>

                {showShareSettings && (
                  <div className="p-4 border-t border-[#D4AF37]/20 space-y-4">
                    {/* Story/Feed Tabs */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveShareTab("story")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeShareTab === "story" 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                            : "bg-[#050A14] text-[#A0A5B0]"
                        }`}
                      >
                        Story (9:16)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveShareTab("feed")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeShareTab === "feed" 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                            : "bg-[#050A14] text-[#A0A5B0]"
                        }`}
                      >
                        Feed (4:5)
                      </button>
                    </div>

                    {/* Template Settings */}
                    {(() => {
                      const templateKey = activeShareTab === "story" ? "share_template_story" : "share_template_feed";
                      const template = formData[templateKey];
                      const updateTemplate = (field, value) => {
                        setFormData(prev => ({
                          ...prev,
                          [templateKey]: { ...prev[templateKey], [field]: value }
                        }));
                      };

                      return (
                        <div className="space-y-4">
                          {/* Logo Position */}
                          <div>
                            <label className="text-[#A0A5B0] text-sm flex items-center gap-2 mb-2">
                              <Move size={14} /> Logo Position
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {["top-left", "top", "top-right", "bottom-left", "bottom", "bottom-right"].map(pos => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => updateTemplate("logo_position", pos)}
                                  className={`py-2 px-3 rounded text-xs capitalize ${
                                    template.logo_position === pos 
                                      ? "bg-[#D4AF37] text-[#050A14]" 
                                      : "bg-[#050A14] text-[#A0A5B0]"
                                  }`}
                                >
                                  {pos.replace("-", " ")}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Overlay Position */}
                          <div>
                            <label className="text-[#A0A5B0] text-sm flex items-center gap-2 mb-2">
                              <Palette size={14} /> Overlay Position
                            </label>
                            <div className="flex gap-2">
                              {["top", "bottom", "full"].map(pos => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => updateTemplate("overlay_position", pos)}
                                  className={`flex-1 py-2 rounded text-xs capitalize ${
                                    template.overlay_position === pos 
                                      ? "bg-[#D4AF37] text-[#050A14]" 
                                      : "bg-[#050A14] text-[#A0A5B0]"
                                  }`}
                                >
                                  {pos}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Text */}
                          <div>
                            <label className="text-[#A0A5B0] text-sm flex items-center gap-2 mb-2">
                              <Type size={14} /> Call-to-Action Text
                            </label>
                            <input
                              type="text"
                              value={template.custom_text}
                              onChange={(e) => updateTemplate("custom_text", e.target.value)}
                              placeholder="Vote Now!"
                              className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] text-sm"
                            />
                          </div>

                          {/* Colors */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[#A0A5B0] text-sm block mb-2">Text Color</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={template.text_color}
                                  onChange={(e) => updateTemplate("text_color", e.target.value)}
                                  className="w-10 h-10 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={template.text_color}
                                  onChange={(e) => updateTemplate("text_color", e.target.value)}
                                  className="flex-1 px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-sm block mb-2">Font Size</label>
                              <input
                                type="number"
                                value={template.font_size}
                                onChange={(e) => updateTemplate("font_size", parseInt(e.target.value) || 28)}
                                min={16}
                                max={64}
                                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded-lg text-[#F5F5F0] text-sm"
                              />
                            </div>
                          </div>

                          {/* Toggles */}
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-[#F5F5F0] text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={template.show_contest_name}
                                onChange={(e) => updateTemplate("show_contest_name", e.target.checked)}
                                className="w-4 h-4"
                              />
                              Show Contest Name
                            </label>
                            <label className="flex items-center gap-2 text-[#F5F5F0] text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={template.show_vote_count}
                                onChange={(e) => updateTemplate("show_vote_count", e.target.checked)}
                                className="w-4 h-4"
                              />
                              Show Vote Count
                            </label>
                          </div>

                          {/* Logo Size */}
                          <div>
                            <label className="text-[#A0A5B0] text-sm block mb-2">Logo Size: {template.logo_size}px</label>
                            <input
                              type="range"
                              min={60}
                              max={200}
                              value={template.logo_size}
                              onChange={(e) => updateTemplate("logo_size", parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full border border-[#D4AF37]/20 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between sticky top-0 bg-[#0A1628] z-10">
              <h3 className="text-[#F5F5F0] font-bold text-lg flex items-center gap-2">
                <BarChart3 className="text-purple-400" /> Vote Analytics
              </h3>
              <button onClick={() => { setShowAnalytics(null); setAnalyticsData(null); }} className="text-[#A0A5B0] hover:text-[#F5F5F0]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {loadingAnalytics ? (
                <div className="text-center py-8 text-[#A0A5B0]">Loading analytics...</div>
              ) : analyticsData ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050A14] rounded-lg p-4 text-center">
                      <p className="text-[#A0A5B0] text-sm">Total Votes</p>
                      <p className="text-3xl font-bold text-[#D4AF37]">{analyticsData.total_votes}</p>
                    </div>
                    <div className="bg-[#050A14] rounded-lg p-4 text-center">
                      <p className="text-[#A0A5B0] text-sm">Status</p>
                      <p className="text-xl font-bold text-[#F5F5F0] capitalize">{analyticsData.status?.replace("_", " ")}</p>
                    </div>
                  </div>

                  {/* Daily Votes Chart */}
                  {analyticsData.daily_votes && analyticsData.daily_votes.length > 0 && (
                    <div>
                      <h4 className="text-[#F5F5F0] font-medium mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-400" /> Daily Voting Trend
                      </h4>
                      <div className="bg-[#050A14] rounded-lg p-4">
                        <div className="flex items-end gap-2 h-32">
                          {analyticsData.daily_votes.map((d, idx) => {
                            const maxVotes = Math.max(...analyticsData.daily_votes.map(x => x.votes));
                            const height = maxVotes > 0 ? (d.votes / maxVotes) * 100 : 0;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full bg-[#D4AF37] rounded-t min-h-[4px]"
                                  style={{ height: `${height}%` }}
                                  title={`${d.date}: ${d.votes} votes`}
                                />
                                <span className="text-[#A0A5B0] text-xs mt-1 truncate w-full text-center">
                                  {d.date.slice(5)}
                                </span>
                                <span className="text-[#F5F5F0] text-xs font-bold">{d.votes}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Talent Breakdown */}
                  {analyticsData.talent_votes && analyticsData.talent_votes.length > 0 && (
                    <div>
                      <h4 className="text-[#F5F5F0] font-medium mb-3">Votes by Participant</h4>
                      <div className="space-y-2">
                        {analyticsData.talent_votes.map((t, idx) => {
                          const percentage = analyticsData.total_votes > 0 
                            ? ((t.votes / analyticsData.total_votes) * 100).toFixed(1) 
                            : 0;
                          return (
                            <div key={t.id} className="bg-[#050A14] rounded-lg p-3 flex items-center gap-3">
                              <span className="text-[#D4AF37] font-bold w-6">{idx + 1}</span>
                              {t.profile_image && (
                                <img src={t.profile_image} className="w-10 h-10 rounded-full object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-[#F5F5F0] font-medium">{t.name}</p>
                                <div className="w-full bg-[#0A1628] rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-[#D4AF37] h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[#F5F5F0] font-bold">{t.votes}</p>
                                <p className="text-[#A0A5B0] text-xs">{percentage}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {analyticsData.total_votes === 0 && (
                    <div className="text-center py-8 text-[#A0A5B0]">
                      No votes recorded yet for this contest.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-[#A0A5B0]">No data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestManagementTab;

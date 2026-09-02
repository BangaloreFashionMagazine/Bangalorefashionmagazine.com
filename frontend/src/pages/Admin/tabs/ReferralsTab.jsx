import { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, Phone, Mail, Instagram, Check, X, MessageCircle, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

const ReferralsTab = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, contacted, approved, rejected
  const { toast } = useToast();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferrals(res.data);
    } catch (err) {
      toast({ title: "Failed to load referrals", variant: "destructive" });
    }
    setLoading(false);
  };

  const updateStatus = async (referralId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/referrals/${referralId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: `Marked as ${status}` });
      fetchReferrals();
    } catch (err) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const deleteReferral = async (referralId) => {
    if (!window.confirm("Delete this referral?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/referrals/${referralId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Referral deleted" });
      fetchReferrals();
    } catch (err) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const filteredReferrals = filter === "all" 
    ? referrals 
    : referrals.filter(r => r.status === filter);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    contacted: "bg-blue-500/20 text-blue-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400"
  };

  const statusCounts = {
    all: referrals.length,
    pending: referrals.filter(r => r.status === "pending").length,
    contacted: referrals.filter(r => r.status === "contacted").length,
    approved: referrals.filter(r => r.status === "approved").length,
    rejected: referrals.filter(r => r.status === "rejected").length
  };

  if (loading) return <div className="text-center py-8 text-[#A0A5B0]">Loading referrals...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <UserPlus className="text-[#D4AF37]" /> Talent Referrals
          </h2>
          <p className="text-[#A0A5B0] text-sm">Review and manage talent referrals from existing talents</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#D4AF37]">{referrals.length}</p>
          <p className="text-xs text-[#A0A5B0]">Total Referrals</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "contacted", "approved", "rejected"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === status 
                ? "bg-[#D4AF37] text-[#050A14]" 
                : "bg-[#0A1628] text-[#A0A5B0] hover:bg-[#D4AF37]/10"
            }`}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <div className="text-center py-12 bg-[#0A1628] rounded-xl border border-[#D4AF37]/20">
          <UserPlus className="mx-auto text-[#D4AF37]/30 mb-4" size={48} />
          <p className="text-[#A0A5B0]">No {filter !== "all" ? filter : ""} referrals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReferrals.map(referral => (
            <div key={referral.id} className="bg-[#0A1628] rounded-xl border border-[#D4AF37]/20 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[#F5F5F0] font-bold text-lg">{referral.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[referral.status]}`}>
                      {referral.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[#A0A5B0]">
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {referral.phone}
                    </span>
                    {referral.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {referral.email}
                      </span>
                    )}
                    {referral.instagram_id && (
                      <span className="flex items-center gap-1">
                        <Instagram size={14} /> @{referral.instagram_id}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm mt-2">
                    <span className="text-[#D4AF37]">{referral.category}</span>
                    <span className="text-[#A0A5B0] flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(referral.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-[#A0A5B0] text-xs mt-2">
                    Referred by: <span className="text-[#F5F5F0]">{referral.referrer_name || "Unknown"}</span>
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(referral.id, "contacted")}
                    className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                    title="Mark as Contacted"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={() => updateStatus(referral.id, "approved")}
                    className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                    title="Approve"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => updateStatus(referral.id, "rejected")}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={() => deleteReferral(referral.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralsTab;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Trophy, Calendar, Clock, Users, Share2, ChevronLeft, Award, Vote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

const ContestPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchContest();
    // Check if user has voted (stored in localStorage)
    const votedContests = JSON.parse(localStorage.getItem("bfm_contest_votes") || "{}");
    if (votedContests[slug]) {
      setHasVoted(true);
    }
  }, [slug]);

  const fetchContest = async () => {
    try {
      const res = await axios.get(`${API}/contests/${slug}`);
      setContest(res.data);
    } catch (err) {
      toast({ title: "Contest not found", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleVote = async (talentId) => {
    if (hasVoted) {
      toast({ title: "You have already voted in this contest", variant: "destructive" });
      return;
    }

    if (contest.status !== "live") {
      toast({ title: "Voting is not open", variant: "destructive" });
      return;
    }

    setVoting(talentId);
    try {
      // Get or create session ID
      let sessionId = localStorage.getItem("bfm_session_id");
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("bfm_session_id", sessionId);
      }

      const res = await axios.post(
        `${API}/contests/${contest.id}/vote`,
        { contest_id: contest.id, talent_id: talentId },
        { headers: { "X-Session-ID": sessionId } }
      );

      // Update local state
      setContest(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === talentId ? { ...p, votes: res.data.votes } : p
        ).sort((a, b) => (b.votes || 0) - (a.votes || 0)),
        total_votes: (prev.total_votes || 0) + 1
      }));

      // Mark as voted
      const votedContests = JSON.parse(localStorage.getItem("bfm_contest_votes") || "{}");
      votedContests[slug] = talentId;
      localStorage.setItem("bfm_contest_votes", JSON.stringify(votedContests));
      setHasVoted(true);

      toast({ title: "Vote recorded! Thank you for voting." });
    } catch (err) {
      toast({ 
        title: err.response?.data?.detail || "Failed to vote", 
        variant: "destructive" 
      });
    }
    setVoting(null);
  };

  const shareContest = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: contest.name,
        text: `Vote for your favorite talent in ${contest.name}!`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Contest link copied!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-[#D4AF37]">Loading contest...</div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-[#050A14] flex flex-col items-center justify-center">
        <Trophy className="text-[#D4AF37]/30 mb-4" size={64} />
        <h1 className="text-[#F5F5F0] text-2xl mb-2">Contest Not Found</h1>
        <Link to="/" className="text-[#D4AF37]">Go to Homepage</Link>
      </div>
    );
  }

  const statusBadge = {
    draft: { color: "bg-gray-500/20 text-gray-400", text: "Draft" },
    upcoming: { color: "bg-blue-500/20 text-blue-400", text: "Coming Soon" },
    live: { color: "bg-green-500/20 text-green-400", text: "Voting Open" },
    closed: { color: "bg-red-500/20 text-red-400", text: "Voting Closed" },
    winner_announced: { color: "bg-[#D4AF37]/20 text-[#D4AF37]", text: "Winner Announced" }
  }[contest.status] || { color: "bg-gray-500/20 text-gray-400", text: contest.status };

  return (
    <div className="min-h-screen bg-[#050A14]">
      {/* Header */}
      <div className="bg-[#0A1628] border-b border-[#D4AF37]/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] mb-4">
            <ChevronLeft size={20} /> Back to Home
          </Link>
        </div>
      </div>

      {/* Banner */}
      {contest.banner_image && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img 
            src={contest.banner_image} 
            alt={contest.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] to-transparent" />
        </div>
      )}

      {/* Contest Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title & Status */}
          <div className="text-center mb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5F5F0] mb-4">{contest.name}</h1>
            {contest.description && (
              <p className="text-[#A0A5B0] text-lg mb-6">{contest.description}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-[#A0A5B0]">
                <Calendar size={16} className="text-[#D4AF37]" />
                {contest.start_date} - {contest.end_date}
              </div>
              <div className="flex items-center gap-2 text-[#A0A5B0]">
                <Users size={16} className="text-[#D4AF37]" />
                {contest.participants?.length || 0} Participants
              </div>
              <div className="flex items-center gap-2 text-[#A0A5B0]">
                <Trophy size={16} className="text-[#D4AF37]" />
                {contest.total_votes || 0} Total Votes
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={shareContest}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg"
            >
              <Share2 size={18} /> Share Contest
            </button>
          </div>

          {/* Winner Banner */}
          {contest.winner_id && (
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl p-6 mb-8 text-center border border-[#D4AF37]/30">
              <Award className="text-[#D4AF37] mx-auto mb-3" size={48} />
              <h2 className="text-[#D4AF37] text-2xl font-bold mb-2">Winner</h2>
              {contest.participants?.find(p => p.id === contest.winner_id) && (
                <div className="flex items-center justify-center gap-4">
                  <img 
                    src={contest.participants.find(p => p.id === contest.winner_id).profile_image}
                    className="w-20 h-20 rounded-full border-4 border-[#D4AF37]"
                  />
                  <div className="text-left">
                    <p className="text-[#F5F5F0] text-xl font-bold">
                      {contest.participants.find(p => p.id === contest.winner_id).name}
                    </p>
                    <p className="text-[#D4AF37]">
                      {contest.participants.find(p => p.id === contest.winner_id).votes} votes
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voting Instructions */}
          {contest.voting_instructions && contest.status === "live" && (
            <div className="bg-[#0A1628] rounded-xl p-4 mb-6 border border-[#D4AF37]/20">
              <h3 className="text-[#D4AF37] font-bold mb-2">How to Vote</h3>
              <p className="text-[#A0A5B0] text-sm">{contest.voting_instructions}</p>
            </div>
          )}

          {/* Rules */}
          {contest.rules && (
            <div className="bg-[#0A1628] rounded-xl p-4 mb-8 border border-[#D4AF37]/20">
              <h3 className="text-[#D4AF37] font-bold mb-2">Contest Rules</h3>
              <p className="text-[#A0A5B0] text-sm whitespace-pre-line">{contest.rules}</p>
            </div>
          )}

          {/* Participants */}
          <h2 className="text-2xl font-bold text-[#F5F5F0] mb-6 text-center">
            {contest.status === "live" ? "Vote for Your Favorite" : "Participants"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contest.participants?.map((talent, idx) => (
              <div 
                key={talent.id}
                className={`bg-[#0A1628] rounded-xl overflow-hidden border transition-all ${
                  contest.winner_id === talent.id 
                    ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" 
                    : "border-[#D4AF37]/20 hover:border-[#D4AF37]/50"
                }`}
              >
                {/* Rank Badge */}
                <div className="relative">
                  {talent.profile_image ? (
                    <img 
                      src={talent.profile_image} 
                      alt={talent.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[#D4AF37]/10 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-4xl">{talent.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#050A14] font-bold">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </div>
                  {contest.winner_id === talent.id && (
                    <div className="absolute top-3 right-3 bg-[#D4AF37] px-2 py-1 rounded text-[#050A14] text-xs font-bold flex items-center gap-1">
                      <Award size={12} /> Winner
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-[#F5F5F0] font-bold text-lg">{talent.name}</h3>
                  <p className="text-[#A0A5B0] text-sm mb-3">{talent.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#D4AF37] font-bold text-xl">{talent.votes || 0} votes</span>
                    
                    {contest.status === "live" && (
                      <button
                        onClick={() => handleVote(talent.id)}
                        disabled={voting === talent.id || hasVoted}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          hasVoted
                            ? "bg-[#D4AF37]/20 text-[#D4AF37] cursor-not-allowed"
                            : "bg-[#D4AF37] text-[#050A14] hover:bg-[#F5F5F0]"
                        }`}
                      >
                        {voting === talent.id ? "Voting..." : hasVoted ? "Voted" : "Vote"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Already Voted Message */}
          {hasVoted && contest.status === "live" && (
            <div className="mt-6 text-center">
              <p className="text-[#A0A5B0]">
                Thank you for voting! You can vote again in 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestPage;

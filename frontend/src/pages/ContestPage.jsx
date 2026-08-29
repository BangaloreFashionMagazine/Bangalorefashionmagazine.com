import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Trophy, Calendar, Clock, Users, Share2, ChevronLeft, Award, Vote, Instagram, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

const ContestPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [votedTalent, setVotedTalent] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchContest();
    // Check if user has voted (stored in localStorage)
    const votedContests = JSON.parse(localStorage.getItem("bfm_contest_votes") || "{}");
    if (votedContests[slug]) {
      setHasVoted(true);
      // Also restore voted talent data if available
      const votedTalentData = JSON.parse(localStorage.getItem("bfm_voted_talents") || "{}");
      if (votedTalentData[slug]) {
        setVotedTalent(votedTalentData[slug]);
      }
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

      // Find the voted talent
      const talent = contest.participants.find(p => p.id === talentId);
      setVotedTalent({ ...talent, votes: res.data.votes });

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
      
      // Store voted talent data for share feature
      const votedTalentData = JSON.parse(localStorage.getItem("bfm_voted_talents") || "{}");
      votedTalentData[slug] = { ...talent, votes: res.data.votes };
      localStorage.setItem("bfm_voted_talents", JSON.stringify(votedTalentData));
      
      setHasVoted(true);

      toast({ title: "Vote recorded! Thank you for voting." });
      
      // Show share modal
      setShowShareModal(true);
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

  // Generate shareable image for Instagram
  const generateShareImage = async (format) => {
    if (!votedTalent || !canvasRef.current) return;
    
    setGeneratingImage(format);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set dimensions based on format
    const dimensions = format === "story" 
      ? { width: 1080, height: 1920 } // 9:16 Story
      : { width: 1080, height: 1350 }; // 4:5 Feed
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    gradient.addColorStop(0, "#0A1628");
    gradient.addColorStop(0.5, "#050A14");
    gradient.addColorStop(1, "#0A1628");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Gold border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, dimensions.width - 40, dimensions.height - 40);
    
    // Inner decorative border
    ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, dimensions.width - 80, dimensions.height - 80);
    
    // Load and draw talent image
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = votedTalent.profile_image || "";
    }).catch(() => {});
    
    if (img.complete && img.naturalWidth > 0) {
      // Calculate image position
      const imgSize = format === "story" ? 500 : 450;
      const imgX = (dimensions.width - imgSize) / 2;
      const imgY = format === "story" ? 350 : 200;
      
      // Gold circle border for image
      ctx.beginPath();
      ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2 + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Clip and draw circular image
      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();
    }
    
    // "I VOTED FOR" text
    const baseY = format === "story" ? 920 : 720;
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ I VOTED FOR", dimensions.width / 2, baseY);
    
    // Talent name
    ctx.fillStyle = "#F5F5F0";
    ctx.font = "bold 56px system-ui, sans-serif";
    ctx.fillText(votedTalent.name?.toUpperCase() || "TALENT", dimensions.width / 2, baseY + 70);
    
    // Category
    ctx.fillStyle = "#A0A5B0";
    ctx.font = "32px system-ui, sans-serif";
    ctx.fillText(votedTalent.category || "", dimensions.width / 2, baseY + 120);
    
    // Contest name
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 40px system-ui, sans-serif";
    const contestY = format === "story" ? 1150 : 900;
    ctx.fillText(`in ${contest.name}`, dimensions.width / 2, contestY);
    
    // Votes count
    ctx.fillStyle = "#F5F5F0";
    ctx.font = "bold 48px system-ui, sans-serif";
    ctx.fillText(`${votedTalent.votes} votes`, dimensions.width / 2, contestY + 70);
    
    // Call to action
    const ctaY = format === "story" ? 1400 : 1080;
    ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
    ctx.fillRect(dimensions.width/2 - 250, ctaY - 40, 500, 90);
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText("VOTE NOW!", dimensions.width / 2, ctaY + 15);
    
    // BFM Branding at bottom
    const brandY = format === "story" ? 1700 : 1220;
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.fillText("BFM", dimensions.width / 2 - 80, brandY);
    ctx.fillStyle = "#F5F5F0";
    ctx.font = "300 42px system-ui, sans-serif";
    ctx.fillText("Magazine", dimensions.width / 2 + 50, brandY);
    
    // Website
    ctx.fillStyle = "#A0A5B0";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText("bangalorefashionmag.com", dimensions.width / 2, brandY + 45);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bfm-vote-${format}-${votedTalent.name?.replace(/\s+/g, "-").toLowerCase() || "share"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setGeneratingImage(null);
      toast({ title: `${format === "story" ? "Story" : "Feed"} image downloaded! Share it on Instagram.` });
    }, "image/png");
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
              {votedTalent && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium"
                >
                  <Instagram size={18} /> Share on Instagram
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instagram Share Modal */}
      {showShareModal && votedTalent && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] rounded-2xl max-w-md w-full border border-[#D4AF37]/30 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Instagram size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[#F5F5F0] font-bold">Share Your Vote!</h3>
                  <p className="text-[#A0A5B0] text-xs">Download and share on Instagram</p>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 text-[#A0A5B0] hover:text-[#F5F5F0]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Voted Talent Preview */}
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                {votedTalent.profile_image ? (
                  <img 
                    src={votedTalent.profile_image} 
                    alt={votedTalent.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#D4AF37]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border-4 border-[#D4AF37]">
                    <span className="text-[#D4AF37] text-3xl">{votedTalent.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ✓ Voted
                </div>
              </div>
              <h4 className="text-[#F5F5F0] font-bold text-lg">{votedTalent.name}</h4>
              <p className="text-[#A0A5B0] text-sm">{votedTalent.category}</p>
              <p className="text-[#D4AF37] font-bold mt-2">{votedTalent.votes} votes</p>
            </div>

            {/* Share Buttons */}
            <div className="p-4 bg-[#050A14] space-y-3">
              <p className="text-[#A0A5B0] text-sm text-center mb-4">
                Download an image and share it on Instagram to encourage others to vote!
              </p>
              
              {/* Instagram Story Button */}
              <button
                onClick={() => generateShareImage("story")}
                disabled={generatingImage === "story"}
                className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {generatingImage === "story" ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <Download size={18} />
                    Download for Story (9:16)
                  </>
                )}
              </button>
              
              {/* Instagram Feed Button */}
              <button
                onClick={() => generateShareImage("feed")}
                disabled={generatingImage === "feed"}
                className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {generatingImage === "feed" ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <Download size={18} />
                    Download for Feed (4:5)
                  </>
                )}
              </button>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Contest link copied!" });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-[#D4AF37] text-sm"
              >
                <Share2 size={16} /> Copy contest link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ContestPage;

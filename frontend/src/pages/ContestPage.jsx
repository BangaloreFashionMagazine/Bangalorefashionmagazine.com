import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import confetti from "canvas-confetti";
import { Trophy, Calendar, Clock, Users, Share2, ChevronLeft, Award, Vote, Instagram, X, Download, Crop, RotateCcw, ZoomIn, ZoomOut, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

const ContestPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [votedTalent, setVotedTalent] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(null);
  const [selectedTalent, setSelectedTalent] = useState(null); // For profile modal
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  
  // Cropping state
  const [crop, setCrop] = useState({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [activeFormat, setActiveFormat] = useState("story"); // story or feed
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  // Confetti celebration animation
  const triggerCelebration = () => {
    // First burst - gold confetti from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFD700', '#F5F5F0', '#FFA500']
    });

    // Second burst - from left
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4AF37', '#FFD700', '#F5F5F0']
      });
    }, 150);

    // Third burst - from right
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4AF37', '#FFD700', '#F5F5F0']
      });
    }, 300);

    // Stars burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 360,
        ticks: 60,
        gravity: 0.5,
        decay: 0.94,
        startVelocity: 20,
        shapes: ['star'],
        colors: ['#D4AF37', '#FFD700', '#FFA500']
      });
    }, 450);
  };

  // Special winner celebration - grand fireworks
  const triggerWinnerCelebration = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fireworks from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B00']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B00']
      });
    }, 250);

    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#FFD700', '#FFFFFF', '#FFA500']
    });

    // Stars shower
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 360,
        shapes: ['star'],
        colors: ['#D4AF37', '#FFD700'],
        scalar: 1.5,
        origin: { y: 0.3 }
      });
    }, 500);
  }, []);

  // Trigger winner celebration on load if winner is announced
  useEffect(() => {
    if (contest?.status === 'winner_announced' && contest?.winner_id) {
      // Small delay for page to render
      setTimeout(() => {
        triggerWinnerCelebration();
      }, 500);
    }
  }, [contest?.status, contest?.winner_id, triggerWinnerCelebration]);

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

      // Trigger celebration confetti!
      triggerCelebration();

      toast({ title: "🎉 Vote recorded! Thank you for voting." });
      
      // Show share modal after a short delay for confetti
      setTimeout(() => {
        setShowShareModal(true);
      }, 800);
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

  // Handle image load for cropper
  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    setImgLoaded(true);
    // Set initial crop to fill the frame
    const { width, height } = e.currentTarget;
    const aspectRatio = activeFormat === "story" ? 9/16 : 4/5;
    
    let cropWidth, cropHeight;
    if (width / height > aspectRatio) {
      cropHeight = 100;
      cropWidth = (height * aspectRatio / width) * 100;
    } else {
      cropWidth = 100;
      cropHeight = (width / aspectRatio / height) * 100;
    }
    
    setCrop({
      unit: '%',
      width: Math.min(cropWidth, 100),
      height: Math.min(cropHeight, 100),
      x: (100 - Math.min(cropWidth, 100)) / 2,
      y: (100 - Math.min(cropHeight, 100)) / 2
    });
  }, [activeFormat]);

  // Reset crop when format changes
  useEffect(() => {
    if (imgRef.current && imgLoaded) {
      const { width, height } = imgRef.current;
      const aspectRatio = activeFormat === "story" ? 9/16 : 4/5;
      
      let cropWidth, cropHeight;
      if (width / height > aspectRatio) {
        cropHeight = 100;
        cropWidth = (height * aspectRatio / width) * 100;
      } else {
        cropWidth = 100;
        cropHeight = (width / aspectRatio / height) * 100;
      }
      
      setCrop({
        unit: '%',
        width: Math.min(cropWidth, 100),
        height: Math.min(cropHeight, 100),
        x: (100 - Math.min(cropWidth, 100)) / 2,
        y: (100 - Math.min(cropHeight, 100)) / 2
      });
    }
  }, [activeFormat, imgLoaded]);

  // Generate shareable image for Instagram with cropping and template
  const generateShareImage = async () => {
    if (!votedTalent || !canvasRef.current || !imgRef.current) return;
    
    setGeneratingImage(activeFormat);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Get template settings from contest
    const templateKey = activeFormat === "story" ? "share_template_story" : "share_template_feed";
    const template = contest[templateKey] || {
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
    
    // Set dimensions based on format (high quality)
    const dimensions = activeFormat === "story" 
      ? { width: 1080, height: 1920 } // 9:16 Story
      : { width: 1080, height: 1350 }; // 4:5 Feed
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Draw cropped talent image as full background
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Calculate crop coordinates from percentage
    const cropX = (crop.x / 100) * image.width * scaleX;
    const cropY = (crop.y / 100) * image.height * scaleY;
    const cropW = (crop.width / 100) * image.width * scaleX;
    const cropH = (crop.height / 100) * image.height * scaleY;
    
    // Draw the cropped image to fill the canvas
    ctx.drawImage(
      image,
      cropX, cropY, cropW, cropH,
      0, 0, dimensions.width, dimensions.height
    );
    
    // Parse overlay color
    const overlayColor = template.overlay_color || "rgba(0,0,0,0.5)";
    
    // Draw overlay based on position
    ctx.fillStyle = overlayColor;
    if (template.overlay_position === "full") {
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    } else if (template.overlay_position === "top") {
      const gradientTop = ctx.createLinearGradient(0, 0, 0, dimensions.height * 0.4);
      gradientTop.addColorStop(0, overlayColor);
      gradientTop.addColorStop(1, "transparent");
      ctx.fillStyle = gradientTop;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height * 0.4);
    } else { // bottom
      const gradientBottom = ctx.createLinearGradient(0, dimensions.height * 0.5, 0, dimensions.height);
      gradientBottom.addColorStop(0, "transparent");
      gradientBottom.addColorStop(1, overlayColor);
      ctx.fillStyle = gradientBottom;
      ctx.fillRect(0, dimensions.height * 0.5, dimensions.width, dimensions.height * 0.5);
    }
    
    // Calculate text Y position based on overlay
    const textY = template.overlay_position === "top" 
      ? 150 
      : dimensions.height - 350;
    
    // Draw contest name if enabled
    ctx.textAlign = "center";
    let currentY = textY;
    
    if (template.show_contest_name) {
      ctx.fillStyle = template.text_color;
      ctx.font = `bold ${template.font_size + 8}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(contest.name, dimensions.width / 2, currentY);
      currentY += template.font_size + 20;
    }
    
    // Draw CTA text
    ctx.fillStyle = template.text_color;
    ctx.font = `bold ${template.font_size}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(template.custom_text || "Vote Now!", dimensions.width / 2, currentY);
    currentY += template.font_size + 15;
    
    // Draw vote count if enabled
    if (template.show_vote_count) {
      ctx.font = `${template.font_size - 4}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`${votedTalent.votes || 0} votes`, dimensions.width / 2, currentY);
    }
    
    // Draw BFM Logo based on position
    const logoSize = template.logo_size || 120;
    const padding = 40;
    
    let logoX, logoY;
    switch (template.logo_position) {
      case "top-left":
        logoX = padding;
        logoY = padding;
        break;
      case "top":
        logoX = (dimensions.width - logoSize * 2) / 2;
        logoY = padding;
        break;
      case "top-right":
        logoX = dimensions.width - logoSize * 2 - padding;
        logoY = padding;
        break;
      case "bottom-left":
        logoX = padding;
        logoY = dimensions.height - logoSize - padding;
        break;
      case "bottom-right":
        logoX = dimensions.width - logoSize * 2 - padding;
        logoY = dimensions.height - logoSize - padding;
        break;
      default: // bottom center
        logoX = (dimensions.width - logoSize * 2) / 2;
        logoY = dimensions.height - logoSize - padding;
    }
    
    // Draw BFM logo text
    ctx.textAlign = "left";
    ctx.fillStyle = "#D4AF37";
    ctx.font = `bold ${logoSize * 0.5}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("BFM", logoX, logoY + logoSize * 0.5);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `300 ${logoSize * 0.35}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("Magazine", logoX + logoSize * 0.8, logoY + logoSize * 0.5);
    
    // Convert to blob and download (PNG for high quality)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bfm-vote-${activeFormat}-${votedTalent.name?.replace(/\s+/g, "-").toLowerCase() || "share"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setGeneratingImage(null);
      toast({ title: `${activeFormat === "story" ? "Story" : "Feed"} image downloaded! Share it on Instagram.` });
    }, "image/png", 1.0); // Max quality
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

            {/* Winner Announcement Section */}
            {contest.status === 'winner_announced' && contest.winner_id && (() => {
              const winner = contest.participants?.find(p => p.id === contest.winner_id);
              if (!winner) return null;
              
              return (
                <div className="mt-10 mb-6">
                  {/* Winner Crown Animation */}
                  <div className="relative">
                    {/* Glowing background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" />
                    </div>
                    
                    {/* Winner Card */}
                    <div className="relative bg-gradient-to-b from-[#D4AF37]/20 to-transparent rounded-3xl p-8 border border-[#D4AF37]/40">
                      {/* Crown */}
                      <div className="text-center mb-4">
                        <span className="text-6xl animate-bounce inline-block">👑</span>
                      </div>
                      
                      {/* Winner Text */}
                      <p className="text-[#D4AF37] text-sm uppercase tracking-widest text-center mb-2">
                        ✨ Winner Announced ✨
                      </p>
                      <h2 className="text-[#F5F5F0] text-3xl md:text-4xl font-bold text-center mb-6">
                        Congratulations!
                      </h2>
                      
                      {/* Winner Photo */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          {/* Animated ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] animate-ping opacity-30" />
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/30">
                            {winner.profile_image ? (
                              <img 
                                src={winner.profile_image} 
                                alt={winner.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                                <span className="text-[#D4AF37] text-5xl">{winner.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          {/* Trophy badge */}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#050A14] px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <Trophy size={14} /> WINNER
                          </div>
                        </div>
                      </div>
                      
                      {/* Winner Name */}
                      <h3 className="text-[#D4AF37] text-2xl md:text-3xl font-bold text-center mb-2">
                        {winner.name}
                      </h3>
                      <p className="text-[#A0A5B0] text-center mb-4">{winner.category}</p>
                      
                      {/* Winner Stats */}
                      <div className="flex justify-center gap-8 mb-6">
                        <div className="text-center">
                          <p className="text-[#D4AF37] text-3xl font-bold">{winner.votes || 0}</p>
                          <p className="text-[#A0A5B0] text-sm">Votes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#D4AF37] text-3xl font-bold">🥇</p>
                          <p className="text-[#A0A5B0] text-sm">1st Place</p>
                        </div>
                      </div>
                      
                      {/* View Profile Button */}
                      <div className="flex justify-center">
                        <Link
                          to={`/talents/${winner.slug || winner.id}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded-full font-bold hover:bg-[#F5F5F0] transition-colors"
                        >
                          <Eye size={18} /> View Winner's Profile
                        </Link>
                      </div>
                      
                      {/* Replay celebration button */}
                      <button
                        onClick={triggerWinnerCelebration}
                        className="mt-4 mx-auto block text-[#D4AF37] text-sm hover:underline"
                      >
                        🎆 Replay Celebration
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Small Participant Icons - Like Weekly Top Profiles */}
            {contest.participants && contest.participants.length > 0 && contest.status !== 'winner_announced' && (
              <div className="mt-8">
                <p className="text-[#A0A5B0] text-sm mb-4">Click on a participant to view their profile</p>
                <div className="flex justify-center items-end gap-3 md:gap-6 flex-wrap">
                  {contest.participants.slice(0, 5).map((talent, idx) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const ringColors = [
                      "ring-yellow-400 ring-4",
                      "ring-gray-300 ring-3", 
                      "ring-amber-600 ring-2",
                      "ring-[#D4AF37]/50 ring-2",
                      "ring-[#D4AF37]/30 ring-2"
                    ];
                    const sizes = idx === 0 
                      ? "w-20 h-20 md:w-24 md:h-24" 
                      : "w-16 h-16 md:w-20 md:h-20";
                    
                    return (
                      <button
                        key={talent.id}
                        onClick={() => setSelectedTalent(talent)}
                        className={`flex flex-col items-center group transition-transform hover:scale-105 ${idx === 0 ? '-mt-2' : ''}`}
                      >
                        <div className="relative">
                          <div className={`${sizes} rounded-full overflow-hidden ${ringColors[idx]} transition-all group-hover:ring-[#D4AF37] group-hover:ring-4`}>
                            {talent.profile_image ? (
                              <img 
                                src={talent.profile_image} 
                                alt={talent.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                                <span className="text-[#D4AF37] text-xl">{talent.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          {idx < 3 && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">{medals[idx]}</div>
                          )}
                        </div>
                        <p className={`mt-3 text-xs font-medium text-center max-w-[80px] truncate ${idx === 0 ? 'text-[#D4AF37]' : 'text-[#F5F5F0]'}`}>
                          {talent.name?.split(' ')[0]}
                        </p>
                        <p className="text-[#A0A5B0] text-xs">{talent.votes || 0} votes</p>
                      </button>
                    );
                  })}
                </div>
                {contest.participants.length > 5 && (
                  <p className="text-center text-[#A0A5B0] text-sm mt-4">
                    +{contest.participants.length - 5} more participants below
                  </p>
                )}
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={shareContest}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg"
            >
              <Share2 size={18} /> Share Contest
            </button>
          </div>

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
            {contest.status === "live" ? "Vote for Your Favorite" : 
             contest.status === "winner_announced" ? "All Participants" : "Participants"}
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

      {/* Talent Profile Modal */}
      {selectedTalent && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A1628] rounded-2xl max-w-lg w-full border border-[#D4AF37]/30 overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h3 className="text-[#F5F5F0] font-bold">Talent Profile</h3>
              <button 
                onClick={() => setSelectedTalent(null)}
                className="p-2 text-[#A0A5B0] hover:text-[#F5F5F0]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {/* Profile Image */}
              <div className="text-center mb-6">
                {selectedTalent.profile_image ? (
                  <img 
                    src={selectedTalent.profile_image} 
                    alt={selectedTalent.name}
                    className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-[#D4AF37]"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto border-4 border-[#D4AF37]">
                    <span className="text-[#D4AF37] text-5xl">{selectedTalent.name?.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Name & Category */}
              <div className="text-center mb-6">
                <h2 className="text-[#F5F5F0] text-2xl font-bold mb-1">{selectedTalent.name}</h2>
                <p className="text-[#D4AF37]">{selectedTalent.category}</p>
                <p className="text-[#A0A5B0] mt-2">{selectedTalent.votes || 0} votes in this contest</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Vote Button */}
                {contest.status === "live" && !hasVoted && (
                  <button
                    onClick={() => {
                      setSelectedTalent(null);
                      handleVote(selectedTalent.id);
                    }}
                    className="w-full py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold text-lg hover:bg-[#F5F5F0] transition-colors"
                  >
                    Vote for {selectedTalent.name?.split(' ')[0]}
                  </button>
                )}

                {/* View Full Profile Link */}
                <Link
                  to={`/talents/${selectedTalent.slug || selectedTalent.id}`}
                  className="block w-full py-3 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg font-medium text-center hover:bg-[#D4AF37]/30 transition-colors"
                >
                  <Eye size={18} className="inline mr-2" />
                  View Full Profile
                </Link>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedTalent(null)}
                  className="w-full py-3 bg-[#050A14] text-[#A0A5B0] rounded-lg font-medium hover:text-[#F5F5F0] transition-colors"
                >
                  Back to Contest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Share Modal with Cropper */}
      {showShareModal && votedTalent && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A1628] rounded-2xl max-w-2xl w-full border border-[#D4AF37]/30 overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Instagram size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[#F5F5F0] font-bold">Share Your Vote!</h3>
                  <p className="text-[#A0A5B0] text-xs">Crop & customize your share image</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowShareModal(false); setImgLoaded(false); navigate('/'); }}
                className="p-2 text-[#A0A5B0] hover:text-[#F5F5F0]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Format Selector */}
            <div className="p-4 border-b border-[#D4AF37]/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFormat("story")}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    activeFormat === "story"
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white"
                      : "bg-[#050A14] text-[#A0A5B0] hover:text-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Story</div>
                    <div className="text-xs opacity-75">9:16 Vertical</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveFormat("feed")}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    activeFormat === "feed"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-[#050A14] text-[#A0A5B0] hover:text-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Feed</div>
                    <div className="text-xs opacity-75">4:5 Portrait</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Cropper Area */}
            <div className="p-4">
              <p className="text-[#A0A5B0] text-sm text-center mb-4">
                <Crop size={16} className="inline mr-2" />
                Drag to adjust the crop area. The image will include contest branding overlay.
              </p>
              
              <div className="bg-[#050A14] rounded-xl p-4 flex justify-center">
                {votedTalent.profile_image ? (
                  <div style={{ maxWidth: activeFormat === "story" ? "200px" : "280px" }}>
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={activeFormat === "story" ? 9/16 : 4/5}
                      className="rounded-lg overflow-hidden"
                    >
                      <img
                        src={votedTalent.profile_image}
                        alt={votedTalent.name}
                        onLoad={onImageLoad}
                        crossOrigin="anonymous"
                        style={{ maxHeight: "400px", width: "auto" }}
                        className="rounded-lg"
                      />
                    </ReactCrop>
                  </div>
                ) : (
                  <div className="w-48 h-64 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-[#D4AF37] text-4xl">{votedTalent.name?.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Preview Info */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#050A14] rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[#F5F5F0] text-sm font-medium">{votedTalent.name}</span>
                  <span className="text-[#A0A5B0] text-xs">• {votedTalent.votes} votes</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="p-4 bg-[#050A14] space-y-3">
              <button
                onClick={generateShareImage}
                disabled={generatingImage || !imgLoaded}
                className={`w-full flex items-center justify-center gap-3 py-4 text-white rounded-xl font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 ${
                  activeFormat === "story"
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"
                    : "bg-gradient-to-r from-purple-600 to-pink-600"
                }`}
              >
                {generatingImage ? (
                  <span className="animate-pulse">Generating High Quality Image...</span>
                ) : (
                  <>
                    <Download size={20} />
                    Download {activeFormat === "story" ? "Story" : "Feed"} Image
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
                <Share2 size={16} /> Copy contest link to share
              </button>

              {/* Go to Home */}
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-[#050A14] text-[#A0A5B0] rounded-lg text-sm hover:text-[#F5F5F0]"
              >
                <ChevronLeft size={16} /> Back to Home
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

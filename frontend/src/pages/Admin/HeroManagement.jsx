import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Image, Plus, Trash2, Move, Eye, EyeOff, Settings, 
  ChevronUp, ChevronDown, Check, X, User, Crosshair,
  Monitor, Smartphone, Play, Pause, ArrowLeft, ArrowRight, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API, BFM_LOGO } from "@/lib/config";

const HeroManagement = () => {
  const { toast } = useToast();
  
  // State
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState({
    autoplay: true,
    slide_duration: 5,
    transition: "fade",
    show_arrows: true,
    show_dots: true,
    hero_height: "70vh",
    default_headline: "BANGALORE FASHION MAGAZINE",
    default_description: "DISCOVER. CREATE. GET FEATURED.",
    default_cta_text: "JOIN BFM",
    default_cta_link: "/join",
    default_bg_color: "#050A14",
    logo_position: "top-left"
  });
  const [eligibleTalents, setEligibleTalents] = useState([]);
  const [allTalents, setAllTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTalentConfigModal, setShowTalentConfigModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [talentImages, setTalentImages] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop or mobile
  const [savingSettings, setSavingSettings] = useState(false);
  const [talentSearchQuery, setTalentSearchQuery] = useState(""); // Search for talents

  // Fetch data
  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${API}/admin/hero-slides`);
      setSlides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/hero-settings`);
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEligibleTalents = async () => {
    try {
      const res = await axios.get(`${API}/admin/talents/hero-eligible`);
      setEligibleTalents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllTalents = async () => {
    try {
      const res = await axios.get(`${API}/talents?approved_only=true&lightweight=false`);
      setAllTalents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSlides(), fetchSettings(), fetchEligibleTalents(), fetchAllTalents()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Talent hero configuration
  const openTalentConfig = async (talent) => {
    try {
      const res = await axios.get(`${API}/admin/talent/${talent.id}/hero-images`);
      setSelectedTalent({ ...talent, ...res.data });
      setTalentImages(res.data.images || []);
      setShowTalentConfigModal(true);
    } catch (err) {
      toast({ title: "Failed to load talent images", variant: "destructive" });
    }
  };

  const saveTalentHeroConfig = async () => {
    if (!selectedTalent) return;
    try {
      const heroEnabled = talentImages.some(img => img.is_hero_enabled);
      const heroIndices = talentImages.filter(img => img.is_hero_enabled).map(img => img.index);
      
      await axios.put(`${API}/admin/talent/${selectedTalent.id}/hero-config`, {
        hero_enabled: heroEnabled,
        hero_images: heroIndices
      });
      
      toast({ title: "Hero configuration saved!" });
      setShowTalentConfigModal(false);
      fetchEligibleTalents();
      fetchAllTalents();
    } catch (err) {
      toast({ title: "Failed to save configuration", variant: "destructive" });
    }
  };

  const toggleImageHeroEnabled = (index) => {
    setTalentImages(prev => prev.map(img => 
      img.index === index ? { ...img, is_hero_enabled: !img.is_hero_enabled } : img
    ));
  };

  // Slide management
  const [addSlideState, setAddSlideState] = useState({
    talent_id: "",
    image_index: 0,
    focal_point_x: 50,
    focal_point_y: 30,
    fit_mode: "smart"
  });

  const selectTalentForSlide = async (talentId) => {
    const talent = eligibleTalents.find(t => t.id === talentId);
    if (!talent) return;
    
    try {
      const res = await axios.get(`${API}/admin/talent/${talentId}/hero-images`);
      const enabledImages = res.data.images.filter(img => img.is_hero_enabled);
      setTalentImages(enabledImages);
      setAddSlideState(prev => ({ ...prev, talent_id: talentId, image_index: enabledImages[0]?.index || 0 }));
    } catch (err) {
      toast({ title: "Failed to load talent images", variant: "destructive" });
    }
  };

  const addHeroSlide = async () => {
    if (!addSlideState.talent_id) {
      toast({ title: "Select a talent first", variant: "destructive" });
      return;
    }
    try {
      await axios.post(`${API}/admin/hero-slides`, addSlideState);
      toast({ title: "Hero slide added!" });
      setShowAddModal(false);
      setAddSlideState({ talent_id: "", image_index: 0, focal_point_x: 50, focal_point_y: 30, fit_mode: "smart" });
      setTalentImages([]);
      fetchSlides();
    } catch (err) {
      toast({ title: err.response?.data?.detail || "Failed to add slide", variant: "destructive" });
    }
  };

  const deleteSlide = async (slideId) => {
    if (!window.confirm("Remove this slide from hero?")) return;
    try {
      await axios.delete(`${API}/admin/hero-slides/${slideId}`);
      toast({ title: "Slide removed" });
      fetchSlides();
    } catch (err) {
      toast({ title: "Failed to delete slide", variant: "destructive" });
    }
  };

  const moveSlide = async (slideId, direction) => {
    const idx = slides.findIndex(s => s.id === slideId);
    if (idx === -1) return;
    
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;
    
    const newSlides = [...slides];
    [newSlides[idx], newSlides[newIdx]] = [newSlides[newIdx], newSlides[idx]];
    
    // Update orders
    const orders = newSlides.map((s, i) => ({ id: s.id, order: i + 1 }));
    
    try {
      await axios.put(`${API}/admin/hero-slides/reorder`, orders);
      fetchSlides();
    } catch (err) {
      toast({ title: "Failed to reorder", variant: "destructive" });
    }
  };

  const toggleSlideActive = async (slide) => {
    try {
      await axios.put(`${API}/admin/hero-slides/${slide.id}`, { is_active: !slide.is_active });
      fetchSlides();
    } catch (err) {
      toast({ title: "Failed to update slide", variant: "destructive" });
    }
  };

  const updateSlide = async (slideId, updates) => {
    try {
      await axios.put(`${API}/admin/hero-slides/${slideId}`, updates);
      fetchSlides();
      setEditingSlide(null);
      toast({ title: "Slide updated!" });
    } catch (err) {
      toast({ title: "Failed to update slide", variant: "destructive" });
    }
  };

  // Settings
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await axios.put(`${API}/admin/hero-settings`, settings);
      toast({ title: "Settings saved!" });
      setShowSettingsModal(false);
    } catch (err) {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
    setSavingSettings(false);
  };

  // Focal point picker
  const FocalPointPicker = ({ image, x, y, onChange }) => {
    const handleClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100;
      const newY = ((e.clientY - rect.top) / rect.height) * 100;
      onChange(Math.round(newX), Math.round(newY));
    };

    // Preset positions for common cropping needs
    const presets = [
      { name: "Face (Top)", x: 50, y: 15 },
      { name: "Head & Shoulders", x: 50, y: 25 },
      { name: "Upper Body", x: 50, y: 35 },
      { name: "Center", x: 50, y: 50 },
      { name: "Lower Body", x: 50, y: 70 },
    ];

    return (
      <div className="space-y-3">
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[#A0A5B0] text-xs mr-2">Quick presets:</span>
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => onChange(p.x, p.y)}
              className={`px-2 py-1 text-xs rounded border ${
                x === p.x && y === p.y 
                  ? "bg-[#D4AF37] text-[#050A14] border-[#D4AF37]" 
                  : "bg-[#050A14] text-[#A0A5B0] border-[#D4AF37]/20 hover:border-[#D4AF37]/50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        
        {/* Click-to-position image */}
        <div className="relative cursor-crosshair border border-[#D4AF37]/40 rounded-lg overflow-hidden" onClick={handleClick}>
          <img src={image} alt="Focal point" className="w-full h-64 object-cover" />
          <div 
            className="absolute w-8 h-8 border-2 border-[#D4AF37] rounded-full bg-[#D4AF37]/30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Crosshair className="w-full h-full text-[#D4AF37]" />
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Click image to set focal point ({x}%, {y}%)
          </div>
          {/* Visual crop guide */}
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-red-500/20 to-transparent pointer-events-none" />
        </div>
        <p className="text-[#A0A5B0] text-xs">
          💡 <strong>Tip:</strong> For portrait photos, use "Face" or "Head & Shoulders" preset. The focal point determines which part of the image stays visible when cropped on different screen sizes.
        </p>
      </div>
    );
  };

  if (loading) {
    return <div className="text-[#A0A5B0] p-4">Loading hero management...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F0]">Hero Management</h2>
          <p className="text-[#A0A5B0] text-sm">Manage homepage hero slides from approved talents</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-[#0A1628] border border-[#D4AF37]/20 text-[#D4AF37] rounded flex items-center gap-2 hover:bg-[#D4AF37]/10"
          >
            <Settings size={16} /> Settings
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2 hover:bg-[#F5F5F0]"
          >
            <Plus size={16} /> Add Hero Slide
          </button>
        </div>
      </div>

      {/* Configure Talents Section */}
      <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
        <h3 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
          <User size={18} className="text-[#D4AF37]" />
          Configure Talent Hero Access
        </h3>
        <p className="text-[#A0A5B0] text-sm mb-4">
          Enable talents to appear in the hero and select which of their portfolio images can be used.
        </p>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A5B0]" />
          <input
            type="text"
            placeholder="Search talents by name..."
            value={talentSearchQuery}
            onChange={(e) => setTalentSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm placeholder-[#A0A5B0] focus:outline-none focus:border-[#D4AF37]/50"
          />
          {talentSearchQuery && (
            <button 
              onClick={() => setTalentSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A5B0] hover:text-[#F5F5F0]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
          {allTalents
            .filter(t => t.is_approved)
            .filter(t => !talentSearchQuery || t.name.toLowerCase().includes(talentSearchQuery.toLowerCase()))
            .map(talent => (
            <div 
              key={talent.id}
              onClick={() => openTalentConfig(talent)}
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                talent.hero_enabled 
                  ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                  : "border-[#D4AF37]/20 bg-[#050A14] hover:border-[#D4AF37]/40"
              }`}
            >
              <div className="aspect-square rounded overflow-hidden mb-2 bg-[#050A14]">
                {talent.profile_image ? (
                  <img src={talent.profile_image} alt={talent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A0A5B0]">
                    <User size={24} />
                  </div>
                )}
              </div>
              <p className="text-[#F5F5F0] text-xs font-medium truncate">{talent.name}</p>
              <p className="text-[#A0A5B0] text-[10px] truncate">{talent.category}</p>
              {talent.hero_enabled && (
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#D4AF37] text-[#050A14] text-[8px] font-bold rounded">
                  HERO ENABLED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Hero Slides */}
      <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
        <h3 className="text-[#F5F5F0] font-semibold mb-4 flex items-center gap-2">
          <Image size={18} className="text-[#D4AF37]" />
          Hero Slides ({slides.length})
        </h3>
        
        {slides.length === 0 ? (
          <div className="text-center py-8">
            <Image size={48} className="mx-auto text-[#A0A5B0] mb-3" />
            <p className="text-[#A0A5B0]">No hero slides configured</p>
            <p className="text-[#A0A5B0]/60 text-sm mt-1">Add slides from enabled talents to display in the homepage hero</p>
            <p className="text-[#D4AF37] text-sm mt-3">Default BFM hero will be shown</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div 
                key={slide.id}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  slide.is_active ? "border-[#D4AF37]/40 bg-[#050A14]" : "border-[#D4AF37]/10 bg-[#050A14]/50 opacity-60"
                }`}
              >
                {/* Order */}
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveSlide(slide.id, "up")}
                    disabled={idx === 0}
                    className="p-1 text-[#A0A5B0] hover:text-[#D4AF37] disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-[#D4AF37] text-center font-bold">{idx + 1}</span>
                  <button 
                    onClick={() => moveSlide(slide.id, "down")}
                    disabled={idx === slides.length - 1}
                    className="p-1 text-[#A0A5B0] hover:text-[#D4AF37] disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Image Preview */}
                <div className="w-32 h-20 rounded overflow-hidden bg-[#050A14] flex-shrink-0">
                  {slide.image_data ? (
                    <img 
                      src={slide.image_data} 
                      alt={slide.talent_name} 
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${slide.focal_point_x}% ${slide.focal_point_y}%` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#A0A5B0]">
                      <Image size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F0] font-semibold truncate">{slide.talent_name}</p>
                  <p className="text-[#D4AF37] text-sm">{slide.talent_category}</p>
                  <p className="text-[#A0A5B0] text-xs">
                    Focal: {slide.focal_point_x}%, {slide.focal_point_y}% • {slide.fit_mode}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleSlideActive(slide)}
                    className={`p-2 rounded ${slide.is_active ? "text-green-500" : "text-[#A0A5B0]"}`}
                    title={slide.is_active ? "Active" : "Inactive"}
                  >
                    {slide.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button 
                    onClick={() => setEditingSlide(slide)}
                    className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded"
                    title="Edit"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={() => deleteSlide(slide.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Slide Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h3 className="text-[#F5F5F0] font-bold">Add Hero Slide</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#A0A5B0] hover:text-[#F5F5F0]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Step 1: Select Talent */}
              <div>
                <label className="block text-[#D4AF37] text-sm mb-2">1. Select Talent (Hero-Enabled Only)</label>
                {eligibleTalents.length === 0 ? (
                  <p className="text-[#A0A5B0] text-sm">No talents have hero enabled. Configure talents above first.</p>
                ) : (
                  <select 
                    value={addSlideState.talent_id}
                    onChange={(e) => selectTalentForSlide(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  >
                    <option value="">Select a talent...</option>
                    {eligibleTalents.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.category}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 2: Select Image */}
              {addSlideState.talent_id && talentImages.length > 0 && (
                <div>
                  <label className="block text-[#D4AF37] text-sm mb-2">2. Select Portfolio Image</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {talentImages.map(img => (
                      <div 
                        key={img.index}
                        onClick={() => setAddSlideState(prev => ({ ...prev, image_index: img.index }))}
                        className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          addSlideState.image_index === img.index 
                            ? "border-[#D4AF37]" 
                            : "border-transparent hover:border-[#D4AF37]/50"
                        }`}
                      >
                        <img src={img.image_data} alt={`Portfolio ${img.index}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Set Focal Point */}
              {addSlideState.talent_id && talentImages.length > 0 && (
                <div>
                  <label className="block text-[#D4AF37] text-sm mb-2">3. Set Focal Point (Click on the image)</label>
                  <FocalPointPicker 
                    image={talentImages.find(i => i.index === addSlideState.image_index)?.image_data || ""}
                    x={addSlideState.focal_point_x}
                    y={addSlideState.focal_point_y}
                    onChange={(x, y) => setAddSlideState(prev => ({ ...prev, focal_point_x: x, focal_point_y: y }))}
                  />
                </div>
              )}

              {/* Step 4: Fit Mode */}
              {addSlideState.talent_id && (
                <div>
                  <label className="block text-[#D4AF37] text-sm mb-2">4. Image Fit Mode</label>
                  <select 
                    value={addSlideState.fit_mode}
                    onChange={(e) => setAddSlideState(prev => ({ ...prev, fit_mode: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  >
                    <option value="smart">Smart Fit (Recommended)</option>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="original">Original</option>
                  </select>
                  <p className="text-[#A0A5B0] text-xs mt-1">
                    Smart Fit and Cover both crop to fill the frame using the focal point you set below -
                    there's no automatic face detection, so drag the focal point onto the face/subject
                    to avoid cropping it out.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#D4AF37]/20 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[#A0A5B0]">Cancel</button>
              <button 
                onClick={addHeroSlide}
                disabled={!addSlideState.talent_id}
                className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50"
              >
                Add Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Talent Config Modal */}
      {showTalentConfigModal && selectedTalent && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowTalentConfigModal(false)}>
          <div className="bg-[#0A1628] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <div>
                <h3 className="text-[#F5F5F0] font-bold">{selectedTalent.talent_name || selectedTalent.name}</h3>
                <p className="text-[#D4AF37] text-sm">{selectedTalent.talent_category || selectedTalent.category}</p>
              </div>
              <button onClick={() => setShowTalentConfigModal(false)} className="text-[#A0A5B0] hover:text-[#F5F5F0]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-[#A0A5B0] text-sm mb-4">
                Select which portfolio images can be used in the homepage hero. Click images to enable/disable.
              </p>
              
              {talentImages.length === 0 ? (
                <p className="text-[#A0A5B0] text-center py-8">No portfolio images available</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {talentImages.map(img => (
                    <div 
                      key={img.index}
                      onClick={() => toggleImageHeroEnabled(img.index)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        img.is_hero_enabled 
                          ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" 
                          : "border-[#D4AF37]/20 opacity-60 hover:opacity-80"
                      }`}
                    >
                      <img src={img.image_data} alt={`Portfolio ${img.index}`} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 flex items-center justify-center ${img.is_hero_enabled ? "bg-[#D4AF37]/20" : "bg-black/40"}`}>
                        {img.is_hero_enabled ? (
                          <Check size={32} className="text-[#D4AF37]" />
                        ) : (
                          <span className="text-white/60 text-xs">Click to enable</span>
                        )}
                      </div>
                      {img.is_hero_enabled && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#D4AF37] text-[#050A14] text-[10px] font-bold rounded">
                          HERO
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
              <p className="text-[#A0A5B0] text-sm">
                {talentImages.filter(i => i.is_hero_enabled).length} images enabled for hero
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowTalentConfigModal(false)} className="px-4 py-2 text-[#A0A5B0]">Cancel</button>
                <button 
                  onClick={saveTalentHeroConfig}
                  className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-[#0A1628] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h3 className="text-[#F5F5F0] font-bold">Hero Slider Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#A0A5B0] hover:text-[#F5F5F0]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Autoplay */}
              <div className="flex items-center justify-between">
                <label className="text-[#F5F5F0]">Autoplay</label>
                <button 
                  onClick={() => setSettings(s => ({ ...s, autoplay: !s.autoplay }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.autoplay ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.autoplay ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Slide Duration */}
              <div>
                <label className="block text-[#F5F5F0] mb-2">Slide Duration</label>
                <select 
                  value={settings.slide_duration}
                  onChange={(e) => setSettings(s => ({ ...s, slide_duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                >
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={7}>7 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>

              {/* Transition */}
              <div>
                <label className="block text-[#F5F5F0] mb-2">Transition Effect</label>
                <select 
                  value={settings.transition}
                  onChange={(e) => setSettings(s => ({ ...s, transition: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom (Ken Burns)</option>
                </select>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <label className="text-[#F5F5F0]">Show Arrows</label>
                <button 
                  onClick={() => setSettings(s => ({ ...s, show_arrows: !s.show_arrows }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.show_arrows ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.show_arrows ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[#F5F5F0]">Show Dots</label>
                <button 
                  onClick={() => setSettings(s => ({ ...s, show_dots: !s.show_dots }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.show_dots ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.show_dots ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Hero Height */}
              <div>
                <label className="block text-[#F5F5F0] mb-2">Hero Height</label>
                <select 
                  value={settings.hero_height}
                  onChange={(e) => setSettings(s => ({ ...s, hero_height: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                >
                  <option value="50vh">50% Screen</option>
                  <option value="60vh">60% Screen</option>
                  <option value="70vh">70% Screen</option>
                  <option value="80vh">80% Screen</option>
                  <option value="100vh">Full Screen</option>
                </select>
              </div>

              {/* Default Content */}
              <div className="pt-4 border-t border-[#D4AF37]/20">
                <h4 className="text-[#D4AF37] text-sm font-semibold mb-3">Default Hero (When No Slides)</h4>
                
                <div className="space-y-3">
                  <input 
                    type="text"
                    value={settings.default_headline}
                    onChange={(e) => setSettings(s => ({ ...s, default_headline: e.target.value }))}
                    placeholder="Headline"
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                  <input 
                    type="text"
                    value={settings.default_description}
                    onChange={(e) => setSettings(s => ({ ...s, default_description: e.target.value }))}
                    placeholder="Description"
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text"
                      value={settings.default_cta_text}
                      onChange={(e) => setSettings(s => ({ ...s, default_cta_text: e.target.value }))}
                      placeholder="Button Text"
                      className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                    />
                    <input 
                      type="text"
                      value={settings.default_cta_link}
                      onChange={(e) => setSettings(s => ({ ...s, default_cta_link: e.target.value }))}
                      placeholder="Button Link"
                      className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#D4AF37]/20 flex justify-end gap-2">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-[#A0A5B0]">Cancel</button>
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setEditingSlide(null)}>
          <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h3 className="text-[#F5F5F0] font-bold">Edit Slide - {editingSlide.talent_name}</h3>
              <button onClick={() => setEditingSlide(null)} className="text-[#A0A5B0] hover:text-[#F5F5F0]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Focal Point */}
              <div>
                <label className="block text-[#D4AF37] text-sm mb-2">Focal Point</label>
                <FocalPointPicker 
                  image={editingSlide.image_data}
                  x={editingSlide.focal_point_x}
                  y={editingSlide.focal_point_y}
                  onChange={(x, y) => setEditingSlide(s => ({ ...s, focal_point_x: x, focal_point_y: y }))}
                />
              </div>

              {/* Fit Mode */}
              <div>
                <label className="block text-[#D4AF37] text-sm mb-2">Fit Mode</label>
                <select 
                  value={editingSlide.fit_mode}
                  onChange={(e) => setEditingSlide(s => ({ ...s, fit_mode: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                >
                  <option value="smart">Smart Fit</option>
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="original">Original</option>
                </select>
                <p className="text-[#A0A5B0] text-xs mt-1">
                  Smart Fit and Cover both crop to fill the frame using the focal point above - there's
                  no automatic face detection, so make sure the focal point is on the face/subject.
                </p>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#D4AF37] text-sm">Preview</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPreviewMode("desktop")}
                      className={`p-2 rounded ${previewMode === "desktop" ? "bg-[#D4AF37] text-[#050A14]" : "text-[#A0A5B0]"}`}
                    >
                      <Monitor size={16} />
                    </button>
                    <button 
                      onClick={() => setPreviewMode("mobile")}
                      className={`p-2 rounded ${previewMode === "mobile" ? "bg-[#D4AF37] text-[#050A14]" : "text-[#A0A5B0]"}`}
                    >
                      <Smartphone size={16} />
                    </button>
                  </div>
                </div>
                
                <div className={`mx-auto overflow-hidden rounded-lg border border-[#D4AF37]/20 ${
                  previewMode === "mobile" ? "w-48 h-80" : "w-full h-48"
                }`}>
                  <img 
                    src={editingSlide.image_data}
                    alt="Preview"
                    className={`w-full h-full ${
                      editingSlide.fit_mode === "contain" ? "object-contain" : 
                      editingSlide.fit_mode === "cover" ? "object-cover" : "object-cover"
                    }`}
                    style={{ objectPosition: `${editingSlide.focal_point_x}% ${editingSlide.focal_point_y}%` }}
                  />
                </div>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D4AF37]/20">
                <div className="flex items-center justify-between">
                  <label className="text-[#F5F5F0] text-sm">Show Name</label>
                  <button 
                    onClick={() => setEditingSlide(s => ({ ...s, show_talent_name: !s.show_talent_name }))}
                    className={`w-10 h-5 rounded-full transition-colors ${editingSlide.show_talent_name ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingSlide.show_talent_name ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#F5F5F0] text-sm">Show Category</label>
                  <button 
                    onClick={() => setEditingSlide(s => ({ ...s, show_talent_category: !s.show_talent_category }))}
                    className={`w-10 h-5 rounded-full transition-colors ${editingSlide.show_talent_category ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingSlide.show_talent_category ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#F5F5F0] text-sm">Show CTA Button</label>
                  <button 
                    onClick={() => setEditingSlide(s => ({ ...s, show_cta_button: !s.show_cta_button }))}
                    className={`w-10 h-5 rounded-full transition-colors ${editingSlide.show_cta_button ? "bg-[#D4AF37]" : "bg-[#050A14]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingSlide.show_cta_button ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#D4AF37]/20 flex justify-end gap-2">
              <button onClick={() => setEditingSlide(null)} className="px-4 py-2 text-[#A0A5B0]">Cancel</button>
              <button 
                onClick={() => updateSlide(editingSlide.id, {
                  focal_point_x: editingSlide.focal_point_x,
                  focal_point_y: editingSlide.focal_point_y,
                  fit_mode: editingSlide.fit_mode,
                  show_talent_name: editingSlide.show_talent_name,
                  show_talent_category: editingSlide.show_talent_category,
                  show_cta_button: editingSlide.show_cta_button
                })}
                className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroManagement;

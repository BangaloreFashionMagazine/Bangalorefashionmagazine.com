import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { 
  Plus, Trash2, Copy, ChevronUp, ChevronDown, Download, Eye, 
  Type, Image, Square, Circle, Layers, Move, RotateCcw, RotateCw,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette,
  Lock, Unlock, EyeOff, ChevronLeft, ChevronRight, Save, FileDown
} from "lucide-react";
import { API } from "@/lib/config";
import { autoCompressImage } from "@/lib/imageOptimization";

const TALENT_CATEGORIES = [
  "Male Model", "Female Model", "Designer", "Photographer", 
  "Makeup Artist", "Hair Stylist", "Stylist", "DJ", 
  "Choreographer", "Casting Coordinator", "Other"
];

const TEMPLATES = [
  { id: "black_gold", name: "BFM Black & Gold", description: "Luxury fashion magazine", colors: { bg: "#000000", accent: "#D4AF37" } },
  { id: "editorial", name: "BFM Editorial", description: "Clean white and black editorial", colors: { bg: "#FFFFFF", accent: "#D4AF37" } },
  { id: "dark_luxury", name: "BFM Dark Luxury", description: "Dramatic dark backgrounds", colors: { bg: "#0A0A0A", accent: "#D4AF37" } }
];

const MagazineBuilder = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Create, 2: Details, 3: Images, 4: Template, 5: Editor
  const [loading, setLoading] = useState(false);
  const [magazines, setMagazines] = useState([]);
  const [currentMagazine, setCurrentMagazine] = useState(null);
  
  // Talent details state
  const [talentDetails, setTalentDetails] = useState({
    name: "",
    category: "Female Model",
    headline: "",
    introduction: "",
    biography: "",
    career_journey: "",
    achievements: "",
    specialization: "",
    location: "",
    instagram: "",
    website: "",
    contact_links: "",
    interview_qa: [{ question: "", answer: "" }],
    additional_info: ""
  });
  
  // Images state
  const [images, setImages] = useState({
    cover_image: "",
    profile_image: "",
    portfolio_images: [],
    behind_scenes: [],
    background_image: "",
    logo: ""
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState("black_gold");
  
  // Editor state
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLayers, setShowLayers] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const editorRef = useRef(null);
  const pageRef = useRef(null);
  
  // Load magazines on mount
  useEffect(() => {
    loadMagazines();
  }, []);
  
  const loadMagazines = async () => {
    try {
      const res = await axios.get(`${API}/magazine-builder/list`);
      setMagazines(res.data);
    } catch (err) {
      console.error("Failed to load magazines", err);
    }
  };
  
  const handleImageUpload = async (e, field, isMultiple = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    try {
      const processedImages = await Promise.all(
        files.map(async (file) => {
          return await autoCompressImage(file);
        })
      );
      
      if (isMultiple) {
        setImages(prev => ({
          ...prev,
          [field]: [...(prev[field] || []), ...processedImages].slice(0, 10)
        }));
      } else {
        setImages(prev => ({ ...prev, [field]: processedImages[0] }));
      }
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };
  
  const addQA = () => {
    setTalentDetails(prev => ({
      ...prev,
      interview_qa: [...prev.interview_qa, { question: "", answer: "" }]
    }));
  };
  
  const updateQA = (index, field, value) => {
    setTalentDetails(prev => ({
      ...prev,
      interview_qa: prev.interview_qa.map((qa, i) => 
        i === index ? { ...qa, [field]: value } : qa
      )
    }));
  };
  
  const removeQA = (index) => {
    setTalentDetails(prev => ({
      ...prev,
      interview_qa: prev.interview_qa.filter((_, i) => i !== index)
    }));
  };
  
  const generateMagazine = async () => {
    if (!talentDetails.name) {
      toast({ title: "Please enter talent name", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API}/magazine-builder/generate`, {
        talent: talentDetails,
        images: images,
        template: selectedTemplate
      });
      
      setCurrentMagazine({ id: res.data.id, template: res.data.template });
      setPages(res.data.pages);
      setCurrentPageIndex(0);
      setStep(5);
      saveToHistory(res.data.pages);
      toast({ title: "Magazine generated!", description: "You can now edit your magazine" });
    } catch (err) {
      toast({ title: "Generation failed", description: err.response?.data?.detail || "Error", variant: "destructive" });
    }
    setLoading(false);
  };
  
  const saveToHistory = (newPages) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newPages));
    setHistory(newHistory.slice(-50)); // Keep last 50 states
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPages(JSON.parse(history[historyIndex - 1]));
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPages(JSON.parse(history[historyIndex + 1]));
    }
  };
  
  const updateElement = (elementId, updates) => {
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        )
      };
    });
    setPages(newPages);
    saveToHistory(newPages);
  };
  
  const updateElementStyle = (elementId, styleUpdates) => {
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.map(el => 
          el.id === elementId ? { ...el, style: { ...el.style, ...styleUpdates } } : el
        )
      };
    });
    setPages(newPages);
    saveToHistory(newPages);
  };
  
  const updateElementPosition = (elementId, positionUpdates) => {
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.map(el => 
          el.id === elementId ? { ...el, position: { ...el.position, ...positionUpdates } } : el
        )
      };
    });
    setPages(newPages);
  };
  
  const deleteElement = (elementId) => {
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.filter(el => el.id !== elementId)
      };
    });
    setPages(newPages);
    setSelectedElement(null);
    saveToHistory(newPages);
  };
  
  const addElement = (type) => {
    const newElement = {
      id: `el_${Date.now()}`,
      type,
      content: type === "text" ? "New Text" : type === "image" ? "" : "rectangle",
      style: type === "text" 
        ? { fontSize: "16px", fontWeight: "400", color: "#FFFFFF", textAlign: "left" }
        : type === "shape" 
        ? { backgroundColor: "#D4AF37" }
        : {},
      position: { x: 10, y: 10, width: 30, height: type === "text" ? 10 : 20 },
      layer: pages[currentPageIndex].elements.length,
      locked: false,
      visible: true,
      name: `New ${type}`
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
  };
  
  const addPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      page_type: "custom",
      background: { type: "solid", color: "#000000" },
      elements: []
    };
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    saveToHistory(newPages);
  };
  
  const duplicatePage = () => {
    const currentPage = pages[currentPageIndex];
    const duplicated = {
      ...JSON.parse(JSON.stringify(currentPage)),
      id: `page_${Date.now()}`,
      name: `${currentPage.name} (Copy)`
    };
    // Generate new IDs for elements
    duplicated.elements = duplicated.elements.map(el => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    const newPages = [...pages.slice(0, currentPageIndex + 1), duplicated, ...pages.slice(currentPageIndex + 1)];
    setPages(newPages);
    setCurrentPageIndex(currentPageIndex + 1);
    saveToHistory(newPages);
  };
  
  const deletePage = () => {
    if (pages.length <= 1) {
      toast({ title: "Cannot delete", description: "Magazine must have at least one page", variant: "destructive" });
      return;
    }
    const newPages = pages.filter((_, i) => i !== currentPageIndex);
    setPages(newPages);
    setCurrentPageIndex(Math.min(currentPageIndex, newPages.length - 1));
    saveToHistory(newPages);
  };
  
  const movePage = (direction) => {
    const newIndex = currentPageIndex + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    const newPages = [...pages];
    [newPages[currentPageIndex], newPages[newIndex]] = [newPages[newIndex], newPages[currentPageIndex]];
    setPages(newPages);
    setCurrentPageIndex(newIndex);
    saveToHistory(newPages);
  };
  
  const saveMagazine = async () => {
    if (!currentMagazine?.id) return;
    
    setLoading(true);
    try {
      await axios.put(`${API}/magazine-builder/${currentMagazine.id}`, {
        title: `${talentDetails.name} - BFM Feature`,
        talent: talentDetails,
        images: images,
        pages: pages,
        template: selectedTemplate
      });
      toast({ title: "Magazine saved!" });
      loadMagazines();
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" });
    }
    setLoading(false);
  };
  
  const exportToPDF = async () => {
    toast({ title: "Preparing PDF...", description: "This may take a moment" });
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [595, 842] // A4 size
      });
      
      for (let i = 0; i < pages.length; i++) {
        setCurrentPageIndex(i);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
        
        const pageEl = document.getElementById(`magazine-page-${i}`);
        if (!pageEl) continue;
        
        const canvas = await html2canvas(pageEl, { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 595, 842);
      }
      
      pdf.save(`${talentDetails.name || 'Magazine'}_BFM.pdf`);
      toast({ title: "PDF exported successfully!" });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };
  
  const exportForInstagram = async (format) => {
    toast({ title: `Exporting for Instagram (${format})...` });
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      
      const dimensions = {
        portrait: { width: 1080, height: 1350 },
        square: { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 }
      };
      
      const { width, height } = dimensions[format] || dimensions.portrait;
      
      const pageEl = document.getElementById(`magazine-page-${currentPageIndex}`);
      if (!pageEl) return;
      
      const canvas = await html2canvas(pageEl, { 
        scale: 3,
        useCORS: true,
        allowTaint: true
      });
      
      // Create a new canvas with Instagram dimensions
      const igCanvas = document.createElement('canvas');
      igCanvas.width = width;
      igCanvas.height = height;
      const ctx = igCanvas.getContext('2d');
      
      // Draw the page scaled to fit
      const scale = Math.min(width / canvas.width, height / canvas.height);
      const x = (width - canvas.width * scale) / 2;
      const y = (height - canvas.height * scale) / 2;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale);
      
      const link = document.createElement('a');
      link.download = `${talentDetails.name || 'Magazine'}_instagram_${format}.jpg`;
      link.href = igCanvas.toDataURL('image/jpeg', 0.95);
      link.click();
      
      toast({ title: "Instagram export complete!" });
    } catch (err) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };
  
  const loadMagazine = async (magazineId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/magazine-builder/${magazineId}`);
      setCurrentMagazine({ id: res.data.id, template: res.data.template });
      setTalentDetails(res.data.talent);
      setImages(res.data.images);
      setPages(res.data.pages);
      setSelectedTemplate(res.data.template);
      setCurrentPageIndex(0);
      setStep(5);
      saveToHistory(res.data.pages);
    } catch (err) {
      toast({ title: "Failed to load magazine", variant: "destructive" });
    }
    setLoading(false);
  };
  
  const currentPage = pages[currentPageIndex];
  const currentElements = currentPage?.elements || [];
  const selectedEl = currentElements.find(el => el.id === selectedElement);
  
  // Render step content
  const renderStep = () => {
    switch (step) {
      case 1: // Magazine list / Create
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#D4AF37]">BFM Magazine Builder</h2>
              <Button onClick={() => setStep(2)} className="bg-[#D4AF37] text-[#050A14] hover:bg-[#F5D76E]" data-testid="create-magazine-btn">
                <Plus className="mr-2" size={18} /> Create New Magazine
              </Button>
            </div>
            
            {magazines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {magazines.map(mag => (
                  <div 
                    key={mag.id} 
                    className="bg-[#0A1628] rounded-lg p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 cursor-pointer transition-all"
                    onClick={() => loadMagazine(mag.id)}
                    data-testid={`magazine-card-${mag.id}`}
                  >
                    <h3 className="text-[#F5F5F0] font-bold">{mag.title}</h3>
                    <p className="text-[#A0A5B0] text-sm">{mag.talent?.category}</p>
                    <p className="text-[#A0A5B0] text-xs mt-2">{mag.pages?.length || 0} pages</p>
                    <p className="text-[#D4AF37] text-xs">Template: {mag.template}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#0A1628] rounded-lg border border-[#D4AF37]/20">
                <p className="text-[#A0A5B0]">No magazines yet. Create your first BFM magazine!</p>
              </div>
            )}
          </div>
        );
        
      case 2: // Talent Details
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 1: Talent Details</h2>
              <Button variant="outline" onClick={() => setStep(1)} className="border-[#D4AF37]/30">
                <ChevronLeft size={16} /> Back
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#A0A5B0] text-sm">Talent Name *</label>
                <Input 
                  value={talentDetails.name}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter talent name"
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                />
              </div>
              <div>
                <label className="text-[#A0A5B0] text-sm">Category *</label>
                <select 
                  value={talentDetails.category}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 bg-[#0A1628] border border-[#D4AF37]/30 rounded text-[#F5F5F0]"
                >
                  {TALENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-[#A0A5B0] text-sm">Profile Headline</label>
              <Input 
                value={talentDetails.headline}
                onChange={(e) => setTalentDetails(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g., 'Rising Star of Indian Fashion'"
                className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
              />
            </div>
            
            <div>
              <label className="text-[#A0A5B0] text-sm">Short Introduction</label>
              <Textarea 
                value={talentDetails.introduction}
                onChange={(e) => setTalentDetails(prev => ({ ...prev, introduction: e.target.value }))}
                placeholder="Brief introduction (2-3 sentences)"
                className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-[#A0A5B0] text-sm">Full Biography</label>
              <Textarea 
                value={talentDetails.biography}
                onChange={(e) => setTalentDetails(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Detailed biography"
                className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                rows={5}
              />
            </div>
            
            <div>
              <label className="text-[#A0A5B0] text-sm">Career Journey</label>
              <Textarea 
                value={talentDetails.career_journey}
                onChange={(e) => setTalentDetails(prev => ({ ...prev, career_journey: e.target.value }))}
                placeholder="How did the journey begin? Key milestones..."
                className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#A0A5B0] text-sm">Achievements</label>
                <Textarea 
                  value={talentDetails.achievements}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Awards, recognitions..."
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-[#A0A5B0] text-sm">Specialization</label>
                <Textarea 
                  value={talentDetails.specialization}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Areas of expertise..."
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[#A0A5B0] text-sm">Location</label>
                <Input 
                  value={talentDetails.location}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Bangalore, India"
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                />
              </div>
              <div>
                <label className="text-[#A0A5B0] text-sm">Instagram</label>
                <Input 
                  value={talentDetails.instagram}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="username"
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                />
              </div>
              <div>
                <label className="text-[#A0A5B0] text-sm">Website</label>
                <Input 
                  value={talentDetails.website}
                  onChange={(e) => setTalentDetails(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.example.com"
                  className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                />
              </div>
            </div>
            
            {/* Interview Q&A */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#A0A5B0] text-sm">Interview Questions & Answers</label>
                <Button variant="outline" size="sm" onClick={addQA} className="border-[#D4AF37]/30 text-[#D4AF37]">
                  <Plus size={14} /> Add Q&A
                </Button>
              </div>
              <div className="space-y-4">
                {talentDetails.interview_qa.map((qa, i) => (
                  <div key={i} className="bg-[#0A1628] p-3 rounded border border-[#D4AF37]/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#D4AF37] text-sm">Q{i + 1}</span>
                      {talentDetails.interview_qa.length > 1 && (
                        <button onClick={() => removeQA(i)} className="text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <Input 
                      value={qa.question}
                      onChange={(e) => updateQA(i, "question", e.target.value)}
                      placeholder="Question"
                      className="bg-[#050A14] border-[#D4AF37]/20 mb-2"
                    />
                    <Textarea 
                      value={qa.answer}
                      onChange={(e) => updateQA(i, "answer", e.target.value)}
                      placeholder="Answer"
                      className="bg-[#050A14] border-[#D4AF37]/20 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)} className="bg-[#D4AF37] text-[#050A14]">
                Next: Upload Images <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        );
        
      case 3: // Images
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 2: Upload Images</h2>
              <Button variant="outline" onClick={() => setStep(2)} className="border-[#D4AF37]/30">
                <ChevronLeft size={16} /> Back
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div className="bg-[#0A1628] p-4 rounded-lg border border-[#D4AF37]/20">
                <label className="text-[#A0A5B0] text-sm block mb-2">Cover Image</label>
                {images.cover_image ? (
                  <div className="relative">
                    <img src={images.cover_image} alt="Cover" className="w-full aspect-[3/4] object-cover rounded" />
                    <button 
                      onClick={() => setImages(prev => ({ ...prev, cover_image: "" }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-[#D4AF37]/30 rounded cursor-pointer hover:border-[#D4AF37]">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover_image")} />
                    <Image size={32} className="text-[#D4AF37]/50" />
                    <span className="text-[#A0A5B0] text-sm mt-2">Upload Cover</span>
                  </label>
                )}
              </div>
              
              {/* Profile Image */}
              <div className="bg-[#0A1628] p-4 rounded-lg border border-[#D4AF37]/20">
                <label className="text-[#A0A5B0] text-sm block mb-2">Profile Image</label>
                {images.profile_image ? (
                  <div className="relative">
                    <img src={images.profile_image} alt="Profile" className="w-full aspect-[3/4] object-cover rounded" />
                    <button 
                      onClick={() => setImages(prev => ({ ...prev, profile_image: "" }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-[#D4AF37]/30 rounded cursor-pointer hover:border-[#D4AF37]">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "profile_image")} />
                    <Image size={32} className="text-[#D4AF37]/50" />
                    <span className="text-[#A0A5B0] text-sm mt-2">Upload Profile</span>
                  </label>
                )}
              </div>
            </div>
            
            {/* Portfolio Images */}
            <div className="bg-[#0A1628] p-4 rounded-lg border border-[#D4AF37]/20">
              <label className="text-[#A0A5B0] text-sm block mb-2">Portfolio Images (up to 10)</label>
              <div className="grid grid-cols-4 gap-3">
                {images.portfolio_images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt={`Portfolio ${i + 1}`} className="w-full aspect-square object-cover rounded" />
                    <button 
                      onClick={() => setImages(prev => ({ ...prev, portfolio_images: prev.portfolio_images.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {images.portfolio_images.length < 10 && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#D4AF37]/30 rounded cursor-pointer hover:border-[#D4AF37]">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, "portfolio_images", true)} />
                    <Plus size={24} className="text-[#D4AF37]/50" />
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="border-[#D4AF37]/30">
                Skip Images
              </Button>
              <Button onClick={() => setStep(4)} className="bg-[#D4AF37] text-[#050A14]">
                Next: Select Template <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        );
        
      case 4: // Template Selection
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 3: Select Template</h2>
              <Button variant="outline" onClick={() => setStep(3)} className="border-[#D4AF37]/30">
                <ChevronLeft size={16} /> Back
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedTemplate === template.id 
                      ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                      : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <div 
                    className="aspect-[3/4] flex items-center justify-center"
                    style={{ backgroundColor: template.colors.bg }}
                  >
                    <div className="text-center p-4">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: template.colors.accent }}
                      >
                        <span className="text-2xl font-bold" style={{ color: template.colors.bg }}>BFM</span>
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: template.colors.accent }}>{template.name}</h3>
                    </div>
                  </div>
                  <div className="p-3 bg-[#0A1628]">
                    <p className="text-[#A0A5B0] text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={generateMagazine} 
                disabled={loading}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#050A14] px-8 py-3 text-lg font-bold"
                data-testid="generate-magazine-btn"
              >
                {loading ? "Generating..." : "✨ Generate Magazine"}
              </Button>
            </div>
          </div>
        );
        
      case 5: // Editor
        return (
          <div className="flex h-[calc(100vh-200px)] gap-4">
            {/* Left Sidebar - Page Thumbnails */}
            <div className="w-48 bg-[#0A1628] rounded-lg p-3 overflow-y-auto flex-shrink-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A0A5B0] text-xs uppercase tracking-wider">Pages</span>
                <button onClick={addPage} className="text-[#D4AF37] hover:text-[#F5D76E]">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {pages.map((page, i) => (
                  <div 
                    key={page.id}
                    onClick={() => setCurrentPageIndex(i)}
                    className={`cursor-pointer rounded border-2 transition-all ${
                      i === currentPageIndex ? 'border-[#D4AF37]' : 'border-transparent hover:border-[#D4AF37]/30'
                    }`}
                  >
                    <div 
                      className="aspect-[3/4] rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: page.background?.color || '#000' }}
                    >
                      <span className="text-white/60">{i + 1}</span>
                    </div>
                    <p className="text-[#A0A5B0] text-[10px] text-center py-1 truncate">{page.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="bg-[#0A1628] rounded-lg p-2 mb-3 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 border-r border-[#D4AF37]/20 pr-2">
                  <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30">
                    <RotateCcw size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30">
                    <RotateCw size={16} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-[#D4AF37]/20 pr-2">
                  <button onClick={() => addElement('text')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Text">
                    <Type size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('image')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Image">
                    <Image size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('shape')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Shape">
                    <Square size={16} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-[#D4AF37]/20 pr-2">
                  <button onClick={duplicatePage} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Duplicate Page">
                    <Copy size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={deletePage} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Delete Page">
                    <Trash2 size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => movePage(-1)} disabled={currentPageIndex === 0} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30">
                    <ChevronUp size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => movePage(1)} disabled={currentPageIndex === pages.length - 1} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30">
                    <ChevronDown size={16} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-[#D4AF37]/20 pr-2">
                  <button onClick={() => setShowLayers(!showLayers)} className={`p-1.5 rounded ${showLayers ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`}>
                    <Layers size={16} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => setPreviewMode(!previewMode)} className={`p-1.5 rounded ${previewMode ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`}>
                    <Eye size={16} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="flex-1" />
                
                <Button onClick={saveMagazine} disabled={loading} size="sm" className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14]" data-testid="save-magazine-btn">
                  <Save size={14} className="mr-1" /> Save
                </Button>
                <Button onClick={exportToPDF} size="sm" className="bg-[#D4AF37] text-[#050A14]" data-testid="export-pdf-btn">
                  <FileDown size={14} className="mr-1" /> Export PDF
                </Button>
                <div className="relative">
                  <Button 
                    size="sm" 
                    className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14]"
                    onClick={(e) => {
                      const dropdown = e.currentTarget.nextElementSibling;
                      dropdown.classList.toggle('hidden');
                    }}
                    data-testid="export-instagram-btn"
                  >
                    <Download size={14} className="mr-1" /> Instagram
                  </Button>
                  <div className="absolute right-0 top-full mt-1 bg-[#0A1628] border border-[#D4AF37]/30 rounded shadow-lg hidden z-10">
                    <button onClick={() => exportForInstagram('portrait')} className="block w-full px-3 py-2 text-sm text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-portrait">Portrait (1080×1350)</button>
                    <button onClick={() => exportForInstagram('square')} className="block w-full px-3 py-2 text-sm text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-square">Square (1080×1080)</button>
                    <button onClick={() => exportForInstagram('story')} className="block w-full px-3 py-2 text-sm text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-story">Story (1080×1920)</button>
                  </div>
                </div>
              </div>
              
              {/* Editor Canvas */}
              <div className="flex-1 flex gap-3 overflow-hidden">
                <div ref={editorRef} className="flex-1 overflow-auto bg-[#1A1A2E] rounded-lg p-8 flex items-center justify-center">
                  <div 
                    id={`magazine-page-${currentPageIndex}`}
                    ref={pageRef}
                    className="relative bg-black shadow-2xl"
                    style={{ 
                      width: `${400 * (zoom / 100)}px`, 
                      height: `${566 * (zoom / 100)}px`,
                      backgroundColor: currentPage?.background?.color || '#000'
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedElement(null);
                    }}
                  >
                    {currentElements
                      .sort((a, b) => a.layer - b.layer)
                      .filter(el => el.visible)
                      .map(el => (
                        <div
                          key={el.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!el.locked) setSelectedElement(el.id);
                          }}
                          className={`absolute cursor-move ${
                            selectedElement === el.id ? 'ring-2 ring-[#D4AF37]' : ''
                          } ${el.locked ? 'cursor-not-allowed' : ''}`}
                          style={{
                            left: `${el.position.x}%`,
                            top: `${el.position.y}%`,
                            width: `${el.position.width}%`,
                            height: `${el.position.height}%`,
                            ...el.style
                          }}
                        >
                          {el.type === 'text' && (
                            <div 
                              contentEditable={selectedElement === el.id && !el.locked}
                              suppressContentEditableWarning
                              onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
                              className="w-full h-full overflow-hidden whitespace-pre-wrap"
                              style={el.style}
                            >
                              {el.content}
                            </div>
                          )}
                          {el.type === 'image' && el.content && (
                            <img src={el.content} alt="" className="w-full h-full" style={el.style} />
                          )}
                          {el.type === 'logo' && (
                            <img src={el.content} alt="Logo" className="w-full h-full" style={el.style} />
                          )}
                          {el.type === 'shape' && (
                            <div className="w-full h-full" style={el.style} />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Right Sidebar - Layers & Properties */}
                {showLayers && (
                  <div className="w-64 bg-[#0A1628] rounded-lg p-3 overflow-y-auto flex-shrink-0">
                    <h3 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-3">Layers</h3>
                    <div className="space-y-1">
                      {[...currentElements].reverse().map(el => (
                        <div 
                          key={el.id}
                          onClick={() => !el.locked && setSelectedElement(el.id)}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                            selectedElement === el.id ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'
                          }`}
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }}
                            className="text-[#A0A5B0] hover:text-[#D4AF37]"
                          >
                            {el.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateElement(el.id, { locked: !el.locked }); }}
                            className="text-[#A0A5B0] hover:text-[#D4AF37]"
                          >
                            {el.locked ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <span className="text-[#F5F5F0] text-xs flex-1 truncate">{el.name || el.type}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Element Properties */}
                    {selectedEl && (
                      <div className="mt-4 pt-4 border-t border-[#D4AF37]/20">
                        <h3 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-3">Properties</h3>
                        
                        {selectedEl.type === 'text' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Font Size</label>
                              <Input 
                                value={selectedEl.style.fontSize?.replace('px', '') || '16'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { fontSize: `${e.target.value}px` })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Color</label>
                              <div className="flex gap-2">
                                <input 
                                  type="color" 
                                  value={selectedEl.style.color || '#FFFFFF'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { color: e.target.value })}
                                  className="w-8 h-8 rounded cursor-pointer"
                                />
                                <Input 
                                  value={selectedEl.style.color || '#FFFFFF'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { color: e.target.value })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-8 text-sm flex-1"
                                />
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { fontWeight: selectedEl.style.fontWeight === '700' ? '400' : '700' })}
                                className={`p-1.5 rounded ${selectedEl.style.fontWeight === '700' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <Bold size={14} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { fontStyle: selectedEl.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                className={`p-1.5 rounded ${selectedEl.style.fontStyle === 'italic' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <Italic size={14} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'left' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'left' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignLeft size={14} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'center' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'center' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignCenter size={14} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'right' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'right' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignRight size={14} className="text-[#A0A5B0]" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {(selectedEl.type === 'image' || selectedEl.type === 'logo') && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Replace Image</label>
                              <label className="flex items-center justify-center p-2 border border-dashed border-[#D4AF37]/30 rounded cursor-pointer hover:border-[#D4AF37] mt-1">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const compressed = await autoCompressImage(file);
                                      updateElement(selectedEl.id, { content: compressed });
                                    }
                                  }}
                                />
                                <span className="text-[#D4AF37] text-xs">Choose Image</span>
                              </label>
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Object Fit</label>
                              <select 
                                value={selectedEl.style.objectFit || 'cover'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { objectFit: e.target.value })}
                                className="w-full p-1.5 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                              >
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="fill">Fill</option>
                              </select>
                            </div>
                          </div>
                        )}
                        
                        {selectedEl.type === 'shape' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Background Color</label>
                              <div className="flex gap-2">
                                <input 
                                  type="color" 
                                  value={selectedEl.style.backgroundColor || '#D4AF37'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                  className="w-8 h-8 rounded cursor-pointer"
                                />
                                <Input 
                                  value={selectedEl.style.backgroundColor || '#D4AF37'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-8 text-sm flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Position controls for all elements */}
                        <div className="mt-3 pt-3 border-t border-[#D4AF37]/20">
                          <label className="text-[#A0A5B0] text-xs">Position (%)</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">X</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.x)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { x: parseFloat(e.target.value) || 0 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">Y</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.y)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { y: parseFloat(e.target.value) || 0 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">Width</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.width)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { width: parseFloat(e.target.value) || 10 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">Height</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.height)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { height: parseFloat(e.target.value) || 10 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4">
      {/* Step indicator for steps 2-4 */}
      {step >= 2 && step <= 4 && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {[2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s === step ? 'bg-[#D4AF37] text-[#050A14]' : s < step ? 'bg-[#D4AF37]/50 text-[#050A14]' : 'bg-[#0A1628] text-[#A0A5B0]'
                }`}>
                  {s - 1}
                </div>
                {s < 4 && <div className={`w-12 h-0.5 ${s < step ? 'bg-[#D4AF37]' : 'bg-[#0A1628]'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Back to list button when in editor */}
      {step === 5 && (
        <div className="mb-4">
          <Button variant="outline" onClick={() => setStep(1)} className="border-[#D4AF37]/30">
            <ChevronLeft size={16} /> Back to Magazines
          </Button>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

export default MagazineBuilder;

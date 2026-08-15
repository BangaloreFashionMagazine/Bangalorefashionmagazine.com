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
  Lock, Unlock, EyeOff, ChevronLeft, ChevronRight, Save, FileDown,
  Minus, Grid, ZoomIn, ZoomOut, Maximize, Minimize, Underline,
  GripVertical, LayoutGrid, ImagePlus, Clipboard, ClipboardCopy,
  FolderOpen, Layout, BookOpen, Star, Instagram, AtSign, Phone
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

const FONT_FAMILIES = [
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Lato", value: "'Lato', sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Cormorant", value: "'Cormorant Garamond', serif" },
  { name: "Oswald", value: "'Oswald', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif" },
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Great Vibes", value: "'Great Vibes', cursive" }
];

const PAGE_TEMPLATES = [
  { id: "blank", name: "Blank Page", icon: "□", category: "Basic" },
  { id: "cover", name: "Cover Page", icon: "📰", category: "Basic" },
  { id: "profile", name: "Profile Page", icon: "👤", category: "Basic" },
  { id: "portfolio_grid", name: "Photo Grid (6)", icon: "🖼", category: "Portfolio" },
  { id: "portfolio_2col", name: "Two Column", icon: "▯▯", category: "Portfolio" },
  { id: "portfolio_3img", name: "Three Images", icon: "▢▢▢", category: "Portfolio" },
  { id: "portfolio_featured", name: "Featured + Grid", icon: "◉▢", category: "Portfolio" },
  { id: "interview", name: "Interview Q&A", icon: "💬", category: "Content" },
  { id: "full_bleed", name: "Full Bleed Image", icon: "🌄", category: "Content" },
  { id: "quote", name: "Quote Page", icon: "❝", category: "Content" },
  { id: "bio_sidebar", name: "Bio + Sidebar", icon: "📝", category: "Content" },
  { id: "timeline", name: "Career Timeline", icon: "📅", category: "Content" },
  { id: "achievements", name: "Achievements", icon: "🏆", category: "Content" },
  { id: "behind_scenes", name: "Behind the Scenes", icon: "🎬", category: "Content" },
  { id: "contact", name: "Contact Page", icon: "📞", category: "Utility" },
  { id: "social_links", name: "Social Links", icon: "📱", category: "Utility" },
  { id: "credits", name: "Credits Page", icon: "📋", category: "Utility" },
  { id: "toc", name: "Table of Contents", icon: "📑", category: "Utility" },
  { id: "ad_full", name: "Full Page Ad", icon: "📢", category: "Ads" },
  { id: "ad_half", name: "Half Page Ad", icon: "📋", category: "Ads" },
  { id: "ad_sidebar", name: "Content + Ad", icon: "📄", category: "Ads" }
];

const MagazineBuilder = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
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
  const [selectedElements, setSelectedElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLayers, setShowLayers] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [clipboard, setClipboard] = useState(null);
  const [showPageTemplates, setShowPageTemplates] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Media Library state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  
  // Master Pages state
  const [showMasterPages, setShowMasterPages] = useState(false);
  const [masterElements, setMasterElements] = useState({
    header: [],
    footer: []
  });
  const [applyMasterTo, setApplyMasterTo] = useState('all'); // 'all', 'except_cover', 'custom'
  const [excludedPages, setExcludedPages] = useState([]);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0 });
  
  const editorRef = useRef(null);
  const pageRef = useRef(null);
  
  // Load magazines on mount
  useEffect(() => {
    loadMagazines();
  }, []);
  
  // Load Google Fonts for Magazine
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Montserrat:wght@300;400;600;700&family=Oswald:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  
  // Auto-save every 30 seconds when there are unsaved changes
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !currentMagazine?.id || step !== 5) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveMagazine(true);
    }, 30000); // 30 seconds
    
    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, autoSaveEnabled, currentMagazine?.id, step, pages]);
  
  const loadMagazines = async () => {
    try {
      const res = await axios.get(`${API}/magazine-builder/list`);
      setMagazines(res.data);
    } catch (err) {
      console.error("Failed to load magazines", err);
    }
  };
  
  // Media Library functions
  const addToMediaLibrary = async (file) => {
    try {
      const compressed = await autoCompressImage(file);
      const newMedia = {
        id: `media_${Date.now()}`,
        url: compressed,
        name: file.name,
        addedAt: new Date().toISOString()
      };
      setMediaLibrary(prev => [...prev, newMedia]);
      setHasUnsavedChanges(true);
      return newMedia;
    } catch (err) {
      toast({ title: "Failed to add image", variant: "destructive" });
      return null;
    }
  };
  
  const removeFromMediaLibrary = (mediaId) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== mediaId));
    setHasUnsavedChanges(true);
  };
  
  const addMediaToCanvas = (mediaUrl) => {
    const newElement = {
      id: `el_${Date.now()}`,
      type: 'image',
      content: mediaUrl,
      style: { opacity: 1, objectFit: 'cover', borderRadius: '0px' },
      position: { x: 10, y: 10, width: 30, height: 30 },
      layer: pages[currentPageIndex].elements.length,
      locked: false,
      visible: true,
      name: 'Library Image'
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
    setShowMediaLibrary(false);
  };
  
  // Master Page functions
  const addMasterElement = (position, type) => {
    const colors = TEMPLATES.find(t => t.id === selectedTemplate)?.colors || { bg: "#000000", accent: "#D4AF37" };
    const newElement = {
      id: `master_${Date.now()}`,
      type: 'text',
      content: position === 'header' ? 'HEADER TEXT' : 'FOOTER TEXT',
      style: { 
        fontSize: position === 'header' ? '10px' : '9px', 
        fontWeight: '400', 
        color: colors.accent, 
        textAlign: 'center',
        letterSpacing: '2px'
      },
      position: position === 'header' 
        ? { x: 5, y: 2, width: 90, height: 4 }
        : { x: 5, y: 94, width: 90, height: 4 },
      layer: 100,
      locked: false,
      visible: true,
      name: position === 'header' ? 'Master Header' : 'Master Footer'
    };
    
    setMasterElements(prev => ({
      ...prev,
      [position]: [...prev[position], newElement]
    }));
    setHasUnsavedChanges(true);
  };
  
  const updateMasterElement = (position, elementId, updates) => {
    setMasterElements(prev => ({
      ...prev,
      [position]: prev[position].map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
    setHasUnsavedChanges(true);
  };
  
  const removeMasterElement = (position, elementId) => {
    setMasterElements(prev => ({
      ...prev,
      [position]: prev[position].filter(el => el.id !== elementId)
    }));
    setHasUnsavedChanges(true);
  };
  
  const shouldApplyMasterToPage = (pageIndex) => {
    if (applyMasterTo === 'all') return true;
    if (applyMasterTo === 'except_cover' && pageIndex === 0) return false;
    if (applyMasterTo === 'custom' && excludedPages.includes(pageIndex)) return false;
    return true;
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
    setHistory(newHistory.slice(-50));
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPages(JSON.parse(history[historyIndex - 1]));
      setHasUnsavedChanges(true);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPages(JSON.parse(history[historyIndex + 1]));
      setHasUnsavedChanges(true);
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
  
  const updateElementPosition = (elementId, positionUpdates, saveHistory = true) => {
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
    if (saveHistory) saveToHistory(newPages);
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
  
  const copyElement = () => {
    if (!selectedElement) return;
    const el = currentElements.find(e => e.id === selectedElement);
    if (el) {
      setClipboard(JSON.parse(JSON.stringify(el)));
      toast({ title: "Element copied" });
    }
  };
  
  const pasteElement = () => {
    if (!clipboard) return;
    const newElement = {
      ...clipboard,
      id: `el_${Date.now()}`,
      position: {
        ...clipboard.position,
        x: clipboard.position.x + 2,
        y: clipboard.position.y + 2
      },
      name: `${clipboard.name} (Copy)`
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
    toast({ title: "Element pasted" });
  };
  
  const duplicateElement = () => {
    if (!selectedElement) return;
    const el = currentElements.find(e => e.id === selectedElement);
    if (!el) return;
    
    const newElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: `el_${Date.now()}`,
      position: {
        ...el.position,
        x: el.position.x + 2,
        y: el.position.y + 2
      },
      name: `${el.name} (Copy)`
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
  };
  
  const bringToFront = () => {
    if (!selectedElement) return;
    const maxLayer = Math.max(...currentElements.map(e => e.layer));
    updateElement(selectedElement, { layer: maxLayer + 1 });
  };
  
  const sendToBack = () => {
    if (!selectedElement) return;
    const minLayer = Math.min(...currentElements.map(e => e.layer));
    updateElement(selectedElement, { layer: minLayer - 1 });
  };
  
  const addElement = (type, shape = "rectangle") => {
    const newElement = {
      id: `el_${Date.now()}`,
      type,
      content: type === "text" ? "New Text" : type === "image" ? "" : shape,
      style: type === "text" 
        ? { fontSize: "18px", fontWeight: "400", color: "#FFFFFF", textAlign: "left", fontFamily: "'Lato', sans-serif", lineHeight: "1.5", letterSpacing: "0px", opacity: 1 }
        : type === "shape" 
        ? { backgroundColor: "#D4AF37", opacity: 1, borderRadius: shape === "circle" ? "50%" : "0px" }
        : { opacity: 1, objectFit: "cover" },
      position: { x: 10, y: 10, width: type === "line" ? 50 : 30, height: type === "text" ? 10 : type === "line" ? 1 : 20 },
      layer: pages[currentPageIndex].elements.length,
      locked: false,
      visible: true,
      name: type === "shape" ? `${shape.charAt(0).toUpperCase() + shape.slice(1)}` : `New ${type}`
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
  };
  
  const addPageFromTemplate = (templateId) => {
    const colors = TEMPLATES.find(t => t.id === selectedTemplate)?.colors || { bg: "#000000", accent: "#D4AF37" };
    let newPage = {
      id: `page_${Date.now()}`,
      name: PAGE_TEMPLATES.find(t => t.id === templateId)?.name || "New Page",
      page_type: templateId,
      background: { type: "solid", color: colors.bg },
      elements: []
    };
    
    // Add elements based on template
    switch (templateId) {
      case "cover":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "COVER TITLE", style: { fontSize: "48px", fontWeight: "700", color: "#FFFFFF", textAlign: "center", fontFamily: "'Playfair Display', serif" }, position: { x: 5, y: 40, width: 90, height: 15 }, layer: 2, locked: false, visible: true, name: "Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Subtitle text here", style: { fontSize: "18px", fontWeight: "400", color: colors.accent, textAlign: "center", letterSpacing: "3px" }, position: { x: 10, y: 55, width: 80, height: 8 }, layer: 2, locked: false, visible: true, name: "Subtitle" }
        ];
        break;
      case "profile":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "PROFILE", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 5, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent, opacity: 0.3 }, position: { x: 5, y: 15, width: 40, height: 60 }, layer: 1, locked: false, visible: true, name: "Image Placeholder" },
          { id: `el_${Date.now()}_3`, type: "text", content: "Name Here", style: { fontSize: "32px", fontWeight: "700", color: "#FFFFFF" }, position: { x: 50, y: 15, width: 45, height: 10 }, layer: 2, locked: false, visible: true, name: "Name" },
          { id: `el_${Date.now()}_4`, type: "text", content: "Add your biography text here. Tell your story, share your journey, and let readers know who you are.", style: { fontSize: "14px", color: "#CCCCCC", lineHeight: "1.8", textAlign: "justify" }, position: { x: 50, y: 28, width: 45, height: 47 }, layer: 2, locked: false, visible: true, name: "Bio" }
        ];
        break;
      case "portfolio_grid":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "PORTFOLIO", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 7 }, layer: 3, locked: false, visible: true, name: "Section Title" }
        ];
        // Add 6 image placeholders in a grid
        for (let i = 0; i < 6; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          newPage.elements.push({
            id: `el_${Date.now()}_img${i}`,
            type: "shape",
            content: "rectangle",
            style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent },
            position: { x: 5 + col * 31, y: 12 + row * 44, width: 29, height: 42 },
            layer: 1,
            locked: false,
            visible: true,
            name: `Image ${i + 1}`
          });
        }
        break;
      case "portfolio_2col":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 3, y: 3, width: 46, height: 94 }, layer: 1, locked: false, visible: true, name: "Left Image" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 51, y: 3, width: 46, height: 94 }, layer: 1, locked: false, visible: true, name: "Right Image" }
        ];
        break;
      case "interview":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "INTERVIEW", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 7 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Q: Your question here?", style: { fontSize: "16px", fontWeight: "700", color: colors.accent }, position: { x: 5, y: 15, width: 90, height: 6 }, layer: 2, locked: false, visible: true, name: "Question 1" },
          { id: `el_${Date.now()}_3`, type: "text", content: "Answer text goes here...", style: { fontSize: "14px", color: "#CCCCCC", lineHeight: "1.8" }, position: { x: 5, y: 22, width: 90, height: 15 }, layer: 2, locked: false, visible: true, name: "Answer 1" },
          { id: `el_${Date.now()}_4`, type: "text", content: "Q: Another question?", style: { fontSize: "16px", fontWeight: "700", color: colors.accent }, position: { x: 5, y: 40, width: 90, height: 6 }, layer: 2, locked: false, visible: true, name: "Question 2" },
          { id: `el_${Date.now()}_5`, type: "text", content: "Answer text goes here...", style: { fontSize: "14px", color: "#CCCCCC", lineHeight: "1.8" }, position: { x: 5, y: 47, width: 90, height: 15 }, layer: 2, locked: false, visible: true, name: "Answer 2" }
        ];
        break;
      case "full_bleed":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "2px dashed " + colors.accent }, position: { x: 0, y: 0, width: 100, height: 100 }, layer: 0, locked: false, visible: true, name: "Full Bleed Image" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: "rgba(0,0,0,0.5)" }, position: { x: 0, y: 70, width: 100, height: 30 }, layer: 1, locked: false, visible: true, name: "Text Overlay" },
          { id: `el_${Date.now()}_3`, type: "text", content: "CAPTION TEXT", style: { fontSize: "24px", fontWeight: "700", color: "#FFFFFF", textAlign: "center" }, position: { x: 5, y: 80, width: 90, height: 10 }, layer: 2, locked: false, visible: true, name: "Caption" }
        ];
        break;
      case "quote":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "❝", style: { fontSize: "72px", color: colors.accent, opacity: 0.5 }, position: { x: 5, y: 20, width: 15, height: 20 }, layer: 1, locked: false, visible: true, name: "Quote Mark" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Your inspiring quote goes here. Make it memorable and impactful.", style: { fontSize: "28px", fontWeight: "400", color: "#FFFFFF", textAlign: "center", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", lineHeight: "1.6" }, position: { x: 10, y: 35, width: 80, height: 30 }, layer: 2, locked: false, visible: true, name: "Quote Text" },
          { id: `el_${Date.now()}_3`, type: "text", content: "— Attribution", style: { fontSize: "14px", color: colors.accent, textAlign: "center", letterSpacing: "2px" }, position: { x: 10, y: 70, width: 80, height: 5 }, layer: 2, locked: false, visible: true, name: "Attribution" }
        ];
        break;
      case "ad_full":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "shape", content: "rectangle", style: { backgroundColor: "#0A1628", border: "2px dashed " + colors.accent }, position: { x: 0, y: 0, width: 100, height: 100 }, layer: 0, locked: false, visible: true, name: "Ad Container" },
          { id: `el_${Date.now()}_2`, type: "text", content: "ADVERTISEMENT", style: { fontSize: "24px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 10, y: 45, width: 80, height: 10 }, layer: 1, locked: false, visible: true, name: "Ad Label" }
        ];
        break;
      case "ad_half":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "shape", content: "rectangle", style: { backgroundColor: "#0A1628", border: "2px dashed " + colors.accent }, position: { x: 0, y: 50, width: 100, height: 50 }, layer: 0, locked: false, visible: true, name: "Ad Container" },
          { id: `el_${Date.now()}_2`, type: "text", content: "ADVERTISEMENT", style: { fontSize: "18px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "3px" }, position: { x: 10, y: 70, width: 80, height: 8 }, layer: 1, locked: false, visible: true, name: "Ad Label" },
          { id: `el_${Date.now()}_3`, type: "text", content: "Content Area", style: { fontSize: "24px", fontWeight: "600", color: "#FFFFFF", textAlign: "center" }, position: { x: 10, y: 20, width: 80, height: 10 }, layer: 1, locked: false, visible: true, name: "Content Title" }
        ];
        break;
      case "portfolio_3img":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "PORTFOLIO", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 7 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 3, y: 12, width: 30, height: 85 }, layer: 1, locked: false, visible: true, name: "Image 1" },
          { id: `el_${Date.now()}_3`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 35, y: 12, width: 30, height: 85 }, layer: 1, locked: false, visible: true, name: "Image 2" },
          { id: `el_${Date.now()}_4`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 67, y: 12, width: 30, height: 85 }, layer: 1, locked: false, visible: true, name: "Image 3" }
        ];
        break;
      case "portfolio_featured":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 3, y: 3, width: 60, height: 94 }, layer: 1, locked: false, visible: true, name: "Featured Image" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 65, y: 3, width: 32, height: 30 }, layer: 1, locked: false, visible: true, name: "Small 1" },
          { id: `el_${Date.now()}_3`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 65, y: 35, width: 32, height: 30 }, layer: 1, locked: false, visible: true, name: "Small 2" },
          { id: `el_${Date.now()}_4`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 65, y: 67, width: 32, height: 30 }, layer: 1, locked: false, visible: true, name: "Small 3" }
        ];
        break;
      case "bio_sidebar":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "ABOUT", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, letterSpacing: "5px" }, position: { x: 5, y: 5, width: 60, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Biography text goes here. Share your complete story, background, inspirations, and journey in the fashion industry.", style: { fontSize: "14px", color: "#CCCCCC", lineHeight: "1.8", textAlign: "justify" }, position: { x: 5, y: 15, width: 60, height: 70 }, layer: 2, locked: false, visible: true, name: "Bio Text" },
          { id: `el_${Date.now()}_3`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent, opacity: 0.1 }, position: { x: 70, y: 5, width: 25, height: 90 }, layer: 0, locked: false, visible: true, name: "Sidebar BG" },
          { id: `el_${Date.now()}_4`, type: "text", content: "QUICK FACTS", style: { fontSize: "14px", fontWeight: "700", color: colors.accent, letterSpacing: "2px" }, position: { x: 72, y: 10, width: 21, height: 5 }, layer: 2, locked: false, visible: true, name: "Sidebar Title" },
          { id: `el_${Date.now()}_5`, type: "text", content: "• Location\n• Experience\n• Specialization\n• Languages", style: { fontSize: "12px", color: "#FFFFFF", lineHeight: "2" }, position: { x: 72, y: 18, width: 21, height: 30 }, layer: 2, locked: false, visible: true, name: "Facts List" }
        ];
        break;
      case "timeline":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "CAREER TIMELINE", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent }, position: { x: 49, y: 15, width: 2, height: 80 }, layer: 0, locked: false, visible: true, name: "Timeline Line" },
          { id: `el_${Date.now()}_3`, type: "text", content: "2020", style: { fontSize: "16px", fontWeight: "700", color: colors.accent }, position: { x: 5, y: 18, width: 40, height: 5 }, layer: 2, locked: false, visible: true, name: "Year 1" },
          { id: `el_${Date.now()}_4`, type: "text", content: "Started journey in fashion", style: { fontSize: "12px", color: "#CCCCCC" }, position: { x: 5, y: 24, width: 40, height: 10 }, layer: 2, locked: false, visible: true, name: "Event 1" },
          { id: `el_${Date.now()}_5`, type: "text", content: "2022", style: { fontSize: "16px", fontWeight: "700", color: colors.accent }, position: { x: 55, y: 40, width: 40, height: 5 }, layer: 2, locked: false, visible: true, name: "Year 2" },
          { id: `el_${Date.now()}_6`, type: "text", content: "Major breakthrough moment", style: { fontSize: "12px", color: "#CCCCCC" }, position: { x: 55, y: 46, width: 40, height: 10 }, layer: 2, locked: false, visible: true, name: "Event 2" },
          { id: `el_${Date.now()}_7`, type: "text", content: "2024", style: { fontSize: "16px", fontWeight: "700", color: colors.accent }, position: { x: 5, y: 62, width: 40, height: 5 }, layer: 2, locked: false, visible: true, name: "Year 3" },
          { id: `el_${Date.now()}_8`, type: "text", content: "Current achievements", style: { fontSize: "12px", color: "#CCCCCC" }, position: { x: 5, y: 68, width: 40, height: 10 }, layer: 2, locked: false, visible: true, name: "Event 3" }
        ];
        break;
      case "achievements":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "ACHIEVEMENTS", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "🏆", style: { fontSize: "48px", textAlign: "center" }, position: { x: 5, y: 15, width: 28, height: 15 }, layer: 2, locked: false, visible: true, name: "Award Icon 1" },
          { id: `el_${Date.now()}_3`, type: "text", content: "Award Title", style: { fontSize: "16px", fontWeight: "700", color: "#FFFFFF", textAlign: "center" }, position: { x: 5, y: 32, width: 28, height: 5 }, layer: 2, locked: false, visible: true, name: "Award 1 Title" },
          { id: `el_${Date.now()}_4`, type: "text", content: "Description", style: { fontSize: "12px", color: "#CCCCCC", textAlign: "center" }, position: { x: 5, y: 38, width: 28, height: 8 }, layer: 2, locked: false, visible: true, name: "Award 1 Desc" },
          { id: `el_${Date.now()}_5`, type: "text", content: "⭐", style: { fontSize: "48px", textAlign: "center" }, position: { x: 36, y: 15, width: 28, height: 15 }, layer: 2, locked: false, visible: true, name: "Award Icon 2" },
          { id: `el_${Date.now()}_6`, type: "text", content: "Recognition", style: { fontSize: "16px", fontWeight: "700", color: "#FFFFFF", textAlign: "center" }, position: { x: 36, y: 32, width: 28, height: 5 }, layer: 2, locked: false, visible: true, name: "Award 2 Title" },
          { id: `el_${Date.now()}_7`, type: "text", content: "Description", style: { fontSize: "12px", color: "#CCCCCC", textAlign: "center" }, position: { x: 36, y: 38, width: 28, height: 8 }, layer: 2, locked: false, visible: true, name: "Award 2 Desc" },
          { id: `el_${Date.now()}_8`, type: "text", content: "🎖", style: { fontSize: "48px", textAlign: "center" }, position: { x: 67, y: 15, width: 28, height: 15 }, layer: 2, locked: false, visible: true, name: "Award Icon 3" },
          { id: `el_${Date.now()}_9`, type: "text", content: "Honor", style: { fontSize: "16px", fontWeight: "700", color: "#FFFFFF", textAlign: "center" }, position: { x: 67, y: 32, width: 28, height: 5 }, layer: 2, locked: false, visible: true, name: "Award 3 Title" },
          { id: `el_${Date.now()}_10`, type: "text", content: "Description", style: { fontSize: "12px", color: "#CCCCCC", textAlign: "center" }, position: { x: 67, y: 38, width: 28, height: 8 }, layer: 2, locked: false, visible: true, name: "Award 3 Desc" }
        ];
        break;
      case "behind_scenes":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "BEHIND THE SCENES", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 3, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 3, y: 13, width: 48, height: 40 }, layer: 1, locked: false, visible: true, name: "BTS Image 1" },
          { id: `el_${Date.now()}_3`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 53, y: 13, width: 44, height: 40 }, layer: 1, locked: false, visible: true, name: "BTS Image 2" },
          { id: `el_${Date.now()}_4`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 3, y: 55, width: 44, height: 40 }, layer: 1, locked: false, visible: true, name: "BTS Image 3" },
          { id: `el_${Date.now()}_5`, type: "shape", content: "rectangle", style: { backgroundColor: "#1A1A2E", border: "1px dashed " + colors.accent }, position: { x: 49, y: 55, width: 48, height: 40 }, layer: 1, locked: false, visible: true, name: "BTS Image 4" }
        ];
        break;
      case "contact":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "GET IN TOUCH", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 10, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "For bookings, collaborations, and inquiries", style: { fontSize: "14px", color: "#CCCCCC", textAlign: "center", fontStyle: "italic" }, position: { x: 10, y: 20, width: 80, height: 5 }, layer: 2, locked: false, visible: true, name: "Subtitle" },
          { id: `el_${Date.now()}_3`, type: "text", content: "📧", style: { fontSize: "32px", textAlign: "center" }, position: { x: 10, y: 35, width: 10, height: 10 }, layer: 2, locked: false, visible: true, name: "Email Icon" },
          { id: `el_${Date.now()}_4`, type: "text", content: "email@example.com", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 22, y: 37, width: 70, height: 6 }, layer: 2, locked: false, visible: true, name: "Email" },
          { id: `el_${Date.now()}_5`, type: "text", content: "📱", style: { fontSize: "32px", textAlign: "center" }, position: { x: 10, y: 50, width: 10, height: 10 }, layer: 2, locked: false, visible: true, name: "Phone Icon" },
          { id: `el_${Date.now()}_6`, type: "text", content: "+91 98765 43210", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 22, y: 52, width: 70, height: 6 }, layer: 2, locked: false, visible: true, name: "Phone" },
          { id: `el_${Date.now()}_7`, type: "text", content: "📍", style: { fontSize: "32px", textAlign: "center" }, position: { x: 10, y: 65, width: 10, height: 10 }, layer: 2, locked: false, visible: true, name: "Location Icon" },
          { id: `el_${Date.now()}_8`, type: "text", content: "Bangalore, India", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 22, y: 67, width: 70, height: 6 }, layer: 2, locked: false, visible: true, name: "Location" }
        ];
        break;
      case "social_links":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "CONNECT WITH ME", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 10, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "shape", content: "circle", style: { backgroundColor: "#E1306C", borderRadius: "50%" }, position: { x: 20, y: 30, width: 15, height: 12 }, layer: 1, locked: false, visible: true, name: "Instagram BG" },
          { id: `el_${Date.now()}_3`, type: "text", content: "@username", style: { fontSize: "14px", color: "#FFFFFF", textAlign: "center" }, position: { x: 15, y: 45, width: 25, height: 5 }, layer: 2, locked: false, visible: true, name: "Instagram Handle" },
          { id: `el_${Date.now()}_4`, type: "shape", content: "circle", style: { backgroundColor: "#1DA1F2", borderRadius: "50%" }, position: { x: 42, y: 30, width: 15, height: 12 }, layer: 1, locked: false, visible: true, name: "Twitter BG" },
          { id: `el_${Date.now()}_5`, type: "text", content: "@username", style: { fontSize: "14px", color: "#FFFFFF", textAlign: "center" }, position: { x: 37, y: 45, width: 25, height: 5 }, layer: 2, locked: false, visible: true, name: "Twitter Handle" },
          { id: `el_${Date.now()}_6`, type: "shape", content: "circle", style: { backgroundColor: "#0077B5", borderRadius: "50%" }, position: { x: 64, y: 30, width: 15, height: 12 }, layer: 1, locked: false, visible: true, name: "LinkedIn BG" },
          { id: `el_${Date.now()}_7`, type: "text", content: "/in/username", style: { fontSize: "14px", color: "#FFFFFF", textAlign: "center" }, position: { x: 59, y: 45, width: 25, height: 5 }, layer: 2, locked: false, visible: true, name: "LinkedIn Handle" },
          { id: `el_${Date.now()}_8`, type: "text", content: "www.yourwebsite.com", style: { fontSize: "18px", color: colors.accent, textAlign: "center" }, position: { x: 10, y: 70, width: 80, height: 8 }, layer: 2, locked: false, visible: true, name: "Website" }
        ];
        break;
      case "credits":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "CREDITS", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 10, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Photography", style: { fontSize: "12px", color: colors.accent, letterSpacing: "2px" }, position: { x: 10, y: 25, width: 35, height: 4 }, layer: 2, locked: false, visible: true, name: "Photo Label" },
          { id: `el_${Date.now()}_3`, type: "text", content: "Photographer Name", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 10, y: 30, width: 35, height: 6 }, layer: 2, locked: false, visible: true, name: "Photographer" },
          { id: `el_${Date.now()}_4`, type: "text", content: "Styling", style: { fontSize: "12px", color: colors.accent, letterSpacing: "2px" }, position: { x: 55, y: 25, width: 35, height: 4 }, layer: 2, locked: false, visible: true, name: "Style Label" },
          { id: `el_${Date.now()}_5`, type: "text", content: "Stylist Name", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 55, y: 30, width: 35, height: 6 }, layer: 2, locked: false, visible: true, name: "Stylist" },
          { id: `el_${Date.now()}_6`, type: "text", content: "Makeup & Hair", style: { fontSize: "12px", color: colors.accent, letterSpacing: "2px" }, position: { x: 10, y: 45, width: 35, height: 4 }, layer: 2, locked: false, visible: true, name: "MUA Label" },
          { id: `el_${Date.now()}_7`, type: "text", content: "MUA Name", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 10, y: 50, width: 35, height: 6 }, layer: 2, locked: false, visible: true, name: "MUA" },
          { id: `el_${Date.now()}_8`, type: "text", content: "Creative Direction", style: { fontSize: "12px", color: colors.accent, letterSpacing: "2px" }, position: { x: 55, y: 45, width: 35, height: 4 }, layer: 2, locked: false, visible: true, name: "CD Label" },
          { id: `el_${Date.now()}_9`, type: "text", content: "Director Name", style: { fontSize: "16px", color: "#FFFFFF" }, position: { x: 55, y: 50, width: 35, height: 6 }, layer: 2, locked: false, visible: true, name: "Director" },
          { id: `el_${Date.now()}_10`, type: "text", content: "Special Thanks", style: { fontSize: "12px", color: colors.accent, letterSpacing: "2px", textAlign: "center" }, position: { x: 10, y: 70, width: 80, height: 4 }, layer: 2, locked: false, visible: true, name: "Thanks Label" },
          { id: `el_${Date.now()}_11`, type: "text", content: "Name 1, Name 2, Name 3", style: { fontSize: "14px", color: "#CCCCCC", textAlign: "center" }, position: { x: 10, y: 76, width: 80, height: 6 }, layer: 2, locked: false, visible: true, name: "Thanks List" }
        ];
        break;
      case "toc":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "CONTENTS", style: { fontSize: "28px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "5px" }, position: { x: 5, y: 10, width: 90, height: 8 }, layer: 3, locked: false, visible: true, name: "Section Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "COVER STORY", style: { fontSize: "14px", color: "#FFFFFF", letterSpacing: "1px" }, position: { x: 10, y: 28, width: 60, height: 5 }, layer: 2, locked: false, visible: true, name: "Item 1" },
          { id: `el_${Date.now()}_3`, type: "text", content: "04", style: { fontSize: "14px", color: colors.accent, textAlign: "right" }, position: { x: 75, y: 28, width: 15, height: 5 }, layer: 2, locked: false, visible: true, name: "Page 1" },
          { id: `el_${Date.now()}_4`, type: "text", content: "THE JOURNEY", style: { fontSize: "14px", color: "#FFFFFF", letterSpacing: "1px" }, position: { x: 10, y: 38, width: 60, height: 5 }, layer: 2, locked: false, visible: true, name: "Item 2" },
          { id: `el_${Date.now()}_5`, type: "text", content: "08", style: { fontSize: "14px", color: colors.accent, textAlign: "right" }, position: { x: 75, y: 38, width: 15, height: 5 }, layer: 2, locked: false, visible: true, name: "Page 2" },
          { id: `el_${Date.now()}_6`, type: "text", content: "PORTFOLIO", style: { fontSize: "14px", color: "#FFFFFF", letterSpacing: "1px" }, position: { x: 10, y: 48, width: 60, height: 5 }, layer: 2, locked: false, visible: true, name: "Item 3" },
          { id: `el_${Date.now()}_7`, type: "text", content: "12", style: { fontSize: "14px", color: colors.accent, textAlign: "right" }, position: { x: 75, y: 48, width: 15, height: 5 }, layer: 2, locked: false, visible: true, name: "Page 3" },
          { id: `el_${Date.now()}_8`, type: "text", content: "INTERVIEW", style: { fontSize: "14px", color: "#FFFFFF", letterSpacing: "1px" }, position: { x: 10, y: 58, width: 60, height: 5 }, layer: 2, locked: false, visible: true, name: "Item 4" },
          { id: `el_${Date.now()}_9`, type: "text", content: "18", style: { fontSize: "14px", color: colors.accent, textAlign: "right" }, position: { x: 75, y: 58, width: 15, height: 5 }, layer: 2, locked: false, visible: true, name: "Page 4" },
          { id: `el_${Date.now()}_10`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent, opacity: 0.3 }, position: { x: 10, y: 35, width: 80, height: 0.5 }, layer: 0, locked: false, visible: true, name: "Divider 1" },
          { id: `el_${Date.now()}_11`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent, opacity: 0.3 }, position: { x: 10, y: 45, width: 80, height: 0.5 }, layer: 0, locked: false, visible: true, name: "Divider 2" },
          { id: `el_${Date.now()}_12`, type: "shape", content: "rectangle", style: { backgroundColor: colors.accent, opacity: 0.3 }, position: { x: 10, y: 55, width: 80, height: 0.5 }, layer: 0, locked: false, visible: true, name: "Divider 3" }
        ];
        break;
      case "ad_sidebar":
        newPage.elements = [
          { id: `el_${Date.now()}_1`, type: "text", content: "CONTENT TITLE", style: { fontSize: "24px", fontWeight: "700", color: "#FFFFFF" }, position: { x: 5, y: 5, width: 60, height: 8 }, layer: 2, locked: false, visible: true, name: "Content Title" },
          { id: `el_${Date.now()}_2`, type: "text", content: "Your main content text goes here. This layout combines editorial content with a sidebar advertisement space.", style: { fontSize: "14px", color: "#CCCCCC", lineHeight: "1.8", textAlign: "justify" }, position: { x: 5, y: 15, width: 60, height: 75 }, layer: 2, locked: false, visible: true, name: "Content Text" },
          { id: `el_${Date.now()}_3`, type: "shape", content: "rectangle", style: { backgroundColor: "#0A1628", border: "2px dashed " + colors.accent }, position: { x: 68, y: 5, width: 28, height: 90 }, layer: 0, locked: false, visible: true, name: "Ad Container" },
          { id: `el_${Date.now()}_4`, type: "text", content: "AD", style: { fontSize: "14px", fontWeight: "700", color: colors.accent, textAlign: "center", letterSpacing: "2px" }, position: { x: 70, y: 45, width: 24, height: 5 }, layer: 1, locked: false, visible: true, name: "Ad Label" }
        ];
        break;
      default:
        break;
    }
    
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    saveToHistory(newPages);
    setShowPageTemplates(false);
  };
  
  const addPage = () => {
    setShowPageTemplates(true);
  };
  
  const duplicatePage = () => {
    const currentPage = pages[currentPageIndex];
    const duplicated = {
      ...JSON.parse(JSON.stringify(currentPage)),
      id: `page_${Date.now()}`,
      name: `${currentPage.name} (Copy)`
    };
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
  
  const updatePageBackground = (updates) => {
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, background: { ...page.background, ...updates } };
    });
    setPages(newPages);
    saveToHistory(newPages);
  };
  
  const saveMagazine = async (isAutoSave = false) => {
    if (!currentMagazine?.id) return;
    
    setLoading(true);
    try {
      await axios.put(`${API}/magazine-builder/${currentMagazine.id}`, {
        title: `${talentDetails.name} - BFM Feature`,
        talent: talentDetails,
        images: images,
        pages: pages,
        template: selectedTemplate,
        media_library: mediaLibrary,
        master_elements: masterElements,
        master_settings: { applyTo: applyMasterTo, excludedPages }
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      if (!isAutoSave) {
        toast({ title: "Magazine saved!" });
      } else {
        toast({ title: "Auto-saved", description: "Your changes have been saved automatically" });
      }
      loadMagazines();
    } catch (err) {
      if (!isAutoSave) {
        toast({ title: "Save failed", variant: "destructive" });
      }
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
        format: [595, 842]
      });
      
      const originalPage = currentPageIndex;
      
      for (let i = 0; i < pages.length; i++) {
        setCurrentPageIndex(i);
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
      
      setCurrentPageIndex(originalPage);
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
      
      const igCanvas = document.createElement('canvas');
      igCanvas.width = width;
      igCanvas.height = height;
      const ctx = igCanvas.getContext('2d');
      
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
      
      // Load media library and master elements if they exist
      if (res.data.media_library) {
        setMediaLibrary(res.data.media_library);
      }
      if (res.data.master_elements) {
        setMasterElements(res.data.master_elements);
      }
      if (res.data.master_settings) {
        setApplyMasterTo(res.data.master_settings.applyTo || 'all');
        setExcludedPages(res.data.master_settings.excludedPages || []);
      }
    } catch (err) {
      toast({ title: "Failed to load magazine", variant: "destructive" });
    }
    setLoading(false);
  };
  
  // Drag and drop handlers
  const handleMouseDown = (e, elementId, handle = null) => {
    e.stopPropagation();
    const el = currentElements.find(e => e.id === elementId);
    if (!el || el.locked) return;
    
    setSelectedElement(elementId);
    
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = ((e.clientX - rect.left) / rect.width) * 100;
    const startY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragStart({
      x: startX,
      y: startY,
      elX: el.position.x,
      elY: el.position.y,
      elW: el.position.width,
      elH: el.position.height
    });
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isResizing) return;
    if (!selectedElement) return;
    
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let currentX = ((e.clientX - rect.left) / rect.width) * 100;
    let currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to page bounds
    currentX = Math.max(0, Math.min(100, currentX));
    currentY = Math.max(0, Math.min(100, currentY));
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    if (isDragging) {
      let newX = dragStart.elX + deltaX;
      let newY = dragStart.elY + deltaY;
      
      // Snap to grid
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Clamp position
      newX = Math.max(0, Math.min(100 - dragStart.elW, newX));
      newY = Math.max(0, Math.min(100 - dragStart.elH, newY));
      
      updateElementPosition(selectedElement, { x: newX, y: newY }, false);
    } else if (isResizing) {
      let newW = dragStart.elW;
      let newH = dragStart.elH;
      let newX = dragStart.elX;
      let newY = dragStart.elY;
      
      switch (resizeHandle) {
        case 'se':
          newW = Math.max(5, dragStart.elW + deltaX);
          newH = Math.max(5, dragStart.elH + deltaY);
          break;
        case 'sw':
          newW = Math.max(5, dragStart.elW - deltaX);
          newH = Math.max(5, dragStart.elH + deltaY);
          newX = dragStart.elX + deltaX;
          break;
        case 'ne':
          newW = Math.max(5, dragStart.elW + deltaX);
          newH = Math.max(5, dragStart.elH - deltaY);
          newY = dragStart.elY + deltaY;
          break;
        case 'nw':
          newW = Math.max(5, dragStart.elW - deltaX);
          newH = Math.max(5, dragStart.elH - deltaY);
          newX = dragStart.elX + deltaX;
          newY = dragStart.elY + deltaY;
          break;
        case 'e':
          newW = Math.max(5, dragStart.elW + deltaX);
          break;
        case 'w':
          newW = Math.max(5, dragStart.elW - deltaX);
          newX = dragStart.elX + deltaX;
          break;
        case 'n':
          newH = Math.max(5, dragStart.elH - deltaY);
          newY = dragStart.elY + deltaY;
          break;
        case 's':
          newH = Math.max(5, dragStart.elH + deltaY);
          break;
      }
      
      if (snapToGrid) {
        newW = Math.round(newW / gridSize) * gridSize;
        newH = Math.round(newH / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      updateElementPosition(selectedElement, { x: newX, y: newY, width: newW, height: newH }, false);
    }
  }, [isDragging, isResizing, selectedElement, dragStart, snapToGrid, gridSize]);
  
  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      saveToHistory(pages);
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, [isDragging, isResizing, pages]);
  
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step !== 5) return;
      
      // Check if we're typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          e.preventDefault();
          deleteElement(selectedElement);
        }
      } else if (e.key === 'Escape') {
        setSelectedElement(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedElement, clipboard]);
  
  const currentPage = pages[currentPageIndex];
  const currentElements = currentPage?.elements || [];
  const selectedEl = currentElements.find(el => el.id === selectedElement);
  
  // Render resize handles
  const renderResizeHandles = (elementId) => {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const positions = {
      nw: { top: -4, left: -4, cursor: 'nw-resize' },
      n: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      ne: { top: -4, right: -4, cursor: 'ne-resize' },
      e: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
      se: { bottom: -4, right: -4, cursor: 'se-resize' },
      s: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      sw: { bottom: -4, left: -4, cursor: 'sw-resize' },
      w: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' }
    };
    
    return handles.map(handle => (
      <div
        key={handle}
        className="absolute w-2 h-2 bg-[#D4AF37] border border-white rounded-sm z-50"
        style={{ ...positions[handle], cursor: positions[handle].cursor }}
        onMouseDown={(e) => handleMouseDown(e, elementId, handle)}
      />
    ));
  };
  
  // Render step content
  const renderStep = () => {
    switch (step) {
      case 1:
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
        
      case 2:
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 1: Talent Details</h2>
              <Button variant="outline" onClick={() => setStep(1)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
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
                      className="bg-[#050A14] border-[#D4AF37]/20 mb-2 text-[#F5F5F0] placeholder:text-[#A0A5B0]/50"
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
        
      case 3:
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 2: Upload Images</h2>
              <Button variant="outline" onClick={() => setStep(2)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
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
              <Button variant="outline" onClick={() => setStep(4)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
                Skip Images
              </Button>
              <Button onClick={() => setStep(4)} className="bg-[#D4AF37] text-[#050A14]">
                Next: Select Template <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#D4AF37]">Step 3: Select Template</h2>
              <Button variant="outline" onClick={() => setStep(3)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
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
        
      case 5:
        return (
          <div className="flex h-[calc(100vh-200px)] gap-3">
            {/* Left Sidebar - Page Thumbnails */}
            <div className="w-44 bg-[#0A1628] rounded-lg p-2 overflow-y-auto flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#A0A5B0] text-xs uppercase tracking-wider">Pages</span>
                <button onClick={addPage} className="text-[#D4AF37] hover:text-[#F5D76E]" title="Add Page">
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
                      className="aspect-[3/4] rounded flex items-center justify-center text-xs relative"
                      style={{ backgroundColor: page.background?.color || '#000' }}
                    >
                      <span className="text-white/60 text-lg font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[#A0A5B0] text-[9px] text-center py-1 truncate px-1">{page.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Toolbar */}
              <div className="bg-[#0A1628] rounded-lg p-2 mb-2 flex items-center gap-1 flex-wrap">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
                  <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Undo (Ctrl+Z)" data-testid="undo-btn">
                    <RotateCcw size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Redo (Ctrl+Shift+Z)" data-testid="redo-btn">
                    <RotateCw size={14} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                {/* Add Elements */}
                <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
                  <button onClick={() => addElement('text')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Text (T)" data-testid="add-text-btn">
                    <Type size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('image')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Image" data-testid="add-image-btn">
                    <ImagePlus size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('shape', 'rectangle')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Rectangle" data-testid="add-rectangle-btn">
                    <Square size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('shape', 'circle')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Circle" data-testid="add-circle-btn">
                    <Circle size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => addElement('shape', 'line')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Line/Divider" data-testid="add-line-btn">
                    <Minus size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => setShowMediaLibrary(true)} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Media Library" data-testid="media-library-btn">
                    <FolderOpen size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => setShowMasterPages(true)} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Master Pages (Headers/Footers)" data-testid="master-pages-btn">
                    <Layout size={14} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                {/* Page Actions */}
                <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
                  <button onClick={duplicatePage} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Duplicate Page">
                    <Copy size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={deletePage} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Delete Page">
                    <Trash2 size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => movePage(-1)} disabled={currentPageIndex === 0} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Move Page Up">
                    <ChevronUp size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => movePage(1)} disabled={currentPageIndex === pages.length - 1} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Move Page Down">
                    <ChevronDown size={14} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                {/* Element Actions */}
                {selectedElement && (
                  <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
                    <button onClick={copyElement} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Copy (Ctrl+C)">
                      <ClipboardCopy size={14} className="text-[#A0A5B0]" />
                    </button>
                    <button onClick={pasteElement} disabled={!clipboard} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Paste (Ctrl+V)">
                      <Clipboard size={14} className="text-[#A0A5B0]" />
                    </button>
                    <button onClick={duplicateElement} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Duplicate (Ctrl+D)">
                      <Copy size={14} className="text-[#A0A5B0]" />
                    </button>
                    <button onClick={bringToFront} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Bring to Front">
                      <Maximize size={14} className="text-[#A0A5B0]" />
                    </button>
                    <button onClick={sendToBack} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Send to Back">
                      <Minimize size={14} className="text-[#A0A5B0]" />
                    </button>
                    <button onClick={() => deleteElement(selectedElement)} className="p-1.5 hover:bg-red-500/20 rounded" title="Delete (Del)">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                )}
                
                {/* View Controls */}
                <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
                  <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded ${showGrid ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Toggle Grid" data-testid="toggle-grid-btn">
                    <Grid size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => setShowLayers(!showLayers)} className={`p-1.5 rounded ${showLayers ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Toggle Layers Panel" data-testid="toggle-layers-btn">
                    <Layers size={14} className="text-[#A0A5B0]" />
                  </button>
                  <button onClick={() => setPreviewMode(!previewMode)} className={`p-1.5 rounded ${previewMode ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Preview Mode" data-testid="preview-mode-btn">
                    <Eye size={14} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border-r border-[#D4AF37]/20 pr-2 mr-1">
                  <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-[#D4AF37]/20 rounded" data-testid="zoom-out-btn">
                    <ZoomOut size={14} className="text-[#A0A5B0]" />
                  </button>
                  <span className="text-[#A0A5B0] text-xs w-10 text-center" data-testid="zoom-level">{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-[#D4AF37]/20 rounded" data-testid="zoom-in-btn">
                    <ZoomIn size={14} className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="flex-1" />
                
                {/* Auto-save indicator */}
                <div className="flex items-center gap-2 mr-2">
                  {hasUnsavedChanges && (
                    <span className="text-[#A0A5B0] text-xs">Unsaved changes</span>
                  )}
                  {lastSaved && !hasUnsavedChanges && (
                    <span className="text-green-400 text-xs">Saved</span>
                  )}
                  <button 
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className={`p-1 rounded text-xs ${autoSaveEnabled ? 'text-green-400' : 'text-[#A0A5B0]'}`}
                    title={autoSaveEnabled ? "Auto-save ON (every 30s)" : "Auto-save OFF"}
                    data-testid="toggle-autosave-btn"
                  >
                    {autoSaveEnabled ? '●' : '○'} Auto
                  </button>
                </div>
                
                {/* Export Buttons */}
                <Button onClick={() => saveMagazine(false)} disabled={loading} size="sm" className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] h-8 px-3" data-testid="save-magazine-btn">
                  <Save size={12} className="mr-1" /> Save
                </Button>
                <Button onClick={exportToPDF} size="sm" className="bg-[#D4AF37] text-[#050A14] h-8 px-3" data-testid="export-pdf-btn">
                  <FileDown size={12} className="mr-1" /> PDF
                </Button>
                <div className="relative">
                  <Button 
                    size="sm" 
                    className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] h-8 px-3"
                    onClick={(e) => {
                      const dropdown = e.currentTarget.nextElementSibling;
                      dropdown.classList.toggle('hidden');
                    }}
                    data-testid="export-instagram-btn"
                  >
                    <Download size={12} className="mr-1" /> IG
                  </Button>
                  <div className="absolute right-0 top-full mt-1 bg-[#0A1628] border border-[#D4AF37]/30 rounded shadow-lg hidden z-50 min-w-[140px]">
                    <button onClick={() => exportForInstagram('portrait')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-portrait">Portrait (1080×1350)</button>
                    <button onClick={() => exportForInstagram('square')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-square">Square (1080×1080)</button>
                    <button onClick={() => exportForInstagram('story')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-story">Story (1080×1920)</button>
                  </div>
                </div>
              </div>
              
              {/* Editor Canvas */}
              <div className="flex-1 flex gap-2 overflow-hidden">
                <div ref={editorRef} className="flex-1 overflow-auto bg-[#1A1A2E] rounded-lg p-4 flex items-center justify-center">
                  <div 
                    id={`magazine-page-${currentPageIndex}`}
                    ref={pageRef}
                    className="relative shadow-2xl"
                    style={{ 
                      width: `${400 * (zoom / 100)}px`, 
                      height: `${566 * (zoom / 100)}px`,
                      backgroundColor: currentPage?.background?.color || '#000',
                      backgroundImage: currentPage?.background?.image ? `url(${currentPage.background.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedElement(null);
                    }}
                  >
                    {/* Grid Overlay */}
                    {showGrid && (
                      <div 
                        className="absolute inset-0 pointer-events-none z-40"
                        style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(212,175,55,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(212,175,55,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: `${gridSize}% ${gridSize}%`
                        }}
                      />
                    )}
                    
                    {currentElements
                      .sort((a, b) => a.layer - b.layer)
                      .filter(el => el.visible)
                      .map(el => (
                        <div
                          key={el.id}
                          onMouseDown={(e) => !previewMode && handleMouseDown(e, el.id)}
                          className={`absolute ${previewMode ? '' : 'cursor-move'} ${
                            selectedElement === el.id && !previewMode ? 'ring-2 ring-[#D4AF37]' : ''
                          } ${el.locked ? 'cursor-not-allowed' : ''}`}
                          style={{
                            left: `${el.position.x}%`,
                            top: `${el.position.y}%`,
                            width: `${el.position.width}%`,
                            height: `${el.position.height}%`,
                            opacity: el.style?.opacity ?? 1,
                            pointerEvents: previewMode ? 'none' : 'auto'
                          }}
                        >
                          {el.type === 'text' && (
                            <div 
                              contentEditable={selectedElement === el.id && !el.locked && !previewMode}
                              suppressContentEditableWarning
                              onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
                              onDoubleClick={(e) => {
                                if (!el.locked && !previewMode) {
                                  setSelectedElement(el.id);
                                  e.target.focus();
                                }
                              }}
                              className="w-full h-full overflow-hidden whitespace-pre-wrap outline-none cursor-text"
                              style={{
                                fontSize: el.style.fontSize,
                                fontWeight: el.style.fontWeight,
                                color: el.style.color,
                                textAlign: el.style.textAlign,
                                fontFamily: el.style.fontFamily || "'Lato', sans-serif",
                                fontStyle: el.style.fontStyle || 'normal',
                                textDecoration: el.style.textDecoration || 'none',
                                lineHeight: el.style.lineHeight || '1.5',
                                letterSpacing: el.style.letterSpacing || '0px',
                                textShadow: el.style.textShadow || 'none'
                              }}
                            >
                              {el.content}
                            </div>
                          )}
                          {el.type === 'image' && el.content && (
                            <img src={el.content} alt="" className="w-full h-full" style={{ objectFit: el.style?.objectFit || 'cover', borderRadius: el.style?.borderRadius || '0' }} />
                          )}
                          {el.type === 'logo' && (
                            <div 
                              className="w-full h-full overflow-hidden"
                              style={{ 
                                borderRadius: '50%', 
                                border: el.style?.border || '2px solid #D4AF37',
                                backgroundColor: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <img 
                                src={el.content} 
                                alt="BFM Logo" 
                                className="w-full h-full"
                                style={{ objectFit: 'cover', borderRadius: '50%' }} 
                              />
                            </div>
                          )}
                          {el.type === 'shape' && (
                            <div 
                              className="w-full h-full" 
                              style={{ 
                                backgroundColor: el.style?.backgroundColor,
                                borderRadius: el.style?.borderRadius || '0',
                                border: el.style?.border || 'none'
                              }} 
                            />
                          )}
                          
                          {/* Resize Handles */}
                          {selectedElement === el.id && !previewMode && !el.locked && renderResizeHandles(el.id)}
                        </div>
                      ))}
                    
                    {/* Render Master Elements */}
                    {shouldApplyMasterToPage(currentPageIndex) && (
                      <>
                        {/* Header Master Elements */}
                        {masterElements.header.map(el => (
                          <div
                            key={el.id}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${el.position.x}%`,
                              top: `${el.position.y}%`,
                              width: `${el.position.width}%`,
                              height: `${el.position.height}%`,
                              opacity: el.style?.opacity ?? 1
                            }}
                          >
                            <div 
                              className="w-full h-full overflow-hidden whitespace-pre-wrap"
                              style={{
                                fontSize: el.style.fontSize,
                                fontWeight: el.style.fontWeight,
                                color: el.style.color,
                                textAlign: el.style.textAlign,
                                letterSpacing: el.style.letterSpacing || '0px'
                              }}
                            >
                              {el.content.replace('{{page}}', String(currentPageIndex + 1))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Footer Master Elements */}
                        {masterElements.footer.map(el => (
                          <div
                            key={el.id}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${el.position.x}%`,
                              top: `${el.position.y}%`,
                              width: `${el.position.width}%`,
                              height: `${el.position.height}%`,
                              opacity: el.style?.opacity ?? 1
                            }}
                          >
                            <div 
                              className="w-full h-full overflow-hidden whitespace-pre-wrap"
                              style={{
                                fontSize: el.style.fontSize,
                                fontWeight: el.style.fontWeight,
                                color: el.style.color,
                                textAlign: el.style.textAlign,
                                letterSpacing: el.style.letterSpacing || '0px'
                              }}
                            >
                              {el.content.replace('{{page}}', String(currentPageIndex + 1))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Right Sidebar - Layers & Properties */}
                {showLayers && (
                  <div className="w-56 bg-[#0A1628] rounded-lg p-2 overflow-y-auto flex-shrink-0 text-sm">
                    <h3 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-2">Layers</h3>
                    <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                      {[...currentElements].reverse().map(el => (
                        <div 
                          key={el.id}
                          onClick={() => !el.locked && setSelectedElement(el.id)}
                          className={`flex items-center gap-1 p-1.5 rounded cursor-pointer text-xs ${
                            selectedElement === el.id ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'
                          }`}
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }}
                            className="text-[#A0A5B0] hover:text-[#D4AF37]"
                          >
                            {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateElement(el.id, { locked: !el.locked }); }}
                            className="text-[#A0A5B0] hover:text-[#D4AF37]"
                          >
                            {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                          </button>
                          <span className="text-[#F5F5F0] flex-1 truncate">{el.name || el.type}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Page Background */}
                    <div className="border-t border-[#D4AF37]/20 pt-2 mb-3">
                      <h3 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-2">Page Background</h3>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={currentPage?.background?.color || '#000000'}
                          onChange={(e) => updatePageBackground({ color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <label className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const compressed = await autoCompressImage(file);
                                updatePageBackground({ image: compressed, type: 'image' });
                              }
                            }}
                          />
                          <span className="text-[#D4AF37] text-xs cursor-pointer hover:underline">+ Image</span>
                        </label>
                        {currentPage?.background?.image && (
                          <button 
                            onClick={() => updatePageBackground({ image: '', type: 'solid' })}
                            className="text-red-400 text-xs"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Element Properties */}
                    {selectedEl && (
                      <div className="border-t border-[#D4AF37]/20 pt-2">
                        <h3 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-2">Properties</h3>
                        
                        {selectedEl.type === 'text' && (
                          <div className="space-y-2">
                            {/* Font Family */}
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Font</label>
                              <select 
                                value={selectedEl.style.fontFamily || "'Lato', sans-serif"}
                                onChange={(e) => updateElementStyle(selectedEl.id, { fontFamily: e.target.value })}
                                className="w-full p-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-xs"
                              >
                                {FONT_FAMILIES.map(font => (
                                  <option key={font.name} value={font.value}>{font.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Font Size */}
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Size</label>
                              <Input 
                                value={selectedEl.style.fontSize?.replace('px', '') || '16'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { fontSize: `${e.target.value}px` })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs text-[#F5F5F0]"
                              />
                            </div>
                            
                            {/* Color */}
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Color</label>
                              <div className="flex gap-1">
                                <input 
                                  type="color" 
                                  value={selectedEl.style.color || '#FFFFFF'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { color: e.target.value })}
                                  className="w-7 h-7 rounded cursor-pointer"
                                />
                                <Input 
                                  value={selectedEl.style.color || '#FFFFFF'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { color: e.target.value })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs flex-1 text-[#F5F5F0]"
                                />
                              </div>
                            </div>
                            
                            {/* Text Formatting */}
                            <div className="flex gap-0.5 flex-wrap">
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { fontWeight: selectedEl.style.fontWeight === '700' ? '400' : '700' })}
                                className={`p-1.5 rounded ${selectedEl.style.fontWeight === '700' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <Bold size={12} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { fontStyle: selectedEl.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                className={`p-1.5 rounded ${selectedEl.style.fontStyle === 'italic' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <Italic size={12} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textDecoration: selectedEl.style.textDecoration === 'underline' ? 'none' : 'underline' })}
                                className={`p-1.5 rounded ${selectedEl.style.textDecoration === 'underline' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <Underline size={12} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'left' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'left' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignLeft size={12} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'center' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'center' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignCenter size={12} className="text-[#A0A5B0]" />
                              </button>
                              <button 
                                onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'right' })}
                                className={`p-1.5 rounded ${selectedEl.style.textAlign === 'right' ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/10'}`}
                              >
                                <AlignRight size={12} className="text-[#A0A5B0]" />
                              </button>
                            </div>
                            
                            {/* Line Height & Letter Spacing */}
                            <div className="grid grid-cols-2 gap-1">
                              <div>
                                <label className="text-[#A0A5B0] text-[10px]">Line Height</label>
                                <Input 
                                  value={selectedEl.style.lineHeight || '1.5'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { lineHeight: e.target.value })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                                />
                              </div>
                              <div>
                                <label className="text-[#A0A5B0] text-[10px]">Letter Space</label>
                                <Input 
                                  value={selectedEl.style.letterSpacing?.replace('px', '') || '0'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { letterSpacing: `${e.target.value}px` })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {(selectedEl.type === 'image' || selectedEl.type === 'logo') && (
                          <div className="space-y-2">
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
                              <label className="text-[#A0A5B0] text-xs">Fit</label>
                              <select 
                                value={selectedEl.style?.objectFit || 'cover'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { objectFit: e.target.value })}
                                className="w-full p-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-xs"
                              >
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="fill">Fill</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Border Radius</label>
                              <Input 
                                value={selectedEl.style?.borderRadius?.replace('px', '').replace('%', '') || '0'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { borderRadius: `${e.target.value}px` })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                              />
                            </div>
                          </div>
                        )}
                        
                        {selectedEl.type === 'shape' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Background</label>
                              <div className="flex gap-1">
                                <input 
                                  type="color" 
                                  value={selectedEl.style?.backgroundColor || '#D4AF37'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                  className="w-7 h-7 rounded cursor-pointer"
                                />
                                <Input 
                                  value={selectedEl.style?.backgroundColor || '#D4AF37'}
                                  onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                  className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs flex-1 text-[#F5F5F0]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-xs">Border Radius</label>
                              <Input 
                                value={selectedEl.style?.borderRadius?.replace('px', '').replace('%', '') || '0'}
                                onChange={(e) => updateElementStyle(selectedEl.id, { borderRadius: `${e.target.value}px` })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Opacity for all */}
                        <div className="mt-2">
                          <label className="text-[#A0A5B0] text-xs">Opacity</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            value={selectedEl.style?.opacity ?? 1}
                            onChange={(e) => updateElementStyle(selectedEl.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-[#050A14] rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        
                        {/* Position controls */}
                        <div className="mt-2 pt-2 border-t border-[#D4AF37]/20">
                          <label className="text-[#A0A5B0] text-xs">Position (%)</label>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">X</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.x)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { x: parseFloat(e.target.value) || 0 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">Y</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.y)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { y: parseFloat(e.target.value) || 0 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">W</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.width)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { width: parseFloat(e.target.value) || 10 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
                              />
                            </div>
                            <div>
                              <label className="text-[#A0A5B0] text-[10px]">H</label>
                              <Input 
                                type="number"
                                value={Math.round(selectedEl.position.height)}
                                onChange={(e) => updateElementPosition(selectedEl.id, { height: parseFloat(e.target.value) || 10 })}
                                className="bg-[#050A14] border-[#D4AF37]/20 h-6 text-xs text-[#F5F5F0]"
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
      {/* Page Templates Modal */}
      {showPageTemplates && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowPageTemplates(false)} data-testid="page-templates-modal">
          <div className="bg-[#0A1628] rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Add New Page</h3>
            {['Basic', 'Portfolio', 'Content', 'Utility', 'Ads'].map(category => (
              <div key={category} className="mb-4">
                <h4 className="text-[#A0A5B0] text-xs uppercase tracking-wider mb-2">{category}</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {PAGE_TEMPLATES.filter(t => t.category === category).map(template => (
                    <div
                      key={template.id}
                      onClick={() => addPageFromTemplate(template.id)}
                      className="bg-[#050A14] p-2 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer transition-all text-center"
                      data-testid={`page-template-${template.id}`}
                    >
                      <div className="text-2xl mb-1">{template.icon}</div>
                      <p className="text-[#F5F5F0] text-[10px]">{template.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowPageTemplates(false)} className="border-[#D4AF37]/30 text-[#F5F5F0]" data-testid="cancel-page-template-btn">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowMediaLibrary(false)} data-testid="media-library-modal">
          <div className="bg-[#0A1628] rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#D4AF37]">Media Library</h3>
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    for (const file of files) {
                      await addToMediaLibrary(file);
                    }
                  }}
                />
                <span className="bg-[#D4AF37] text-[#050A14] px-3 py-1.5 rounded text-sm font-medium hover:bg-[#F5D76E]">
                  + Upload Images
                </span>
              </label>
            </div>
            
            {mediaLibrary.length === 0 ? (
              <div className="text-center py-12 bg-[#050A14] rounded-lg border border-dashed border-[#D4AF37]/30">
                <FolderOpen size={48} className="mx-auto text-[#D4AF37]/30 mb-3" />
                <p className="text-[#A0A5B0]">No images in library yet</p>
                <p className="text-[#A0A5B0] text-sm">Upload images to reuse across pages</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {mediaLibrary.map(media => (
                  <div key={media.id} className="relative group">
                    <img 
                      src={media.url} 
                      alt={media.name}
                      className="w-full aspect-square object-cover rounded cursor-pointer border-2 border-transparent hover:border-[#D4AF37]"
                      onClick={() => addMediaToCanvas(media.url)}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromMediaLibrary(media.id); }}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowMediaLibrary(false)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Master Pages Modal */}
      {showMasterPages && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowMasterPages(false)} data-testid="master-pages-modal">
          <div className="bg-[#0A1628] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Master Pages</h3>
            <p className="text-[#A0A5B0] text-sm mb-4">Header and footer elements will appear on all selected pages.</p>
            
            {/* Apply Settings */}
            <div className="mb-6 p-3 bg-[#050A14] rounded-lg">
              <label className="text-[#A0A5B0] text-xs uppercase tracking-wider block mb-2">Apply Master Elements To</label>
              <select 
                value={applyMasterTo}
                onChange={(e) => setApplyMasterTo(e.target.value)}
                className="w-full p-2 bg-[#0A1628] border border-[#D4AF37]/30 rounded text-[#F5F5F0] text-sm"
              >
                <option value="all">All Pages</option>
                <option value="except_cover">All Except Cover (First Page)</option>
                <option value="custom">Custom Selection</option>
              </select>
              
              {applyMasterTo === 'custom' && (
                <div className="mt-3">
                  <label className="text-[#A0A5B0] text-xs block mb-2">Exclude pages (comma-separated numbers):</label>
                  <Input 
                    placeholder="e.g., 1, 3, 5"
                    value={excludedPages.join(', ')}
                    onChange={(e) => {
                      const nums = e.target.value.split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0);
                      setExcludedPages(nums);
                    }}
                    className="bg-[#0A1628] border-[#D4AF37]/30 text-[#F5F5F0]"
                  />
                </div>
              )}
            </div>
            
            {/* Header Elements */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[#F5F5F0] font-medium">Header Elements</h4>
                <Button size="sm" onClick={() => addMasterElement('header', 'text')} className="bg-[#D4AF37]/20 text-[#D4AF37] h-7">
                  <Plus size={12} className="mr-1" /> Add Header Text
                </Button>
              </div>
              {masterElements.header.length === 0 ? (
                <p className="text-[#A0A5B0] text-sm italic">No header elements</p>
              ) : (
                <div className="space-y-2">
                  {masterElements.header.map(el => (
                    <div key={el.id} className="flex items-center gap-2 p-2 bg-[#050A14] rounded">
                      <Input 
                        value={el.content}
                        onChange={(e) => updateMasterElement('header', el.id, { content: e.target.value })}
                        className="bg-[#0A1628] border-[#D4AF37]/20 text-[#F5F5F0] text-sm flex-1"
                      />
                      <input 
                        type="color" 
                        value={el.style.color}
                        onChange={(e) => updateMasterElement('header', el.id, { style: { ...el.style, color: e.target.value } })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button onClick={() => removeMasterElement('header', el.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer Elements */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[#F5F5F0] font-medium">Footer Elements</h4>
                <Button size="sm" onClick={() => addMasterElement('footer', 'text')} className="bg-[#D4AF37]/20 text-[#D4AF37] h-7">
                  <Plus size={12} className="mr-1" /> Add Footer Text
                </Button>
              </div>
              {masterElements.footer.length === 0 ? (
                <p className="text-[#A0A5B0] text-sm italic">No footer elements</p>
              ) : (
                <div className="space-y-2">
                  {masterElements.footer.map(el => (
                    <div key={el.id} className="flex items-center gap-2 p-2 bg-[#050A14] rounded">
                      <Input 
                        value={el.content}
                        onChange={(e) => updateMasterElement('footer', el.id, { content: e.target.value })}
                        className="bg-[#0A1628] border-[#D4AF37]/20 text-[#F5F5F0] text-sm flex-1"
                      />
                      <input 
                        type="color" 
                        value={el.style.color}
                        onChange={(e) => updateMasterElement('footer', el.id, { style: { ...el.style, color: e.target.value } })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button onClick={() => removeMasterElement('footer', el.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-[#050A14] rounded text-[#A0A5B0] text-xs">
              <p><strong>Tip:</strong> Add page numbers by including <code className="bg-[#0A1628] px-1 rounded">{'{{page}}'}</code> in your text. It will be replaced with the actual page number.</p>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMasterPages(false)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
        <div className="mb-3">
          <Button variant="outline" onClick={() => setStep(1)} className="border-[#D4AF37]/30 text-[#F5F5F0]">
            <ChevronLeft size={16} /> Back to Magazines
          </Button>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

export default MagazineBuilder;

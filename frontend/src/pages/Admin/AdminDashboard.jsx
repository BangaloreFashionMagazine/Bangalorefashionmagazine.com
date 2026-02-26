import { useState, useEffect } from "react";
import axios from "axios";
import { Users, Star, Award, Image, Download, Check, X, Phone, Mail, Trash2, ExternalLink, Music, Video, Upload, BarChart3, TrendingUp, Eye, MousePointer, ShoppingBag, Package, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { API, TALENT_CATEGORIES, STORE_CATEGORIES } from "@/lib/config";
import { autoCompressImage } from "@/lib/imageOptimization";

const AdminDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [allTalents, setAllTalents] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [ads, setAds] = useState([]);
  const [magazine, setMagazine] = useState(null);
  const [music, setMusic] = useState(null);
  const [partyEvents, setPartyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loadedTabs, setLoadedTabs] = useState({});
  const [categoryFilter, setCategoryFilter] = useState(""); // Category filter for All Talents
  
  // Analytics state
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [popularTalents, setPopularTalents] = useState([]);
  const [partyStats, setPartyStats] = useState([]);
  const [adStats, setAdStats] = useState([]);
  const [dailyViews, setDailyViews] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const { toast } = useToast();

  // Forms
  const [newHero, setNewHero] = useState({ title: "", subtitle: "", category: "", order: 1, image_data: "" });
  const [newAward, setNewAward] = useState({ title: "", winner_name: "", winner_images: [], description: "", category: "", talent_id: "" });
  const [newAd, setNewAd] = useState({ title: "", link: "", order: 1, image_data: "" });
  const [newMagazine, setNewMagazine] = useState({ title: "", file_data: "", file_name: "" });
  const [newMusic, setNewMusic] = useState({ title: "", file_data: "", file_name: "" });
  const [newVideo, setNewVideo] = useState({ title: "", video_url: "", video_type: "youtube" });
  const [video, setVideo] = useState(null);
  const [newPartyEvent, setNewPartyEvent] = useState({ title: "", venue: "", event_date: "", description: "", image: "", entry_code: "", booking_info: "", contact: "", is_active: true });
  
  // Designer Store state
  const [storeOrders, setStoreOrders] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeSettings, setStoreSettings] = useState({ hero_images: [], contact_email: "", contact_phone: "", contact_instagram: "" });
  const [newProduct, setNewProduct] = useState({ name: "", description: "", store_category: "Everyday Chic", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "", designer_id: "" });
  const [editingProduct, setEditingProduct] = useState(null);

  // Tab-specific data fetchers
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/talents/pending`);
      setPending(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAllTalents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/talents?approved_only=false&lightweight=true`);
      setAllTalents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hero-images`);
      setHeroImages(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/awards?active_only=false`);
      setAwards(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/advertisements`);
      setAds(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchMagazine = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/magazine`);
      setMagazine(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchMusic = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/music`);
      setMusic(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchVideo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/video`);
      setVideo(res.data?.id ? res.data : null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchPartyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/party-events`);
      setPartyEvents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summary, popular, parties, ads, daily, recent] = await Promise.all([
        axios.get(`${API}/admin/analytics/summary`),
        axios.get(`${API}/admin/analytics/popular-talents`),
        axios.get(`${API}/admin/analytics/party-stats`),
        axios.get(`${API}/admin/analytics/ad-stats`),
        axios.get(`${API}/admin/analytics/daily-views`),
        axios.get(`${API}/admin/analytics/recent-activity`)
      ]);
      setAnalyticsSummary(summary.data);
      setPopularTalents(popular.data);
      setPartyStats(parties.data);
      setAdStats(ads.data);
      setDailyViews(daily.data);
      setRecentActivity(recent.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Load data for current tab
  const loadTabData = async (tabName, force = false) => {
    if (loadedTabs[tabName] && !force) return;
    
    switch(tabName) {
      case 'pending': await fetchPending(); break;
      case 'talents': await fetchAllTalents(); break;
      case 'analytics': await fetchAnalytics(); break;
      case 'hero': await fetchHeroImages(); break;
      case 'video': await fetchVideo(); break;
      case 'contests': await Promise.all([fetchAwards(), fetchAllTalents()]); break;
      case 'ads': await fetchAds(); break;
      case 'magazine': await fetchMagazine(); break;
      case 'music': await fetchMusic(); break;
      case 'party': await fetchPartyEvents(); break;
      case 'store': await fetchStoreOrders(); await fetchStoreProducts(); await fetchStoreSettings(); break;
      case 'export': await fetchStoreOrders(); break;
      default: break;
    }
    setLoadedTabs(prev => ({...prev, [tabName]: true}));
  };

  // Fetch pending on mount, then lazy-load other tabs
  useEffect(() => { loadTabData('pending'); }, []);
  
  // Load data when tab changes
  useEffect(() => { loadTabData(tab); }, [tab]);

  const approve = async (id) => { await axios.put(`${API}/admin/talent/${id}/approve`); toast({ title: "Approved!" }); fetchPending(); fetchAllTalents(); setSelectedTalent(null); };
  const reject = async (id) => { await axios.put(`${API}/admin/talent/${id}/reject`); toast({ title: "Rejected" }); fetchPending(); setSelectedTalent(null); };
  const updateRank = async (id, rank) => { 
    await axios.put(`${API}/admin/talent/${id}/rank?rank=${rank}`); 
    toast({ title: `Rank updated to ${rank}` });
    fetchAllTalents(); 
  };
  const deleteTalent = async (id) => { if (window.confirm("Delete?")) { await axios.delete(`${API}/admin/talent/${id}`); fetchPending(); fetchAllTalents(); setSelectedTalent(null); } };
  const exportTalents = () => window.open(`${API}/admin/talents/export`, '_blank');
  
  // Store functions
  const fetchStoreOrders = async () => {
    try {
      const res = await axios.get(`${API}/store/orders`);
      setStoreOrders(res.data);
    } catch (err) { console.error(err); }
  };
  
  const fetchStoreProducts = async () => {
    try {
      const res = await axios.get(`${API}/store/products?active_only=false`);
      setStoreProducts(res.data);
    } catch (err) { console.error(err); }
  };
  
  const fetchStoreSettings = async () => {
    try {
      const res = await axios.get(`${API}/store/settings`);
      setStoreSettings(res.data);
    } catch (err) { console.error(err); }
  };
  
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/store/orders/${orderId}/status?status=${status}`);
      toast({ title: `Order status updated to ${status}` });
      fetchStoreOrders();
    } catch (err) { toast({ title: "Failed to update status", variant: "destructive" }); }
  };
  
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axios.delete(`${API}/store/orders/${orderId}`);
      toast({ title: "Order deleted" });
      fetchStoreOrders();
    } catch (err) { toast({ title: "Failed to delete order", variant: "destructive" }); }
  };
  
  const exportOrdersToExcel = () => {
    if (storeOrders.length === 0) {
      toast({ title: "No orders to export", variant: "destructive" });
      return;
    }
    
    // Create CSV content with MRP, Discount, Final Price
    const headers = ["Order Date", "Product Name", "MRP (₹)", "Discount %", "Final Price (₹)", "Size", "Designer Name", "Customer Name", "Customer Phone", "Customer Email", "Customer Address", "Notes", "Status"];
    const rows = storeOrders.map(o => [
      o.created_at ? new Date(o.created_at).toLocaleDateString() : "N/A",
      o.product_name || "",
      o.product_mrp || o.product_price || "",
      o.product_discount || 0,
      o.product_price || "",
      o.product_size || "",
      o.designer_name || "",
      o.customer_name || "",
      o.customer_phone || "",
      o.customer_email || "",
      `"${(o.customer_address || "").replace(/"/g, '""')}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`,
      o.status || ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Orders exported to Excel/CSV" });
  };
  
  const exportSalesToExcel = () => {
    if (storeOrders.length === 0) {
      toast({ title: "No sales data to export", variant: "destructive" });
      return;
    }
    
    // Filter only delivered/completed orders for sales report
    const completedOrders = storeOrders.filter(o => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'shipped');
    
    if (completedOrders.length === 0) {
      toast({ title: "No completed sales to export", variant: "destructive" });
      return;
    }
    
    // Calculate totals
    const totalSales = completedOrders.reduce((sum, o) => sum + (o.product_price || 0), 0);
    
    const headers = ["Sale Date", "Product Name", "MRP (₹)", "Discount %", "Sale Price (₹)", "Size", "Designer", "Customer Name", "Customer Phone", "Customer Email", "Delivery Address"];
    const rows = completedOrders.map(o => [
      o.created_at ? new Date(o.created_at).toLocaleDateString() : "N/A",
      o.product_name || "",
      o.product_mrp || o.product_price || "",
      o.product_discount || 0,
      o.product_price || "",
      o.product_size || "",
      o.designer_name || "",
      o.customer_name || "",
      o.customer_phone || "",
      o.customer_email || "",
      `"${(o.customer_address || "").replace(/"/g, '""')}"`
    ]);
    
    // Add summary row
    rows.push([]);
    rows.push(["TOTAL SALES", "", "", "", totalSales, "", "", "", "", "", ""]);
    rows.push(["Total Orders", completedOrders.length, "", "", "", "", "", "", "", "", ""]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Sales report exported to Excel/CSV" });
  };
  
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.designer_id) {
      toast({ title: "Name, price and designer are required", variant: "destructive" });
      return;
    }
    try {
      await axios.post(`${API}/store/products`, { 
        ...newProduct, 
        price: parseFloat(newProduct.price),
        discount_percent: parseInt(newProduct.discount_percent) || 0
      });
      toast({ title: "Product added!" });
      setNewProduct({ name: "", description: "", store_category: "Everyday Chic", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "", designer_id: "" });
      fetchStoreProducts();
    } catch (err) { toast({ title: err.response?.data?.detail || "Failed to add product", variant: "destructive" }); }
  };
  
  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/store/products/${productId}`);
      toast({ title: "Product deleted" });
      fetchStoreProducts();
    } catch (err) { toast({ title: "Failed to delete", variant: "destructive" }); }
  };
  
  const updateProduct = async () => {
    if (!editingProduct) return;
    try {
      await axios.put(`${API}/store/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        store_category: editingProduct.store_category,
        size: editingProduct.size,
        material: editingProduct.material,
        price: parseFloat(editingProduct.price),
        discount_percent: parseInt(editingProduct.discount_percent) || 0,
        shipping_info: editingProduct.shipping_info,
        images: editingProduct.images,
        video: editingProduct.video
      });
      toast({ title: "Product updated!" });
      setEditingProduct(null);
      fetchStoreProducts();
    } catch (err) { toast({ title: "Failed to update product", variant: "destructive" }); }
  };
  
  const saveStoreSettings = async () => {
    try {
      await axios.put(`${API}/store/settings`, storeSettings);
      toast({ title: "Store settings saved!" });
    } catch (err) { toast({ title: "Failed to save settings", variant: "destructive" }); }
  };

  const openTalentDetail = async (talent) => {
    // Show immediately with existing data
    setSelectedTalent(talent);
    setEditData({...talent});
    setEditMode(false);
    
    // Fetch full data including portfolio_images and portfolio_video
    try {
      const res = await axios.get(`${API}/admin/talent/${talent.id}/full`);
      setEditData(prev => ({
        ...prev, 
        password: res.data.password,
        portfolio_images: res.data.portfolio_images || [],
        portfolio_video: res.data.portfolio_video || ""
      }));
      setSelectedTalent(prev => ({
        ...prev,
        portfolio_images: res.data.portfolio_images || [],
        portfolio_video: res.data.portfolio_video || ""
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const saveTalentEdit = async () => {
    try {
      await axios.put(`${API}/talent/${selectedTalent.id}`, editData);
      toast({ title: "Talent updated!" });
      fetchAllTalents();
      setSelectedTalent(null);
      setEditMode(false);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Update failed", variant: "destructive" });
    }
  };

  // Hero Images
  const handleHeroImg = (e) => {
    const file = e.target.files[0];
    if (file) { 
      const r = new FileReader(); 
      r.onloadend = async () => {
        const compressed = await autoCompressImage(r.result, 500);
        setNewHero({...newHero, image_data: compressed});
      }; 
      r.readAsDataURL(file); 
    }
  };
  const addHero = async () => {
    if (!newHero.image_data || !newHero.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/hero-images`, newHero);
    setNewHero({ title: "", subtitle: "", category: "", order: heroImages.length + 1, image_data: "" });
    toast({ title: "Hero image added!" }); fetchHeroImages();
  };
  const deleteHero = async (id) => { await axios.delete(`${API}/admin/hero-images/${id}`); fetchHeroImages(); };
  const updateHeroOrder = async (id, order) => {
    await axios.put(`${API}/admin/hero-images/${id}`, { order });
    fetchHeroImages();
  };

  // Awards (Contest Winners)
  const addAward = async () => {
    if (!newAward.title || !newAward.winner_name || !(newAward.winner_images || []).length) { 
      toast({ title: "Please fill title, name and add at least 1 image", variant: "destructive" }); 
      return; 
    }
    await axios.post(`${API}/admin/awards`, {
      ...newAward, 
      winner_image: (newAward.winner_images || [])[0],
      talent_id: newAward.talent_id || ""
    });
    setNewAward({ title: "", winner_name: "", winner_images: [], description: "", category: "", talent_id: "" });
    toast({ title: "Winner added!" }); 
    fetchAwards();
  };
  const deleteAward = async (id) => { await axios.delete(`${API}/admin/awards/${id}`); fetchAwards(); };

  // Ads
  const handleAdImg = (e) => {
    const file = e.target.files[0];
    if (file) { 
      const r = new FileReader(); 
      r.onloadend = async () => {
        const compressed = await autoCompressImage(r.result, 500);
        setNewAd({...newAd, image_data: compressed});
      }; 
      r.readAsDataURL(file); 
    }
  };
  const addAd = async () => {
    if (!newAd.image_data || !newAd.title) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/advertisements`, newAd);
    setNewAd({ title: "", link: "", order: ads.length + 1, image_data: "" });
    toast({ title: "Ad added!" }); fetchAds();
  };
  const deleteAd = async (id) => { await axios.delete(`${API}/admin/advertisements/${id}`); fetchAds(); };

  // Magazine
  const handleMagazineFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => setNewMagazine({...newMagazine, file_data: reader.result, file_name: file.name});
      reader.readAsDataURL(file);
    } else {
      toast({ title: "Please select a PDF file", variant: "destructive" });
    }
  };
  const uploadMagazine = async () => {
    if (!newMagazine.file_data || !newMagazine.title) { toast({ title: "Please add title and PDF file", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/magazine`, newMagazine);
    setNewMagazine({ title: "", file_data: "", file_name: "" });
    toast({ title: "Magazine uploaded!" }); fetchMagazine();
  };
  const deleteMagazine = async () => { 
    if (window.confirm("Delete magazine?")) {
      await axios.delete(`${API}/admin/magazine`); 
      fetchMagazine(); 
    }
  };

  // Music
  const handleMusicFile = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/wav")) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMusic({...newMusic, file_data: reader.result, file_name: file.name});
      reader.readAsDataURL(file);
    } else {
      toast({ title: "Please select an MP3 or WAV file", variant: "destructive" });
    }
  };
  const uploadMusic = async () => {
    if (!newMusic.file_data || !newMusic.title) { toast({ title: "Please add title and audio file", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/music`, newMusic);
    setNewMusic({ title: "", file_data: "", file_name: "" });
    toast({ title: "Music uploaded!" }); fetchMusic();
  };
  const deleteMusic = async () => { 
    if (window.confirm("Delete music?")) {
      await axios.delete(`${API}/admin/music`); 
      fetchMusic(); 
    }
  };

  // Video
  const uploadVideo = async () => {
    if (!newVideo.video_url || !newVideo.title) { toast({ title: "Please add title and video URL", variant: "destructive" }); return; }
    await axios.post(`${API}/admin/video`, newVideo);
    setNewVideo({ title: "", video_url: "", video_type: "youtube" });
    toast({ title: "Video uploaded!" }); fetchVideo();
  };
  const deleteVideo = async () => { 
    if (window.confirm("Delete video?")) {
      await axios.delete(`${API}/admin/video`); 
      fetchVideo(); 
    }
  };

  const tabs = [
    { id: "pending", label: "Pending", icon: Users },
    { id: "talents", label: "All Talents", icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "hero", label: "Hero Images", icon: Image },
    { id: "party", label: "Party Updates", icon: Calendar },
    { id: "video", label: "Featured Video", icon: Video },
    { id: "contests", label: "Contest & Winners", icon: Award },
    { id: "ads", label: "Advertisements", icon: ExternalLink },
    { id: "magazine", label: "Magazine", icon: Download },
    { id: "music", label: "Background Music", icon: Music },
    { id: "export", label: "Export", icon: Download },
    { id: "store", label: "Designer Store", icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-6">Admin Dashboard</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm ${tab === t.id ? "bg-[#D4AF37] text-[#050A14]" : "bg-[#0A1628] text-[#A0A5B0]"}`}>
              <t.icon size={16} /> {t.label}
              {t.id === "pending" && pending.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pending.length}</span>}
            </button>
          ))}
        </div>

        {/* Pending */}
        {tab === "pending" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Pending Approvals</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Click on a profile to view full details before approving.</p>
            {loading ? <p className="text-[#A0A5B0]">Loading...</p> : pending.length === 0 ? <p className="text-[#A0A5B0]">No pending registrations</p> : (
              <div className="space-y-4">
                {pending.map(t => (
                  <div key={t.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                    <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#0D1B2A] transition-colors" onClick={() => openTalentDetail(t)}>
                      <img src={t.profile_image || "https://via.placeholder.com/80"} className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]/30" />
                      <div className="flex-1">
                        <p className="text-[#F5F5F0] font-bold text-lg">{t.name}</p>
                        <p className="text-[#D4AF37] text-sm">{t.category}</p>
                        <p className="text-[#A0A5B0] text-xs mt-1">{t.email} • {t.phone || "No phone"}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {t.agreed_to_terms ? (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                              <Check size={14} /> Terms Agreed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-sm">
                              <X size={14} /> Terms NOT Agreed
                            </span>
                          )}
                        </div>
                        <p className="text-[#A0A5B0] text-xs">
                          {t.portfolio_images?.length || 0} portfolio images
                        </p>
                      </div>
                    </div>
                    <div className="flex border-t border-[#D4AF37]/10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openTalentDetail(t); }} 
                        className="flex-1 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-sm font-medium"
                      >
                        View Full Details
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); approve(t.id); }} className="flex-1 py-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Check size={16} /> Approve
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); reject(t.id); }} className="flex-1 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Talents */}
        {tab === "talents" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="text-lg font-bold text-[#F5F5F0]">All Registered Talents ({allTalents.length})</h2>
              <div className="flex gap-2 items-center">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                >
                  <option value="">All Categories</option>
                  {TALENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <a href={`${API}/admin/talents/export`} download 
                  className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold flex items-center gap-2">
                  <Download size={16} /> Export
                </a>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent mr-3"></div>
                <span className="ml-3 text-[#A0A5B0]">Loading talents...</span>
              </div>
            ) : allTalents.filter(t => !categoryFilter || t.category === categoryFilter).length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">{categoryFilter ? `No talents found in "${categoryFilter}" category.` : "No talents found."}</p>
            ) : (
              <div className="space-y-3">
                {allTalents.filter(t => !categoryFilter || t.category === categoryFilter).map(t => (
                  <div key={t.id} className="bg-[#050A14] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer hover:bg-[#0D1B2A] transition-colors" onClick={() => openTalentDetail(t)}>
                    <img src={t.profile_image || "https://via.placeholder.com/60"} className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[#F5F5F0] font-bold">{t.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${t.is_approved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>{t.is_approved ? "Approved" : "Pending"}</span>
                        {t.rank && <span className="text-xs px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded">Rank #{t.rank}</span>}
                      </div>
                      <p className="text-[#D4AF37] text-sm">{t.category}</p>
                      <p className="text-[#A0A5B0] text-xs truncate">{t.email} {t.phone ? `• ${t.phone}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                      <input type="number" min="1" max="9999" placeholder="Rank" onClick={(e) => e.stopPropagation()} value={t.rank || ""} onChange={(e) => updateRank(t.id, parseInt(e.target.value) || null)} className="px-2 py-1 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm w-20" />
                      <span className="text-[#A0A5B0] text-sm">{t.votes || 0} votes</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteTalent(t.id); }} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
                <Eye className="text-[#D4AF37] mb-2" size={20} />
                <p className="text-2xl md:text-3xl font-bold text-[#F5F5F0]">{analyticsSummary?.total_views?.toLocaleString() || 0}</p>
                <p className="text-xs text-[#A0A5B0]">Total Views</p>
              </div>
              <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
                <Users className="text-[#D4AF37] mb-2" size={20} />
                <p className="text-2xl md:text-3xl font-bold text-[#F5F5F0]">{analyticsSummary?.talents?.total || 0}</p>
                <p className="text-xs text-[#A0A5B0] mt-1">{analyticsSummary?.talents?.approved || 0} approved</p>
              </div>
              <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
                <MousePointer className="text-[#D4AF37] mb-2" size={20} />
                <p className="text-2xl md:text-3xl font-bold text-[#F5F5F0]">{analyticsSummary?.total_clicks?.toLocaleString() || 0}</p>
                <p className="text-xs text-[#A0A5B0]">Total Clicks</p>
              </div>
              <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
                <TrendingUp className="text-[#D4AF37] mb-2" size={20} />
                <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.talents?.total_votes || 0}</p>
                <p className="text-xs text-[#A0A5B0]">Total Votes</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Views Chart */}
              <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
                <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Daily Views (Last 7 Days)</h3>
                <div className="space-y-2">
                  {dailyViews.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#A0A5B0] text-sm w-20">{d.date}</span>
                      <div className="flex-1 bg-[#050A14] rounded-full h-4 overflow-hidden">
                        <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${Math.min(100, (d.views / Math.max(...dailyViews.map(x => x.views), 1)) * 100)}%` }} />
                      </div>
                      <span className="text-[#F5F5F0] text-sm w-16 text-right">{d.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Talents */}
              <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
                <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Most Viewed Profiles</h3>
                <div className="space-y-3">
                  {popularTalents.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-[#050A14] rounded-lg">
                      <span className="text-[#D4AF37] font-bold">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-[#F5F5F0] font-medium">{t.name}</p>
                        <p className="text-[#A0A5B0] text-xs">{t.category}</p>
                      </div>
                      <span className="text-[#D4AF37]">{t.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[#D4AF37]/10 last:border-0">
                    <span className={`w-2 h-2 rounded-full ${a.event_type === 'view' ? 'bg-blue-500' : a.event_type === 'click' ? 'bg-green-500' : 'bg-[#D4AF37]'}`}></span>
                    <span className="text-[#A0A5B0] text-sm flex-1">{a.event_type}: {a.target_type} - {a.target_name || a.target_id}</span>
                    <span className="text-[#A0A5B0] text-xs">{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hero Images */}
        {tab === "hero" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Hero Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input type="text" placeholder="Title" value={newHero.title} onChange={e => setNewHero({...newHero, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Subtitle" value={newHero.subtitle} onChange={e => setNewHero({...newHero, subtitle: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Category" value={newHero.category} onChange={e => setNewHero({...newHero, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Order" value={newHero.order} onChange={e => setNewHero({...newHero, order: parseInt(e.target.value)})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <ImageUploadWithCrop 
                onImageSelect={(img) => setNewHero({...newHero, image_data: img})} 
                aspectRatio={16/9}
                buttonText="Choose Hero Image"
              />
              {newHero.image_data && <img src={newHero.image_data} className="h-20 rounded" alt="Preview" />}
              <button onClick={addHero} className="w-full md:w-auto px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Hero</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroImages.map(h => (
                <div key={h.id} className="relative group bg-[#050A14] rounded-lg overflow-hidden">
                  <img src={h.image_data} className="w-full h-32 object-cover" alt={h.title} />
                  <div className="p-3">
                    <p className="text-[#F5F5F0] font-bold text-sm">{h.title}</p>
                    <p className="text-[#A0A5B0] text-xs">{h.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <select value={h.order} onChange={e => updateHeroOrder(h.id, parseInt(e.target.value))} className="px-2 py-1 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm">
                        {[1,2,3,4,5,6,7,8,9,10].map(o => <option key={o} value={o}>#{o}</option>)}
                      </select>
                      <button onClick={() => deleteHero(h.id)} className="flex-1 px-2 py-1 bg-red-500/20 text-red-500 rounded text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Party Updates */}
        {tab === "party" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Party Updates</h2>
            
            {/* Add New Party Event Form */}
            <div className="bg-[#050A14] rounded-lg p-4 mb-6">
              <h3 className="text-[#D4AF37] font-bold mb-4">Add New Party Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input type="text" placeholder="Event Title*" value={newPartyEvent.title} onChange={e => setNewPartyEvent({...newPartyEvent, title: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Venue*" value={newPartyEvent.venue} onChange={e => setNewPartyEvent({...newPartyEvent, venue: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="date" value={newPartyEvent.event_date} onChange={e => setNewPartyEvent({...newPartyEvent, event_date: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Entry Code (e.g. BFM2024)" value={newPartyEvent.entry_code} onChange={e => setNewPartyEvent({...newPartyEvent, entry_code: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Contact Info" value={newPartyEvent.contact} onChange={e => setNewPartyEvent({...newPartyEvent, contact: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Booking Info" value={newPartyEvent.booking_info} onChange={e => setNewPartyEvent({...newPartyEvent, booking_info: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              </div>
              <textarea placeholder="Description" value={newPartyEvent.description} onChange={e => setNewPartyEvent({...newPartyEvent, description: e.target.value})} className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-3" rows={3} />
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <ImageUploadWithCrop 
                  onImageSelect={(img) => setNewPartyEvent({...newPartyEvent, image: img})} 
                  aspectRatio={16/9}
                  buttonText="Choose Event Image"
                />
                {newPartyEvent.image && <img src={newPartyEvent.image} className="h-20 rounded" alt="Preview" />}
              </div>
              <button onClick={async () => {
                if (!newPartyEvent.title || !newPartyEvent.venue || !newPartyEvent.image) {
                  toast({ title: "Please fill title, venue and image", variant: "destructive" });
                  return;
                }
                try {
                  await axios.post(`${API}/admin/party-events`, newPartyEvent);
                  toast({ title: "Party event added!" });
                  setNewPartyEvent({ title: "", venue: "", event_date: "", description: "", image: "", entry_code: "", booking_info: "", contact: "", is_active: true });
                  fetchPartyEvents();
                } catch (err) {
                  toast({ title: "Failed to add event", variant: "destructive" });
                }
              }} className="w-full md:w-auto px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Party Event</button>
            </div>
            
            {/* Existing Events */}
            {partyEvents.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">No party events added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partyEvents.map(event => (
                  <div key={event.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                    <img src={event.image} className="w-full h-40 object-cover" alt={event.title} />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[#F5F5F0] font-bold">{event.title}</h3>
                        {event.entry_code && <span className="px-2 py-1 bg-[#D4AF37] text-[#050A14] text-xs font-bold rounded">{event.entry_code}</span>}
                      </div>
                      <p className="text-[#A0A5B0] text-sm">{event.venue}</p>
                      {event.event_date && <p className="text-[#D4AF37] text-sm">{new Date(event.event_date).toLocaleDateString()}</p>}
                      {event.description && <p className="text-[#A0A5B0] text-xs mt-2">{event.description}</p>}
                      <div className="flex gap-2 mt-3">
                        <button onClick={async () => {
                          if (window.confirm("Delete this event?")) {
                            await axios.delete(`${API}/admin/party-events/${event.id}`);
                            toast({ title: "Event deleted" });
                            fetchPartyEvents();
                          }
                        }} className="flex-1 md:flex-none px-4 py-2 text-sm font-medium bg-red-500/20 text-red-500 rounded hover:bg-red-500/30">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contest & Winners */}
        {tab === "contests" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-2">Contest & Winners</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add contest winners with up to 5 images. Link to a talent profile to make clickable.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input type="text" placeholder="Contest Title (e.g. Model of the Week)" value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Winner Name" value={newAward.winner_name} onChange={e => setNewAward({...newAward, winner_name: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Category" value={newAward.category} onChange={e => setNewAward({...newAward, category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Description" value={newAward.description} onChange={e => setNewAward({...newAward, description: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Link to Talent Profile</label>
              <select 
                value={newAward.talent_id || ""} 
                onChange={e => setNewAward({...newAward, talent_id: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
              >
                <option value="">-- No linked profile (not clickable) --</option>
                {allTalents.filter(t => t.is_approved).map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.category}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Winner Images (up to 5)</label>
              <div className="flex flex-wrap gap-3 items-center">
                {(newAward.winner_images || []).map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} className="h-20 w-16 object-cover rounded" alt={`Image ${i+1}`} />
                    <button onClick={() => setNewAward({...newAward, winner_images: (newAward.winner_images || []).filter((_, idx) => idx !== i)})} 
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"><X size={12} /></button>
                  </div>
                ))}
                {(newAward.winner_images || []).length < 5 && (
                  <ImageUploadWithCrop 
                    onImageSelect={(img) => setNewAward({...newAward, winner_images: [...(newAward.winner_images || []), img]})} 
                    aspectRatio={3/4}
                    buttonText={`Add Image (${(newAward.winner_images || []).length}/5)`}
                  />
                )}
              </div>
            </div>
            <button onClick={addAward} className="w-full md:w-auto px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Winner</button>
            
            {awards.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8 mt-6">No contest winners added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {awards.map(a => (
                  <div key={a.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                    <div className="flex gap-1 p-2 overflow-x-auto">
                      {(a.winner_images || [a.winner_image]).filter(Boolean).slice(0, 5).map((img, i) => (
                        <img key={i} src={img} alt={`${a.winner_name} ${i+1}`} className="h-24 w-20 flex-shrink-0 object-cover rounded" />
                      ))}
                    </div>
                    <div className="p-3">
                      <p className="text-[#D4AF37] text-sm">{a.title}</p>
                      <p className="text-[#F5F5F0] font-bold">{a.winner_name}</p>
                      {a.category && <p className="text-[#A0A5B0] text-xs">{a.category}</p>}
                      {a.talent_id && <p className="text-green-500 text-xs mt-1">✓ Linked to profile</p>}
                      {!a.talent_id && <p className="text-yellow-500 text-xs mt-1">⚠ Not linked to profile</p>}
                      <button onClick={() => deleteAward(a.id)} className="mt-3 w-full px-3 py-2 bg-red-500/20 text-red-500 rounded text-sm font-medium flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Delete Winner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ads */}
        {tab === "ads" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Advertisements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input type="text" placeholder="Title" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Link (optional)" value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Order" value={newAd.order} onChange={e => setNewAd({...newAd, order: parseInt(e.target.value)})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <ImageUploadWithCrop 
                onImageSelect={(img) => setNewAd({...newAd, image_data: img})} 
                buttonText="Choose Ad Image"
              />
              {newAd.image_data && <img src={newAd.image_data} className="h-16 rounded" alt="Preview" />}
              <button onClick={addAd} className="w-full md:w-auto px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Ad</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ads.map(a => (
                <div key={a.id} className="relative group">
                  <img src={a.image_data} className="w-full h-32 object-cover rounded" alt={a.title} />
                  <button onClick={() => deleteAd(a.id)} className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100"><Trash2 size={14} className="text-white" /></button>
                  <p className="text-[#F5F5F0] text-sm mt-1">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Magazine */}
        {tab === "magazine" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Monthly Magazine</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Upload your monthly magazine PDF. This will be available for download on the homepage.</p>
            
            {magazine ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Magazine:</p>
                <p className="text-[#F5F5F0]">{magazine.title}</p>
                <p className="text-[#A0A5B0] text-sm">{magazine.file_name}</p>
                <p className="text-[#A0A5B0] text-xs mt-1">Uploaded: {new Date(magazine.created_at).toLocaleDateString()}</p>
                <button onClick={deleteMagazine} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Delete Magazine
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No magazine uploaded yet.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Magazine Title (e.g. January 2026 Edition)" value={newMagazine.title} onChange={e => setNewMagazine({...newMagazine, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <div>
                <input type="file" accept="application/pdf" onChange={handleMagazineFile} className="text-[#A0A5B0]" />
                {newMagazine.file_name && <p className="text-[#D4AF37] text-sm mt-2">Selected: {newMagazine.file_name}</p>}
              </div>
              <button onClick={uploadMagazine} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Download size={18} /> Upload Magazine
              </button>
            </div>
          </div>
        )}

        {/* Music */}
        {tab === "music" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Background Music</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Upload background music (MP3 or WAV) for the homepage.</p>
            
            {music ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Music:</p>
                <p className="text-[#F5F5F0]">{music.title}</p>
                <p className="text-[#A0A5B0] text-sm">{music.file_name}</p>
                <audio src={music.file_data} controls className="mt-2 w-full" />
                <button onClick={deleteMusic} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Delete Music
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No background music uploaded yet.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Music Title" value={newMusic.title} onChange={e => setNewMusic({...newMusic, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <div>
                <input type="file" accept="audio/mpeg,audio/mp3,audio/wav" onChange={handleMusicFile} className="text-[#A0A5B0]" />
                {newMusic.file_name && <p className="text-[#D4AF37] text-sm mt-2">Selected: {newMusic.file_name}</p>}
              </div>
              <button onClick={uploadMusic} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Music size={18} /> Upload Music
              </button>
            </div>
          </div>
        )}

        {/* Video */}
        {tab === "video" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Featured Video</h2>
            <p className="text-[#A0A5B0] text-sm mb-4">Add a YouTube or Vimeo video to feature on the homepage.</p>
            
            {video ? (
              <div className="mb-6 p-4 bg-[#050A14] rounded-lg">
                <p className="text-[#D4AF37] font-bold">Current Video:</p>
                <p className="text-[#F5F5F0]">{video.title}</p>
                <p className="text-[#A0A5B0] text-sm break-all">{video.video_url}</p>
                <button onClick={deleteVideo} className="mt-3 px-4 py-2 bg-red-500 text-white rounded text-sm flex items-center gap-2">
                  <Trash2 size={14} /> Remove Video
                </button>
              </div>
            ) : (
              <p className="text-[#A0A5B0] mb-4">No featured video set.</p>
            )}

            <div className="space-y-4">
              <input type="text" placeholder="Video Title" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Video URL (YouTube or Vimeo)" value={newVideo.video_url} onChange={e => setNewVideo({...newVideo, video_url: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <select value={newVideo.video_type} onChange={e => setNewVideo({...newVideo, video_type: e.target.value})}
                className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
              <button onClick={uploadVideo} className="px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold flex items-center gap-2">
                <Video size={18} /> Set Featured Video
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        {tab === "export" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Export Data</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-[#A0A5B0] mb-4">Download all talents: Name, Email, Phone, Instagram, Category, Status, Rank, Votes</p>
                <a href={`${API}/admin/talents/export`} download 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded font-bold">
                  <Download size={18} /> Export Talents CSV
                </a>
              </div>
              
              <div className="border-t border-[#D4AF37]/20 pt-6">
                <p className="text-[#A0A5B0] mb-4">Download sales data: Order Date, Product, MRP, Discount, Final Price, Size, Designer, Customer details</p>
                <button onClick={exportSalesToExcel} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded font-bold">
                  <Download size={18} /> Export Sales CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Designer Store Management */}
        {tab === "store" && (
          <div className="space-y-6">
            {/* Store Settings */}
            <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
              <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Store Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="email" placeholder="Contact Email" value={storeSettings.contact_email} onChange={e => setStoreSettings({...storeSettings, contact_email: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Contact Phone" value={storeSettings.contact_phone} onChange={e => setStoreSettings({...storeSettings, contact_phone: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Instagram Handle" value={storeSettings.contact_instagram} onChange={e => setStoreSettings({...storeSettings, contact_instagram: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              </div>
              <div className="mb-4">
                <label className="text-[#A0A5B0] text-sm mb-2 block">Store Hero Images (up to 5)</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {(storeSettings.hero_images || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} className="h-20 w-32 object-cover rounded" alt={`Hero ${i+1}`} />
                      <button onClick={() => setStoreSettings({...storeSettings, hero_images: storeSettings.hero_images.filter((_, idx) => idx !== i)})} 
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"><X size={12} /></button>
                    </div>
                  ))}
                  {(storeSettings.hero_images || []).length < 5 && (
                    <ImageUploadWithCrop 
                      onImageSelect={(img) => setStoreSettings({...storeSettings, hero_images: [...(storeSettings.hero_images || []), img]})} 
                      aspectRatio={16/9}
                      buttonText={`Add Hero (${(storeSettings.hero_images || []).length}/5)`}
                    />
                  )}
                </div>
              </div>
              <button onClick={saveStoreSettings} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Save Settings</button>
            </div>

            {/* Add/Edit Product */}
            <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
              <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Product Name*" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="number" placeholder="Price (₹)*" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="number" placeholder="Discount %" min="0" max="100" value={editingProduct ? editingProduct.discount_percent : newProduct.discount_percent} onChange={e => editingProduct ? setEditingProduct({...editingProduct, discount_percent: e.target.value}) : setNewProduct({...newProduct, discount_percent: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <select value={editingProduct ? editingProduct.store_category : newProduct.store_category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, store_category: e.target.value}) : setNewProduct({...newProduct, store_category: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                  {STORE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <input type="text" placeholder="Size (e.g. S, M, L)" value={editingProduct ? editingProduct.size : newProduct.size} onChange={e => editingProduct ? setEditingProduct({...editingProduct, size: e.target.value}) : setNewProduct({...newProduct, size: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                <input type="text" placeholder="Material" value={editingProduct ? editingProduct.material : newProduct.material} onChange={e => editingProduct ? setEditingProduct({...editingProduct, material: e.target.value}) : setNewProduct({...newProduct, material: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                {!editingProduct && (
                  <select value={newProduct.designer_id} onChange={e => setNewProduct({...newProduct, designer_id: e.target.value})} className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                    <option value="">Select Designer*</option>
                    {allTalents.filter(t => t.category === "Designer Store").map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <textarea placeholder="Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-4" rows={2} />
              <input type="text" placeholder="Shipping Info" value={editingProduct ? editingProduct.shipping_info : newProduct.shipping_info} onChange={e => editingProduct ? setEditingProduct({...editingProduct, shipping_info: e.target.value}) : setNewProduct({...newProduct, shipping_info: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-4" />
              <div className="mb-4">
                <label className="text-[#A0A5B0] text-sm mb-2 block">Product Images (up to 5)</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {(editingProduct ? editingProduct.images : newProduct.images || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} className="h-20 w-20 object-cover rounded" alt={`Product ${i+1}`} />
                      <button onClick={() => {
                        if (editingProduct) setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)});
                        else setNewProduct({...newProduct, images: newProduct.images.filter((_, idx) => idx !== i)});
                      }} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"><X size={12} /></button>
                    </div>
                  ))}
                  {(editingProduct ? editingProduct.images : newProduct.images || []).length < 5 && (
                    <ImageUploadWithCrop 
                      onImageSelect={(img) => {
                        if (editingProduct) setEditingProduct({...editingProduct, images: [...editingProduct.images, img]});
                        else setNewProduct({...newProduct, images: [...(newProduct.images || []), img]});
                      }} 
                      aspectRatio={1}
                      buttonText={`Add (${(editingProduct ? editingProduct.images : newProduct.images || []).length}/5)`}
                    />
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[#A0A5B0] text-sm mb-2 block">Product Video (optional, max 45 seconds)</label>
                {(editingProduct ? editingProduct.video : newProduct.video) ? (
                  <div className="flex items-center gap-3">
                    <video src={editingProduct ? editingProduct.video : newProduct.video} className="h-16 rounded" />
                    <button onClick={() => editingProduct ? setEditingProduct({...editingProduct, video: ""}) : setNewProduct({...newProduct, video: ""})} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">Remove</button>
                  </div>
                ) : (
                  <input type="file" accept="video/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 50 * 1024 * 1024) { toast({ title: "Video must be under 50MB", variant: "destructive" }); return; }
                      // Validate video duration
                      const video = document.createElement('video');
                      video.preload = 'metadata';
                      video.onloadedmetadata = () => {
                        window.URL.revokeObjectURL(video.src);
                        if (video.duration > 45) {
                          toast({ title: "Video must be 45 seconds or less", description: `Your video is ${Math.round(video.duration)} seconds`, variant: "destructive" });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (editingProduct) setEditingProduct({...editingProduct, video: reader.result});
                          else setNewProduct({...newProduct, video: reader.result});
                          toast({ title: "Video uploaded!", description: `Duration: ${Math.round(video.duration)} seconds` });
                        };
                        reader.readAsDataURL(file);
                      };
                      video.src = URL.createObjectURL(file);
                    }
                  }} className="text-[#A0A5B0]" />
                )}
              </div>
              <div className="flex gap-3">
                {editingProduct ? (
                  <>
                    <button onClick={() => { updateProduct(); }} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Save Changes</button>
                    <button onClick={() => setEditingProduct(null)} className="px-6 py-2 border border-[#A0A5B0] text-[#A0A5B0] rounded">Cancel</button>
                  </>
                ) : (
                  <button onClick={addProduct} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Add Product</button>
                )}
              </div>
            </div>

            {/* All Products */}
            <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
              <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">All Products ({storeProducts.length})</h2>
              {storeProducts.length === 0 ? (
                <p className="text-[#A0A5B0]">No products added yet. Add designers with "Designer Store" category first, then add products.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {storeProducts.map(p => (
                    <div key={p.id} className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                      <div className="relative">
                        <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt={p.name} className="w-full h-32 object-cover rounded mb-3" />
                        {p.discount_percent > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{p.discount_percent}% OFF</div>
                        )}
                        <div className="absolute top-2 left-2 bg-[#0A1628]/80 text-[#D4AF37] text-xs px-2 py-1 rounded">{p.store_category || "Everyday Chic"}</div>
                        {p.video && <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-1"><Video size={12} className="text-white" /></div>}
                      </div>
                      <h3 className="text-[#F5F5F0] font-bold truncate">{p.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[#D4AF37] font-bold">₹{(p.discount_percent > 0 ? p.discounted_price : p.price)?.toLocaleString()}</p>
                        {p.discount_percent > 0 && <p className="text-[#A0A5B0] text-sm line-through">₹{p.price?.toLocaleString()}</p>}
                      </div>
                      <p className="text-[#A0A5B0] text-sm truncate">By {p.designer_name}</p>
                      <p className="text-[#A0A5B0] text-xs mt-1">Size: {p.size || "N/A"} | Material: {p.material || "N/A"}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditingProduct({...p, price: p.price.toString(), discount_percent: (p.discount_percent || 0).toString(), store_category: p.store_category || "Everyday Chic", video: p.video || ""})} className="flex-1 px-2 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="flex-1 px-2 py-1.5 bg-red-500/20 text-red-500 rounded text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders */}
            <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#F5F5F0]">Orders ({storeOrders.length})</h2>
                {storeOrders.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={exportOrdersToExcel} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold flex items-center gap-2">
                      <Download size={16} /> Export Orders
                    </button>
                    <button onClick={exportSalesToExcel} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold flex items-center gap-2">
                      <Download size={16} /> Export Sales
                    </button>
                  </div>
                )}
              </div>
              {storeOrders.length === 0 ? (
                <p className="text-[#A0A5B0]">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {storeOrders.map(o => (
                    <div key={o.id} className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <h3 className="text-[#F5F5F0] font-bold">{o.product_name}</h3>
                          <p className="text-[#D4AF37]">₹{o.product_price?.toLocaleString()}</p>
                          <p className="text-[#A0A5B0] text-sm">Designer: {o.designer_name}</p>
                          {o.product_size && <p className="text-[#A0A5B0] text-sm">Size: {o.product_size}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${o.status === 'delivered' ? 'bg-green-500/20 text-green-500' : o.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' : o.status === 'confirmed' ? 'bg-yellow-500/20 text-yellow-500' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {o.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#D4AF37]/10">
                        <p className="text-[#F5F5F0]"><strong>Customer:</strong> {o.customer_name}</p>
                        <p className="text-[#A0A5B0] text-sm"><Phone size={12} className="inline" /> {o.customer_phone}</p>
                        {o.customer_email && <p className="text-[#A0A5B0] text-sm"><Mail size={12} className="inline" /> {o.customer_email}</p>}
                        <p className="text-[#A0A5B0] text-sm"><MapPin size={12} className="inline" /> {o.customer_address}</p>
                        {o.notes && <p className="text-[#A0A5B0] text-sm mt-1"><strong>Notes:</strong> {o.notes}</p>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="px-3 py-1 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => deleteOrder(o.id)} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm flex items-center gap-1">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Talent Detail Modal */}
        {selectedTalent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0A1628] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#F5F5F0]">Talent Details</h2>
                  <button onClick={() => { setSelectedTalent(null); setEditMode(false); }} className="p-2 hover:bg-[#050A14] rounded-full">
                    <X className="text-[#A0A5B0]" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image & Portfolio */}
                  <div>
                    <div className="mb-4">
                      <p className="text-[#D4AF37] text-sm uppercase mb-2">Profile Image</p>
                      <img src={editData.profile_image || "https://via.placeholder.com/300"} className="w-full max-w-xs mx-auto rounded-xl border-2 border-[#D4AF37]/30" />
                      {editMode && (
                        <div className="mt-3">
                          <ImageUploadWithCrop 
                            onImageSelect={(img) => setEditData({...editData, profile_image: img})} 
                            aspectRatio={3/4}
                            buttonText="Change Profile Image"
                          />
                        </div>
                      )}
                    </div>

                    {/* Portfolio Images */}
                    <div className="mt-4">
                      <p className="text-[#D4AF37] text-sm uppercase mb-2">Portfolio ({(editData.portfolio_images || []).length}/7 images)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(editData.portfolio_images || []).map((img, i) => (
                          <div key={i} className="relative group">
                            <img src={img} alt={`Portfolio ${i+1}`} className="w-full aspect-square object-cover rounded" />
                            {editMode && (
                              <button onClick={() => setEditData({...editData, portfolio_images: editData.portfolio_images.filter((_, idx) => idx !== i)})} 
                                className="absolute top-0 right-0 p-1.5 bg-red-500 rounded-full md:opacity-0 md:group-hover:opacity-100">
                                <X size={14} className="text-white" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {editMode && (editData.portfolio_images || []).length < 7 && (
                        <div className="mt-3">
                          <ImageUploadWithCrop 
                            onImageSelect={(img) => setEditData(prev => ({...prev, portfolio_images: [...(prev.portfolio_images || []), img].slice(0, 7)}))} 
                            aspectRatio={3/4}
                            buttonText={`Add Image (${(editData.portfolio_images || []).length}/7)`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Portfolio Video */}
                    <div className="mt-4">
                      <p className="text-[#D4AF37] text-sm uppercase mb-2">Portfolio Video (max 45 sec)</p>
                      {editData.portfolio_video ? (
                        <div>
                          <video src={editData.portfolio_video} controls className="w-full max-h-40 rounded bg-black" />
                          {editMode && (
                            <button onClick={() => setEditData({...editData, portfolio_video: ""})} className="mt-2 px-4 py-2 bg-red-500/20 text-red-500 rounded text-sm font-medium w-full md:w-auto">Remove Video</button>
                          )}
                        </div>
                      ) : (
                        editMode ? (
                          <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
                            <input type="file" accept="video/*" onChange={e => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (file.size > 50 * 1024 * 1024) {
                                toast({ title: "Video must be less than 50MB", variant: "destructive" });
                                return;
                              }
                              const video = document.createElement('video');
                              video.preload = 'metadata';
                              video.onloadedmetadata = () => {
                                if (video.duration > 45) {
                                  toast({ title: "Video must be 45 seconds or less", variant: "destructive" });
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => setEditData(prev => ({...prev, portfolio_video: reader.result}));
                                reader.readAsDataURL(file);
                                toast({ title: "Video uploaded!", description: `Duration: ${Math.round(video.duration)} seconds` });
                              };
                              video.src = URL.createObjectURL(file);
                            }} className="hidden" id="admin-video-upload" />
                            <label htmlFor="admin-video-upload" className="cursor-pointer block">
                              <Video size={28} className="mx-auto text-[#D4AF37] mb-2" />
                              <p className="text-[#A0A5B0] text-sm">Tap to upload video</p>
                              <p className="text-[#A0A5B0] text-xs mt-1">Max 45 seconds, 50MB</p>
                            </label>
                          </div>
                        ) : <p className="text-[#A0A5B0] text-sm">No video uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Details Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#A0A5B0] text-sm">Name</label>
                      {editMode ? (
                        <input type="text" value={editData.name || ""} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0] text-lg font-bold">{editData.name}</p>
                      )}
                    </div>

                    {/* Login Credentials Section */}
                    <div className="p-3 bg-[#050A14] rounded-lg border border-[#D4AF37]/30">
                      <p className="text-[#D4AF37] text-xs uppercase mb-2">Login Credentials</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[#A0A5B0] text-xs">Email (Username)</label>
                          <p className="text-[#F5F5F0] font-mono text-sm">{editData.email}</p>
                        </div>
                        <div>
                          <label className="text-[#A0A5B0] text-xs">Password</label>
                          <p className="text-[#F5F5F0] font-mono text-sm bg-[#0A1628] px-2 py-1 rounded">{editData.password || "Not available"}</p>
                        </div>
                        {/* Password Reset - Always visible */}
                        <div className="mt-2 pt-2 border-t border-[#D4AF37]/20">
                          <label className="text-[#A0A5B0] text-xs">Set New Password</label>
                          <input type="text" placeholder="Enter new password (min 6 chars)" id={`newpw-${editData.id}`}
                            className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm mt-1" />
                          <button onClick={async () => {
                            const pwInput = document.getElementById(`newpw-${editData.id}`);
                            const newPw = pwInput?.value;
                            if (!newPw || newPw.length < 6) {
                              toast({ title: "Password must be at least 6 characters", variant: "destructive" });
                              return;
                            }
                            try {
                              await axios.put(`${API}/admin/talent/${editData.id}/password`, { password: newPw });
                              toast({ title: "Password updated successfully!" });
                              setEditData({...editData, password: newPw});
                              pwInput.value = '';
                            } catch (err) {
                              toast({ title: "Failed to update password", description: err.response?.data?.detail || "Unknown error", variant: "destructive" });
                            }
                          }} className="mt-2 px-3 py-1 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold hover:bg-[#F5F5F0]">
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Phone</label>
                      {editMode ? (
                        <input type="text" value={editData.phone || ""} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0]">{editData.phone || "N/A"}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Instagram</label>
                      {editMode ? (
                        <input type="text" value={editData.instagram_id || ""} onChange={e => setEditData({...editData, instagram_id: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
                      ) : (
                        <p className="text-[#F5F5F0]">{editData.instagram_id || "N/A"}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Category</label>
                      {editMode ? (
                        <select value={editData.category || ""} onChange={e => setEditData({...editData, category: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                          {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <p className="text-[#D4AF37]">{editData.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A0A5B0] text-sm">Bio</label>
                      {editMode ? (
                        <textarea value={editData.bio || ""} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" rows={3} />
                      ) : (
                        <p className="text-[#F5F5F0]">{editData.bio || "No bio"}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[#A0A5B0] text-sm">Status:</label>
                      <span className={`px-2 py-1 rounded text-sm ${editData.is_approved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                        {editData.is_approved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    {/* Store Categories for Designer Store talents */}
                    {editData.category === "Designer Store" && editData.store_subcategories && editData.store_subcategories.length > 0 && (
                      <div>
                        <label className="text-[#A0A5B0] text-sm">Store Categories</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {editData.store_subcategories.map(cat => (
                            <span key={cat} className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm">{cat}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-[#D4AF37]/20">
                  {editMode ? (
                    <>
                      <button onClick={saveTalentEdit} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Save Changes</button>
                      <button onClick={() => { setEditMode(false); setEditData({...selectedTalent}); }} className="px-6 py-2 border border-[#A0A5B0] text-[#A0A5B0] rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditMode(true)} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">Edit Details</button>
                      {!selectedTalent.is_approved && (
                        <>
                          <button onClick={() => approve(selectedTalent.id)} className="px-6 py-2 bg-green-500 text-white rounded font-bold">Approve</button>
                          <button onClick={() => reject(selectedTalent.id)} className="px-6 py-2 bg-red-500 text-white rounded font-bold">Reject</button>
                        </>
                      )}
                      <button onClick={() => deleteTalent(selectedTalent.id)} className="px-6 py-2 bg-red-500/20 text-red-500 rounded font-bold">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

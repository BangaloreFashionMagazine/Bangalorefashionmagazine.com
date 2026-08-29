import { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { Users, Star, Award, Image, Download, Check, X, Phone, Mail, Trash2, ExternalLink, Music, Video, Upload, BarChart3, TrendingUp, Eye, MousePointer, ShoppingBag, Package, MapPin, Calendar, BookOpen, Settings, IndianRupee, Layers, FileText, Share2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { API, BFM_LOGO, TALENT_CATEGORIES, STORE_CATEGORIES, getCategoryDisplay, getCategoryForDB } from "@/lib/config";
import { autoCompressImage } from "@/lib/imageOptimization";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";

// Import modular tab components
import { PendingTab, AllTalentsTab, PaidTalentsTab, AnalyticsTab, ContestManagementTab } from "./tabs";

// Lazy load Magazine Builder for better performance
const MagazineBuilder = lazy(() => import("./MagazineBuilder"));
// Lazy load Hero Management
const HeroManagement = lazy(() => import("./HeroManagement"));

const AdminDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [allTalents, setAllTalents] = useState([]);
  const [paidTalents, setPaidTalents] = useState([]);
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
  const [talentSearchAdmin, setTalentSearchAdmin] = useState(""); // Search filter for All Talents
  const [paidSearchFilter, setPaidSearchFilter] = useState(""); // Search filter for Paid Talents
  
  // Analytics state
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [popularTalents, setPopularTalents] = useState([]);
  const [partyStats, setPartyStats] = useState([]);
  const [adStats, setAdStats] = useState([]);
  const [dailyViews, setDailyViews] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [storeAnalytics, setStoreAnalytics] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [shareAnalytics, setShareAnalytics] = useState(null);
  
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
  
  // Share settings state
  const [shareSettings, setShareSettings] = useState({ share_enabled: true });
  
  // Events & Custom Payments state
  const [events, setEvents] = useState([]);
  const [eventPayments, setEventPayments] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", amount: 500, event_type: "contest", max_participants: null, deadline: "", is_active: true });
  const [editingEvent, setEditingEvent] = useState(null);
  const [paymentQRSettings, setPaymentQRSettings] = useState({ upi_id: "", paypal_email: "", payment_note: "Payment for BFM" });
  
  // Instagram Promo state
  const [instagramTalent, setInstagramTalent] = useState(null);
  const [imageAnalyses, setImageAnalyses] = useState([]);
  const [analyzingImages, setAnalyzingImages] = useState(false);
  const [generatingDesigns, setGeneratingDesigns] = useState(false);
  const [instagramDesigns, setInstagramDesigns] = useState(null);
  const [selectedImage1, setSelectedImage1] = useState(0);
  const [selectedImage2, setSelectedImage2] = useState(1);
  const [talentSearch, setTalentSearch] = useState("");
  const [customImages, setCustomImages] = useState([]);  // Custom uploaded images for Instagram
  const [useCustomImages, setUseCustomImages] = useState(false);  // Toggle to use custom images
  const [instaSettings, setInstaSettings] = useState({
    showTalentInsta: false,  // Default OFF - don't show talent's Instagram
    showWebsite: true,       // Default ON - show BFM website
    showQR: true,            // Default ON - show QR code to BFM profile
    promotionFormat: 'both', // 'feed', 'story', or 'both'
    customHashtags: '#bangalorefashionmagazine #BFM #fashion #model #talent', // Max 5 hashtags
    customCaption: 'Discover {name} on Bangalore Fashion Magazine! 🌟',  // {name} will be replaced
    showHashtags: true
  });

  // Payment Settings state
  const [paymentSettings, setPaymentSettings] = useState({
    payment_enabled: false,
    registration_fee: 499,
    razorpay_configured: false
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);

  // Tab visibility (which tabs show in the tab bar)
  const [hiddenTabs, setHiddenTabs] = useState([]);
  const [savingTabSettings, setSavingTabSettings] = useState(false);

  const fetchTabSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/tab-settings`);
      setHiddenTabs(res.data.hidden_tabs || []);
    } catch (err) { /* default: all tabs visible */ }
  };

  const toggleTabVisible = (tabId) => {
    setHiddenTabs(prev => prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]);
  };

  const saveTabSettings = async () => {
    setSavingTabSettings(true);
    try {
      await axios.put(`${API}/admin/tab-settings`, { hidden_tabs: hiddenTabs });
      toast({ title: "Tab visibility saved!" });
    } catch (err) {
      toast({ title: "Failed to save tab settings", variant: "destructive" });
    }
    setSavingTabSettings(false);
  };

  useEffect(() => { fetchTabSettings(); }, []);

  // Category management (built-in + admin-added custom categories)
  const [categoryOptions, setCategoryOptions] = useState(TALENT_CATEGORIES);
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories/all`);
      const names = (res.data.categories || []).map(c => c.display_name);
      setCategoryOptions([...new Set([...TALENT_CATEGORIES, ...names])]);
      setCustomCategories((res.data.categories || []).filter(c => c.is_custom));
    } catch (err) { /* fall back to built-in defaults already in state */ }
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      await axios.post(`${API}/admin/categories`, { display_name: name });
      setNewCategoryName("");
      toast({ title: "Category added!" });
      fetchCategories();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to add category", variant: "destructive" });
    }
    setSavingCategory(false);
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API}/admin/categories/${id}`);
      toast({ title: "Category deleted" });
      fetchCategories();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to delete category", variant: "destructive" });
    }
  };

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
      // Admin needs full data including email and phone - don't use lightweight
      const res = await axios.get(`${API}/talents?approved_only=false&lightweight=false`);
      setAllTalents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  const fetchPaidTalents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/paid-talents`);
      setPaidTalents(res.data.talents || []);
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

  // Fetch Events & Payments
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events?active_only=false`);
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };
  
  const fetchEventPayments = async () => {
    try {
      const res = await axios.get(`${API}/events/payments/all`);
      setEventPayments(res.data);
    } catch (err) { console.error(err); }
  };
  
  const createEvent = async () => {
    try {
      await axios.post(`${API}/events/create`, newEvent);
      toast({ title: "Event created successfully!" });
      setNewEvent({ title: "", description: "", amount: 500, event_type: "contest", max_participants: null, deadline: "", is_active: true });
      fetchEvents();
    } catch (err) {
      toast({ title: "Failed to create event", variant: "destructive" });
    }
  };
  
  const updateEvent = async () => {
    if (!editingEvent) return;
    try {
      await axios.put(`${API}/events/${editingEvent.id}`, editingEvent);
      toast({ title: "Event updated!" });
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      toast({ title: "Failed to update event", variant: "destructive" });
    }
  };
  
  const deleteEvent = async (eventId) => {
    if (!confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API}/events/${eventId}`);
      toast({ title: "Event deleted!" });
      fetchEvents();
    } catch (err) {
      toast({ title: "Failed to delete event", variant: "destructive" });
    }
  };
  
  const fetchShareSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/share-settings`);
      setShareSettings(res.data || { share_enabled: true });
    } catch (err) { 
      console.error(err);
      setShareSettings({ share_enabled: true });
    }
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
      
      // Calculate category breakdown from talents
      try {
        const talentsRes = await axios.get(`${API}/talents`);
        const talents = talentsRes.data || [];
        const categoryCount = {};
        talents.forEach(t => {
          const cat = t.category || 'Other';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        const breakdown = Object.entries(categoryCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
        setCategoryBreakdown(breakdown);
      } catch (e) { console.error(e); }
      
      // Fetch store analytics
      try {
        const ordersRes = await axios.get(`${API}/store/orders`);
        const orders = ordersRes.data || [];
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
        setStoreAnalytics({ totalOrders, totalRevenue, pendingOrders, completedOrders });
      } catch (e) { console.error(e); }
      
      // Fetch share analytics
      try {
        const shareRes = await axios.get(`${API}/admin/share-analytics`);
        setShareAnalytics(shareRes.data);
      } catch (e) { console.error(e); }
      
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Load data for current tab
  const loadTabData = async (tabName, force = false) => {
    // Always force reload for instagram tab to ensure fresh talent list
    if (loadedTabs[tabName] && !force && tabName !== 'instagram') return;
    
    switch(tabName) {
      case 'pending': await fetchPending(); break;
      case 'talents': await fetchAllTalents(); break;
      case 'paid-talents': await fetchPaidTalents(); break;
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
      case 'instagram': await fetchAllTalents(); break;  // Always fetch fresh talent data
      case 'events': await fetchEvents(); await fetchEventPayments(); break;
      case 'settings': await fetchPaymentSettings(); await fetchPaymentHistory(); await fetchShareSettings(); break;
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
      // editData.category is already stored in database format (see the
      // Category <select> above, which converts display <-> db form on change).
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

  // Get Featured in Magazine (admin review)
  const [featuredSubmissions, setFeaturedSubmissions] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState("");
  const [featuredPaymentFilter, setFeaturedPaymentFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [featuredSettings, setFeaturedSettings] = useState({ enabled: true, fee: 999 });
  const [savingFeaturedSettings, setSavingFeaturedSettings] = useState(false);

  const fetchFeaturedSubmissions = async () => {
    setFeaturedLoading(true);
    try {
      const params = {};
      if (featuredCategoryFilter) params.category = featuredCategoryFilter;
      if (featuredPaymentFilter) params.payment_status = featuredPaymentFilter;
      const res = await axios.get(`${API}/admin/magazine-features`, { params });
      setFeaturedSubmissions(res.data || []);
    } catch (err) { toast({ title: "Failed to load submissions", variant: "destructive" }); }
    setFeaturedLoading(false);
  };

  const fetchFeaturedSettings = async () => {
    try {
      const res = await axios.get(`${API}/magazine-feature-settings`);
      setFeaturedSettings(res.data);
    } catch (err) { /* defaults already in state */ }
  };

  const saveFeaturedSettings = async () => {
    setSavingFeaturedSettings(true);
    try {
      await axios.put(`${API}/admin/magazine-feature-settings`, featuredSettings);
      toast({ title: "Feature price updated!" });
    } catch (err) {
      toast({ title: "Failed to update price", variant: "destructive" });
    }
    setSavingFeaturedSettings(false);
  };

  const updateSubmissionReview = async (id, updates) => {
    try {
      await axios.put(`${API}/admin/magazine-features/${id}`, updates);
      toast({ title: "Updated!" });
      fetchFeaturedSubmissions();
      setSelectedSubmission(null);
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      await axios.delete(`${API}/admin/magazine-features/${id}`);
      toast({ title: "Deleted" });
      fetchFeaturedSubmissions();
      setSelectedSubmission(null);
    } catch (err) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const downloadFile = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => { if (tab === "get-featured") { fetchFeaturedSubmissions(); fetchFeaturedSettings(); } }, [tab, featuredCategoryFilter, featuredPaymentFilter]);

  // Payment Settings
  const fetchPaymentSettings = async () => {
    try {
      const res = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(res.data);
    } catch (err) { console.error("Failed to fetch payment settings:", err); }
  };
  
  const fetchPaymentHistory = async () => {
    try {
      const res = await axios.get(`${API}/payment-history`);
      setPaymentHistory(res.data);
    } catch (err) { console.error("Failed to fetch payment history:", err); }
  };
  
  const updatePaymentSettings = async () => {
    setSavingPaymentSettings(true);
    try {
      await axios.post(`${API}/payment-settings`, {
        payment_enabled: paymentSettings.payment_enabled,
        registration_fee: parseInt(paymentSettings.registration_fee) || 499
      });
      toast({ title: "Payment settings updated!" });
    } catch (err) {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
    setSavingPaymentSettings(false);
  };

  const tabs = [
    { id: "pending", label: "Pending", icon: Users },
    { id: "talents", label: "All Talents", icon: Star },
    { id: "paid-talents", label: "Paid Talents", icon: IndianRupee },
    { id: "hero-management", label: "Hero Management", icon: Layers },
    { id: "magazine-builder", label: "Magazine Builder", icon: BookOpen },
    { id: "instagram", label: "Instagram Promo", icon: Image },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "events", label: "Events & Payments", icon: IndianRupee },
    { id: "get-featured", label: "Get Featured", icon: Award },
    { id: "hero", label: "Hero Images (Legacy)", icon: Image },
    { id: "party", label: "Party Updates", icon: Calendar },
    { id: "video", label: "Featured Video", icon: Video },
    { id: "contests", label: "Contest Management", icon: Trophy },
    { id: "winners", label: "Winners Gallery", icon: Award },
    { id: "ads", label: "Advertisements", icon: ExternalLink },
    { id: "magazine", label: "Magazine PDF", icon: Download },
    { id: "music", label: "Background Music", icon: Music },
    { id: "export", label: "Export", icon: Download },
    { id: "store", label: "Designer Store", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-6">Admin Dashboard</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.filter(t => t.id === "settings" || !hiddenTabs.includes(t.id)).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm ${tab === t.id ? "bg-[#D4AF37] text-[#050A14]" : "bg-[#0A1628] text-[#A0A5B0]"}`}>
              <t.icon size={16} /> {t.label}
              {t.id === "pending" && pending.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pending.length}</span>}
            </button>
          ))}
        </div>

        {/* Pending */}
        {tab === "pending" && (
          <PendingTab 
            pending={pending}
            loading={loading}
            openTalentDetail={openTalentDetail}
            approve={approve}
            reject={reject}
          />
        )}

        {/* All Talents */}
        {tab === "talents" && (
          <AllTalentsTab
            allTalents={allTalents}
            loading={loading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            talentSearchAdmin={talentSearchAdmin}
            setTalentSearchAdmin={setTalentSearchAdmin}
            openTalentDetail={openTalentDetail}
            updateRank={updateRank}
            deleteTalent={deleteTalent}
            fetchAllTalents={fetchAllTalents}
            toast={toast}
          />
        )}

        {/* Paid Talents Tab */}
        {/* Paid Talents */}
        {tab === "paid-talents" && (
          <PaidTalentsTab
            paidTalents={paidTalents}
            loading={loading}
            paidSearchFilter={paidSearchFilter}
            setPaidSearchFilter={setPaidSearchFilter}
          />
        )}

        {/* Magazine Builder Tab */}
        {tab === "magazine-builder" && (
          <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#D4AF37]">Loading Magazine Builder...</div>}>
            <MagazineBuilder />
          </Suspense>
        )}

        {/* Instagram Promo Tab */}
        {tab === "instagram" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-4">Instagram Promotion</h2>
            <p className="text-[#A0A5B0] text-sm mb-6">Generate professional Instagram promotional images to drive traffic to the BFM website.</p>
            
            {/* Promotion Settings */}
            <div className="mb-6 p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/10">
              <h3 className="text-[#D4AF37] font-bold text-sm mb-3">Promotion Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-[#F5F5F0] text-sm">Show Talent Instagram</label>
                  <button 
                    onClick={() => setInstaSettings(s => ({ ...s, showTalentInsta: !s.showTalentInsta }))}
                    className={`w-12 h-6 rounded-full transition-colors ${instaSettings.showTalentInsta ? "bg-[#D4AF37]" : "bg-[#050A14] border border-[#D4AF37]/30"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${instaSettings.showTalentInsta ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#F5F5F0] text-sm">Show BFM Website</label>
                  <button 
                    onClick={() => setInstaSettings(s => ({ ...s, showWebsite: !s.showWebsite }))}
                    className={`w-12 h-6 rounded-full transition-colors ${instaSettings.showWebsite ? "bg-[#D4AF37]" : "bg-[#050A14] border border-[#D4AF37]/30"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${instaSettings.showWebsite ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[#F5F5F0] text-sm">Show QR Code</label>
                    <p className="text-[#A0A5B0] text-[10px]">Scan to view talent profile on BFM</p>
                  </div>
                  <button 
                    onClick={() => setInstaSettings(s => ({ ...s, showQR: !s.showQR }))}
                    className={`w-12 h-6 rounded-full transition-colors ${instaSettings.showQR ? "bg-[#D4AF37]" : "bg-[#050A14] border border-[#D4AF37]/30"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${instaSettings.showQR ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
              
              {/* Custom Hashtags - Max 5 for Instagram */}
              <div className="mt-4 pt-4 border-t border-[#D4AF37]/10">
                <label className="text-[#F5F5F0] text-sm mb-2 block">Custom Hashtags (Max 5)</label>
                <input 
                  type="text"
                  placeholder="#bangalorefashionmagazine #BFM #fashion #model #talent"
                  value={instaSettings.customHashtags}
                  onChange={(e) => {
                    // Count hashtags and limit to 5
                    const hashtags = e.target.value;
                    const count = (hashtags.match(/#/g) || []).length;
                    if (count <= 5) {
                      setInstaSettings(s => ({ ...s, customHashtags: hashtags }));
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                />
                <p className="text-[#A0A5B0] text-[10px] mt-1">
                  {(instaSettings.customHashtags.match(/#/g) || []).length}/5 hashtags used. These will appear in the copy-ready caption.
                </p>
              </div>
              
              {/* Custom Caption Template */}
              <div className="mt-3">
                <label className="text-[#F5F5F0] text-sm mb-2 block">Caption Template</label>
                <textarea 
                  placeholder="Discover {name} on Bangalore Fashion Magazine! 🌟"
                  value={instaSettings.customCaption}
                  onChange={(e) => setInstaSettings(s => ({ ...s, customCaption: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm resize-none"
                />
                <p className="text-[#A0A5B0] text-[10px] mt-1">
                  Use <span className="text-[#D4AF37]">{'{name}'}</span> for talent name, <span className="text-[#D4AF37]">{'{category}'}</span> for category
                </p>
              </div>

              <p className="text-[#A0A5B0] text-xs mt-3">
                Default: Hide talent's personal Instagram to drive traffic to BFM website instead.
              </p>
            </div>

            {/* Talent Search and Selection */}
            <div className="mb-6">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Search Talent by Name</label>
              <input 
                type="text"
                placeholder="Type talent name to search..."
                value={talentSearch}
                onChange={(e) => setTalentSearch(e.target.value)}
                className="w-full md:w-96 px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-3"
              />
              <select 
                value={instagramTalent?.id || ""} 
                onChange={async (e) => {
                  const talent = allTalents.find(t => t.id === e.target.value);
                  setInstagramTalent(talent);
                  setImageAnalyses([]);
                  setInstagramDesigns(null);
                  if (talent) {
                    // Fetch full talent data with portfolio
                    try {
                      const res = await axios.get(`${API}/talent/${talent.id}?include_contact=true`);
                      setInstagramTalent(res.data);
                      // Check for existing designs
                      const designRes = await axios.get(`${API}/instagram/designs/${talent.id}`);
                      if (designRes.data.designs?.length > 0) {
                        setInstagramDesigns(designRes.data);
                      }
                    } catch (err) { console.error(err); }
                  }
                }}
                className="w-full md:w-96 px-4 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
              >
                <option value="">-- Select a talent --</option>
                {allTalents
                  .filter(t => t.is_approved && t.name.toLowerCase().includes(talentSearch.toLowerCase()))
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.category}</option>
                  ))}
              </select>
              {talentSearch && (
                <p className="text-[#A0A5B0] text-xs mt-1">
                  Showing {allTalents.filter(t => t.is_approved && t.name.toLowerCase().includes(talentSearch.toLowerCase())).length} results
                </p>
              )}
            </div>
            
            {instagramTalent && (
              <div className="space-y-6">
                {/* Talent Info - No Instagram ID by default */}
                <div className="bg-[#050A14] rounded-lg p-4 flex items-center gap-4">
                  <img src={instagramTalent.profile_image} alt={instagramTalent.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37]" />
                  <div>
                    <h3 className="text-[#F5F5F0] font-bold text-lg">{instagramTalent.name}</h3>
                    <p className="text-[#D4AF37]">{instagramTalent.category}</p>
                    <p className="text-[#A0A5B0] text-sm">Bangalore Fashion Magazine • Bangalore, India</p>
                  </div>
                </div>
                
                {/* Portfolio Images with Analysis */}
                {instagramTalent.portfolio_images?.length > 0 || customImages.length > 0 ? (
                  <div>
                    {/* Toggle between Portfolio and Custom Images */}
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useCustomImages} 
                          onChange={(e) => {
                            setUseCustomImages(e.target.checked);
                            setSelectedImage1(0);
                            setSelectedImage2(1);
                          }}
                          className="w-4 h-4 accent-[#D4AF37]"
                        />
                        <span className="text-[#F5F5F0] text-sm">Use Custom Images</span>
                      </label>
                    </div>

                    {/* Custom Image Upload Section */}
                    {useCustomImages && (
                      <div className="mb-6 p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/30">
                        <h4 className="text-[#D4AF37] font-bold mb-3">Upload Custom Images</h4>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {customImages.map((img, i) => (
                            <div key={i} className="relative">
                              <img src={img} alt={`Custom ${i+1}`} className="w-20 h-24 object-cover rounded" />
                              <button 
                                onClick={() => setCustomImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                              >×</button>
                            </div>
                          ))}
                          {customImages.length < 5 && (
                            <label className="w-20 h-24 border-2 border-dashed border-[#D4AF37]/30 rounded flex items-center justify-center cursor-pointer hover:border-[#D4AF37]">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    try {
                                      const compressed = await autoCompressImage(reader.result);
                                      setCustomImages(prev => [...prev, compressed].slice(0, 5));
                                    } catch (err) {
                                      toast({ title: "Failed to upload image", variant: "destructive" });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <span className="text-[#D4AF37] text-2xl">+</span>
                            </label>
                          )}
                        </div>
                        <p className="text-[#A0A5B0] text-xs">Upload up to 5 custom images for this design</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[#D4AF37] font-bold">
                        {useCustomImages ? `Custom Images (${customImages.length})` : `Portfolio Images (${instagramTalent.portfolio_images?.length || 0})`}
                      </h3>
                      {!useCustomImages && (
                        <button 
                          onClick={async () => {
                            setAnalyzingImages(true);
                            try {
                              const res = await axios.post(`${API}/instagram/analyze-images`, {
                                talent_id: instagramTalent.id,
                                images: instagramTalent.portfolio_images
                              });
                              setImageAnalyses(res.data.analyses);
                              setSelectedImage1(res.data.best_image_index);
                              setSelectedImage2(res.data.second_best_index);
                              toast({ title: "Images analyzed!", description: "Best photos have been selected." });
                            } catch (err) {
                              toast({ title: "Analysis failed", variant: "destructive" });
                            }
                            setAnalyzingImages(false);
                          }}
                          disabled={analyzingImages}
                          className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm disabled:opacity-50"
                        >
                          {analyzingImages ? "Analyzing..." : "🤖 AI Analyze Photos"}
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(useCustomImages ? customImages : (instagramTalent.portfolio_images || [])).map((img, i) => {
                        const analysis = !useCustomImages ? imageAnalyses.find(a => a.image_index === i) : null;
                        const isSelected = selectedImage1 === i || selectedImage2 === i;
                        return (
                          <div key={i} className={`relative rounded-lg overflow-hidden border-2 ${isSelected ? 'border-[#D4AF37]' : 'border-transparent'}`}>
                            <img src={img} alt={`Photo ${i+1}`} className="w-full aspect-[3/4] object-cover" />
                            {analysis && (
                              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                                <span className={`font-bold ${analysis.quality_score >= 80 ? 'text-green-400' : analysis.quality_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {analysis.quality_score}/100
                                </span>
                              </div>
                            )}
                            {analysis?.is_recommended && (
                              <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#050A14] px-2 py-1 rounded text-xs font-bold">
                                BEST
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setSelectedImage1(i)}
                                  className={`flex-1 px-2 py-1 rounded text-xs ${selectedImage1 === i ? 'bg-[#D4AF37] text-[#050A14]' : 'bg-[#0A1628] text-[#A0A5B0]'}`}
                                >
                                  Design 1
                                </button>
                                <button 
                                  onClick={() => setSelectedImage2(i)}
                                  className={`flex-1 px-2 py-1 rounded text-xs ${selectedImage2 === i ? 'bg-[#D4AF37] text-[#050A14]' : 'bg-[#0A1628] text-[#A0A5B0]'}`}
                                >
                                  Design 2
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Generate Designs Button */}
                    <div className="mt-6 text-center">
                      {useCustomImages && customImages.length < 2 && (
                        <p className="text-[#A0A5B0] text-sm mb-2">Upload at least 2 custom images to generate designs</p>
                      )}
                      <button 
                        onClick={async () => {
                          setGeneratingDesigns(true);
                          try {
                            const res = await axios.post(`${API}/instagram/generate-designs`, {
                              talent_id: instagramTalent.id,
                              image1_index: selectedImage1,
                              image2_index: selectedImage2
                            });
                            setInstagramDesigns(res.data);
                            toast({ title: "Designs generated!", description: "You can now download and use them." });
                          } catch (err) {
                            toast({ title: "Generation failed", description: err.response?.data?.detail || "Error", variant: "destructive" });
                          }
                          setGeneratingDesigns(false);
                        }}
                        disabled={generatingDesigns || (useCustomImages && customImages.length < 2)}
                        className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#050A14] rounded-lg font-bold text-lg disabled:opacity-50"
                      >
                        {generatingDesigns ? "Generating..." : "✨ Generate Instagram Designs"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#A0A5B0] mb-4">This talent has no portfolio images.</p>
                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={useCustomImages} 
                        onChange={(e) => setUseCustomImages(e.target.checked)}
                        className="w-4 h-4 accent-[#D4AF37]"
                      />
                      <span className="text-[#D4AF37] text-sm">Upload Custom Images Instead</span>
                    </label>
                    {useCustomImages && (
                      <div className="mt-4 p-4 bg-[#050A14] rounded-lg border border-[#D4AF37]/30 inline-block">
                        <div className="flex flex-wrap gap-3 justify-center mb-3">
                          {customImages.map((img, i) => (
                            <div key={i} className="relative">
                              <img src={img} alt={`Custom ${i+1}`} className="w-20 h-24 object-cover rounded" />
                              <button 
                                onClick={() => setCustomImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                              >×</button>
                            </div>
                          ))}
                          {customImages.length < 5 && (
                            <label className="w-20 h-24 border-2 border-dashed border-[#D4AF37]/30 rounded flex items-center justify-center cursor-pointer hover:border-[#D4AF37]">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    try {
                                      const compressed = await autoCompressImage(reader.result);
                                      setCustomImages(prev => [...prev, compressed].slice(0, 5));
                                    } catch (err) {
                                      toast({ title: "Failed to upload image", variant: "destructive" });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <span className="text-[#D4AF37] text-2xl">+</span>
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Generated Designs Preview */}
                {instagramDesigns && (
                  <div className="mt-8 border-t border-[#D4AF37]/20 pt-6">
                    <h3 className="text-[#D4AF37] font-bold text-lg mb-4">Generated Designs</h3>
                    
                    {/* Instagram Feed Posts - 1080x1350 (4:5 ratio) */}
                    <div className="mb-8">
                      <h4 className="text-[#F5F5F0] font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md"></span>
                        Instagram Feed (1080 × 1350 px)
                      </h4>
                      <p className="text-[#A0A5B0] text-xs mb-4">Optimized for Instagram feed posts with 4:5 portrait aspect ratio</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[0, 1].map(idx => {
                          const imageSource = useCustomImages 
                            ? customImages[idx === 0 ? selectedImage1 : selectedImage2]
                            : instagramTalent.portfolio_images?.[idx === 0 ? selectedImage1 : selectedImage2];
                          return (
                          <div key={idx} className="bg-[#050A14] rounded-lg p-4">
                            <h4 className="text-[#F5F5F0] font-bold mb-3">Feed Design {idx + 1}</h4>
                            {/* Instagram Feed Preview - 4:5 ratio */}
                            <div 
                              id={`feed-design-${idx}`}
                              className="relative bg-black rounded-lg overflow-hidden mx-auto"
                              style={{ aspectRatio: '4/5', maxWidth: '350px', width: '100%' }}
                            >
                              <img 
                                src={imageSource} 
                                alt="Design" 
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center 25%' }}
                              />
                              {/* NO tint overlay - only gradient on text area at bottom */}
                              <div className="absolute inset-0">
                                {/* Text area at bottom only - minimal overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent" style={{height: '58%'}}>
                                  {/* BFM Logo & Branding */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <img src={BFM_LOGO} alt="BFM" className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]" />
                                    <div>
                                      <div className="text-white text-xs font-bold tracking-wider">BANGALORE</div>
                                      <div className="text-[#D4AF37] text-xs">FASHION MAGAZINE</div>
                                    </div>
                                  </div>
                                  
                                  {/* Talent Info */}
                                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-0.5">Featured Talent</div>
                                  <div className="text-white text-2xl font-bold">{instagramTalent.name}</div>
                                  <div className="text-[#D4AF37] text-sm uppercase tracking-wide">{instagramTalent.category}</div>
                                  
                                  {instaSettings.showTalentInsta && instagramTalent.instagram_id && (
                                    <div className="text-white/70 text-sm mt-1">@{instagramTalent.instagram_id}</div>
                                  )}
                                  
                                  {/* Website CTA */}
                                  {instaSettings.showWebsite && (
                                    <div className="mt-2 pt-2 border-t border-white/20">
                                      <div className="text-white/90 text-xs">Discover this talent on</div>
                                      <div className="text-[#D4AF37] text-sm font-bold">bangalorefashionmagazine.com</div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* QR Code - bottom right */}
                                {instaSettings.showQR && (
                                  <div className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-md p-1 flex items-center justify-center">
                                    <QRCodeSVG 
                                      value={`https://bangalorefashionmagazine.com/talent/${instagramTalent.id}`}
                                      size={48}
                                      level="M"
                                      includeMargin={false}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const el = document.getElementById(`feed-design-${idx}`);
                                import('html2canvas').then(({ default: html2canvas }) => {
                                  // Export at exact Instagram dimensions: 1080x1350 with HIGH QUALITY
                                  html2canvas(el, { 
                                    scale: 3, // Higher scale for better quality
                                    useCORS: true,
                                    allowTaint: true,
                                    width: el.offsetWidth,
                                    height: el.offsetHeight,
                                    backgroundColor: null
                                  }).then(canvas => {
                                    const link = document.createElement('a');
                                    link.download = `BFM_${instagramTalent.name.replace(/\s+/g, '_')}_Feed_${idx + 1}.png`;
                                    link.href = canvas.toDataURL('image/png', 1.0); // Full quality PNG
                                    link.click();
                                  });
                                });
                              }}
                              className="mt-3 w-full px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm"
                            >
                              Download Feed (1080×1350)
                            </button>
                          </div>
                        )})}
                      </div>
                    </div>
                    
                    {/* Instagram Story Posts - 1080x1920 (9:16 ratio) */}
                    <div>
                      <h4 className="text-[#F5F5F0] font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-md"></span>
                        Instagram Story (1080 × 1920 px)
                      </h4>
                      <p className="text-[#A0A5B0] text-xs mb-4">Optimized for Instagram stories with 9:16 full-screen aspect ratio</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[0, 1].map(idx => {
                          const imageSource = useCustomImages 
                            ? customImages[idx === 0 ? selectedImage1 : selectedImage2]
                            : instagramTalent.portfolio_images?.[idx === 0 ? selectedImage1 : selectedImage2];
                          return (
                          <div key={idx} className="bg-[#050A14] rounded-lg p-4">
                            <h4 className="text-[#F5F5F0] font-bold mb-3">Story Design {idx + 1}</h4>
                            {/* Instagram Story Preview - 9:16 ratio */}
                            <div 
                              id={`story-design-${idx}`}
                              className="relative bg-black rounded-lg overflow-hidden mx-auto"
                              style={{ aspectRatio: '9/16', maxWidth: '220px', width: '100%' }}
                            >
                              <img 
                                src={imageSource} 
                                alt="Story Design" 
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center top' }}
                              />
                              {/* Story Overlay - NO tint, only bottom text area */}
                              <div className="absolute inset-0">
                                {/* Text area at bottom only */}
                                <div className="absolute bottom-0 left-0 right-0 text-center p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent" style={{height: '58%'}}>
                                  {/* BFM Logo */}
                                  <img src={BFM_LOGO} alt="BFM" className="w-6 h-6 mx-auto rounded-full border border-[#D4AF37] mb-0.5" />
                                  <div className="text-[#D4AF37] text-[6px] font-bold tracking-wider">BANGALORE FASHION MAGAZINE</div>
                                  
                                  {/* Talent Info */}
                                  <div className="text-[#D4AF37] text-[6px] uppercase tracking-widest mt-1">Featured Talent</div>
                                  <div className="text-white text-sm font-bold leading-tight">{instagramTalent.name}</div>
                                  <div className="text-[#D4AF37] text-[8px] uppercase">{instagramTalent.category}</div>
                                  
                                  {instaSettings.showTalentInsta && instagramTalent.instagram_id && (
                                    <div className="text-white/70 text-[8px]">@{instagramTalent.instagram_id}</div>
                                  )}
                                  
                                  {/* Website */}
                                  {instaSettings.showWebsite && (
                                    <div className="mt-1 pt-1 border-t border-white/20">
                                      <div className="text-[#D4AF37] text-[7px] font-bold">bangalorefashionmagazine.com</div>
                                    </div>
                                  )}
                                  
                                  {/* QR Code */}
                                  {instaSettings.showQR && (
                                    <div className="mt-1 mx-auto w-8 h-8 bg-white rounded p-0.5 flex items-center justify-center">
                                      <QRCodeSVG 
                                        value={`https://bangalorefashionmagazine.com/talent/${instagramTalent.id}`}
                                        size={28}
                                        level="M"
                                        includeMargin={false}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const el = document.getElementById(`story-design-${idx}`);
                                import('html2canvas').then(({ default: html2canvas }) => {
                                  // Export at HIGH QUALITY
                                  html2canvas(el, { 
                                    scale: 5, // Higher scale for story format
                                    useCORS: true,
                                    allowTaint: true,
                                    width: el.offsetWidth,
                                    height: el.offsetHeight,
                                    backgroundColor: null
                                  }).then(canvas => {
                                    const link = document.createElement('a');
                                    link.download = `BFM_${instagramTalent.name.replace(/\s+/g, '_')}_Story_${idx + 1}.png`;
                                    link.href = canvas.toDataURL('image/png', 1.0); // Full quality PNG
                                    link.click();
                                  });
                                });
                              }}
                              className="mt-3 w-full px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm"
                            >
                              Download Story (1080×1920)
                            </button>
                          </div>
                        )})}
                      </div>
                    </div>
                    
                    {/* Caption and Hashtags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#050A14] rounded-lg p-4">
                        <h4 className="text-[#F5F5F0] font-bold mb-3">Caption</h4>
                        <textarea 
                          readOnly 
                          value={instagramDesigns.caption} 
                          className="w-full h-40 px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(instagramDesigns.caption);
                            toast({ title: "Caption copied!" });
                          }}
                          className="mt-3 w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] rounded font-bold text-sm"
                        >
                          Copy Caption
                        </button>
                      </div>
                      <div className="bg-[#050A14] rounded-lg p-4">
                        <h4 className="text-[#F5F5F0] font-bold mb-3">Caption & Hashtags</h4>
                        {/* Generated Caption */}
                        <div className="mb-3">
                          <label className="text-[#A0A5B0] text-xs mb-1 block">Caption</label>
                          <textarea 
                            value={instaSettings.customCaption
                              .replace('{name}', instagramTalent?.name || 'Talent')
                              .replace('{category}', instagramTalent?.category || 'Model')}
                            onChange={(e) => setInstaSettings(s => ({ ...s, customCaption: e.target.value }))}
                            className="w-full h-20 px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                          />
                        </div>
                        {/* Hashtags */}
                        <div>
                          <label className="text-[#A0A5B0] text-xs mb-1 block">Hashtags (Max 5)</label>
                          <textarea 
                            value={instaSettings.customHashtags}
                            onChange={(e) => {
                              const hashtags = e.target.value;
                              const count = (hashtags.match(/#/g) || []).length;
                              if (count <= 5) {
                                setInstaSettings(s => ({ ...s, customHashtags: hashtags }));
                              }
                            }}
                            className="w-full h-24 px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm"
                          />
                          <p className="text-[#A0A5B0] text-[10px] mt-1">
                            {(instaSettings.customHashtags.match(/#/g) || []).length}/5 hashtags
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            const fullCaption = instaSettings.customCaption
                              .replace('{name}', instagramTalent?.name || 'Talent')
                              .replace('{category}', instagramTalent?.category || 'Model') + 
                              '\n\n' + instaSettings.customHashtags;
                            navigator.clipboard.writeText(fullCaption);
                            toast({ title: "Caption & Hashtags copied!" });
                          }}
                          className="mt-3 w-full px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm"
                        >
                          Copy Caption + Hashtags
                        </button>
                      </div>
                    </div>
                    
                    {/* Regenerate Button */}
                    <div className="mt-6 text-center">
                      <button 
                        onClick={async () => {
                          setGeneratingDesigns(true);
                          try {
                            const res = await axios.post(`${API}/instagram/generate-designs`, {
                              talent_id: instagramTalent.id,
                              image1_index: selectedImage1,
                              image2_index: selectedImage2
                            });
                            setInstagramDesigns(res.data);
                            toast({ title: "Designs regenerated!" });
                          } catch (err) {
                            toast({ title: "Regeneration failed", variant: "destructive" });
                          }
                          setGeneratingDesigns(false);
                        }}
                        disabled={generatingDesigns}
                        className="px-6 py-2 bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] rounded font-bold"
                      >
                        🔄 Regenerate Designs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Events & Custom Payments Tab */}
        {tab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F5F5F0]">Events & Custom Payments</h2>
            </div>
            
            {/* Create New Event */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">
                {editingEvent ? "Edit Event" : "Create New Event / Contest"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., BFM Model Contest 2024"
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, title: e.target.value})
                      : setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Entry Fee (₹) *</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={editingEvent ? editingEvent.amount : newEvent.amount}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, amount: parseInt(e.target.value) || 0})
                      : setNewEvent({...newEvent, amount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Event Type</label>
                  <select
                    value={editingEvent ? editingEvent.event_type : newEvent.event_type}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, event_type: e.target.value})
                      : setNewEvent({...newEvent, event_type: e.target.value})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  >
                    <option value="contest">Contest</option>
                    <option value="event">Event</option>
                    <option value="workshop">Workshop</option>
                    <option value="photoshoot">Photoshoot</option>
                    <option value="audition">Audition</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Max Participants (optional)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={editingEvent ? (editingEvent.max_participants || "") : (newEvent.max_participants || "")}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, max_participants: e.target.value ? parseInt(e.target.value) : null})
                      : setNewEvent({...newEvent, max_participants: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Deadline (optional)</label>
                  <input
                    type="date"
                    value={editingEvent ? (editingEvent.deadline || "") : (newEvent.deadline || "")}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, deadline: e.target.value})
                      : setNewEvent({...newEvent, deadline: e.target.value})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[#A0A5B0] text-sm">Active</label>
                  <button
                    onClick={() => editingEvent 
                      ? setEditingEvent({...editingEvent, is_active: !editingEvent.is_active})
                      : setNewEvent({...newEvent, is_active: !newEvent.is_active})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      (editingEvent ? editingEvent.is_active : newEvent.is_active) 
                        ? "bg-green-500" : "bg-[#050A14] border border-[#D4AF37]/30"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      (editingEvent ? editingEvent.is_active : newEvent.is_active) ? "translate-x-6" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[#A0A5B0] text-sm mb-1 block">Description</label>
                  <textarea
                    placeholder="Describe the event, rules, prizes, etc."
                    value={editingEvent ? editingEvent.description : newEvent.description}
                    onChange={(e) => editingEvent 
                      ? setEditingEvent({...editingEvent, description: e.target.value})
                      : setNewEvent({...newEvent, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {editingEvent ? (
                  <>
                    <button onClick={updateEvent} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">
                      Update Event
                    </button>
                    <button onClick={() => setEditingEvent(null)} className="px-6 py-2 bg-[#050A14] border border-[#D4AF37]/30 text-[#A0A5B0] rounded">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={createEvent} disabled={!newEvent.title || !newEvent.amount} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50">
                    Create Event
                  </button>
                )}
              </div>
            </div>
            
            {/* Active Events List */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">All Events ({events.length})</h3>
              {events.length === 0 ? (
                <p className="text-[#A0A5B0]">No events created yet. Create your first event above!</p>
              ) : (
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="bg-[#050A14] rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[#F5F5F0] font-bold">{event.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${event.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {event.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded uppercase">
                            {event.event_type}
                          </span>
                        </div>
                        <p className="text-[#A0A5B0] text-sm mt-1">{event.description || "No description"}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-[#D4AF37] font-bold">₹{event.amount}</span>
                          <span className="text-[#A0A5B0]">{event.participants?.length || 0} registered</span>
                          {event.max_participants && (
                            <span className="text-[#A0A5B0]">Max: {event.max_participants}</span>
                          )}
                          {event.deadline && (
                            <span className="text-[#A0A5B0]">Deadline: {new Date(event.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingEvent(event)}
                          className="px-3 py-1 bg-[#0A1628] border border-[#D4AF37]/30 text-[#D4AF37] rounded text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Payment History */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Event Payment History ({eventPayments.length})</h3>
              {eventPayments.length === 0 ? (
                <p className="text-[#A0A5B0]">No event payments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-2 text-[#A0A5B0]">Event</th>
                        <th className="text-left py-2 text-[#A0A5B0]">Talent</th>
                        <th className="text-left py-2 text-[#A0A5B0]">Amount</th>
                        <th className="text-left py-2 text-[#A0A5B0]">Status</th>
                        <th className="text-left py-2 text-[#A0A5B0]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventPayments.map((payment, idx) => (
                        <tr key={idx} className="border-b border-[#D4AF37]/10">
                          <td className="py-2 text-[#F5F5F0]">{payment.event_title}</td>
                          <td className="py-2 text-[#F5F5F0]">{payment.talent_name}</td>
                          <td className="py-2 text-[#D4AF37]">₹{payment.amount}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              payment.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                              payment.status === 'created' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-2 text-[#A0A5B0]">{new Date(payment.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Info Box */}
            <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/30">
              <h4 className="text-[#D4AF37] font-bold mb-2">How it works:</h4>
              <ul className="text-[#A0A5B0] text-sm space-y-1">
                <li>• Create events/contests with custom entry fees</li>
                <li>• Talents can view and pay for events from their dashboard</li>
                <li>• Payments are processed via Razorpay (same as registration)</li>
                <li>• Track all registrations and payments here</li>
              </ul>
            </div>
          </div>
        )}

        {/* Get Featured in Magazine - admin review */}
        {tab === "get-featured" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="text-lg font-bold text-[#F5F5F0]">Get Featured Submissions ({featuredSubmissions.length})</h2>
              <div className="flex gap-2 items-center flex-wrap">
                <select value={featuredCategoryFilter} onChange={e => setFeaturedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm">
                  <option value="">All Categories</option>
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={featuredPaymentFilter} onChange={e => setFeaturedPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-sm">
                  <option value="">All Payment Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Payment Pending</option>
                </select>
              </div>
            </div>

            {/* Feature price control */}
            <div className="mb-4 p-3 bg-[#050A14] rounded-lg border border-[#D4AF37]/10 flex flex-wrap items-center gap-3">
              <span className="text-[#A0A5B0] text-sm">Feature Fee:</span>
              <input type="number" min="0" value={featuredSettings.fee}
                onChange={e => setFeaturedSettings({...featuredSettings, fee: parseInt(e.target.value) || 0})}
                className="w-28 px-2 py-1 bg-[#0A1628] border border-[#D4AF37]/30 rounded text-[#F5F5F0]" />
              <label className="flex items-center gap-2 text-sm text-[#A0A5B0]">
                <input type="checkbox" checked={featuredSettings.enabled}
                  onChange={e => setFeaturedSettings({...featuredSettings, enabled: e.target.checked})}
                  className="accent-[#D4AF37]" />
                Payment required
              </label>
              <button onClick={saveFeaturedSettings} disabled={savingFeaturedSettings}
                className="px-4 py-1.5 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold disabled:opacity-50">
                {savingFeaturedSettings ? 'Saving...' : 'Save Price'}
              </button>
            </div>

            {featuredLoading ? (
              <p className="text-[#A0A5B0] text-center py-8">Loading...</p>
            ) : featuredSubmissions.length === 0 ? (
              <p className="text-[#A0A5B0] text-center py-8">No submissions found.</p>
            ) : (
              <div className="space-y-3">
                {featuredSubmissions.map(s => (
                  <div key={s.id} className="bg-[#050A14] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer hover:bg-[#0D1B2A]" onClick={() => setSelectedSubmission(s)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[#F5F5F0] font-bold">{s.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${s.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {s.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] capitalize">{s.review_status}</span>
                      </div>
                      <p className="text-[#D4AF37] text-sm">{s.category}</p>
                      <p className="text-[#A0A5B0] text-xs">{s.email} • {s.phone} • {s.files?.length || 0} file(s)</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm self-start md:self-center">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* Detail / review modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedSubmission(null)}>
                <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-[#D4AF37]/30" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[#F5F5F0] font-bold text-lg">{selectedSubmission.name}</h3>
                    <button onClick={() => setSelectedSubmission(null)} className="text-[#A0A5B0] hover:text-[#F5F5F0]"><X size={20} /></button>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-[#A0A5B0]">Category: <span className="text-[#F5F5F0]">{selectedSubmission.category}</span></p>
                    <p className="text-[#A0A5B0]">Email: <span className="text-[#F5F5F0]">{selectedSubmission.email}</span></p>
                    <p className="text-[#A0A5B0]">Phone: <span className="text-[#F5F5F0]">{selectedSubmission.phone}</span></p>
                    {selectedSubmission.notes && <p className="text-[#A0A5B0]">Notes: <span className="text-[#F5F5F0]">{selectedSubmission.notes}</span></p>}
                  </div>

                  {selectedSubmission.files?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[#A0A5B0] text-sm mb-2">Files ({selectedSubmission.files.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {selectedSubmission.files.map((f, i) => (
                          <div key={i} className="relative group">
                            <img src={f} alt="" className="w-full aspect-[3/4] object-cover rounded border border-[#D4AF37]/20" />
                            <button onClick={() => downloadFile(f, `${selectedSubmission.name}-${i + 1}.jpg`)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                              <Download className="text-[#D4AF37]" size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-[#A0A5B0] text-sm block mb-1">Review Status</label>
                    <select value={selectedSubmission.review_status}
                      onChange={e => setSelectedSubmission({...selectedSubmission, review_status: e.target.value})}
                      className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="used">Used in Magazine</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="text-[#A0A5B0] text-sm block mb-1">Admin Notes</label>
                    <textarea value={selectedSubmission.admin_notes || ""}
                      onChange={e => setSelectedSubmission({...selectedSubmission, admin_notes: e.target.value})}
                      className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] h-20" />
                  </div>
                  <button
                    onClick={() => updateSubmissionReview(selectedSubmission.id, {
                      review_status: selectedSubmission.review_status,
                      admin_notes: selectedSubmission.admin_notes
                    })}
                    className="w-full py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {tab === "analytics" && (
          <AnalyticsTab
            analyticsSummary={analyticsSummary}
            dailyViews={dailyViews}
            categoryBreakdown={categoryBreakdown}
            popularTalents={popularTalents}
            partyStats={partyStats}
            adStats={adStats}
            recentActivity={recentActivity}
            shareAnalytics={shareAnalytics}
            storeAnalytics={storeAnalytics}
          />
        )}

        {/* Hero Management (New) */}
        {tab === "hero-management" && (
          <Suspense fallback={<div className="text-[#A0A5B0] p-4">Loading Hero Management...</div>}>
            <HeroManagement />
          </Suspense>
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
                  buttonText="Choose Event Image"
                  skipCrop={true}
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
        {tab === "contests" && <ContestManagementTab />}

        {tab === "winners" && (
          <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-2">Winners Gallery</h2>
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
                skipCrop={true}
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F0]">Monthly Magazine</h2>
                <p className="text-[#A0A5B0] text-sm">Upload and manage your BFM magazine editions</p>
              </div>
            </div>
            
            {magazine ? (
              <div className="space-y-6">
                {/* Current Magazine Display */}
                <div className="bg-[#050A14] rounded-xl p-6 border border-[#D4AF37]/30">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Magazine Preview */}
                    <div className="w-full md:w-48 flex-shrink-0">
                      <div className="aspect-[3/4] bg-gradient-to-br from-[#D4AF37]/20 to-[#050A14] rounded-lg flex items-center justify-center border border-[#D4AF37]/20">
                        <div className="text-center p-4">
                          <FileText size={48} className="text-[#D4AF37] mx-auto mb-2" />
                          <p className="text-[#D4AF37] text-xs font-medium">PDF</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Magazine Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#F5F5F0] mb-2">{magazine.title}</h3>
                      <p className="text-[#A0A5B0] text-sm mb-1">{magazine.file_name}</p>
                      <p className="text-[#A0A5B0] text-xs mb-4">
                        Uploaded: {new Date(magazine.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <a 
                          href={magazine.file_data} 
                          download={magazine.file_name}
                          className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#F5D76E] transition-colors"
                        >
                          <Download size={16} /> Download PDF
                        </a>
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: magazine.title,
                                text: `Check out the latest BFM Magazine: ${magazine.title}`,
                                url: window.location.origin
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.origin);
                              toast({ title: "Link copied to clipboard!" });
                            }
                          }}
                          className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#D4AF37]/30 transition-colors"
                        >
                          <Share2 size={16} /> Share
                        </button>
                        <button 
                          onClick={deleteMagazine} 
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Upload New Section */}
                <div className="border-t border-[#D4AF37]/20 pt-6">
                  <h4 className="text-sm font-semibold text-[#D4AF37] mb-4">Replace Magazine</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="New Magazine Title" 
                      value={newMagazine.title} 
                      onChange={e => setNewMagazine({...newMagazine, title: e.target.value})}
                      className="flex-1 px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm" 
                    />
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleMagazineFile} 
                      className="text-[#A0A5B0] text-sm" 
                    />
                    <button 
                      onClick={uploadMagazine} 
                      disabled={!newMagazine.title || !newMagazine.file_data}
                      className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload
                    </button>
                  </div>
                  {newMagazine.file_name && (
                    <p className="text-[#D4AF37] text-xs mt-2">Selected: {newMagazine.file_name}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={64} className="text-[#D4AF37]/30 mx-auto mb-4" />
                <p className="text-[#A0A5B0] mb-6">No magazine uploaded yet</p>
                <div className="max-w-md mx-auto space-y-3">
                  <input 
                    type="text" 
                    placeholder="Magazine Title (e.g. January 2026 Edition)" 
                    value={newMagazine.title} 
                    onChange={e => setNewMagazine({...newMagazine, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" 
                  />
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleMagazineFile} 
                    className="w-full text-[#A0A5B0]" 
                  />
                  {newMagazine.file_name && (
                    <p className="text-[#D4AF37] text-sm">Selected: {newMagazine.file_name}</p>
                  )}
                  <button 
                    onClick={uploadMagazine} 
                    disabled={!newMagazine.title || !newMagazine.file_data}
                    className="w-full px-6 py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload size={18} /> Upload Magazine
                  </button>
                </div>
              </div>
            )}
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
                <p className="text-[#A0A5B0]">No products added yet. Add designers with &quot;Designer Store&quot; category first, then add products.</p>
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

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
            <h2 className="text-lg font-bold text-[#F5F5F0] mb-6">Settings</h2>

            {/* Tab Visibility Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="text-[#D4AF37]" size={24} />
                <h3 className="text-[#F5F5F0] font-bold text-lg">Tab Visibility</h3>
              </div>
              <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                <p className="text-[#A0A5B0] text-sm mb-3">Hide tabs you don't use to reduce clutter. Settings always stays visible.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tabs.filter(t => t.id !== "settings").map(t => (
                    <label key={t.id} className="flex items-center gap-2 px-3 py-2 bg-[#0A1628] rounded text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenTabs.includes(t.id)}
                        onChange={() => toggleTabVisible(t.id)}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-[#F5F5F0]">{t.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={saveTabSettings}
                  disabled={savingTabSettings}
                  className="w-full mt-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold disabled:opacity-50"
                >
                  {savingTabSettings ? 'Saving...' : 'Save Tab Visibility'}
                </button>
              </div>
            </div>

            {/* Manage Categories Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Star className="text-[#D4AF37]" size={24} />
                <h3 className="text-[#F5F5F0] font-bold text-lg">Manage Categories</h3>
              </div>
              <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                <p className="text-[#A0A5B0] text-sm mb-3">
                  Add categories beyond the built-in defaults. New/existing talents can select them,
                  and they immediately work correctly in filtering and search.
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]"
                  />
                  <button
                    onClick={addCategory}
                    disabled={savingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {customCategories.length === 0 ? (
                  <p className="text-[#A0A5B0] text-sm">No custom categories added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customCategories.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-[#0A1628] rounded">
                        <span className="text-[#F5F5F0]">{c.display_name}</span>
                        <button onClick={() => deleteCategory(c.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Settings Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <IndianRupee className="text-[#D4AF37]" size={24} />
                <h3 className="text-[#F5F5F0] font-bold text-lg">Payment Settings</h3>
              </div>
              
              <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10 space-y-4">
                {/* Razorpay Status */}
                <div className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                  <div>
                    <p className="text-[#F5F5F0] font-medium">Razorpay Integration</p>
                    <p className="text-[#A0A5B0] text-sm">API keys configuration status</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentSettings.razorpay_configured ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {paymentSettings.razorpay_configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                
                {!paymentSettings.razorpay_configured && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-500 text-sm">
                      <strong>Note:</strong> Add your Razorpay API keys to backend/.env file:
                    </p>
                    <code className="block mt-2 p-2 bg-[#050A14] rounded text-[#A0A5B0] text-xs">
                      RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx<br/>
                      RAZORPAY_KEY_SECRET=your_secret_key
                    </code>
                  </div>
                )}
                
                {/* Payment Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                  <div>
                    <p className="text-[#F5F5F0] font-medium">Paid Registration</p>
                    <p className="text-[#A0A5B0] text-sm">Require payment for talent registration</p>
                  </div>
                  <button
                    onClick={() => setPaymentSettings({...paymentSettings, payment_enabled: !paymentSettings.payment_enabled})}
                    className={`relative w-14 h-7 rounded-full transition-colors ${paymentSettings.payment_enabled ? 'bg-[#D4AF37]' : 'bg-[#A0A5B0]/30'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${paymentSettings.payment_enabled ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {/* Registration Fee */}
                <div className="p-3 bg-[#0A1628] rounded-lg">
                  <label className="text-[#F5F5F0] font-medium block mb-2">Registration Fee (₹)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={paymentSettings.registration_fee}
                      onChange={(e) => setPaymentSettings({...paymentSettings, registration_fee: parseInt(e.target.value) || 0})}
                      className="w-32 px-3 py-2 bg-[#050A14] border border-[#D4AF37]/30 rounded text-[#F5F5F0] text-lg font-bold"
                      min="1"
                    />
                    <span className="text-[#A0A5B0]">INR</span>
                  </div>
                  <p className="text-[#A0A5B0] text-sm mt-2">Amount talents will pay to register</p>
                </div>
                
                {/* Save Button */}
                <button
                  onClick={updatePaymentSettings}
                  disabled={savingPaymentSettings}
                  className="w-full py-3 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold disabled:opacity-50"
                >
                  {savingPaymentSettings ? 'Saving...' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
            
            {/* Payment History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#F5F5F0] font-bold text-lg">Payment History</h3>
                <button onClick={fetchPaymentHistory} className="text-[#D4AF37] text-sm hover:underline">Refresh</button>
              </div>
              
              {paymentHistory.total_count > 0 ? (
                <div className="bg-[#050A14] rounded-lg border border-[#D4AF37]/10">
                  <div className="p-4 border-b border-[#D4AF37]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A5B0]">Total Revenue</span>
                      <span className="text-[#D4AF37] font-bold text-xl">₹{paymentHistory.total_revenue?.toLocaleString()}</span>
                    </div>
                    <p className="text-[#A0A5B0] text-sm mt-1">{paymentHistory.total_count} successful payments</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {paymentHistory.payments?.map((p, i) => (
                      <div key={i} className="p-3 border-b border-[#D4AF37]/5 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[#F5F5F0] font-medium">{p.talent_name}</p>
                            <p className="text-[#A0A5B0] text-xs">{p.talent_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#D4AF37] font-bold">₹{(p.amount / 100).toLocaleString()}</p>
                            <p className="text-[#A0A5B0] text-xs">{new Date(p.paid_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#050A14] rounded-lg p-8 text-center border border-[#D4AF37]/10">
                  <IndianRupee className="text-[#A0A5B0]/30 mx-auto mb-3" size={48} />
                  <p className="text-[#A0A5B0]">No payments yet</p>
                  <p className="text-[#A0A5B0]/60 text-sm">Payments will appear here once talents start registering</p>
                </div>
              )}
            </div>
            
            {/* Manual Payment QR/Links - For sharing with talents */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Payment QR & Links (Share with Talents)</h3>
              <p className="text-[#A0A5B0] text-sm mb-4">Generate payment links or QR codes to share with talents for manual payments (photoshoots, special events, etc.)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UPI Payment */}
                <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                  <h4 className="text-[#D4AF37] font-bold mb-3">UPI Payment (India)</h4>
                  <input
                    type="text"
                    placeholder="Your UPI ID (e.g., yourname@paytm)"
                    value={paymentQRSettings.upi_id}
                    onChange={(e) => setPaymentQRSettings(s => ({ ...s, upi_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Payment Note (e.g., BFM Photoshoot Fee)"
                    value={paymentQRSettings.payment_note}
                    onChange={(e) => setPaymentQRSettings(s => ({ ...s, payment_note: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-3"
                  />
                  {paymentQRSettings.upi_id && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block mb-3">
                        <QRCodeSVG 
                          value={`upi://pay?pa=${paymentQRSettings.upi_id}&pn=BFM&tn=${encodeURIComponent(paymentQRSettings.payment_note)}`}
                          size={150}
                          level="M"
                        />
                      </div>
                      <p className="text-[#A0A5B0] text-xs mb-2">Scan to pay via UPI</p>
                      <button 
                        onClick={() => {
                          const link = `upi://pay?pa=${paymentQRSettings.upi_id}&pn=BFM&tn=${encodeURIComponent(paymentQRSettings.payment_note)}`;
                          navigator.clipboard.writeText(link);
                          toast({ title: "UPI link copied!" });
                        }}
                        className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm"
                      >
                        Copy UPI Link
                      </button>
                    </div>
                  )}
                </div>
                
                {/* PayPal Payment */}
                <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10">
                  <h4 className="text-[#D4AF37] font-bold mb-3">PayPal Payment</h4>
                  <input
                    type="email"
                    placeholder="Your PayPal Email"
                    value={paymentQRSettings.paypal_email}
                    onChange={(e) => setPaymentQRSettings(s => ({ ...s, paypal_email: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-3"
                  />
                  {paymentQRSettings.paypal_email && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block mb-3">
                        <QRCodeSVG 
                          value={`https://paypal.me/${paymentQRSettings.paypal_email.split('@')[0]}`}
                          size={150}
                          level="M"
                        />
                      </div>
                      <p className="text-[#A0A5B0] text-xs mb-2">Scan to pay via PayPal</p>
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://paypal.me/${paymentQRSettings.paypal_email.split('@')[0]}`);
                            toast({ title: "PayPal link copied!" });
                          }}
                          className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm"
                        >
                          Copy PayPal Link
                        </button>
                      </div>
                      <p className="text-[#A0A5B0] text-[10px] mt-2">Note: PayPal.me links use username, not email. Update if different.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-[#050A14] rounded border border-[#D4AF37]/20">
                <h4 className="text-[#D4AF37] font-bold text-sm mb-2">💡 How to use:</h4>
                <ul className="text-[#A0A5B0] text-xs space-y-1">
                  <li>1. Enter your UPI ID or PayPal email above</li>
                  <li>2. QR code will be generated automatically</li>
                  <li>3. Screenshot the QR or copy the link</li>
                  <li>4. Share with talents via WhatsApp, Instagram DM, etc.</li>
                  <li>5. For event-specific payments, use the <span className="text-[#D4AF37]">Events & Payments</span> tab with Razorpay integration</li>
                </ul>
              </div>
            </div>
            
            {/* Share Settings Section */}
            <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="text-[#D4AF37]" size={24} />
                <h3 className="text-[#F5F5F0] font-bold text-lg">Share Settings</h3>
              </div>
              
              <div className="bg-[#050A14] rounded-lg p-4 border border-[#D4AF37]/10 space-y-4">
                {/* Share Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                  <div>
                    <p className="text-[#F5F5F0] font-medium">Enable Talent Sharing</p>
                    <p className="text-[#A0A5B0] text-sm">Allow talents to share their profiles with branded images</p>
                  </div>
                  <button 
                    onClick={async () => {
                      const newValue = !shareSettings.share_enabled;
                      setShareSettings(s => ({ ...s, share_enabled: newValue }));
                      try {
                        await axios.post(`${API}/admin/share-settings`, { share_enabled: newValue });
                        toast({ title: newValue ? "Sharing enabled" : "Sharing disabled" });
                      } catch (err) {
                        toast({ title: "Failed to update", variant: "destructive" });
                      }
                    }}
                    className={`w-14 h-7 rounded-full transition-colors ${shareSettings.share_enabled ? "bg-[#D4AF37]" : "bg-[#050A14] border border-[#D4AF37]/30"}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${shareSettings.share_enabled ? "translate-x-7" : "translate-x-0.5"}`} />
                  </button>
                </div>
                
                <div className="p-3 bg-[#050A14]/50 rounded-lg">
                  <p className="text-[#A0A5B0] text-sm">
                    When enabled, talents can share their profiles as branded images to WhatsApp, Instagram Stories, and Instagram Feed. 
                    Images include BFM logo, talent photo, name, category, and website URL.
                  </p>
                </div>
              </div>
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
                        <select value={getCategoryDisplay(editData.category) || ""} onChange={e => setEditData({...editData, category: getCategoryForDB(e.target.value)})} className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <p className="text-[#D4AF37]">{getCategoryDisplay(editData.category)}</p>
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

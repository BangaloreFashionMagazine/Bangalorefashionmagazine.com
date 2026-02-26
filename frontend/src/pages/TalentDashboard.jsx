import { useState, useEffect } from "react";
import axios from "axios";
import { X, Video, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { API, TALENT_CATEGORIES, getCategoryDisplay } from "@/lib/config";

// Designer Products Section Component
const DesignerProductsSection = ({ designerId, designerCategories = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", store_category: designerCategories[0] || "", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/store/products?designer_id=${designerId}&active_only=false`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  
  useEffect(() => { fetchProducts(); }, [designerId]);
  
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    if (!newProduct.store_category) {
      toast({ title: "Please select a category for this product", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/store/products`, { 
        ...newProduct, 
        price: parseFloat(newProduct.price), 
        discount_percent: parseInt(newProduct.discount_percent) || 0,
        designer_id: designerId 
      });
      toast({ title: "Product added!" });
      setNewProduct({ name: "", description: "", store_category: designerCategories[0] || "", size: "", material: "", price: "", discount_percent: "", shipping_info: "", images: [], video: "" });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) { toast({ title: err.response?.data?.detail || "Failed to add product", variant: "destructive" }); }
    setSubmitting(false);
  };
  
  const updateProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
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
      fetchProducts();
    } catch (err) { toast({ title: err.response?.data?.detail || "Failed to update product", variant: "destructive" }); }
    setSubmitting(false);
  };
  
  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/store/products/${productId}`);
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (err) { toast({ title: "Failed to delete", variant: "destructive" }); }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#F5F5F0]">My Products ({products.length}/10)</h2>
          {products.length < 10 && !editingProduct && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold text-sm">
              {showAddForm ? "Cancel" : "+ Add Product"}
            </button>
          )}
        </div>
        
        {/* Add/Edit Form */}
        {(showAddForm || editingProduct) && (
          <div className="bg-[#050A14] rounded-lg p-4 mb-6 border border-[#D4AF37]/20">
            <h3 className="text-[#D4AF37] font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            
            {/* Category Selection */}
            {designerCategories.length > 0 && (
              <div className="mb-4">
                <label className="text-[#A0A5B0] text-sm mb-2 block">Product Category *</label>
                <div className="flex flex-wrap gap-2">
                  {designerCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => editingProduct ? setEditingProduct({...editingProduct, store_category: cat}) : setNewProduct({...newProduct, store_category: cat})}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        (editingProduct ? editingProduct.store_category : newProduct.store_category) === cat
                          ? 'bg-[#D4AF37] text-[#050A14] border-[#D4AF37]'
                          : 'border-[#D4AF37]/30 text-[#A0A5B0] hover:border-[#D4AF37]'
                      }`}
                    >
                      {cat === "Everyday Chic" && "👕"} {cat === "After Dark" && "✨"} {cat === "Heritage Luxe" && "🪔"} {cat === "Accessories Room" && "👜"} {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Product Name *" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Price (₹) *" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="number" placeholder="Discount % (0-100)" min="0" max="100" value={editingProduct ? editingProduct.discount_percent : newProduct.discount_percent} onChange={e => editingProduct ? setEditingProduct({...editingProduct, discount_percent: e.target.value}) : setNewProduct({...newProduct, discount_percent: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Size" value={editingProduct ? editingProduct.size : newProduct.size} onChange={e => editingProduct ? setEditingProduct({...editingProduct, size: e.target.value}) : setNewProduct({...newProduct, size: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Material" value={editingProduct ? editingProduct.material : newProduct.material} onChange={e => editingProduct ? setEditingProduct({...editingProduct, material: e.target.value}) : setNewProduct({...newProduct, material: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
              <input type="text" placeholder="Shipping Info" value={editingProduct ? editingProduct.shipping_info : newProduct.shipping_info} onChange={e => editingProduct ? setEditingProduct({...editingProduct, shipping_info: e.target.value}) : setNewProduct({...newProduct, shipping_info: e.target.value})} className="px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" />
            </div>
            <textarea placeholder="Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 bg-[#0A1628] border border-[#D4AF37]/20 rounded text-[#F5F5F0] mb-4" rows={2} />
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Product Images (up to 5)</label>
              <div className="flex flex-wrap gap-2">
                {(editingProduct ? editingProduct.images : newProduct.images).map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    <button onClick={() => editingProduct ? setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)}) : setNewProduct({...newProduct, images: newProduct.images.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
                  </div>
                ))}
                {(editingProduct ? editingProduct.images : newProduct.images).length < 5 && (
                  <ImageUploadWithCrop onImageSelect={(img) => editingProduct ? setEditingProduct({...editingProduct, images: [...editingProduct.images, img]}) : setNewProduct({...newProduct, images: [...newProduct.images, img]})} buttonText="Add Image" />
                )}
              </div>
            </div>
            {/* Video Upload */}
            <div className="mb-4">
              <label className="text-[#A0A5B0] text-sm mb-2 block">Product Video (max 45 seconds, optional)</label>
              {(editingProduct ? editingProduct.video : newProduct.video) ? (
                <div className="flex items-center gap-2">
                  <video src={editingProduct ? editingProduct.video : newProduct.video} className="h-20 rounded" />
                  <button onClick={() => editingProduct ? setEditingProduct({...editingProduct, video: ""}) : setNewProduct({...newProduct, video: ""})} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">Remove</button>
                </div>
              ) : (
                <input type="file" accept="video/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 50 * 1024 * 1024) { toast({ title: "Video must be under 50MB", variant: "destructive" }); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (editingProduct) setEditingProduct({...editingProduct, video: reader.result});
                      else setNewProduct({...newProduct, video: reader.result});
                    };
                    reader.readAsDataURL(file);
                  }
                }} className="text-[#A0A5B0]" />
              )}
            </div>
            <div className="flex gap-3">
              {editingProduct ? (
                <>
                  <button onClick={updateProduct} disabled={submitting} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="px-6 py-2 border border-[#A0A5B0] text-[#A0A5B0] rounded">Cancel</button>
                </>
              ) : (
                <button onClick={addProduct} disabled={submitting} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold disabled:opacity-50">
                  {submitting ? "Adding..." : "Add Product"}
                </button>
              )}
            </div>
          </div>
        )}
        
        {loading ? (
          <p className="text-[#A0A5B0]">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-[#A0A5B0]">You haven't added any products yet. Add your first product to start selling!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[#050A14] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                <div className="relative">
                  <img src={p.images?.[0] || "https://via.placeholder.com/200"} alt={p.name} className="w-full h-40 object-cover" />
                  {p.discount_percent > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{p.discount_percent}% OFF</div>
                  )}
                  <div className="absolute top-2 left-2 bg-[#0A1628]/80 text-[#D4AF37] text-xs px-2 py-1 rounded">{p.store_category || "Everyday Chic"}</div>
                  {p.video && <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-1"><Video size={12} className="text-white" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="text-[#F5F5F0] font-bold">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[#D4AF37] font-bold">₹{(p.discount_percent > 0 ? p.discounted_price : p.price)?.toLocaleString()}</p>
                    {p.discount_percent > 0 && <p className="text-[#A0A5B0] text-sm line-through">₹{p.price?.toLocaleString()}</p>}
                  </div>
                  {p.size && <p className="text-[#A0A5B0] text-sm">Size: {p.size}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditingProduct({...p, price: p.price.toString(), discount_percent: (p.discount_percent || 0).toString(), store_category: p.store_category || "Everyday Chic", images: p.images || [], video: p.video || ""})} className="flex-1 px-3 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded text-sm flex items-center justify-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TalentDashboard = ({ talent, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(talent || {});
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioVideo, setPortfolioVideo] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch fresh talent data from API
    if (talent?.id) {
      setFetching(true);
      axios.get(`${API}/talent/${talent.id}`)
        .then(res => {
          setFormData(res.data);
          setPortfolio(res.data.portfolio_images || []);
          setPortfolioVideo(res.data.portfolio_video || "");
          localStorage.setItem("talent", JSON.stringify(res.data));
          onUpdate(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [talent?.id]);

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({...formData, profile_image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioAdd = (e) => {
    const files = Array.from(e.target.files);
    if (portfolio.length + files.length > 7) {
      toast({ title: "Max 7 images", variant: "destructive" });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPortfolio(prev => [...prev, reader.result].slice(0, 7));
      reader.readAsDataURL(file);
    });
  };

  const removePortfolio = (i) => setPortfolio(prev => prev.filter((_, idx) => idx !== i));

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast({ title: "Error", description: "Please upload a video file", variant: "destructive" });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Error", description: "Video must be less than 50MB", variant: "destructive" });
      return;
    }
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      setVideoDuration(Math.round(duration));
      
      if (duration > 45) {
        toast({ title: "Error", description: "Video must be 45 seconds or less. Your video is " + Math.round(duration) + " seconds.", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioVideo(reader.result);
        toast({ title: "Video uploaded!", description: `Duration: ${Math.round(duration)} seconds` });
      };
      reader.readAsDataURL(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = () => {
    setPortfolioVideo("");
    setVideoDuration(0);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/talent/${talent.id}`, {
        name: formData.name, phone: formData.phone, instagram_id: formData.instagram_id,
        category: formData.category, bio: formData.bio, profile_image: formData.profile_image,
        portfolio_images: portfolio,
        portfolio_video: portfolioVideo
      });
      localStorage.setItem("talent", JSON.stringify(res.data));
      onUpdate(res.data);
      toast({ title: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!talent) return <div className="min-h-screen bg-[#050A14] pt-20 text-center text-[#F5F5F0]">Please login</div>;
  if (fetching) return <div className="min-h-screen bg-[#050A14] pt-20 text-center text-[#F5F5F0]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050A14] pt-20 pb-12 px-3 md:px-4">
      <div className="max-w-4xl mx-auto bg-[#0A1628] rounded-2xl p-4 md:p-8 border border-[#D4AF37]/20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F5F5F0]">My Profile</h1>
            <p className="text-sm mt-1">
              Status: {talent.is_approved ? <span className="text-green-500">Approved ✓</span> : <span className="text-yellow-500">Pending Approval</span>}
            </p>
          </div>
          <button onClick={() => setEditing(!editing)} className="w-full md:w-auto px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-[#050A14]">
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <img src={formData.profile_image || "https://via.placeholder.com/200"} alt="" className="w-full aspect-square object-cover rounded-xl" />
            {editing && (
              <div className="mt-3">
                <ImageUploadWithCrop 
                  onImageSelect={(img) => setFormData({...formData, profile_image: img})} 
                  aspectRatio={1}
                  buttonText="Change Profile Photo"
                />
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-3">
            {editing ? (
              <>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Name" />
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Phone" />
                <input type="text" value={formData.instagram_id} onChange={e => setFormData({...formData, instagram_id: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]" placeholder="Instagram" />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0]">
                  {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] h-20" placeholder="Bio" />
                
                <div>
                  <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Images ({portfolio.length}/7) - Click to crop</p>
                  <div className="flex flex-wrap gap-3 items-center mb-2">
                    {portfolio.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="h-20 w-16 object-cover rounded" />
                        <button type="button" onClick={() => removePortfolio(i)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {portfolio.length < 7 && (
                      <ImageUploadWithCrop 
                        onImageSelect={(img) => setPortfolio(prev => [...prev, img].slice(0, 7))} 
                        aspectRatio={3/4}
                        buttonText={`Add (${portfolio.length}/7)`}
                      />
                    )}
                  </div>
                </div>

                {/* Portfolio Video */}
                <div>
                  <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Video (max 45 seconds) - Original size</p>
                  {!portfolioVideo ? (
                    <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="dash-video-upload" />
                      <label htmlFor="dash-video-upload" className="cursor-pointer">
                        <Video size={24} className="mx-auto text-[#D4AF37] mb-1" />
                        <p className="text-[#A0A5B0] text-sm">Upload video (max 45 sec)</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <video src={portfolioVideo} controls className="w-full max-h-40 rounded-lg bg-black" />
                      <button type="button" onClick={removeVideo} className="mt-2 px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm">
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>
                
                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-[#D4AF37] text-[#050A14] rounded font-bold">
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-[#F5F5F0]"><strong>Name:</strong> {talent.name}</p>
                <p className="text-[#F5F5F0]"><strong>Email:</strong> {talent.email}</p>
                <p className="text-[#F5F5F0]"><strong>Phone:</strong> {talent.phone}</p>
                <p className="text-[#F5F5F0]"><strong>Instagram:</strong> @{talent.instagram_id}</p>
                <p className="text-[#F5F5F0]"><strong>Category:</strong> {getCategoryDisplay(talent.category)}</p>
                {talent.category === "Designer Store" && talent.store_subcategories && talent.store_subcategories.length > 0 && (
                  <p className="text-[#F5F5F0]"><strong>Store Categories:</strong> <span className="text-[#D4AF37]">{talent.store_subcategories.join(", ")}</span></p>
                )}
                <p className="text-[#F5F5F0]"><strong>Votes:</strong> {talent.votes || 0}</p>
                {talent.bio && <p className="text-[#F5F5F0]"><strong>Bio:</strong> {talent.bio}</p>}
                {portfolio.length > 0 && (
                  <div>
                    <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Images</p>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.map((img, i) => <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded" />)}
                    </div>
                  </div>
                )}
                {portfolioVideo && (
                  <div>
                    <p className="text-[#A0A5B0] text-sm mb-2">Portfolio Video</p>
                    <video src={portfolioVideo} controls className="w-full max-h-40 rounded-lg bg-black" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* My Products Section - Only for Designer Store category */}
      {talent?.category === "Designer Store" && (
        <DesignerProductsSection designerId={talent.id} designerCategories={talent.store_subcategories || []} />
      )}
    </div>
  );
};

export default TalentDashboard;

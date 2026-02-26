import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, Instagram, Star, X, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/config";

// Product Card Component
export const ProductCard = ({ product, onClick }) => {
  const hasDiscount = product.discount_percent > 0;
  const displayPrice = hasDiscount ? product.discounted_price : product.price;
  
  return (
    <div 
      className="group bg-[#0A1628] rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 overflow-hidden cursor-pointer transition-all"
      onClick={() => onClick(product)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.images?.[0] || "https://via.placeholder.com/300"} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            {product.discount_percent}% OFF
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-serif text-sm font-bold text-[#F5F5F0] truncate">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-[#D4AF37] font-bold">₹{displayPrice?.toLocaleString()}</p>
          {hasDiscount && (
            <p className="text-[#A0A5B0] text-sm line-through">₹{product.price?.toLocaleString()}</p>
          )}
        </div>
        <p className="text-[#A0A5B0] text-xs mt-1 truncate">By {product.designer_name}</p>
      </div>
    </div>
  );
};

// Product Detail Modal Component
export const ProductDetailModal = ({ product, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", customer_address: "", notes: "" });
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (product?.id) {
      axios.get(`${API}/store/reviews/${product.id}`).then(res => setReviews(res.data)).catch(() => {});
    }
  }, [product?.id]);
  
  if (!product) return null;
  
  const images = product.images?.length > 0 ? product.images : ["https://via.placeholder.com/500"];
  
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.customer_name || !orderForm.customer_phone || !orderForm.customer_address) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/store/orders`, { ...orderForm, product_id: product.id });
      toast({ title: "Order placed successfully!", description: "We will contact you soon." });
      setShowOrderForm(false);
      setOrderForm({ customer_name: "", customer_email: "", customer_phone: "", customer_address: "", notes: "" });
    } catch (err) {
      toast({ title: "Failed to place order", variant: "destructive" });
    }
    setSubmitting(false);
  };
  
  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/store/reviews`, { ...reviewForm, product_id: product.id });
      toast({ title: "Review submitted!" });
      setShowReviewForm(false);
      setReviewForm({ reviewer_name: "", rating: 5, comment: "" });
      const res = await axios.get(`${API}/store/reviews/${product.id}`);
      setReviews(res.data);
    } catch (err) {
      toast({ title: "Failed to submit review", variant: "destructive" });
    }
    setSubmitting(false);
  };
  
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "No reviews";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#0A1628] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[#050A14] rounded-full text-[#F5F5F0] hover:text-[#D4AF37] z-10">
          <X size={24} />
        </button>
        
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg mb-3">
              <img src={images[currentImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setCurrentImage(i)} 
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${i === currentImage ? 'border-[#D4AF37]' : 'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#F5F5F0]">{product.name}</h2>
            <p className="text-[#A0A5B0] text-sm mt-1">By {product.designer_name}</p>
            
            <div className="mt-3 flex items-center gap-3">
              <p className="text-[#D4AF37] text-2xl font-bold">
                ₹{(product.discount_percent > 0 ? product.discounted_price : product.price)?.toLocaleString()}
              </p>
              {product.discount_percent > 0 && (
                <>
                  <p className="text-[#A0A5B0] text-lg line-through">₹{product.price?.toLocaleString()}</p>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{product.discount_percent}% OFF</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A0A5B0]"} />)}</div>
              <span className="text-[#A0A5B0] text-sm">({reviews.length} reviews)</span>
            </div>
            
            {product.description && <p className="text-[#A0A5B0] mt-4">{product.description}</p>}
            
            <div className="mt-4 space-y-2 text-sm">
              {product.size && <p className="text-[#F5F5F0]"><strong className="text-[#D4AF37]">Size:</strong> {product.size}</p>}
              {product.material && <p className="text-[#F5F5F0]"><strong className="text-[#D4AF37]">Material:</strong> {product.material}</p>}
              {product.shipping_info && <p className="text-[#F5F5F0]"><strong className="text-[#D4AF37]">Shipping:</strong> {product.shipping_info}</p>}
            </div>
            
            <button onClick={() => setShowOrderForm(true)} className="w-full mt-6 py-3 bg-[#D4AF37] text-[#050A14] font-bold rounded-lg hover:bg-[#F5F5F0] transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={20} /> Buy Now
            </button>
            
            <button onClick={() => setShowReviewForm(true)} className="w-full mt-3 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors text-sm">
              Write a Review
            </button>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <h3 className="text-[#D4AF37] font-serif text-lg mb-4">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-[#A0A5B0]">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {reviews.map(r => (
                <div key={r.id} className="bg-[#050A14] p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F5F5F0] font-bold">{r.reviewer_name}</span>
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A0A5B0]"} />)}</div>
                  </div>
                  {r.comment && <p className="text-[#A0A5B0] text-sm mt-2">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {showOrderForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowOrderForm(false)}>
            <div className="bg-[#0A1628] p-6 rounded-xl max-w-md w-full border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
              <h3 className="font-serif text-xl text-[#D4AF37] mb-4">Place Order</h3>
              <form onSubmit={handleOrder} className="space-y-4">
                <input type="text" placeholder="Your Name *" value={orderForm.customer_name} onChange={e => setOrderForm({...orderForm, customer_name: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" required />
                <input type="email" placeholder="Email" value={orderForm.customer_email} onChange={e => setOrderForm({...orderForm, customer_email: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" />
                <input type="tel" placeholder="Phone Number *" value={orderForm.customer_phone} onChange={e => setOrderForm({...orderForm, customer_phone: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" required />
                <textarea placeholder="Delivery Address *" value={orderForm.customer_address} onChange={e => setOrderForm({...orderForm, customer_address: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-24" required />
                <textarea placeholder="Any special notes..." value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-16" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowOrderForm(false)} className="flex-1 py-3 border border-[#A0A5B0] text-[#A0A5B0] rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#D4AF37] text-[#050A14] font-bold rounded-lg disabled:opacity-50">{submitting ? "Submitting..." : "Place Order"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showReviewForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowReviewForm(false)}>
            <div className="bg-[#0A1628] p-6 rounded-xl max-w-md w-full border border-[#D4AF37]/20" onClick={e => e.stopPropagation()}>
              <h3 className="font-serif text-xl text-[#D4AF37] mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <input type="text" placeholder="Your Name *" value={reviewForm.reviewer_name} onChange={e => setReviewForm({...reviewForm, reviewer_name: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0]" required />
                <div>
                  <label className="text-[#A0A5B0] text-sm">Rating</label>
                  <div className="flex gap-2 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})}>
                        <Star size={24} className={s <= reviewForm.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A0A5B0]"} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Your review..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-3 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] h-24" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-3 border border-[#A0A5B0] text-[#A0A5B0] rounded-lg">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#D4AF37] text-[#050A14] font-bold rounded-lg disabled:opacity-50">{submitting ? "Submitting..." : "Submit Review"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Designer Store Page
const DesignerStorePage = () => {
  const [storeSettings, setStoreSettings] = useState({ hero_images: [], contact_email: "", contact_phone: "", contact_instagram: "" });
  const [designers, setDesigners] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, designersRes, productsRes] = await Promise.all([
          axios.get(`${API}/store/settings`),
          axios.get(`${API}/store/designers`),
          axios.get(`${API}/store/products`)
        ]);
        setStoreSettings(settingsRes.data);
        setDesigners(designersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (storeSettings.hero_images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % storeSettings.hero_images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [storeSettings.hero_images]);
  
  const filteredProducts = selectedDesigner 
    ? products.filter(p => p.designer_id === selectedDesigner) 
    : products;
  
  const selectedDesignerInfo = selectedDesigner 
    ? designers.find(d => d.id === selectedDesigner) 
    : null;
  
  const heroImages = storeSettings.hero_images?.length > 0 
    ? storeSettings.hero_images 
    : ["https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600"];
  
  return (
    <div className="min-h-screen bg-[#050A14] pt-16">
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {heroImages.map((img, i) => (
          <div 
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt={`Designer Store ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#F5F5F0]">Designer Store</h1>
          <p className="text-[#A0A5B0] mt-2">Exclusive fashion from talented designers</p>
        </div>
        {heroImages.length > 1 && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroImages.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-[#D4AF37] w-6' : 'bg-[#F5F5F0]/50'}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-[#0A1628] py-6 border-y border-[#D4AF37]/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
            <p className="text-[#D4AF37] font-serif text-lg">Contact Us</p>
            {storeSettings.contact_email && (
              <a href={`mailto:${storeSettings.contact_email}`} className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37]">
                <Mail size={18} /> {storeSettings.contact_email}
              </a>
            )}
            {storeSettings.contact_phone && (
              <a href={`tel:${storeSettings.contact_phone}`} className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37]">
                <Phone size={18} /> {storeSettings.contact_phone}
              </a>
            )}
            {storeSettings.contact_instagram && (
              <a href={`https://instagram.com/${storeSettings.contact_instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37]">
                <Instagram size={18} /> @{storeSettings.contact_instagram}
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-serif text-2xl text-[#D4AF37] mb-6 text-center">Our Designers</h2>
        
        {loading ? (
          <p className="text-[#A0A5B0] text-center">Loading...</p>
        ) : designers.length === 0 ? (
          <p className="text-[#A0A5B0] text-center">No designers with products yet.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setSelectedDesigner(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${!selectedDesigner ? 'bg-[#D4AF37] text-[#050A14] border-[#D4AF37]' : 'border-[#D4AF37]/30 text-[#A0A5B0] hover:border-[#D4AF37]'}`}
            >
              All Products
            </button>
            {designers.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDesigner(d.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${selectedDesigner === d.id ? 'bg-[#D4AF37] text-[#050A14] border-[#D4AF37]' : 'border-[#D4AF37]/30 text-[#A0A5B0] hover:border-[#D4AF37]'}`}
              >
                <img src={d.profile_image} alt={d.name} className="w-6 h-6 rounded-full object-cover" />
                {d.name} ({d.product_count})
              </button>
            ))}
          </div>
        )}
        
        {selectedDesignerInfo && (
          <div className="bg-[#0A1628] p-6 rounded-xl mb-8 flex items-center gap-4">
            <img src={selectedDesignerInfo.profile_image} alt={selectedDesignerInfo.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37]" />
            <div>
              <h3 className="font-serif text-xl text-[#F5F5F0]">{selectedDesignerInfo.name}</h3>
              <p className="text-[#A0A5B0]">{selectedDesignerInfo.product_count} Products</p>
            </div>
          </div>
        )}
        
        <h2 className="font-serif text-2xl text-[#D4AF37] mb-6">{selectedDesigner ? `Products by ${selectedDesignerInfo?.name}` : 'All Products'}</h2>
        
        {filteredProducts.length === 0 ? (
          <p className="text-[#A0A5B0] text-center py-12">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
            ))}
          </div>
        )}
      </div>
      
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default DesignerStorePage;

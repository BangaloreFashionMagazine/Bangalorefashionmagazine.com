// Shared configuration and constants

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// BFM Logo URL
export const BFM_LOGO = "/bfm-logo.jpeg";

// Talent Categories
export const TALENT_CATEGORIES = [
  "Women | Models",
  "Men | Models",
  "Designers",
  "Designer Store",
  "Beauty",
  "Visual Stories",
  "Experiences",
  "Creative Collective"
];

// Map old categories to new for display
export const CATEGORY_DISPLAY = {
  "Model - Female": "Women | Models",
  "Model - Male": "Men | Models",
  "Makeup & Hair": "Beauty",
  "Photography": "Visual Stories",
  "Event Management": "Experiences",
  "Other": "Creative Collective",
  "Designers": "Designers"
};

// Reverse map: new category names to old database names
export const CATEGORY_DB = {
  "Women | Models": "Model - Female",
  "Men | Models": "Model - Male",
  "Beauty": "Makeup & Hair",
  "Visual Stories": "Photography",
  "Experiences": "Event Management",
  "Creative Collective": "Other",
  "Designers": "Designers"
};

export const getCategoryDisplay = (cat) => CATEGORY_DISPLAY[cat] || cat;
export const getCategoryForDB = (cat) => CATEGORY_DB[cat] || cat;

// Designer Store Categories
export const STORE_CATEGORIES = [
  { id: "Everyday Chic", label: "Everyday Chic", description: "Casuals" },
  { id: "After Dark", label: "After Dark", description: "Party" },
  { id: "Heritage Luxe", label: "Heritage Luxe", description: "Ethnic" },
  { id: "Accessories Room", label: "Accessories Room", description: "Accessories" }
];

// Store sub-categories with icons (for registration form)
export const STORE_SUBCATEGORIES = [
  { id: "Everyday Chic", label: "Everyday Chic (Casuals)", icon: "👕" },
  { id: "After Dark", label: "After Dark (Party)", icon: "✨" },
  { id: "Heritage Luxe", label: "Heritage Luxe (Ethnic)", icon: "🪔" },
  { id: "Accessories Room", label: "Accessories Room", icon: "👜" }
];

export const DEFAULT_SLIDES = [
  { image: "https://images.unsplash.com/photo-1700150594432-7024e06005c4?w=1200", category: "Editorial", title: "Spring Collection 2025", subtitle: "Editorial Fashion Photography" },
  { image: "https://images.unsplash.com/photo-1700150624576-c6c0641e54fe?w=1200", category: "Haute Couture", title: "Haute Couture Series", subtitle: "Luxury Fashion Campaign" },
  { image: "https://images.unsplash.com/photo-1611232657592-dedbfa563955?w=1200", category: "Contemporary", title: "Modern Elegance", subtitle: "Contemporary Fashion" },
  { image: "https://images.unsplash.com/photo-1679503350214-b435e5e11813?w=1200", category: "Classic", title: "Timeless Beauty", subtitle: "Classic Fashion Photography" }
];

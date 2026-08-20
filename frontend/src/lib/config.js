// Shared configuration and constants

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// BFM Logo URL
export const BFM_LOGO = "/bfm-logo.jpeg";

// Talent Categories
export const TALENT_CATEGORIES = [
  "All Talents",
  "Models – Male",
  "Models – Female",
  "Designers",
  "Photographers",
  "Makeup Artists",
  "Hair Stylists",
  "Stylists",
  "DJs",
  "Choreographers",
  "Casting Coordinators",
  "Featured Talents"
];

// Magazine Categories
export const MAGAZINE_CATEGORIES = [
  "Latest Issues",
  "Talent Spotlight",
  "Editorials"
];

// Map old categories to new for display
export const CATEGORY_DISPLAY = {
  "Model - Female": "Models – Female",
  "Model - Male": "Models – Male",
  "Makeup & Hair": "Makeup Artists",
  "Photography": "Photographers",
  "Event Management": "Choreographers",
  "Other": "Stylists",
  "Designers": "Designers",
  "Hair Stylists": "Hair Stylists",
  "DJs": "DJs",
  "Casting Coordinators": "Casting Coordinators"
};

// Reverse map: new category names to old database names
export const CATEGORY_DB = {
  "All Talents": "All",
  "Models – Male": "Model - Male",
  "Models – Female": "Model - Female",
  "Designers": "Designers",
  "Photographers": "Photography",
  "Makeup Artists": "Makeup & Hair",
  "Hair Stylists": "Hair Stylists",
  "Stylists": "Stylists",
  "DJs": "DJs",
  "Choreographers": "Choreographers",
  "Casting Coordinators": "Casting Coordinators",
  "Featured Talents": "Featured"
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

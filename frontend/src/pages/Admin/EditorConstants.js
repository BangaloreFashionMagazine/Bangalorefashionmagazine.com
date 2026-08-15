// BFM Magazine Editor - Constants and Configurations

// Page Size Presets
export const PAGE_SIZES = {
  bfm_standard: { name: "BFM Standard", width: 816, height: 1056, ratio: "3:4" },
  a4_portrait: { name: "A4 Portrait", width: 595, height: 842, ratio: "1:1.41" },
  a4_landscape: { name: "A4 Landscape", width: 842, height: 595, ratio: "1.41:1" },
  a5_portrait: { name: "A5 Portrait", width: 420, height: 595, ratio: "1:1.41" },
  a5_landscape: { name: "A5 Landscape", width: 595, height: 420, ratio: "1.41:1" },
  letter_portrait: { name: "Letter Portrait", width: 612, height: 792, ratio: "1:1.29" },
  letter_landscape: { name: "Letter Landscape", width: 792, height: 612, ratio: "1.29:1" },
  instagram_square: { name: "Instagram Square", width: 1080, height: 1080, ratio: "1:1" },
  instagram_portrait: { name: "Instagram Portrait", width: 1080, height: 1350, ratio: "4:5" },
  instagram_story: { name: "Instagram Story", width: 1080, height: 1920, ratio: "9:16" },
  custom: { name: "Custom Size", width: 816, height: 1056, ratio: "custom" }
};

// Text Style Presets
export const TEXT_STYLES = {
  cover_title: {
    name: "Cover Title",
    fontSize: "72px",
    fontWeight: "800",
    fontFamily: "'Playfair Display', serif",
    letterSpacing: "4px",
    lineHeight: "1.1",
    textTransform: "uppercase"
  },
  cover_subtitle: {
    name: "Cover Subtitle",
    fontSize: "24px",
    fontWeight: "400",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "6px",
    lineHeight: "1.4",
    textTransform: "uppercase"
  },
  main_headline: {
    name: "Main Headline",
    fontSize: "48px",
    fontWeight: "700",
    fontFamily: "'Playfair Display', serif",
    letterSpacing: "2px",
    lineHeight: "1.2"
  },
  subheadline: {
    name: "Subheadline",
    fontSize: "24px",
    fontWeight: "600",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "1px",
    lineHeight: "1.3"
  },
  section_heading: {
    name: "Section Heading",
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: "4px",
    lineHeight: "1.4",
    textTransform: "uppercase"
  },
  article_heading: {
    name: "Article Heading",
    fontSize: "32px",
    fontWeight: "600",
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "1px",
    lineHeight: "1.3"
  },
  body: {
    name: "Body Text",
    fontSize: "14px",
    fontWeight: "400",
    fontFamily: "'Lato', sans-serif",
    letterSpacing: "0.5px",
    lineHeight: "1.7"
  },
  quote: {
    name: "Quote",
    fontSize: "28px",
    fontWeight: "300",
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    letterSpacing: "1px",
    lineHeight: "1.5"
  },
  caption: {
    name: "Caption",
    fontSize: "11px",
    fontWeight: "400",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "0.5px",
    lineHeight: "1.4"
  },
  credit: {
    name: "Credit",
    fontSize: "10px",
    fontWeight: "500",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "1px",
    lineHeight: "1.3",
    textTransform: "uppercase"
  },
  small_text: {
    name: "Small Text",
    fontSize: "10px",
    fontWeight: "400",
    fontFamily: "'Lato', sans-serif",
    letterSpacing: "0.3px",
    lineHeight: "1.5"
  },
  footer: {
    name: "Footer",
    fontSize: "9px",
    fontWeight: "400",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "1px",
    lineHeight: "1.4"
  }
};

// Color Palettes
export const COLOR_PALETTES = {
  bfm_gold_black: {
    name: "BFM Gold & Black",
    colors: {
      primary: "#000000",
      secondary: "#0A0A0A",
      accent: "#D4AF37",
      text: "#FFFFFF",
      muted: "#A0A5B0",
      highlight: "#F5D76E"
    }
  },
  minimal_white: {
    name: "Minimal White",
    colors: {
      primary: "#FFFFFF",
      secondary: "#F5F5F5",
      accent: "#000000",
      text: "#1A1A1A",
      muted: "#666666",
      highlight: "#D4AF37"
    }
  },
  luxury_beige: {
    name: "Luxury Beige",
    colors: {
      primary: "#F5F0E8",
      secondary: "#E8E0D5",
      accent: "#8B7355",
      text: "#2C2416",
      muted: "#9C8B7A",
      highlight: "#D4AF37"
    }
  },
  editorial_black: {
    name: "Editorial Black",
    colors: {
      primary: "#1A1A1A",
      secondary: "#2D2D2D",
      accent: "#FFFFFF",
      text: "#F0F0F0",
      muted: "#888888",
      highlight: "#D4AF37"
    }
  },
  fashion_pink: {
    name: "Fashion Pink",
    colors: {
      primary: "#FFF5F5",
      secondary: "#FFE4E6",
      accent: "#BE185D",
      text: "#1F1F1F",
      muted: "#9CA3AF",
      highlight: "#EC4899"
    }
  },
  modern_blue: {
    name: "Modern Blue",
    colors: {
      primary: "#0F172A",
      secondary: "#1E293B",
      accent: "#3B82F6",
      text: "#F1F5F9",
      muted: "#64748B",
      highlight: "#60A5FA"
    }
  }
};

// Font Families
export const FONT_FAMILIES = [
  { name: "Playfair Display", value: "'Playfair Display', serif", category: "Serif" },
  { name: "Cormorant Garamond", value: "'Cormorant Garamond', serif", category: "Serif" },
  { name: "Lora", value: "'Lora', serif", category: "Serif" },
  { name: "Merriweather", value: "'Merriweather', serif", category: "Serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif", category: "Sans-Serif" },
  { name: "Lato", value: "'Lato', sans-serif", category: "Sans-Serif" },
  { name: "Roboto", value: "'Roboto', sans-serif", category: "Sans-Serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif", category: "Sans-Serif" },
  { name: "Poppins", value: "'Poppins', sans-serif", category: "Sans-Serif" },
  { name: "Oswald", value: "'Oswald', sans-serif", category: "Sans-Serif" },
  { name: "Raleway", value: "'Raleway', sans-serif", category: "Sans-Serif" },
  { name: "Dancing Script", value: "'Dancing Script', cursive", category: "Script" },
  { name: "Great Vibes", value: "'Great Vibes', cursive", category: "Script" },
  { name: "Pacifico", value: "'Pacifico', cursive", category: "Script" }
];

// Image Layouts
export const IMAGE_LAYOUTS = {
  single: {
    full_page: { name: "Full Page", cols: 1, positions: [{ x: 0, y: 0, w: 100, h: 100 }] },
    full_width: { name: "Full Width", cols: 1, positions: [{ x: 0, y: 20, w: 100, h: 60 }] },
    half_page: { name: "Half Page", cols: 1, positions: [{ x: 10, y: 10, w: 80, h: 45 }] },
    quarter_page: { name: "Quarter Page", cols: 1, positions: [{ x: 10, y: 10, w: 40, h: 40 }] }
  },
  multiple: {
    two_images: { name: "2 Images", cols: 2, positions: [{ x: 5, y: 10, w: 43, h: 60 }, { x: 52, y: 10, w: 43, h: 60 }] },
    three_images: { name: "3 Images", cols: 3, positions: [{ x: 5, y: 10, w: 28, h: 50 }, { x: 36, y: 10, w: 28, h: 50 }, { x: 67, y: 10, w: 28, h: 50 }] },
    four_images: { name: "4 Images Grid", cols: 2, positions: [{ x: 5, y: 5, w: 43, h: 43 }, { x: 52, y: 5, w: 43, h: 43 }, { x: 5, y: 52, w: 43, h: 43 }, { x: 52, y: 52, w: 43, h: 43 }] },
    six_images: { name: "6 Images Grid", cols: 3, positions: [{ x: 3, y: 3, w: 30, h: 30 }, { x: 35, y: 3, w: 30, h: 30 }, { x: 67, y: 3, w: 30, h: 30 }, { x: 3, y: 36, w: 30, h: 30 }, { x: 35, y: 36, w: 30, h: 30 }, { x: 67, y: 36, w: 30, h: 30 }] }
  },
  editorial: {
    large_small: { name: "Large + Small", positions: [{ x: 5, y: 5, w: 60, h: 70 }, { x: 68, y: 5, w: 27, h: 33 }, { x: 68, y: 42, w: 27, h: 33 }] },
    hero_gallery: { name: "Hero + Gallery", positions: [{ x: 5, y: 5, w: 90, h: 50 }, { x: 5, y: 58, w: 28, h: 35 }, { x: 36, y: 58, w: 28, h: 35 }, { x: 67, y: 58, w: 28, h: 35 }] },
    asymmetrical: { name: "Asymmetrical", positions: [{ x: 5, y: 5, w: 45, h: 55 }, { x: 52, y: 5, w: 43, h: 35 }, { x: 52, y: 43, w: 43, h: 52 }] }
  }
};

// Shape Types
export const SHAPE_TYPES = [
  { id: "rectangle", name: "Rectangle", icon: "◻" },
  { id: "rounded", name: "Rounded Rectangle", icon: "▢" },
  { id: "circle", name: "Circle", icon: "●" },
  { id: "oval", name: "Oval", icon: "⬭" },
  { id: "triangle", name: "Triangle", icon: "△" },
  { id: "line_h", name: "Horizontal Line", icon: "—" },
  { id: "line_v", name: "Vertical Line", icon: "|" },
  { id: "line_d", name: "Diagonal Line", icon: "/" }
];

// Button/CTA Presets
export const BUTTON_PRESETS = [
  { id: "read_more", text: "Read More", style: "primary" },
  { id: "view_profile", text: "View Profile", style: "primary" },
  { id: "visit_website", text: "Visit Website", style: "secondary" },
  { id: "follow_instagram", text: "Follow on Instagram", style: "instagram" },
  { id: "book_now", text: "Book Now", style: "accent" },
  { id: "contact", text: "Contact", style: "outline" },
  { id: "get_directions", text: "Get Directions", style: "secondary" },
  { id: "hire_talent", text: "Hire Talent", style: "primary" }
];

// Social Icons
export const SOCIAL_ICONS = [
  { id: "instagram", name: "Instagram", icon: "instagram" },
  { id: "facebook", name: "Facebook", icon: "facebook" },
  { id: "twitter", name: "Twitter/X", icon: "twitter" },
  { id: "youtube", name: "YouTube", icon: "youtube" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin" },
  { id: "whatsapp", name: "WhatsApp", icon: "message-circle" },
  { id: "website", name: "Website", icon: "globe" },
  { id: "email", name: "Email", icon: "mail" },
  { id: "phone", name: "Phone", icon: "phone" }
];

// Section Divider Categories
export const SECTION_CATEGORIES = [
  "FASHION",
  "BEAUTY",
  "JEWELLERY",
  "LIFESTYLE",
  "BANGALORE",
  "EVENTS",
  "INTERVIEWS",
  "SPOTLIGHT",
  "DESIGNERS",
  "MODELS",
  "PHOTOGRAPHY"
];

// Export Formats
export const EXPORT_FORMATS = {
  pdf_high: { name: "PDF (High Quality)", dpi: 300, format: "pdf" },
  pdf_web: { name: "PDF (Web)", dpi: 150, format: "pdf" },
  pdf_print: { name: "PDF (Print Ready)", dpi: 300, format: "pdf", bleed: true },
  instagram_post: { name: "Instagram Post", width: 1080, height: 1350, format: "jpg" },
  instagram_square: { name: "Instagram Square", width: 1080, height: 1080, format: "jpg" },
  instagram_story: { name: "Instagram Story", width: 1080, height: 1920, format: "jpg" }
};

// Grid Settings
export const GRID_PRESETS = {
  magazine_12: { name: "12 Column Magazine", columns: 12, gutter: 20, margin: 40 },
  magazine_6: { name: "6 Column Layout", columns: 6, gutter: 24, margin: 48 },
  simple_3: { name: "3 Column Simple", columns: 3, gutter: 32, margin: 40 },
  two_column: { name: "2 Column Article", columns: 2, gutter: 40, margin: 60 }
};

// Default Margins
export const MARGIN_PRESETS = {
  standard: { name: "Standard", top: 40, bottom: 40, left: 40, right: 40 },
  narrow: { name: "Narrow", top: 20, bottom: 20, left: 20, right: 20 },
  wide: { name: "Wide", top: 60, bottom: 60, left: 60, right: 60 },
  bleed: { name: "Full Bleed", top: 0, bottom: 0, left: 0, right: 0 }
};

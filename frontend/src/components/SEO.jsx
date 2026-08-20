import { useEffect } from 'react';

/**
 * SEO Component - Updates document head with meta tags
 * Usage: <SEOHead title="Page Title" description="..." />
 */
const SEOHead = ({ 
  title = "Bangalore Fashion Magazine | BFM",
  description = "Discover professional fashion talent in Bangalore. Models, designers, photographers, makeup artists and more. Join BFM today.",
  keywords = "bangalore fashion, fashion magazine, bangalore models, fashion photographers, designers bangalore",
  image = "",
  url = "",
  type = "website",
  twitterCard = "summary_large_image"
}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Helper to update or create meta tag
    const updateMeta = (property, content, isProperty = true) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Standard meta tags
    updateMeta('description', description, false);
    updateMeta('keywords', keywords, false);
    
    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:type', type);
    if (url) updateMeta('og:url', url);
    if (image) updateMeta('og:image', image);
    updateMeta('og:site_name', 'Bangalore Fashion Magazine');
    
    // Twitter Card tags
    updateMeta('twitter:card', twitterCard, false);
    updateMeta('twitter:title', title, false);
    updateMeta('twitter:description', description, false);
    if (image) updateMeta('twitter:image', image, false);
    
    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }
  }, [title, description, keywords, image, url, type, twitterCard]);
  
  return null;
};

/**
 * Structured Data Component - Adds JSON-LD schema
 */
const StructuredData = ({ data }) => {
  useEffect(() => {
    // Remove existing schema
    const existing = document.querySelector('script[data-schema="bfm"]');
    if (existing) existing.remove();
    
    // Add new schema
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-schema', 'bfm');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    
    return () => {
      script.remove();
    };
  }, [data]);
  
  return null;
};

/**
 * Breadcrumb Component with Schema
 */
const Breadcrumbs = ({ items }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  
  return (
    <>
      <StructuredData data={schemaData} />
      <nav aria-label="Breadcrumb" className="text-sm mb-4">
        <ol className="flex items-center gap-2 text-[#A0A5B0]">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#D4AF37]/50">›</span>}
              {i === items.length - 1 ? (
                <span className="text-[#F5F5F0]">{item.name}</span>
              ) : (
                <a href={item.url} className="hover:text-[#D4AF37] transition-colors">
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

/**
 * Generate alt text for talent images
 */
const generateAltText = (talentName, category, context = "profile") => {
  const categoryMap = {
    "Model - Female": "female fashion model",
    "Model - Male": "male fashion model",
    "Models – Female": "female fashion model",
    "Models – Male": "male fashion model",
    "Photography": "fashion photographer",
    "Photographers": "fashion photographer",
    "Designers": "fashion designer",
    "Makeup & Hair": "makeup artist",
    "Makeup Artists": "makeup artist",
    "Hair Stylists": "hair stylist",
    "Stylists": "fashion stylist",
    "DJs": "DJ",
    "Choreographers": "choreographer",
    "Casting Coordinators": "casting coordinator"
  };
  
  const profession = categoryMap[category] || "fashion talent";
  
  if (context === "profile") {
    return `${talentName} - ${profession} in Bangalore featured by Bangalore Fashion Magazine`;
  } else if (context === "portfolio") {
    return `${talentName} ${profession} portfolio photo - Bangalore Fashion Magazine`;
  } else if (context === "hero") {
    return `${talentName} - Featured ${profession} on BFM homepage`;
  }
  
  return `${talentName} - ${profession} - BFM`;
};

export { SEOHead, StructuredData, Breadcrumbs, generateAltText };

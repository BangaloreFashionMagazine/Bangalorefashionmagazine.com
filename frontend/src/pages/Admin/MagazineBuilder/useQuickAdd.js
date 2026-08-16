import { useCallback } from 'react';

/**
 * Custom hook for Quick Add functionality (preset text/image boxes)
 */
export const useQuickAdd = ({ pages, currentPageIndex, setPages, setSelectedElement, saveToHistory, setShowQuickAddPanel }) => {
  
  // Add a quick text box with preset styles
  const addQuickTextBox = useCallback((preset) => {
    const presets = {
      heading: { 
        content: "Add Heading", 
        style: { fontSize: "36px", fontWeight: "700", color: "#FFFFFF", fontFamily: "'Playfair Display', serif", textAlign: "center", lineHeight: "1.2" },
        position: { x: 10, y: 10, width: 80, height: 8 }
      },
      subheading: { 
        content: "Add Subheading", 
        style: { fontSize: "20px", fontWeight: "500", color: "#D4AF37", fontFamily: "'Montserrat', sans-serif", textAlign: "center", lineHeight: "1.4" },
        position: { x: 15, y: 20, width: 70, height: 6 }
      },
      body: { 
        content: "Add your body text here. This is a paragraph that can contain multiple lines of text. Edit this content to match your needs.", 
        style: { fontSize: "14px", fontWeight: "400", color: "#F5F5F0", fontFamily: "'Lato', sans-serif", textAlign: "left", lineHeight: "1.7" },
        position: { x: 10, y: 30, width: 80, height: 15 }
      },
      quote: { 
        content: "\"Add an inspiring quote here\"", 
        style: { fontSize: "24px", fontWeight: "300", color: "#D4AF37", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", textAlign: "center", lineHeight: "1.5" },
        position: { x: 10, y: 40, width: 80, height: 10 }
      },
      caption: { 
        content: "Photo caption or credit", 
        style: { fontSize: "11px", fontWeight: "400", color: "#A0A5B0", fontFamily: "'Montserrat', sans-serif", textAlign: "center", lineHeight: "1.3" },
        position: { x: 20, y: 85, width: 60, height: 4 }
      }
    };
    
    const p = presets[preset];
    const newElement = {
      id: `el_${Date.now()}`,
      type: 'text',
      content: p.content,
      style: { ...p.style, opacity: 1, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' },
      position: p.position,
      layer: pages[currentPageIndex]?.elements?.length || 0,
      locked: false,
      visible: true,
      name: `${preset.charAt(0).toUpperCase() + preset.slice(1)} Text`
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
    setShowQuickAddPanel(false);
  }, [pages, currentPageIndex, setPages, setSelectedElement, saveToHistory, setShowQuickAddPanel]);
  
  // Add a quick image placeholder box
  const addQuickImageBox = useCallback((preset) => {
    const presets = {
      full: { position: { x: 0, y: 0, width: 100, height: 100 }, name: "Full Page Image" },
      half_top: { position: { x: 0, y: 0, width: 100, height: 50 }, name: "Half Page Top" },
      half_bottom: { position: { x: 0, y: 50, width: 100, height: 50 }, name: "Half Page Bottom" },
      square: { position: { x: 25, y: 20, width: 50, height: 40 }, name: "Square Image" },
      portrait: { position: { x: 30, y: 10, width: 40, height: 60 }, name: "Portrait Image" },
      sidebar: { position: { x: 70, y: 10, width: 25, height: 80 }, name: "Sidebar Image" }
    };
    
    const p = presets[preset];
    const newElement = {
      id: `el_${Date.now()}`,
      type: 'image',
      content: '',
      style: { opacity: 1, objectFit: 'cover', borderRadius: '0px' },
      position: p.position,
      layer: pages[currentPageIndex]?.elements?.length || 0,
      locked: false,
      visible: true,
      name: p.name
    };
    
    const newPages = pages.map((page, pIdx) => {
      if (pIdx !== currentPageIndex) return page;
      return { ...page, elements: [...page.elements, newElement] };
    });
    setPages(newPages);
    setSelectedElement(newElement.id);
    saveToHistory(newPages);
    setShowQuickAddPanel(false);
  }, [pages, currentPageIndex, setPages, setSelectedElement, saveToHistory, setShowQuickAddPanel]);
  
  return { addQuickTextBox, addQuickImageBox };
};

export default useQuickAdd;

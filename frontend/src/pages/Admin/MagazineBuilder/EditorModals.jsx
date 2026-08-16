import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Save as Template Modal
export const SaveTemplateModal = ({
  show,
  onClose,
  templateName,
  setTemplateName,
  saveAsTemplate,
  savedTemplates,
  loadTemplate,
  deleteTemplate
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0A1628] rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Save as Template</h3>
        <p className="text-[#A0A5B0] text-sm mb-4">Save this magazine layout as a reusable template for future magazines.</p>
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template name (e.g., 'Model Feature Layout')"
          className="bg-[#050A14] border-[#D4AF37]/30 text-[#F5F5F0] mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#D4AF37]/30 text-[#F5F5F0]">
            Cancel
          </Button>
          <Button onClick={saveAsTemplate} className="bg-[#D4AF37] text-[#050A14]">
            Save Template
          </Button>
        </div>
        
        {/* Show existing templates */}
        {savedTemplates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#D4AF37]/20">
            <h4 className="text-[#F5F5F0] font-medium mb-3">Your Saved Templates</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedTemplates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-[#050A14] rounded">
                  <div>
                    <p className="text-[#F5F5F0] text-sm">{t.name}</p>
                    <p className="text-[#A0A5B0] text-xs">{t.pageCount} pages</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { loadTemplate(t); onClose(); }} className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-xs hover:bg-[#D4AF37]/30">
                      Load
                    </button>
                    <button onClick={() => deleteTemplate(t.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile Preview Modal
export const MobilePreviewModal = ({
  show,
  onClose,
  mobilePreviewDevice,
  setMobilePreviewDevice,
  currentPage,
  currentPageIndex,
  setCurrentPageIndex,
  pages,
  pageSize,
  currentElements
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        {/* Device selector */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-[#0A1628] rounded-full p-1">
          <button 
            onClick={() => setMobilePreviewDevice('iphone')}
            className={`px-3 py-1 rounded-full text-xs ${mobilePreviewDevice === 'iphone' ? 'bg-[#D4AF37] text-[#050A14]' : 'text-[#A0A5B0]'}`}
          >
            iPhone
          </button>
          <button 
            onClick={() => setMobilePreviewDevice('android')}
            className={`px-3 py-1 rounded-full text-xs ${mobilePreviewDevice === 'android' ? 'bg-[#D4AF37] text-[#050A14]' : 'text-[#A0A5B0]'}`}
          >
            Android
          </button>
          <button 
            onClick={() => setMobilePreviewDevice('tablet')}
            className={`px-3 py-1 rounded-full text-xs ${mobilePreviewDevice === 'tablet' ? 'bg-[#D4AF37] text-[#050A14]' : 'text-[#A0A5B0]'}`}
          >
            Tablet
          </button>
        </div>
        
        {/* Phone frame */}
        <div 
          className={`bg-[#1a1a1a] rounded-[40px] p-3 shadow-2xl ${
            mobilePreviewDevice === 'tablet' ? 'w-[500px]' : 'w-[320px]'
          }`}
          style={{
            border: '4px solid #333',
            boxShadow: '0 0 0 2px #555, 0 10px 40px rgba(0,0,0,0.5)'
          }}
        >
          {/* Notch */}
          {mobilePreviewDevice !== 'tablet' && (
            <div className="w-20 h-5 bg-[#1a1a1a] rounded-b-xl mx-auto mb-2" />
          )}
          
          {/* Screen */}
          <div 
            className={`bg-white rounded-[30px] overflow-hidden ${
              mobilePreviewDevice === 'tablet' ? 'h-[700px]' : 'h-[600px]'
            }`}
          >
            <div 
              className="w-full h-full overflow-y-auto"
              style={{
                transform: mobilePreviewDevice === 'tablet' ? 'scale(0.5)' : 'scale(0.35)',
                transformOrigin: 'top left',
                width: mobilePreviewDevice === 'tablet' ? '200%' : '285%',
                height: mobilePreviewDevice === 'tablet' ? '200%' : '285%'
              }}
            >
              {/* Render current page content */}
              {currentPage && (
                <div
                  style={{
                    width: pageSize.width,
                    height: pageSize.height,
                    backgroundColor: currentPage.background?.color || '#000',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {currentElements
                    .filter(el => el.visible !== false)
                    .sort((a, b) => a.layer - b.layer)
                    .map(el => (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.position.x}%`,
                          top: `${el.position.y}%`,
                          width: `${el.position.width}%`,
                          height: `${el.position.height}%`,
                          ...el.style,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {el.type === 'text' && el.content}
                        {el.type === 'image' && el.content && (
                          <img src={el.content} alt="" style={{ width: '100%', height: '100%', objectFit: el.style?.objectFit || 'cover' }} />
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
          
          {/* Home indicator */}
          <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-2" />
        </div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-[#D4AF37]"
        >
          ✕ Close
        </button>
        
        {/* Page navigation */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button 
            onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-2 bg-[#0A1628] rounded-full text-[#D4AF37] disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white text-sm">Page {currentPageIndex + 1} of {pages.length}</span>
          <button 
            onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === pages.length - 1}
            className="p-2 bg-[#0A1628] rounded-full text-[#D4AF37] disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default {
  SaveTemplateModal,
  MobilePreviewModal
};

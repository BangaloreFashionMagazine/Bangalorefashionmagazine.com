import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, Type, ImagePlus, Square, Circle, Minus, FolderOpen, Layout,
  RotateCcw, RotateCw, Copy, Clipboard, Trash2, Grid, Layers, Eye,
  Lock, Unlock, ChevronUp, ChevronDown, Save, FileDown, Download,
  ChevronDown as ChevronDownIcon, BookOpen, Phone
} from "lucide-react";

// Quick Add Panel for preset text/image boxes
export const QuickAddPanel = ({ 
  showPanel, 
  setShowPanel, 
  addQuickTextBox, 
  addQuickImageBox 
}) => {
  if (!showPanel) return null;
  
  return (
    <div className="absolute top-8 left-0 bg-[#0A1628] border border-[#D4AF37]/30 rounded-lg shadow-xl z-50 w-56 py-2">
      <p className="px-3 py-1 text-[10px] text-[#D4AF37] uppercase font-bold">📝 Text Boxes</p>
      <button onClick={() => addQuickTextBox('heading')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20 flex items-center gap-2">
        <span className="text-lg font-bold">H</span> Heading
      </button>
      <button onClick={() => addQuickTextBox('subheading')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20 flex items-center gap-2">
        <span className="text-base font-medium">H2</span> Subheading
      </button>
      <button onClick={() => addQuickTextBox('body')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20 flex items-center gap-2">
        <span className="text-sm">¶</span> Body Text
      </button>
      <button onClick={() => addQuickTextBox('quote')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20 flex items-center gap-2">
        <span className="text-lg italic">&quot;</span> Quote
      </button>
      <button onClick={() => addQuickTextBox('caption')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20 flex items-center gap-2">
        <span className="text-[10px]">Aa</span> Caption
      </button>
      
      <div className="border-t border-[#D4AF37]/20 my-2" />
      
      <p className="px-3 py-1 text-[10px] text-[#D4AF37] uppercase font-bold">🖼️ Image Boxes</p>
      <button onClick={() => addQuickImageBox('full')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">▣ Full Page</button>
      <button onClick={() => addQuickImageBox('half_top')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">▤ Half Top</button>
      <button onClick={() => addQuickImageBox('half_bottom')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">▥ Half Bottom</button>
      <button onClick={() => addQuickImageBox('square')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">◻ Square Center</button>
      <button onClick={() => addQuickImageBox('portrait')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">▯ Portrait</button>
      <button onClick={() => addQuickImageBox('sidebar')} className="w-full text-left px-3 py-2 text-xs text-[#F5F5F0] hover:bg-[#D4AF37]/20">▐ Sidebar</button>
    </div>
  );
};

// Add Elements Toolbar Section
export const AddElementsToolbar = ({
  showQuickAddPanel,
  setShowQuickAddPanel,
  addQuickTextBox,
  addQuickImageBox,
  addElement,
  setShowMediaLibrary,
  setShowMasterPages
}) => (
  <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
    <div className="relative">
      <button 
        onClick={() => setShowQuickAddPanel(!showQuickAddPanel)} 
        className={`p-1.5 rounded flex items-center gap-1 ${showQuickAddPanel ? 'bg-[#D4AF37] text-[#050A14]' : 'hover:bg-[#D4AF37]/20'}`}
        title="Quick Add (Presets)"
        data-testid="quick-add-btn"
      >
        <Plus size={14} className={showQuickAddPanel ? 'text-[#050A14]' : 'text-[#D4AF37]'} />
        <ChevronDownIcon size={10} className={showQuickAddPanel ? 'text-[#050A14]' : 'text-[#A0A5B0]'} />
      </button>
      <QuickAddPanel 
        showPanel={showQuickAddPanel}
        setShowPanel={setShowQuickAddPanel}
        addQuickTextBox={addQuickTextBox}
        addQuickImageBox={addQuickImageBox}
      />
    </div>
    
    <button onClick={() => addElement('text')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Text (T)" data-testid="add-text-btn">
      <Type size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => addElement('image')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Image" data-testid="add-image-btn">
      <ImagePlus size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => addElement('shape', 'rectangle')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Rectangle" data-testid="add-rectangle-btn">
      <Square size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => addElement('shape', 'circle')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Circle" data-testid="add-circle-btn">
      <Circle size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => addElement('shape', 'line')} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Add Line/Divider" data-testid="add-line-btn">
      <Minus size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => setShowMediaLibrary(true)} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Media Library" data-testid="media-library-btn">
      <FolderOpen size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => setShowMasterPages(true)} className="p-1.5 hover:bg-[#D4AF37]/20 rounded" title="Master Pages (Headers/Footers)" data-testid="master-pages-btn">
      <Layout size={14} className="text-[#A0A5B0]" />
    </button>
  </div>
);

// History Toolbar Section
export const HistoryToolbar = ({ undo, redo, historyIndex, historyLength }) => (
  <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
    <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Undo (Ctrl+Z)" data-testid="undo-btn">
      <RotateCcw size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={redo} disabled={historyIndex >= historyLength - 1} className="p-1.5 hover:bg-[#D4AF37]/20 rounded disabled:opacity-30" title="Redo (Ctrl+Y)" data-testid="redo-btn">
      <RotateCw size={14} className="text-[#A0A5B0]" />
    </button>
  </div>
);

// View Controls Toolbar Section
export const ViewControlsToolbar = ({ 
  showGrid, setShowGrid,
  showLayers, setShowLayers,
  previewMode, setPreviewMode,
  showMobilePreview, setShowMobilePreview
}) => (
  <div className="flex items-center gap-0.5 border-r border-[#D4AF37]/20 pr-2 mr-1">
    <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded ${showGrid ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Toggle Grid" data-testid="toggle-grid-btn">
      <Grid size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => setShowLayers(!showLayers)} className={`p-1.5 rounded ${showLayers ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Toggle Layers Panel" data-testid="toggle-layers-btn">
      <Layers size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => setPreviewMode(!previewMode)} className={`p-1.5 rounded ${previewMode ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Preview Mode" data-testid="preview-mode-btn">
      <Eye size={14} className="text-[#A0A5B0]" />
    </button>
    <button onClick={() => setShowMobilePreview(!showMobilePreview)} className={`p-1.5 rounded ${showMobilePreview ? 'bg-[#D4AF37]/20' : 'hover:bg-[#D4AF37]/20'}`} title="Mobile Preview" data-testid="mobile-preview-btn">
      <Phone size={14} className="text-[#A0A5B0]" />
    </button>
  </div>
);

// Export Buttons Toolbar Section
export const ExportToolbar = ({
  saveMagazine,
  loading,
  setShowSaveTemplateModal,
  exportToPDF,
  exportForInstagram
}) => (
  <>
    <Button onClick={() => saveMagazine(false)} disabled={loading} size="sm" className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] h-8 px-3" data-testid="save-magazine-btn">
      <Save size={12} className="mr-1" /> Save
    </Button>
    <Button onClick={() => setShowSaveTemplateModal(true)} size="sm" className="bg-[#0A1628] border border-[#D4AF37]/50 text-[#D4AF37]/80 hover:bg-[#D4AF37]/20 h-8 px-2" title="Save as Template" data-testid="save-template-btn">
      <BookOpen size={12} />
    </Button>
    <Button onClick={exportToPDF} size="sm" className="bg-[#D4AF37] text-[#050A14] h-8 px-3" data-testid="export-pdf-btn">
      <FileDown size={12} className="mr-1" /> PDF
    </Button>
    <div className="relative">
      <Button 
        size="sm" 
        className="bg-[#0A1628] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050A14] h-8 px-3"
        onClick={(e) => {
          const dropdown = e.currentTarget.nextElementSibling;
          dropdown.classList.toggle('hidden');
        }}
        data-testid="export-instagram-btn"
      >
        <Download size={12} className="mr-1" /> IG
      </Button>
      <div className="absolute right-0 top-full mt-1 bg-[#0A1628] border border-[#D4AF37]/30 rounded shadow-lg hidden z-50 min-w-[140px]">
        <button onClick={() => exportForInstagram('portrait')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-portrait">Portrait (1080×1350)</button>
        <button onClick={() => exportForInstagram('square')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-square">Square (1080×1080)</button>
        <button onClick={() => exportForInstagram('story')} className="block w-full px-3 py-2 text-xs text-left hover:bg-[#D4AF37]/20 text-[#F5F5F0]" data-testid="export-ig-story">Story (1080×1920)</button>
      </div>
    </div>
  </>
);

export default {
  QuickAddPanel,
  AddElementsToolbar,
  HistoryToolbar,
  ViewControlsToolbar,
  ExportToolbar
};

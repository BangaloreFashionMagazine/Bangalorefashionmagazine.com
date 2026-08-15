// BFM Magazine Editor - UI Components
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, ChevronUp, Copy, Trash2, Eye, EyeOff, Lock, Unlock,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  RotateCcw, FlipHorizontal, FlipVertical, Maximize2, Minimize2,
  Sun, Contrast, Droplets, Sparkles, Image as ImageIcon,
  Type, Square, Circle, Minus, Grid, Layout, Palette
} from 'lucide-react';

// Page Size Selector Component
export const PageSizeSelector = ({ currentSize, onSizeChange, pageSizes }) => {
  const [showCustom, setShowCustom] = useState(currentSize?.ratio === 'custom');
  const [customWidth, setCustomWidth] = useState(currentSize?.width || 816);
  const [customHeight, setCustomHeight] = useState(currentSize?.height || 1056);

  return (
    <div className="space-y-3">
      <label className="text-[#A0A5B0] text-xs uppercase tracking-wider">Page Size</label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(pageSizes).map(([key, size]) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'custom') {
                setShowCustom(true);
              } else {
                setShowCustom(false);
                onSizeChange(key, size);
              }
            }}
            className={`p-2 rounded text-xs text-left transition-all ${
              currentSize?.name === size.name 
                ? 'bg-[#D4AF37] text-[#050A14]' 
                : 'bg-[#050A14] text-[#F5F5F0] hover:bg-[#D4AF37]/20'
            }`}
          >
            <div className="font-medium">{size.name}</div>
            <div className="text-[10px] opacity-70">{size.width} × {size.height}px</div>
          </button>
        ))}
      </div>
      
      {showCustom && (
        <div className="space-y-2 p-3 bg-[#050A14] rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#A0A5B0] text-[10px]">Width (px)</label>
              <Input 
                type="number" 
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 816)}
                className="bg-[#0A1628] border-[#D4AF37]/20 h-7 text-xs"
              />
            </div>
            <div>
              <label className="text-[#A0A5B0] text-[10px]">Height (px)</label>
              <Input 
                type="number" 
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1056)}
                className="bg-[#0A1628] border-[#D4AF37]/20 h-7 text-xs"
              />
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => onSizeChange('custom', { name: 'Custom', width: customWidth, height: customHeight, ratio: 'custom' })}
            className="w-full bg-[#D4AF37] text-[#050A14] h-7 text-xs"
          >
            Apply Custom Size
          </Button>
        </div>
      )}
    </div>
  );
};

// Background Editor Component
export const BackgroundEditor = ({ background, onChange }) => {
  const [bgType, setBgType] = useState(background?.type || 'solid');
  
  return (
    <div className="space-y-3">
      <label className="text-[#A0A5B0] text-xs uppercase tracking-wider">Background</label>
      
      {/* Background Type Tabs */}
      <div className="flex gap-1 bg-[#050A14] p-1 rounded">
        {['solid', 'gradient', 'image'].map(type => (
          <button
            key={type}
            onClick={() => {
              setBgType(type);
              onChange({ ...background, type });
            }}
            className={`flex-1 py-1 px-2 rounded text-xs capitalize ${
              bgType === type ? 'bg-[#D4AF37] text-[#050A14]' : 'text-[#A0A5B0]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* Solid Color */}
      {bgType === 'solid' && (
        <div className="space-y-2">
          <label className="text-[#A0A5B0] text-[10px]">Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={background?.color || '#000000'}
              onChange={(e) => onChange({ ...background, type: 'solid', color: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer"
            />
            <Input 
              value={background?.color || '#000000'}
              onChange={(e) => onChange({ ...background, type: 'solid', color: e.target.value })}
              className="bg-[#050A14] border-[#D4AF37]/20 h-8 text-xs flex-1"
            />
          </div>
        </div>
      )}
      
      {/* Gradient */}
      {bgType === 'gradient' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#A0A5B0] text-[10px]">Start Color</label>
              <div className="flex gap-1">
                <input 
                  type="color" 
                  value={background?.gradientStart || '#000000'}
                  onChange={(e) => onChange({ ...background, type: 'gradient', gradientStart: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer"
                />
                <Input 
                  value={background?.gradientStart || '#000000'}
                  onChange={(e) => onChange({ ...background, type: 'gradient', gradientStart: e.target.value })}
                  className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-[10px] flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-[#A0A5B0] text-[10px]">End Color</label>
              <div className="flex gap-1">
                <input 
                  type="color" 
                  value={background?.gradientEnd || '#333333'}
                  onChange={(e) => onChange({ ...background, type: 'gradient', gradientEnd: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer"
                />
                <Input 
                  value={background?.gradientEnd || '#333333'}
                  onChange={(e) => onChange({ ...background, type: 'gradient', gradientEnd: e.target.value })}
                  className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-[10px] flex-1"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[#A0A5B0] text-[10px]">Direction</label>
            <select 
              value={background?.gradientDirection || 'to bottom'}
              onChange={(e) => onChange({ ...background, type: 'gradient', gradientDirection: e.target.value })}
              className="w-full p-1 bg-[#050A14] border border-[#D4AF37]/20 rounded text-[#F5F5F0] text-xs"
            >
              <option value="to bottom">Top to Bottom</option>
              <option value="to top">Bottom to Top</option>
              <option value="to right">Left to Right</option>
              <option value="to left">Right to Left</option>
              <option value="to bottom right">Diagonal ↘</option>
              <option value="to bottom left">Diagonal ↙</option>
              <option value="to top right">Diagonal ↗</option>
              <option value="to top left">Diagonal ↖</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Image Background */}
      {bgType === 'image' && (
        <div className="space-y-2">
          <label className="flex items-center justify-center p-3 border border-dashed border-[#D4AF37]/30 rounded cursor-pointer hover:border-[#D4AF37]">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    onChange({ ...background, type: 'image', image: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <ImageIcon size={16} className="mr-2 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">Upload Background Image</span>
          </label>
          
          {background?.image && (
            <>
              <div className="relative h-20 rounded overflow-hidden">
                <img src={background.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <label className="text-[#A0A5B0] text-[10px]">Overlay Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={background?.overlayColor || '#000000'}
                    onChange={(e) => onChange({ ...background, overlayColor: e.target.value })}
                    className="w-8 h-7 rounded cursor-pointer"
                  />
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round((background?.overlayOpacity || 0) * 100)}
                    onChange={(e) => onChange({ ...background, overlayOpacity: parseInt(e.target.value) / 100 })}
                    className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs w-16"
                    placeholder="%"
                  />
                  <span className="text-[#A0A5B0] text-xs self-center">%</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Image Effects Panel
export const ImageEffectsPanel = ({ effects, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="text-[#A0A5B0] text-xs uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={12} /> Image Effects
      </label>
      
      {/* Brightness */}
      <div>
        <div className="flex justify-between text-[10px] text-[#A0A5B0] mb-1">
          <span className="flex items-center gap-1"><Sun size={10} /> Brightness</span>
          <span>{effects?.brightness || 100}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="200" 
          value={effects?.brightness || 100}
          onChange={(e) => onChange({ ...effects, brightness: parseInt(e.target.value) })}
          className="w-full h-1 bg-[#050A14] rounded appearance-none cursor-pointer accent-[#D4AF37]"
        />
      </div>
      
      {/* Contrast */}
      <div>
        <div className="flex justify-between text-[10px] text-[#A0A5B0] mb-1">
          <span className="flex items-center gap-1"><Contrast size={10} /> Contrast</span>
          <span>{effects?.contrast || 100}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="200" 
          value={effects?.contrast || 100}
          onChange={(e) => onChange({ ...effects, contrast: parseInt(e.target.value) })}
          className="w-full h-1 bg-[#050A14] rounded appearance-none cursor-pointer accent-[#D4AF37]"
        />
      </div>
      
      {/* Saturation */}
      <div>
        <div className="flex justify-between text-[10px] text-[#A0A5B0] mb-1">
          <span className="flex items-center gap-1"><Droplets size={10} /> Saturation</span>
          <span>{effects?.saturation || 100}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="200" 
          value={effects?.saturation || 100}
          onChange={(e) => onChange({ ...effects, saturation: parseInt(e.target.value) })}
          className="w-full h-1 bg-[#050A14] rounded appearance-none cursor-pointer accent-[#D4AF37]"
        />
      </div>
      
      {/* Blur */}
      <div>
        <div className="flex justify-between text-[10px] text-[#A0A5B0] mb-1">
          <span>Blur</span>
          <span>{effects?.blur || 0}px</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={effects?.blur || 0}
          onChange={(e) => onChange({ ...effects, blur: parseInt(e.target.value) })}
          className="w-full h-1 bg-[#050A14] rounded appearance-none cursor-pointer accent-[#D4AF37]"
        />
      </div>
      
      {/* Quick Filters */}
      <div>
        <label className="text-[#A0A5B0] text-[10px] mb-2 block">Quick Filters</label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { name: 'None', filter: {} },
            { name: 'B&W', filter: { saturation: 0 } },
            { name: 'Sepia', filter: { sepia: 100 } },
            { name: 'Vintage', filter: { sepia: 30, brightness: 90, contrast: 110 } },
            { name: 'Vivid', filter: { saturation: 140, contrast: 110 } },
            { name: 'Muted', filter: { saturation: 70, brightness: 95 } },
            { name: 'Warm', filter: { sepia: 20, saturation: 110 } },
            { name: 'Cool', filter: { hueRotate: 180, saturation: 90 } }
          ].map(f => (
            <button
              key={f.name}
              onClick={() => onChange({ ...effects, ...f.filter })}
              className="p-1 bg-[#050A14] text-[#A0A5B0] rounded text-[9px] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Margins Editor
export const MarginsEditor = ({ margins, onChange, onApplyToAll }) => {
  return (
    <div className="space-y-3">
      <label className="text-[#A0A5B0] text-xs uppercase tracking-wider">Page Margins</label>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Top</label>
          <Input 
            type="number" 
            value={margins?.top || 40}
            onChange={(e) => onChange({ ...margins, top: parseInt(e.target.value) || 0 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Bottom</label>
          <Input 
            type="number" 
            value={margins?.bottom || 40}
            onChange={(e) => onChange({ ...margins, bottom: parseInt(e.target.value) || 0 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Left</label>
          <Input 
            type="number" 
            value={margins?.left || 40}
            onChange={(e) => onChange({ ...margins, left: parseInt(e.target.value) || 0 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Right</label>
          <Input 
            type="number" 
            value={margins?.right || 40}
            onChange={(e) => onChange({ ...margins, right: parseInt(e.target.value) || 0 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
      </div>
      
      <button
        onClick={onApplyToAll}
        className="w-full py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-xs hover:bg-[#D4AF37]/30"
      >
        Apply to All Pages
      </button>
    </div>
  );
};

// Grid Settings Panel
export const GridSettingsPanel = ({ settings, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[#A0A5B0] text-xs uppercase tracking-wider flex items-center gap-2">
          <Grid size={12} /> Grid & Guides
        </label>
        <button
          onClick={() => onChange({ ...settings, showGrid: !settings?.showGrid })}
          className={`px-2 py-0.5 rounded text-[10px] ${settings?.showGrid ? 'bg-[#D4AF37] text-[#050A14]' : 'bg-[#050A14] text-[#A0A5B0]'}`}
        >
          {settings?.showGrid ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Columns</label>
          <Input 
            type="number" 
            min="1"
            max="24"
            value={settings?.columns || 12}
            onChange={(e) => onChange({ ...settings, columns: parseInt(e.target.value) || 12 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[#A0A5B0] text-[10px]">Gutter</label>
          <Input 
            type="number" 
            value={settings?.gutter || 20}
            onChange={(e) => onChange({ ...settings, gutter: parseInt(e.target.value) || 20 })}
            className="bg-[#050A14] border-[#D4AF37]/20 h-7 text-xs"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[#A0A5B0] text-xs">Snap to Grid</span>
        <button
          onClick={() => onChange({ ...settings, snapToGrid: !settings?.snapToGrid })}
          className={`px-2 py-0.5 rounded text-[10px] ${settings?.snapToGrid ? 'bg-[#D4AF37] text-[#050A14]' : 'bg-[#050A14] text-[#A0A5B0]'}`}
        >
          {settings?.snapToGrid ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[#A0A5B0] text-xs">Alignment Guides</span>
        <button
          onClick={() => onChange({ ...settings, showGuides: !settings?.showGuides })}
          className={`px-2 py-0.5 rounded text-[10px] ${settings?.showGuides !== false ? 'bg-[#D4AF37] text-[#050A14]' : 'bg-[#050A14] text-[#A0A5B0]'}`}
        >
          {settings?.showGuides !== false ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

// Layer Item Component
export const LayerItem = ({ element, isSelected, onSelect, onToggleVisibility, onToggleLock, onMoveUp, onMoveDown, onDelete }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'text': return <Type size={12} />;
      case 'image': return <ImageIcon size={12} />;
      case 'logo': return <Circle size={12} />;
      case 'shape': return <Square size={12} />;
      default: return <Layout size={12} />;
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer group ${
        isSelected ? 'bg-[#D4AF37]/30 text-[#D4AF37]' : 'text-[#A0A5B0] hover:bg-[#050A14]'
      }`}
      onClick={() => onSelect(element.id)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisibility(element.id); }}
        className="opacity-60 hover:opacity-100"
      >
        {element.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLock(element.id); }}
        className="opacity-60 hover:opacity-100"
      >
        {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>
      
      {getIcon(element.type)}
      
      <span className="flex-1 truncate text-[11px]">{element.name || element.type}</span>
      
      <div className="hidden group-hover:flex gap-0.5">
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(element.id); }} className="p-0.5 hover:text-[#D4AF37]">
          <ChevronUp size={10} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(element.id); }} className="p-0.5 hover:text-[#D4AF37]">
          <ChevronDown size={10} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(element.id); }} className="p-0.5 hover:text-red-400">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
};

// Alignment Tools
export const AlignmentTools = ({ onAlign, onDistribute }) => {
  return (
    <div className="space-y-2">
      <label className="text-[#A0A5B0] text-xs uppercase tracking-wider">Alignment</label>
      
      <div className="grid grid-cols-6 gap-1">
        <button onClick={() => onAlign('left')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Left">
          <AlignLeft size={14} className="text-[#A0A5B0]" />
        </button>
        <button onClick={() => onAlign('centerH')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Center">
          <AlignCenter size={14} className="text-[#A0A5B0]" />
        </button>
        <button onClick={() => onAlign('right')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Right">
          <AlignRight size={14} className="text-[#A0A5B0]" />
        </button>
        <button onClick={() => onAlign('top')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Top">
          <AlignVerticalJustifyStart size={14} className="text-[#A0A5B0]" />
        </button>
        <button onClick={() => onAlign('centerV')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Middle">
          <AlignVerticalJustifyCenter size={14} className="text-[#A0A5B0]" />
        </button>
        <button onClick={() => onAlign('bottom')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20" title="Align Bottom">
          <AlignVerticalJustifyEnd size={14} className="text-[#A0A5B0]" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <button onClick={() => onDistribute('horizontal')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20 text-[10px] text-[#A0A5B0]">
          Distribute H
        </button>
        <button onClick={() => onDistribute('vertical')} className="p-1.5 bg-[#050A14] rounded hover:bg-[#D4AF37]/20 text-[10px] text-[#A0A5B0]">
          Distribute V
        </button>
      </div>
    </div>
  );
};

export default { PageSizeSelector, BackgroundEditor, ImageEffectsPanel, MarginsEditor, GridSettingsPanel, LayerItem, AlignmentTools };

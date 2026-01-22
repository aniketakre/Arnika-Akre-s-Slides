
import React, { useState } from 'react';
import { 
  Bold, Italic, Palette, Trash2, Link as LinkIcon, 
  AlignLeft, AlignCenter, AlignRight, RotateCcw, 
  Sliders, Maximize2, Type, Layers
} from 'lucide-react';
import { SlideElement, SiteProject, ElementType } from '../types';

interface FloatingToolbarProps {
  element: SlideElement;
  project?: SiteProject; 
  position: { top: number; left: number };
  onUpdate: (updates: Partial<SlideElement['styles']>) => void;
  onUpdateMetadata?: (metadata: any) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ element, project, position, onUpdate, onUpdateMetadata }) => {
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'advanced'>('style');

  const toggleStyle = (key: keyof SlideElement['styles'], value: string, defaultValue: string = 'normal') => {
    const current = (element.styles as any)?.[key];
    onUpdate({ [key]: current === value ? defaultValue : value });
  };

  return (
    <div 
      className="fixed z-[100] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 w-[240px] overflow-hidden"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex border-b bg-gray-50/50">
        <button onClick={() => setActiveTab('style')} className={`flex-1 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'style' ? 'text-indigo-600 bg-white' : 'text-gray-400'}`}>Basic</button>
        <button onClick={() => setActiveTab('advanced')} className={`flex-1 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'advanced' ? 'text-indigo-600 bg-white' : 'text-gray-400'}`}>Design</button>
        <button onClick={() => setShowLinkEditor(!showLinkEditor)} className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${showLinkEditor ? 'text-amber-600 bg-white' : 'text-gray-400'}`}><LinkIcon size={12}/></button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {showLinkEditor ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Internal Slide</label>
              <select 
                className="w-full text-[11px] p-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={element.metadata?.targetSlideId || ''}
                onChange={(e) => onUpdateMetadata?.({ ...element.metadata, targetSlideId: e.target.value, href: '' })}
              >
                <option value="">None</option>
                {project?.slides.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">External URL</label>
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full text-[11px] p-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={element.metadata?.href || ''}
                onChange={(e) => onUpdateMetadata?.({ ...element.metadata, href: e.target.value, targetSlideId: '' })}
              />
            </div>
          </div>
        ) : activeTab === 'style' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <button onClick={() => toggleStyle('fontWeight', 'bold')} className={`p-2 rounded-xl transition-all ${element.styles?.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}><Bold size={14}/></button>
              <button onClick={() => toggleStyle('fontStyle', 'italic')} className={`p-2 rounded-xl transition-all ${element.styles?.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}><Italic size={14}/></button>
              <div className="w-px h-6 bg-gray-100 mx-1" />
              <button onClick={() => onUpdate({ textAlign: 'left' })} className={`p-2 rounded-xl transition-all ${element.styles?.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}><AlignLeft size={14}/></button>
              <button onClick={() => onUpdate({ textAlign: 'center' })} className={`p-2 rounded-xl transition-all ${element.styles?.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}><AlignCenter size={14}/></button>
              <button onClick={() => onUpdate({ textAlign: 'right' })} className={`p-2 rounded-xl transition-all ${element.styles?.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}><AlignRight size={14}/></button>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Palette size={12}/></div>
                <input type="color" value={element.styles?.color || '#000000'} onChange={(e) => onUpdate({ color: e.target.value, backgroundColor: element.type === ElementType.SHAPE ? e.target.value : element.styles?.backgroundColor })} className="w-full h-8 rounded-xl border-none p-0 cursor-pointer opacity-0 absolute inset-0" />
                <div className="w-full h-8 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-[9px] font-black uppercase text-gray-400">Color</div>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl px-2 border border-gray-100">
                <Type size={12} className="text-gray-400 mr-2"/>
                <input 
                  type="number" 
                  value={parseInt(element.styles?.fontSize || '24')}
                  onChange={(e) => onUpdate({ fontSize: `${e.target.value}px` })}
                  className="w-12 text-[11px] font-bold bg-transparent py-2 outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Border Radius</span>
                <span className="text-[9px] font-bold text-indigo-600">{element.styles?.borderRadius || '0'}</span>
              </div>
              <input type="range" min="0" max="100" value={parseInt(element.styles?.borderRadius || '0')} onChange={(e) => onUpdate({ borderRadius: `${e.target.value}px` })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Opacity</span>
                <span className="text-[9px] font-bold text-indigo-600">{Math.round(parseFloat(element.styles?.opacity || '1') * 100)}%</span>
              </div>
              <input type="range" min="0" max="100" value={parseFloat(element.styles?.opacity || '1') * 100} onChange={(e) => onUpdate({ opacity: (parseFloat(e.target.value) / 100).toString() })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rotation</span>
              <div className="flex gap-1.5">
                <button onClick={() => onUpdate({ rotation: `${parseInt(element.styles?.rotation || '0') - 15}deg` })} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"><RotateCcw size={12}/></button>
                <button onClick={() => onUpdate({ rotation: `${parseInt(element.styles?.rotation || '0') + 15}deg` })} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all rotate-180"><RotateCcw size={12}/></button>
                <button onClick={() => onUpdate({ rotation: '0deg' })} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"><Maximize2 size={12}/></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;

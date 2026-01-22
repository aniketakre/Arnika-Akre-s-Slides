
import React, { useState, useMemo } from 'react';
import { SiteProject, SlideContent, SlideElement, LayoutType, ElementType, NavigationLink } from '../types';
import { 
  Plus, Layers, Trash2, MousePointer2, Settings, 
  Download, History, Eye, EyeOff, Sparkles,
  Type as TypeIcon, Image as ImageIcon, MousePointerClick, 
  AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
  CheckCircle2, Flame, Wind, Droplets, Move, Table as TableIcon,
  Video, Play, Square, Circle, Hash, Smile, Link as LinkIcon, Minus,
  Star, Heart, Bell, Shield, Cloud, Zap, Clock, Save, Wand2
} from 'lucide-react';
import { exportToPptx } from '../utils/pptxExport';

interface SidebarProps {
  project: SiteProject;
  history: {timestamp: number, action: string, project: SiteProject}[];
  historyIndex: number;
  filteredSlides: SlideContent[];
  selectedSlideId: string | null;
  selectedElementId: string | null;
  onSelectSlide: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateProject: (p: SiteProject, action?: string) => void;
  onUpdateElement: (id: string, styleUpdates: Partial<SlideElement['styles']>) => void;
  onAddElement: (el: SlideElement) => void;
  onDeleteElement: (id: string) => void;
  onAddSlide: () => void;
  onDeleteSlide: (id: string) => void;
  onRestoreToPoint: (index: number) => void;
  onRefineSlide?: (id: string) => void;
  onTriggerAiImage?: () => void;
  selectedElementIds?: string[];
  onAlign?: (alignment: string) => void;
}

const THEME_PRESETS = [
  { name: 'Arnika Indigo', primary: '#4f46e5', secondary: '#818cf8', font: 'Plus Jakarta Sans', icon: Droplets },
  { name: 'SaaS Emerald', primary: '#059669', secondary: '#34d399', font: 'Inter', icon: Wind },
  { name: 'Cyber Neon', primary: '#ec4899', secondary: '#f472b6', font: 'Orbitron', icon: Flame },
  { name: 'Professional Slate', primary: '#1e293b', secondary: '#64748b', font: 'Plus Jakarta Sans', icon: CheckCircle2 },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  project, history, historyIndex, filteredSlides, selectedSlideId, selectedElementId, onSelectSlide, onSelectElement,
  onUpdateProject, onUpdateElement, onAddElement, onDeleteElement, onAddSlide, onDeleteSlide, 
  onRestoreToPoint, onRefineSlide, onTriggerAiImage, selectedElementIds = [], onAlign
}) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'layers' | 'insert' | 'settings' | 'history'>('slides');
  const currentSlide = useMemo(() => project.slides?.find(s => s.id === selectedSlideId), [project.slides, selectedSlideId]);

  const toggleElementVisibility = (id: string) => {
    const el = currentSlide?.elements.find(e => e.id === id);
    if (el) onUpdateElement(id, { hidden: !el.styles?.hidden });
  };

  const applyTheme = (preset: typeof THEME_PRESETS[0]) => {
    onUpdateProject({
      ...project,
      theme: { ...project.theme, primaryColor: preset.primary, secondaryColor: preset.secondary, fontFamily: preset.font }
    }, `Applied ${preset.name} Theme`);
  };

  const addNewElement = (type: ElementType, content: string = '', extraStyles: any = {}) => {
    onAddElement({
      id: `el-${Date.now()}`,
      type,
      content,
      styles: { 
        left: '40%', 
        top: '40%', 
        width: type === ElementType.IMAGE || type === ElementType.VIDEO || type === ElementType.GIF ? '300px' : 'auto',
        zIndex: 50,
        ...extraStyles 
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white select-none shadow-2xl overflow-hidden" role="navigation">
      <div className="flex border-b overflow-x-auto no-scrollbar bg-gray-50/50 shrink-0">
        {[
          { id: 'slides', icon: Layers, label: 'Slides' },
          { id: 'layers', icon: MousePointer2, label: 'Layers' },
          { id: 'insert', icon: Plus, label: 'Add' },
          { id: 'settings', icon: Settings, label: 'Style' },
          { id: 'history', icon: Clock, label: 'Versions' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 min-w-[64px] py-2 md:py-4 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={16} /><span className="text-[8px] uppercase font-bold tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'slides' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-2 px-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigator</h3>
               <button onClick={onAddSlide} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase shadow-md active:scale-95 transition-all"><Plus size={14}/> Add</button>
             </div>
             
             <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar pb-4 md:pb-0 px-1">
               {project.slides.map((s, idx) => (
                 <div 
                  key={s.id} 
                  onClick={() => onSelectSlide(s.id)} 
                  className={`group relative p-3 md:p-4 min-w-[140px] md:min-w-0 rounded-2xl border-2 transition-all cursor-pointer shrink-0 
                    ${selectedSlideId === s.id ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-gray-50 bg-gray-50/30 hover:border-indigo-100'}`}
                 >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 md:gap-3 truncate">
                       <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${selectedSlideId === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</span>
                       <p className="text-xs font-bold text-gray-800 truncate">{s.title || 'Untitled'}</p>
                     </div>
                     <button onClick={(e) => { e.stopPropagation(); onDeleteSlide(s.id); }} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors hidden md:block"><Trash2 size={12}/></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'layers' && currentSlide && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alignment</h3>
              <div className={`grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded-xl ${selectedElementIds.length < 2 ? 'opacity-30 pointer-events-none' : ''}`}>
                <button onClick={() => onAlign?.('alignLeft')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-indigo-600 transition-all shadow-sm"><AlignLeft size={16}/></button>
                <button onClick={() => onAlign?.('alignCenter')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-indigo-600 transition-all shadow-sm"><AlignCenter size={16}/></button>
                <button onClick={() => onAlign?.('alignRight')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-indigo-600 transition-all shadow-sm"><AlignRight size={16}/></button>
                <button onClick={() => onAlign?.('distributeV')} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-indigo-600 transition-all shadow-sm"><AlignVerticalJustifyCenter size={16}/></button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Elements</h3>
              {[...currentSlide.elements].reverse().map((el) => (
                <div 
                  key={el.id} 
                  onClick={() => onSelectElement(el.id)} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all ${selectedElementIds.includes(el.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate font-bold opacity-80">{el.type}: {el.content.substring(0, 12)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleElementVisibility(el.id); }} className="p-1.5 hover:bg-white/20 rounded-lg">{el.styles?.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 space-y-3">
               <div className="flex items-center gap-2">
                 <Sparkles size={16} className="text-indigo-600" />
                 <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">AI Creation</h4>
               </div>
               <button 
                onClick={onTriggerAiImage}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl hover:shadow-lg transition-all active:scale-95 group border border-indigo-100"
               >
                 <div className="p-2 bg-indigo-600 text-white rounded-xl"><Wand2 size={16} /></div>
                 <div className="text-left">
                   <p className="text-[10px] font-black text-gray-900 uppercase">AI Image</p>
                   <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Generate custom visuals</p>
                 </div>
               </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { type: ElementType.TEXT, icon: TypeIcon, label: 'Text', content: 'New Text Block' },
                { type: ElementType.IMAGE, icon: ImageIcon, label: 'Image', content: 'https://source.unsplash.com/random/800x600?nature' },
                { type: ElementType.VIDEO, icon: Video, label: 'Video', content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { type: ElementType.BUTTON, icon: MousePointerClick, label: 'Button', content: 'Explore Now' },
                { type: ElementType.GIF, icon: Smile, label: 'GIF', content: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZjhqZzhqZzhqZzhqZzhqZzhqZzhqZzhqZzhqZzhqZzhqZzhqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxVfP9p7q7K/giphy.gif' },
                { type: ElementType.SHAPE, icon: Square, label: 'Rect', content: 'rect', extra: { backgroundColor: '#4f46e5', width: '200px', height: '100px', borderRadius: '12px' } },
                { type: ElementType.SHAPE, icon: Circle, label: 'Circle', content: 'circle', extra: { backgroundColor: '#ec4899', width: '100px', height: '100px', borderRadius: '50%' } },
                { type: ElementType.SHAPE, icon: Minus, label: 'Line', content: 'rect', extra: { backgroundColor: '#cbd5e1', width: '250px', height: '2px' } },
                { type: ElementType.TABLE, icon: TableIcon, label: 'Table', content: '[["H1","H2"],["D1","D2"]]' },
                { type: ElementType.TEXT, icon: Star, label: 'Icon', content: 'star', extra: { fontSize: '48px', color: '#f59e0b' } },
                { type: ElementType.TEXT, icon: Zap, label: 'Icon', content: 'zap', extra: { fontSize: '48px', color: '#8b5cf6' } },
                { type: ElementType.LINK, icon: LinkIcon, label: 'Link', content: 'Click for details' }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => addNewElement(item.type, item.content, item.extra || {})}
                  className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-100 rounded-xl hover:border-indigo-600 hover:shadow-lg active:scale-95 transition-all group"
                >
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <item.icon size={16} />
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase text-gray-500 truncate w-full text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Style Presets</h3>
            <div className="grid grid-cols-1 gap-2">
              {THEME_PRESETS.map(preset => (
                <button key={preset.name} onClick={() => applyTheme(preset)} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-500 transition-all group text-left">
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-indigo-50 transition-colors" style={{ color: preset.primary }}><preset.icon size={16} /></div>
                  <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-gray-800 truncate">{preset.name}</p></div>
                </button>
              ))}
            </div>
            <button onClick={() => exportToPptx(project)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 shadow-xl"><Download size={14} /> Export PPTX</button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="px-1 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Version Snapshots</h3>
              <div className="flex items-center gap-1 text-[8px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                <Save size={10} /> Persistent
              </div>
            </div>
            <div className="space-y-2">
              {[...history].reverse().map((entry, idx) => {
                const actualIdx = (history.length - 1) - idx;
                const isCurrent = historyIndex === actualIdx;
                const slideCount = entry.project.slides?.length || 0;
                
                return (
                  <button 
                    key={entry.timestamp} 
                    onClick={() => onRestoreToPoint(actualIdx)} 
                    className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${isCurrent ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${isCurrent ? 'text-indigo-700' : 'text-gray-900'}`}>{entry.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] text-gray-400 font-medium flex items-center gap-1">
                            <Clock size={8} /> {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[8px] text-indigo-400 font-black uppercase bg-white/50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {slideCount} Slides
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse mt-1" />
                      )}
                    </div>
                    {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                  </button>
                );
              })}
              {history.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No versions recorded yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

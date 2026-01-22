
import React, { useState } from 'react';
import { ChevronDown, Map, Play, Layout, Palette, Share2, ExternalLink } from 'lucide-react';
import { SiteProject, NavigationLink } from '../types';

interface SlideNavbarProps {
  project: SiteProject;
  activeSlideId: string | null;
  onNavigate: (id: string) => void;
  onToggleTheme: (color: string) => void;
}

const SlideNavbar: React.FC<SlideNavbarProps> = ({ project, activeSlideId, onNavigate, onToggleTheme }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const renderNavLink = (link: NavigationLink) => {
    const hasChildren = link.children && link.children.length > 0;
    const isActive = activeSlideId === link.targetSlideId;

    return (
      <div key={link.id} className="relative group/nav">
        <button 
          onClick={() => {
            if (hasChildren) {
              setOpenDropdown(openDropdown === link.id ? null : link.id);
            } else if (link.targetSlideId) {
              onNavigate(link.targetSlideId);
            } else if (link.url) {
              window.open(link.url, '_blank');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-black/5'}`}
        >
          {link.label}
          {hasChildren && <ChevronDown size={12} className={`transition-transform ${openDropdown === link.id ? 'rotate-180' : ''}`} />}
          {link.url && <ExternalLink size={10} className="opacity-40" />}
        </button>

        {hasChildren && openDropdown === link.id && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-2xl rounded-2xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
            {link.children?.map(child => (
              <button
                key={child.id}
                onClick={() => {
                  if (child.targetSlideId) onNavigate(child.targetSlideId);
                  setOpenDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {child.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl transition-all hover:bg-white/90">
      <div className="flex items-center gap-1 mr-2 px-2">
        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px] font-black">A</div>
        <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">SiteNav</span>
      </div>

      <div className="w-px h-6 bg-gray-200/50 mx-1" />

      {/* Dynamic Custom Links */}
      <div className="flex items-center gap-1">
        {project.theme.navLinks.length > 0 ? (
          project.theme.navLinks.map(renderNavLink)
        ) : (
          <button 
            onClick={() => onNavigate(project.slides[0].id)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 rounded-xl transition-colors text-[11px] font-bold text-gray-400 italic"
          >
            No menu items defined...
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200/50 mx-1" />

      <button onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')} className="p-2 hover:bg-black/5 rounded-xl transition-colors text-gray-600">
        <Palette size={16} />
      </button>

      {openDropdown === 'theme' && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-4 gap-2">
            {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#1f2937'].map(color => (
              <button key={color} onClick={() => { onToggleTheme(color); setOpenDropdown(null); }} className="w-full aspect-square rounded-lg transition-transform hover:scale-110" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      )}

      <button className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
        Publish
      </button>
    </div>
  );
};

export default SlideNavbar;

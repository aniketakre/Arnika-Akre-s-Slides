
import React from 'react';
import { SiteProject } from '../types';
import { X, ArrowRight, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface LinkMapViewProps {
  project: SiteProject;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

const LinkMapView: React.FC<LinkMapViewProps> = ({ project, onClose, onNavigate }) => {
  const getLinksForSlide = (slideId: string) => {
    const slide = project.slides.find(s => s.id === slideId);
    if (!slide) return [];
    return slide.elements
      .filter(el => el.metadata?.targetSlideId)
      .map(el => ({
        fromElement: el.content,
        toSlideId: el.metadata.targetSlideId,
        toSlideTitle: project.slides.find(s => s.id === el.metadata.targetSlideId)?.title || 'Broken Link'
      }));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-gray-900/95 backdrop-blur-xl flex flex-col p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LinkIcon className="text-indigo-400" /> Architecture Map
          </h2>
          <p className="text-gray-400 text-sm mt-1">Visualizing navigation flow and interactive anchors.</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {project.slides.map((slide, index) => {
            const links = getLinksForSlide(slide.id);
            return (
              <div key={slide.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-500/20">{index + 1}</span>
                  <h3 className="font-bold text-white truncate">{slide.title}</h3>
                </div>

                <div className="space-y-3">
                  {links.length > 0 ? links.map((link, lIdx) => (
                    <div key={lIdx} className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onNavigate(link.toSlideId)}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">{link.fromElement}</span>
                        <span className={`text-xs font-medium truncate ${link.toSlideTitle === 'Broken Link' ? 'text-red-400' : 'text-gray-300'}`}>
                          {link.toSlideTitle}
                        </span>
                      </div>
                      {link.toSlideTitle === 'Broken Link' ? <AlertCircle size={14} className="text-red-400 shrink-0" /> : <ArrowRight size={14} className="text-gray-500 shrink-0" />}
                    </div>
                  )) : (
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center py-4 italic">No interactive links</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LinkMapView;


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SiteProject, SlideContent, SlideElement, LayoutType, ElementType, NavigationLink } from './types';
import { readFileAsText } from './utils/fileParsers';
import { generateSiteStructure, refineSlide } from './services/geminiService';
import Sidebar from './components/Sidebar';
import SlideRenderer from './components/SlideRenderer';
import ContextMenu from './components/ContextMenu';
import OnboardingOverlay from './components/OnboardingOverlay';
import LinkMapView from './components/LinkMapView';
import AiImageModal from './components/AiImageModal';
import { t } from './utils/i18n';
import { 
  Upload, Sparkles, Play, Edit3, Globe, Map, AlertCircle, RefreshCw,
  Plus, ArrowRight, Briefcase, User, ChevronUp, ChevronDown, PanelLeftClose, PanelLeft,
  CloudCheck, CloudUpload, HardDrive
} from 'lucide-react';

const STORAGE_KEY = 'arnika_akre_project_v3';
const HISTORY_KEY = 'arnika_history_v3';
const TOUR_KEY = 'arnika_tour_completed';

const TEMPLATES: Record<string, Partial<SiteProject>> = {
  pitch: {
    name: "New Pitch Deck",
    theme: { primaryColor: "#4f46e5", secondaryColor: "#818cf8", fontFamily: "Plus Jakarta Sans", navbarEnabled: true, navLinks: [] },
    slides: [
      { id: 's1', title: 'The Big Idea', layout: LayoutType.HERO, elements: [{ id: 'e1', type: ElementType.TEXT, content: 'Revolutionizing the Industry', styles: { top: '40%', left: '10%', fontSize: '48px', fontWeight: '800' } }] },
      { id: 's2', title: 'The Problem', layout: LayoutType.CONTENT_IMAGE, elements: [] },
      { id: 's3', title: 'Our Solution', layout: LayoutType.GRID, elements: [] }
    ]
  },
  portfolio: {
    name: "Creative Portfolio",
    theme: { primaryColor: "#ec4899", secondaryColor: "#f472b6", fontFamily: "Plus Jakarta Sans", navbarEnabled: true, navLinks: [] },
    slides: [
      { id: 's1', title: 'Hello, I am [Name]', layout: LayoutType.HERO, elements: [] },
      { id: 's2', title: 'Recent Works', layout: LayoutType.GRID, elements: [] }
    ]
  }
};

const LOADING_TIPS = [
  "Gemini is analyzing the hierarchy of your document...",
  "Applying glassmorphism styles to your content...",
  "Generating 3D spatial positioning for elements...",
  "Optimizing image selection for visual impact...",
  "Building the interactive navigation map..."
];

const App: React.FC = () => {
  const [project, setProject] = useState<SiteProject | null>(null);
  const [history, setHistory] = useState<{timestamp: number, project: SiteProject, action: string}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAiImage, setShowAiImage] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Persistence Load
  useEffect(() => {
    const savedProject = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const tourDone = localStorage.getItem(TOUR_KEY);
    
    if (!tourDone) setShowTour(true);
    
    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject);
        if (parsed && parsed.slides && parsed.slides.length > 0) {
          setProject(parsed);
          setSelectedSlideId(parsed.slides[0].id);
        }
      } catch (e) { 
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
        setHistoryIndex(parsedHistory.length - 1);
      } catch (e) {
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  }, []);

  // Autosave Logic
  useEffect(() => { 
    if (project) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        try { 
          localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
          setSaveStatus('saved');
        } catch (e) {
          console.error("Storage limit reached");
          setSaveStatus('idle');
        }
      }, 500); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [project, history]);

  useEffect(() => {
    if (isLoading || isAiProcessing) {
      const interval = setInterval(() => setTipIndex(p => (p + 1) % LOADING_TIPS.length), 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading, isAiProcessing]);

  const currentSlide = useMemo(() => {
    if (!project || project.slides.length === 0) return null;
    return project.slides.find(s => s.id === selectedSlideId) || project.slides[0];
  }, [project, selectedSlideId]);

  const pushToHistory = useCallback((newProject: SiteProject, action: string = "Update") => {
    const entry = { timestamp: Date.now(), project: JSON.parse(JSON.stringify(newProject)), action };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      if (newHistory.length >= 30) newHistory.shift(); // Limit to 30 snapshots
      newHistory.push(entry);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  const updateProjectState = useCallback((newProject: SiteProject, actionName?: string) => { 
    setProject(newProject); 
    pushToHistory(newProject, actionName); 
  }, [pushToHistory]);

  const onSelectElement = useCallback((id: string | null, multi: boolean = false) => {
    if (multi && id) {
      setSelectedElementIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    } else {
      setSelectedElementIds(id ? [id] : []);
    }
  }, []);

  const handleAlign = useCallback((alignment: string) => {
    if (!project || !selectedSlideId || selectedElementIds.length < 2) return;
    const slide = project.slides.find(s => s.id === selectedSlideId);
    if (!slide) return;

    const selectedElements = slide.elements.filter(e => selectedElementIds.includes(e.id));
    const rects = selectedElements.map(e => ({
      id: e.id,
      left: parseFloat(e.styles?.left || '0'),
      top: parseFloat(e.styles?.top || '0'),
      width: parseFloat(e.styles?.width || '10'),
    }));

    let updates: { [id: string]: Partial<SlideElement['styles']> } = {};

    switch (alignment) {
      case 'alignLeft':
        const minLeft = Math.min(...rects.map(r => r.left));
        rects.forEach(r => updates[r.id] = { left: `${minLeft}%` });
        break;
      case 'alignCenter':
        const avgCenter = rects.reduce((acc, r) => acc + (r.left + r.width / 2), 0) / rects.length;
        rects.forEach(r => updates[r.id] = { left: `${avgCenter - r.width / 2}%` });
        break;
      case 'alignRight':
        const maxRight = Math.max(...rects.map(r => r.left + r.width));
        rects.forEach(r => updates[r.id] = { left: `${maxRight - r.width}%` });
        break;
    }

    const newSlides = project.slides.map(s => 
      s.id === selectedSlideId 
        ? { ...s, elements: s.elements.map(e => updates[e.id] ? { ...e, styles: { ...e.styles, ...updates[e.id] } } : e) } 
        : s
    );
    updateProjectState({ ...project, slides: newSlides }, "Align Elements");
  }, [project, selectedSlideId, selectedElementIds, updateProjectState]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const text = await readFileAsText(file);
      const generatedProject = await generateSiteStructure(text, file.name);
      setProject(generatedProject);
      setSelectedSlideId(generatedProject.slides[0].id);
      pushToHistory(generatedProject, `Imported ${file.name}`);
    } catch (err: any) { 
      setError("AI analysis failed.");
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] bg-gray-100 overflow-hidden transition-all ${isPresenting ? 'bg-black' : ''}`}>
      {!isPresenting && (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-[60] shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hidden md:block"
            >
              {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md cursor-pointer" onClick={() => { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(HISTORY_KEY); window.location.reload(); }}>A</div>
            <div className="flex flex-col ml-1">
              <h1 className="font-bold text-gray-800 tracking-tight text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{project?.name || 'Arnika Akre'}</h1>
              {project && (
                <div className="flex items-center gap-1.5 -mt-0.5">
                  {saveStatus === 'saving' ? (
                    <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase animate-pulse">
                      <CloudUpload size={10} /> Syncing
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                      <CloudCheck size={10} /> Local Snapshot Saved
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            {project && (
              <>
                <button onClick={() => setShowMap(true)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-2 text-xs font-bold uppercase">
                  <Map size={18} /> Map
                </button>
                <button onClick={() => setIsPublishing(true)} className="px-3 py-1.5 rounded-lg font-bold text-[10px] md:text-xs uppercase bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                  <Globe size={14} className="md:mr-1 inline" /> <span className="hidden sm:inline">{t('publish', lang)}</span>
                </button>
                <button onClick={() => setIsPresenting(true)} className="px-3 py-1.5 rounded-lg font-bold text-[10px] md:text-xs uppercase bg-gray-900 text-white hover:bg-black transition-all">
                  <Play size={14} className="md:mr-1 inline" /> <span className="hidden sm:inline">{t('present', lang)}</span>
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[1000] bg-white/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Analyzing</h2>
          <p className="text-gray-400 text-xs font-bold animate-pulse">{LOADING_TIPS[tipIndex]}</p>
        </div>
      )}

      {!project && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto pt-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6 animate-bounce"><Sparkles size={32} /></div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter italic text-center">Arnika Akre</h2>
          <p className="text-gray-400 mb-12 max-w-md font-medium text-center">The standard for high-fidelity document-to-web transitions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
            <label className="group bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 hover:border-indigo-600 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Upload size={24} /></div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">AI Analysis</h3>
              <p className="text-gray-400 text-xs mb-4">Import any Word/PPTX. Gemini builds the flow.</p>
              <input type="file" className="hidden" accept=".docx,.pptx,.txt,.pdf,.md" onChange={handleFileUpload} />
            </label>
            <button onClick={() => setProject(TEMPLATES.pitch as SiteProject)} className="group bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 hover:border-emerald-600 transition-all text-left">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Edit3 size={24} /></div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Blank Canvas</h3>
              <p className="text-gray-400 text-xs">Start fresh with high-end interaction tools.</p>
            </button>
            <div className="group bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-left">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Briefcase size={24} /></div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Templates</h3>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setProject(TEMPLATES.pitch as SiteProject)} className="px-3 py-1 bg-amber-50 text-[10px] font-bold text-amber-700 rounded-full">Pitch</button>
                <button onClick={() => setProject(TEMPLATES.portfolio as SiteProject)} className="px-3 py-1 bg-pink-50 text-[10px] font-bold text-pink-700 rounded-full">Works</button>
              </div>
            </div>
          </div>
        </div>
      ) : project && currentSlide && (
        <div className={`flex flex-col md:flex-row flex-1 h-full relative overflow-hidden`}>
          <main className={`overflow-hidden flex flex-col items-center justify-center bg-gray-50 relative ${isPresenting ? 'flex-1 p-0 bg-black' : 'h-[70dvh] md:h-full md:flex-1 p-2 md:p-8'}`}>
            <div className={`w-full h-full max-w-5xl transition-all duration-700 ${isPresenting ? 'max-w-none' : ''}`}>
              <div className={`bg-white shadow-2xl overflow-hidden border relative transition-all duration-700 h-full ${isPresenting ? 'w-screen h-screen rounded-none border-none' : 'rounded-xl md:rounded-3xl'}`}>
                <SlideRenderer 
                  project={project} slide={currentSlide} onNavigate={setSelectedSlideId} primaryColor={project.theme.primaryColor}
                  selectedElementIds={isPresenting ? [] : selectedElementIds} isPresenting={isPresenting}
                  onSelectElement={onSelectElement}
                  onUpdateElements={(map) => {
                    const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, elements: s.elements.map(e => map[e.id] ? { ...e, styles: { ...e.styles, ...map[e.id] } } : e) } : s);
                    updateProjectState({ ...project, slides: newSlides }, "Move Elements");
                  }}
                  onUpdateSlideTitle={(text) => {
                    const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, title: text } : s);
                    updateProjectState({ ...project, slides: newSlides }, "Rename Slide");
                  }}
                />
              </div>
            </div>
          </main>

          {!isPresenting && (
            <aside 
              className={`bg-white border-t md:border-t-0 md:border-l border-gray-200 transition-all duration-300 flex flex-col shrink-0 z-50 
                ${sidebarCollapsed ? 'w-0 overflow-hidden opacity-0 invisible md:w-0' : 'w-full md:w-80 h-[30dvh] md:h-full'}`}
            >
              <Sidebar 
                project={project} history={history} historyIndex={historyIndex}
                filteredSlides={project.slides} selectedSlideId={selectedSlideId} selectedElementId={selectedElementIds[0] || null}
                onSelectSlide={setSelectedSlideId} onSelectElement={(id) => onSelectElement(id, false)}
                onUpdateProject={updateProjectState} 
                onUpdateElement={(id, styleUpdates) => {
                   const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, styles: { ...e.styles, ...styleUpdates } } : e) } : s);
                   updateProjectState({ ...project, slides: newSlides }, "Update Style");
                }}
                onAddElement={(el) => {
                   const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, elements: [...s.elements, el] } : s);
                   updateProjectState({ ...project, slides: newSlides }, "Add Element");
                }} 
                onDeleteElement={(id) => {
                   const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, elements: s.elements.filter(e => e.id !== id) } : s);
                   updateProjectState({ ...project, slides: newSlides }, "Delete Element");
                   setSelectedElementIds([]);
                }} 
                onAddSlide={() => {
                   const newSlide: SlideContent = { id: `slide-${Date.now()}`, title: 'New Story Slide', layout: LayoutType.BLANK, elements: [] };
                   updateProjectState({ ...project, slides: [...project.slides, newSlide] }, "Add Slide");
                   setSelectedSlideId(newSlide.id);
                }} 
                onDeleteSlide={(id) => {
                   const newSlides = project.slides.filter(s => s.id !== id);
                   if (newSlides.length === 0) setProject(null);
                   else updateProjectState({ ...project, slides: newSlides }, "Delete Slide");
                }} 
                onRestoreToPoint={(idx) => {
                  const state = history[idx];
                  if (state) {
                    setProject(state.project);
                    setHistoryIndex(idx);
                  }
                }}
                onTriggerAiImage={() => setShowAiImage(true)}
                selectedElementIds={selectedElementIds}
                onAlign={handleAlign}
              />
            </aside>
          )}
        </div>
      )}

      {showMap && project && <LinkMapView project={project} onClose={() => setShowMap(false)} onNavigate={(id) => { setSelectedSlideId(id); setShowMap(false); }} />}
      {showTour && <OnboardingOverlay onClose={() => { setShowTour(false); localStorage.setItem(TOUR_KEY, 'true'); }} />}
      {showAiImage && project && (
        <AiImageModal 
          onClose={() => setShowAiImage(false)} 
          onGenerate={(url) => {
             const newEl: SlideElement = {
               id: `ai-img-${Date.now()}`,
               type: ElementType.IMAGE,
               content: url,
               styles: { left: '30%', top: '30%', width: '400px', zIndex: 60, borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
             };
             const newSlides = project.slides.map(s => s.id === selectedSlideId ? { ...s, elements: [...s.elements, newEl] } : s);
             updateProjectState({ ...project, slides: newSlides }, "Generate AI Image");
          }} 
        />
      )}
    </div>
  );
};

export default App;

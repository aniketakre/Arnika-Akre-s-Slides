
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SlideContent, ElementType, SlideElement, SiteProject } from '../types';
import FloatingToolbar from './FloatingToolbar';
import SlideNavbar from './SlideNavbar';
import { Maximize2, Minimize2, RotateCcw, Table as TableIcon } from 'lucide-react';

interface SlideRendererProps {
  project: SiteProject;
  slide: SlideContent;
  onNavigate: (id: string) => void;
  primaryColor: string;
  selectedElementIds: string[];
  isPresenting?: boolean;
  onSelectElement?: (id: string, isMulti: boolean) => void;
  onUpdateElements?: (updates: { [id: string]: Partial<SlideElement['styles']> }) => void;
  onUpdateElementMetadata?: (id: string, metadata: any) => void;
  onUpdateSlideTitle?: (text: string) => void;
  onThemeUpdate?: (color: string) => void;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ 
  project, slide, onNavigate, primaryColor, selectedElementIds, isPresenting = false,
  onSelectElement, onUpdateElements, onUpdateElementMetadata, onUpdateSlideTitle, onThemeUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialElementsPos, setInitialElementsPos] = useState<{ [id: string]: { left: number, top: number } }>({});
  const [localOffsets, setLocalOffsets] = useState<{ [id: string]: { left: string, top: string } }>({});
  
  const [baseScale, setBaseScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const pinchDistRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const canvasWidth = 1000;
      const canvasHeight = 562.5;
      
      const scaleX = (containerWidth - 40) / canvasWidth;
      const scaleY = (containerHeight - 40) / canvasHeight;
      const newScale = Math.min(scaleX, scaleY, isPresenting ? 1.5 : 1);
      
      setBaseScale(newScale > 0 ? newScale : 1);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    handleResize();
    return () => resizeObserver.disconnect();
  }, [isPresenting, slide.id]);

  const currentScale = baseScale * userZoom;

  const handleWheel = (e: React.WheelEvent) => {
    if (isPresenting) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.005;
      setUserZoom(prev => Math.min(Math.max(0.2, prev + delta), 5));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && !isPresenting) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );

      if (pinchDistRef.current !== null) {
        const delta = (dist - pinchDistRef.current) * 0.005;
        setUserZoom(prev => Math.min(Math.max(0.2, prev + delta), 5));
      }
      pinchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    pinchDistRef.current = null;
  };

  const handleElementInteraction = (e: React.MouseEvent | React.TouchEvent, el: SlideElement) => {
    if (el.styles?.hidden || isPresenting) return;
    if ('touches' in e && e.touches.length > 1) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const isMulti = 'ctrlKey' in e ? (e.metaKey || e.ctrlKey || e.shiftKey) : false;
    const isSelected = selectedElementIds.includes(el.id);
    
    if (!isSelected && !isMulti && (el.metadata?.href || el.metadata?.targetSlideId)) {
        e.stopPropagation();
        if (el.metadata?.href) window.open(el.metadata.href, '_blank');
        else if (el.metadata?.targetSlideId) onNavigate(el.metadata.targetSlideId);
        return;
    }

    e.stopPropagation();
    if (!isSelected) onSelectElement?.(el.id, isMulti);
    
    setIsDragging(true);
    setDragStartPos({ x: clientX, y: clientY });
    
    const initialPos: { [id: string]: { left: number, top: number } } = {};
    const currentIds = isSelected ? selectedElementIds : [el.id];
    currentIds.forEach(id => {
      const target = slide.elements.find(e => e.id === id);
      if (target) initialPos[id] = { 
        left: parseFloat(target.styles?.left || '0'), 
        top: parseFloat(target.styles?.top || '0') 
      };
    });
    setInitialElementsPos(initialPos);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !canvasRef.current || isPresenting) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((clientX - dragStartPos.x) / (rect.width / currentScale)) * 100 * currentScale;
      const dy = ((clientY - dragStartPos.y) / (rect.height / currentScale)) * 100 * currentScale;
      
      const newOffsets: { [id: string]: { left: string, top: string } } = {};
      Object.keys(initialElementsPos).forEach(id => {
        newOffsets[id] = { left: `${initialElementsPos[id].left + dx}%`, top: `${initialElementsPos[id].top + dy}%` };
      });
      setLocalOffsets(newOffsets);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onUp = () => {
      if (isDragging && Object.keys(localOffsets).length > 0) onUpdateElements?.(localOffsets);
      setIsDragging(false);
      setLocalOffsets({});
      setInitialElementsPos({});
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, dragStartPos, initialElementsPos, localOffsets, onUpdateElements, isPresenting, currentScale]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full flex items-center justify-center overflow-auto transition-all duration-700 ${isPresenting ? 'bg-black' : 'bg-gray-100'}`}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => !isPresenting && onSelectElement?.('', false)}
    >
      {!isPresenting && (
        <div className="fixed bottom-4 left-4 md:bottom-auto md:top-20 md:right-8 md:left-auto z-[110] flex gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 shadow-xl">
          <button onClick={() => setUserZoom(prev => Math.min(prev + 0.2, 5))} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all"><Maximize2 size={16}/></button>
          <button onClick={() => setUserZoom(prev => Math.max(prev - 0.2, 0.2))} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all"><Minimize2 size={16}/></button>
          <button onClick={() => setUserZoom(1)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all" title="Reset Zoom"><RotateCcw size={16}/></button>
          <div className="px-2 self-center text-[9px] font-black text-gray-400 uppercase tracking-widest">{Math.round(currentScale * 100)}%</div>
        </div>
      )}

      <div 
        ref={canvasRef}
        className={`relative bg-white shadow-2xl transition-all duration-300 ease-out origin-center shrink-0`}
        style={{
          width: '1000px',
          height: '562.5px',
          transform: `scale(${currentScale})`,
          backgroundColor: slide.styles?.backgroundColor || '#ffffff',
          backgroundImage: slide.styles?.backgroundImage ? `url(${slide.styles.backgroundImage})` : (slide.styles?.gradient || 'none'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          touchAction: 'none'
        }}
      >
        {!isPresenting && <SlideNavbar project={project} activeSlideId={slide.id} onNavigate={onNavigate} onToggleTheme={onThemeUpdate || (() => {})} />}

        {slide.section && !isPresenting && (
          <div className="absolute top-20 left-8 z-10 flex items-center gap-2 bg-black/5 px-4 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">{slide.section}</span>
          </div>
        )}

        <h1 
          className={`absolute top-[12%] left-[5%] right-[5%] text-center font-black outline-none z-10 ${isPresenting ? 'text-7xl text-white' : 'text-5xl hover:bg-black/5 rounded'}`} 
          contentEditable={!isPresenting}
          suppressContentEditableWarning 
          onBlur={(e) => onUpdateSlideTitle?.(e.currentTarget.innerText)}
        >
          {slide.title}
        </h1>

        {slide.elements.filter(el => !el.styles?.hidden || selectedElementIds.includes(el.id)).map((el) => {
          const isSelected = selectedElementIds.includes(el.id);
          const hasOffset = localOffsets[el.id];
          const yId = el.type === ElementType.VIDEO ? getYoutubeId(el.content) : null;
          
          const elementStyle: React.CSSProperties = {
            position: 'absolute',
            left: hasOffset ? hasOffset.left : (el.styles?.left || '10%'),
            top: hasOffset ? hasOffset.top : (el.styles?.top || '20%'),
            width: el.styles?.width || 'auto',
            height: el.styles?.height || 'auto',
            color: el.styles?.color || 'inherit',
            textAlign: el.styles?.textAlign || 'left',
            zIndex: el.styles?.zIndex || 20,
            opacity: el.styles?.hidden ? '0.3' : (el.styles?.opacity || '1'),
            cursor: isDragging && isSelected ? 'grabbing' : (isPresenting ? 'pointer' : 'grab'),
            background: el.styles?.gradient || el.styles?.backgroundColor || 'transparent',
            borderRadius: el.styles?.borderRadius || '0',
            fontSize: el.styles?.fontSize || '24px',
            fontWeight: el.styles?.fontWeight || '400',
            transform: `rotate(${el.styles?.rotation || '0deg'}) scale(${isSelected ? 1.05 : 1})`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            userSelect: 'none',
            overflow: 'hidden'
          };

          return (
            <div 
              key={el.id} 
              onMouseDown={(e) => handleElementInteraction(e, el)} 
              onTouchStart={(e) => handleElementInteraction(e, el)}
              style={elementStyle} 
              className={`${isSelected ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}
            >
              {el.type === ElementType.TEXT && <div className="outline-none min-w-[50px] whitespace-pre-wrap">{el.content}</div>}
              {(el.type === ElementType.IMAGE || el.type === ElementType.GIF) && <img src={el.content} className="w-full h-full object-cover pointer-events-none" />}
              {el.type === ElementType.BUTTON && <div className="px-10 py-4 rounded-3xl font-black text-white text-[12px] uppercase tracking-widest text-center shadow-lg" style={{ backgroundColor: primaryColor }}>{el.content}</div>}
              {el.type === ElementType.VIDEO && yId && (
                <div className="w-full h-full bg-black relative">
                   <iframe 
                    className="w-full h-full absolute inset-0 pointer-events-none"
                    src={`https://www.youtube.com/embed/${yId}?autoplay=0&controls=0&modestbranding=1`} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  />
                  {!isPresenting && <div className="absolute inset-0 bg-transparent z-10" />}
                </div>
              )}
              {el.type === ElementType.SHAPE && <div className="w-full h-full" style={{ background: el.styles?.backgroundColor || primaryColor, borderRadius: el.styles?.borderRadius }} />}
              {el.type === ElementType.LINK && <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"># {el.content}</div>}
              {el.type === ElementType.TABLE && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-3 min-w-[200px]">
                   <div className="flex items-center gap-2 opacity-30 mb-2"><TableIcon size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Interactive Table</span></div>
                   <div className="text-[11px] text-gray-400 font-medium">Element rendering prioritized in presentation mode.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isPresenting && selectedElementIds.length === 1 && !isDragging && (
        <FloatingToolbar 
          element={slide.elements.find(el => el.id === selectedElementIds[0])!} 
          project={project}
          position={{ top: 20, left: 20 }}
          onUpdate={(updates) => onUpdateElements?.({ [selectedElementIds[0]]: updates })} 
          onUpdateMetadata={(metadata) => onUpdateElementMetadata?.(selectedElementIds[0], metadata)}
        />
      )}
    </div>
  );
};

export default SlideRenderer;

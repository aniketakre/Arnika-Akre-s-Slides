
import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Wand2, Loader2, Maximize2 } from 'lucide-react';
import { generateAiImage } from '../services/geminiService';

interface AiImageModalProps {
  onClose: () => void;
  onGenerate: (imageUrl: string) => void;
}

const SUGGESTIONS = [
  "Photorealistic tech office, 8k, cinematic lighting",
  "Minimalist 3D isometric abstract shapes, pastel blue",
  "Futuristic cyberpunk city skyline at night",
  "Professional business growth chart, glassmorphism",
  "Abstract fluid silk textures, gold and navy"
];

const ASPECT_RATIOS = [
  { label: 'Square', value: '1:1', icon: '■' },
  { label: 'Landscape', value: '16:9', icon: '▭' },
  { label: 'Portrait', value: '9:16', icon: '▯' },
  { label: 'Standard', value: '4:3', icon: '▢' }
];

const AiImageModal: React.FC<AiImageModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<any>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateAiImage(prompt, ratio);
      onGenerate(url);
      onClose();
    } catch (err) {
      setError("Image generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20 flex flex-col animate-in zoom-in-95 duration-500">
        <div className="p-8 flex-1">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Image Studio</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Powered by Gemini Vision</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Describe your vision</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic 3D city with glass skyscrapers..."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-sm font-medium resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Quick Suggestions</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPrompt(s)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold hover:bg-indigo-100 transition-all active:scale-95"
                  >
                    {s.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button 
                    key={r.value} 
                    onClick={() => setRatio(r.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${ratio === r.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                  >
                    <span className="text-lg leading-none">{r.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-bold text-red-500 text-center">{error}</p>}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          <button 
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${isGenerating || !prompt.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 shadow-gray-200'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Painting with AI...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiImageModal;

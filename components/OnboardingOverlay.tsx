
import React, { useState } from 'react';
import { ChevronRight, Sparkles, Layout, Download, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    title: "Import Your Content",
    description: "Upload any Word or PowerPoint file. Gemini AI will analyze the structure and rewrite it for a high-fidelity web experience.",
    icon: Sparkles,
    color: "text-indigo-600 bg-indigo-50"
  },
  {
    title: "AI Layout Refinement",
    description: "Don't like a slide? Use the 'Design Ideas' sparkle button to let Gemini rearrange elements for maximum visual impact.",
    icon: Layout,
    color: "text-amber-600 bg-amber-50"
  },
  {
    title: "Interactive Export",
    description: "Add anchor links, 3D rotations, and custom navbars. Export to PPTX or share your live interactive link.",
    icon: Download,
    color: "text-green-600 bg-green-50"
  }
];

const OnboardingOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    else onClose();
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col items-center p-8 text-center animate-in zoom-in-95 duration-500">
        <div className={`p-4 rounded-3xl mb-6 ${step.color}`}>
          <step.icon size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{step.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{step.description}</p>

        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-100'}`} />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingOverlay;

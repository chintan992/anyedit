import React from 'react';
import { EditConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface EditPanelProps {
  config: EditConfig;
  onChange: (config: EditConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  resultImage: string | null;
}

const EditPanel: React.FC<EditPanelProps> = ({ 
  config, 
  onChange, 
  onGenerate, 
  isGenerating, 
  resultImage
}) => {
  const { isAuthenticated, login } = useAuth();
  
  const handleConfigChange = (key: keyof EditConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  if (!isAuthenticated) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl">
             <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
             </div>
             <h3 className="text-lg font-medium text-white">Sign In Required</h3>
             <p className="text-zinc-400 text-sm max-w-sm">
                 To edit images using your own quota with Gemini 2.5 Flash, please sign in with your Google account.
             </p>
             <button
               onClick={login}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
             >
               Sign In with Google
             </button>
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               rel="noreferrer"
               className="text-xs text-zinc-500 underline hover:text-zinc-300"
             >
                Pricing Information
             </a>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-1">
      
      {/* Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-sm shrink-0">
         <div className="space-y-3">
             <label className="text-sm font-medium text-zinc-300 block">Edit Instruction</label>
             <textarea 
                value={config.prompt}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                placeholder="Describe how to change the image (e.g. 'Turn the background into a cyberpunk city', 'Add a red hat')"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
             />
         </div>

         <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                 <label className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">Aspect Ratio</label>
                 <select 
                    value={config.aspectRatio}
                    onChange={(e) => handleConfigChange('aspectRatio', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                 >
                     <option value="1:1">1:1 (Square)</option>
                     <option value="3:4">3:4 (Portrait)</option>
                     <option value="4:3">4:3 (Landscape)</option>
                     <option value="9:16">9:16 (Story)</option>
                     <option value="16:9">16:9 (Cinema)</option>
                 </select>
             </div>
             {/* Gemini 2.5 Flash Image doesn't support 'imageSize' output config like Pro does, so we hide/disable it or treat as decorative for now if switching models, but keeping consistent UI is fine */}
             <div className="space-y-2 opacity-50 pointer-events-none">
                 <label className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">Quality</label>
                 <select 
                    disabled
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-500 focus:outline-none appearance-none cursor-not-allowed"
                 >
                     <option>Standard (Flash)</option>
                 </select>
             </div>
         </div>

         <button
            onClick={onGenerate}
            disabled={isGenerating || !config.prompt.trim()}
            className={`w-full py-3 rounded-lg font-medium transition-all shadow-lg ${
                isGenerating || !config.prompt.trim()
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
         >
             {isGenerating ? 'Generating Edit...' : 'Generate Edit'}
         </button>
      </div>

      {/* Result Display */}
      {resultImage && (
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col animate-fadeIn min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Result</h3>
                  <a 
                    href={resultImage} 
                    download="edited-image.png"
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors"
                  >
                      Download
                  </a>
              </div>
              <div className="flex-1 relative rounded-lg overflow-hidden bg-zinc-950/50 flex items-center justify-center border border-zinc-800/50 border-dashed">
                  <img 
                    src={resultImage} 
                    alt="Edited Result" 
                    className="max-w-full max-h-full object-contain"
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default EditPanel;

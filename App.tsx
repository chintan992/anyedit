import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import JsonCanvas from './components/JsonCanvas';
import EditPanel from './components/EditPanel';
import ProfileMenu from './components/ProfileMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnalysisResult, AnalysisStatus, EditConfig } from './types';
import { analyzeImage, generateEditedImage } from './services/geminiService';

const AppContent: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'analyze' | 'edit'>('analyze');

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Edit State
  const [editConfig, setEditConfig] = useState<EditConfig>({
    prompt: '',
    aspectRatio: '1:1',
    imageSize: '1K'
  });
  const [editResult, setEditResult] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setAnalysisResult(null);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setEditResult(null);
    setEditError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalysisStatus(AnalysisStatus.ANALYZING);
    setAnalysisError(null);

    try {
      const data = await analyzeImage(file);
      setAnalysisResult(data);
      setAnalysisStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAnalysisStatus(AnalysisStatus.ERROR);
      setAnalysisError(err.message || "Failed to analyze image.");
    }
  };

  const handleEditGenerate = async () => {
    if (!file) return;

    setIsEditing(true);
    setEditError(null);

    try {
      // Logic for using own quota is handled by the AuthContext/Service using the key
      if (!isAuthenticated) {
          await login();
      }

      const imageUrl = await generateEditedImage(file, editConfig);
      setEditResult(imageUrl);
    } catch (err: any) {
      console.error("Edit Generation Error:", err);
      
      const errorMessage = err.message || JSON.stringify(err);
      const isPermissionError = 
        errorMessage.includes("The caller does not have permission") || 
        errorMessage.includes("403") ||
        errorMessage.includes("PERMISSION_DENIED") ||
        err.status === 403;

      if (errorMessage.includes("Requested entity was not found") || isPermissionError) {
          logout(); // Reset auth state on key failure
          setEditError("Permission denied. Please sign in again with a valid paid API key.");
      } else {
          setEditError(err.message || "Failed to generate edited image.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-zinc-950/80 backdrop-blur z-20 shrink-0">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <span className="font-bold text-white">A</span>
           </div>
           <h1 className="text-lg md:text-xl font-bold tracking-tight hidden md:block">AnyEdit <span className="text-zinc-600 font-normal">/ Visual Analysis</span></h1>
           <h1 className="text-lg font-bold tracking-tight md:hidden">AnyEdit</h1>
        </div>
        
        <div className="flex items-center space-x-4">
           {/* Mode Toggles */}
           <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex items-center">
               <button
                 onClick={() => setMode('analyze')}
                 className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                     mode === 'analyze' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                 }`}
               >
                   Analyze
               </button>
               <button
                 onClick={() => setMode('edit')}
                 className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                     mode === 'edit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                 }`}
               >
                   Edit Pro
               </button>
           </div>

           <div className="h-6 w-px bg-zinc-800"></div>

           {/* User Auth */}
           {isAuthenticated ? (
               <ProfileMenu />
           ) : (
               <button
                 onClick={login}
                 className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
               >
                 Sign In
               </button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden w-full max-w-[1920px] mx-auto flex flex-col md:flex-row">
        
        {/* Left Column: Input */}
        <div className="w-full md:w-[40%] flex flex-col p-4 md:p-6 gap-6 md:h-full md:overflow-y-auto shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/50">
           <div className="flex-1 min-h-[300px] md:min-h-[400px]">
               <ImageUploader onFileSelect={handleFileSelect} selectedFile={file} />
           </div>
           
           {mode === 'analyze' && (
             <button 
                onClick={handleAnalyze}
                disabled={!file || analysisStatus === AnalysisStatus.ANALYZING}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all shadow-lg ${
                    !file || analysisStatus === AnalysisStatus.ANALYZING 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {analysisStatus === AnalysisStatus.ANALYZING ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing Structure...
                    </span>
                ) : "Generate Breakdown"}
              </button>
           )}

            {mode === 'analyze' && analysisResult && (
                <div className="h-1/2 min-h-[200px] animate-slideUp hidden md:block">
                    <JsonCanvas data={analysisResult} />
                </div>
            )}
        </div>

        {/* Right Column: Output */}
        <div className="w-full md:w-[60%] p-4 md:p-6 md:h-full md:overflow-y-auto bg-zinc-950">
            {mode === 'analyze' && (
                <>
                    {analysisStatus === AnalysisStatus.ERROR && (
                        <div className="flex items-center justify-center border border-red-900/30 bg-red-900/10 rounded-xl p-6 text-center">
                            <div className="space-y-2">
                                <p className="text-red-400 font-medium">Error processing image</p>
                                <p className="text-red-500/80 text-sm">{analysisError}</p>
                            </div>
                        </div>
                    )}

                    {analysisStatus === AnalysisStatus.SUCCESS && analysisResult && (
                        <div className="h-full">
                            <AnalysisDisplay data={analysisResult} />
                            <div className="mt-6 md:hidden h-[300px]">
                                <JsonCanvas data={analysisResult} />
                            </div>
                        </div>
                    )}

                    {(analysisStatus === AnalysisStatus.IDLE || analysisStatus === AnalysisStatus.ANALYZING) && !analysisResult && (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 text-zinc-600 space-y-4 min-h-[300px]">
                             <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                </svg>
                            </div>
                            <p>Upload an image to start analysis</p>
                        </div>
                    )}
                </>
            )}

            {mode === 'edit' && (
                 <div className="h-full flex flex-col">
                     {editError && (
                        <div className="mb-6 flex items-center justify-center border border-red-900/30 bg-red-900/10 rounded-xl p-4 text-center shrink-0">
                            <p className="text-red-400 text-sm">{editError}</p>
                        </div>
                     )}
                     
                     {file ? (
                        <EditPanel 
                            config={editConfig}
                            onChange={setEditConfig}
                            onGenerate={handleEditGenerate}
                            isGenerating={isEditing}
                            resultImage={editResult}
                        />
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 text-zinc-600 space-y-4">
                            <p>Please upload an image first to enable editing.</p>
                         </div>
                     )}
                 </div>
            )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

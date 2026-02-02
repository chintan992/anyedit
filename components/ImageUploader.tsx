import React, { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, selectedFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up object URL when component unmounts or file changes
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Source Image</h2>
      
      <div
        className={`flex-1 relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 overflow-hidden ${
          dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 hover:border-zinc-500 bg-zinc-900"
        } ${selectedFile ? "border-solid border-zinc-700" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950/50">
             {/* Use background-image for 'contain' effect to mimic professional photo viewers */}
            <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain shadow-2xl"
            />
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
              }}
              className="absolute bottom-4 right-4 bg-zinc-800/80 backdrop-blur text-white px-3 py-1.5 rounded-md text-sm hover:bg-zinc-700 border border-zinc-600 transition-colors shadow-lg"
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="text-center p-6 space-y-4">
             <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
             </div>
            <div>
                <p className="text-lg font-medium text-zinc-200">Drag & drop an image</p>
                <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
            </div>
            <button
              onClick={onButtonClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              Upload Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon, CheckCircleIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setFileName(file.name);
        onFileSelect(file);
    }
  };

  const handleZoneClick = () => {
    if (!fileName) {
        fileInputRef.current?.click();
    }
  };

  const dragDropClasses = isDragging
    ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(129,140,248,0.6)]'
    : 'border-indigo-500/30 bg-slate-900/50 hover:border-indigo-400/80 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]';

  return (
    <div className="w-full max-w-2xl text-center p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-100 mb-2 [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">Welcome, Educator!</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Let's transform your teaching materials into an engaging quiz in seconds. Just upload a chapter in PDF format to begin.</p>
        <div
            className={`relative w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${fileName ? 'border-green-500/50 bg-green-900/20' : 'cursor-pointer ' + dragDropClasses}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleZoneClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
            />
            {fileName ? (
                 <div className="flex flex-col items-center justify-center space-y-4 text-slate-300">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
                    <p className="text-lg font-medium">
                        <span className="font-semibold text-slate-100 break-all">{fileName}</span>
                    </p>
                    <p className="text-sm text-slate-400">File selected. Ready for processing!</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
                    <UploadCloudIcon className="w-16 h-16 text-indigo-400/50" />
                    <p className="text-lg font-medium">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm">PDF file (up to 10MB)</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default FileUpload;
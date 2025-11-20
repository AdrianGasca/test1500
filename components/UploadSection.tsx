import React, { useRef } from 'react';
import { Upload, Camera, Images } from 'lucide-react';

interface UploadSectionProps {
  onImagesSelect: (files: FileList) => void;
  isProcessing: boolean;
  compact?: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImagesSelect, isProcessing, compact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesSelect(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isProcessing}
          multiple
        />
        <button 
          onClick={isProcessing ? undefined : handleButtonClick}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing}
        >
          <Camera className="w-5 h-5" />
          Agregar más fotos
        </button>
      </>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isProcessing}
        multiple
      />
      
      <div 
        onClick={isProcessing ? undefined : handleButtonClick}
        className={`
          group cursor-pointer 
          border-2 border-dashed border-gray-300 hover:border-blue-500 
          rounded-2xl p-8 bg-white hover:bg-blue-50
          flex flex-col items-center justify-center 
          transition-all duration-300 ease-in-out
          shadow-sm hover:shadow-md
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors relative">
          <Camera className="w-8 h-8 text-blue-600" />
          <Images className="w-4 h-4 text-blue-800 absolute bottom-3 right-3" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Subir Fotos</h3>
        <p className="text-sm text-gray-500 text-center px-4">
          Sube fotos de varias habitaciones (Cocina, Baño, Salón) a la vez para un reporte completo.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
          <Upload className="w-3 h-3" />
          <span>Soporta JPG, PNG, WEBP</span>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
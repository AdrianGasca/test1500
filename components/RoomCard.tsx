import React, { useState } from 'react';
import { RoomEntry } from '../types';
import ScoreGauge from './ScoreGauge';
import FeedbackCard from './FeedbackCard';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';

interface RoomCardProps {
  room: RoomEntry;
  onRemove: (id: string) => void;
  onRetake: (id: string, file: File) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onRemove, onRetake }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleRetake = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onRetake(room.id, e.target.files[0]);
    }
  };

  if (room.status === 'analyzing') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (room.status === 'error' || !room.analysis) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 flex items-center gap-4">
         <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
             <img src={room.previewUrl} className="w-full h-full object-cover opacity-50" alt="Error" />
         </div>
         <div className="flex-1">
             <h3 className="font-semibold text-red-600">Error en análisis</h3>
             <p className="text-xs text-gray-500">{room.error || 'No se pudo procesar la imagen.'}</p>
         </div>
         <button onClick={() => onRemove(room.id)} className="p-2 text-gray-400 hover:text-red-500">
             <Trash2 className="w-5 h-5" />
         </button>
      </div>
    );
  }

  const { analysis } = room;
  const isPerfect = analysis.score === 100;

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${expanded ? 'border-blue-200 shadow-md' : 'border-gray-100'}`}>
      {/* Card Header / Summary */}
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="relative w-20 h-20 flex-shrink-0">
            <img 
                src={room.previewUrl} 
                alt={analysis.roomName} 
                className="w-full h-full object-cover rounded-lg shadow-sm"
            />
            {isPerfect && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    PERFECTO
                </div>
            )}
        </div>

        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">{analysis.roomName}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{analysis.summary}</p>
        </div>

        <div className="flex items-center gap-3">
             <ScoreGauge score={analysis.score} size="sm" />
             <button className="text-gray-400">
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
             </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="mt-4 space-y-4">
                 {/* Actions Toolbar */}
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalles</span>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            <span>Reemplazar Foto</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleRetake} />
                        </label>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(room.id); }}
                            className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                        </button>
                    </div>
                 </div>

                 <FeedbackCard 
                    title="Problemas" 
                    items={analysis.issues} 
                    type="issue" 
                 />
                 <FeedbackCard 
                    title="Consejos para 100/100" 
                    items={analysis.tips} 
                    type="tip" 
                 />
            </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
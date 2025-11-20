import React, { useState, useCallback, useMemo } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { analyzeCleanliness } from './services/geminiService';
import { AppState, RoomEntry } from './types';
import UploadSection from './components/UploadSection';
import ScoreGauge from './components/ScoreGauge';
import RoomCard from './components/RoomCard';

const App: React.FC = () => {
  const [rooms, setRooms] = useState<RoomEntry[]>([]);
  
  // Global state derived from rooms
  const isAnalyzing = useMemo(() => rooms.some(r => r.status === 'analyzing'), [rooms]);
  
  const globalScore = useMemo(() => {
    const completedRooms = rooms.filter(r => r.status === 'complete' && r.analysis);
    if (completedRooms.length === 0) return 0;
    const total = completedRooms.reduce((acc, curr) => acc + (curr.analysis?.score || 0), 0);
    return Math.round(total / completedRooms.length);
  }, [rooms]);

  const appState = useMemo(() => {
    if (rooms.length === 0) return AppState.IDLE;
    if (rooms.some(r => r.status === 'analyzing')) return AppState.ANALYZING;
    return AppState.RESULTS;
  }, [rooms]);

  const processFile = async (file: File, existingId?: string) => {
    const id = existingId || crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    const newEntry: RoomEntry = {
      id,
      file,
      previewUrl,
      status: 'analyzing',
      analysis: null
    };

    // Add or update entry in state
    setRooms(prev => {
      if (existingId) {
        return prev.map(r => r.id === existingId ? newEntry : r);
      }
      return [...prev, newEntry];
    });

    try {
      const result = await analyzeCleanliness(file);
      setRooms(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'complete', analysis: result } : r
      ));
    } catch (err) {
      console.error(err);
      setRooms(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'error', error: "Error al analizar" } : r
      ));
    }
  };

  const handleImagesSelect = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      processFile(file);
    });
  }, []);

  const handleRetake = useCallback((id: string, file: File) => {
    processFile(file, id);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleReset = () => {
    setRooms([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-teal-400 to-blue-500 text-white p-2 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AutoCheck</h1>
          </div>
          {rooms.length > 0 && (
             <button 
               onClick={handleReset}
               className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
               <span className="hidden sm:inline">Borrar Todo</span>
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-32">
        
        {/* IDLE STATE */}
        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8 fade-in">
            <div className="text-center max-w-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Inspector de Habitaciones</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Sube fotos de todas las habitaciones (cocina, baño, salón). Nuestra IA calculará el puntaje de limpieza de cada área y el promedio global.
              </p>
            </div>
            <UploadSection onImagesSelect={handleImagesSelect} isProcessing={false} />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-12">
               {[
                { label: "Análisis Multi-Habitación", desc: "Sube fotos de todo el apartamento a la vez." },
                { label: "Puntaje Global", desc: "Obtén el promedio de limpieza de toda la propiedad." },
                { label: "Mejora Continua", desc: "Reemplaza fotos hasta lograr el 100/100." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.label}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS / LIST STATE */}
        {rooms.length > 0 && (
          <div className="space-y-8">
            
            {/* Global Score Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
               
               <div className="flex-shrink-0">
                 <ScoreGauge score={globalScore} />
               </div>
               
               <div className="flex-1 text-center md:text-left">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Puntaje General</h2>
                 <p className="text-gray-600 mb-4">
                   {isAnalyzing 
                     ? "Analizando habitaciones restantes..." 
                     : globalScore === 100 
                       ? "¡El apartamento está impecable! Todo listo." 
                       : "Algunas áreas necesitan atención para alcanzar la perfección."
                   }
                 </p>
                 
                 {isAnalyzing && (
                   <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 font-medium">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>Procesando imágenes...</span>
                   </div>
                 )}

                 {!isAnalyzing && globalScore === 100 && (
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Certificado de Limpieza IA</span>
                    </div>
                 )}
               </div>
            </div>

            {/* Room List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-lg font-bold text-gray-800">Habitaciones ({rooms.length})</h3>
                 <span className="text-xs text-gray-500">Toca una tarjeta para ver detalles</span>
              </div>
              
              <div className="grid gap-4">
                {rooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onRemove={handleRemove} 
                    onRetake={handleRetake}
                  />
                ))}
              </div>
            </div>
            
            {/* Fixed Bottom Action */}
            <div className="sticky bottom-6 z-10 flex justify-center">
               <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-2 border border-gray-200">
                 <UploadSection onImagesSelect={handleImagesSelect} isProcessing={false} compact={true} />
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
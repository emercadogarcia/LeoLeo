import React from 'react';
import { ModuleId } from '../types';
import { Sparkles } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface ModuleNavProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
}

export const ModuleNav: React.FC<ModuleNavProps> = ({ activeModule, onSelectModule }) => {
  const modules = [
    {
      id: 'cazador' as ModuleId,
      title: 'Cazador de Sonidos',
      subtitle: 'Fonemas y Letras',
      icon: '🎈',
      color: 'from-amber-400 to-orange-500',
      activeBorder: 'border-orange-600',
    },
    {
      id: 'tren' as ModuleId,
      title: 'Tren de Sílabas',
      subtitle: 'Formar Palabras',
      icon: '🚂',
      color: 'from-cyan-400 to-blue-500',
      activeBorder: 'border-blue-600',
    },
    {
      id: 'cuentistas' as ModuleId,
      title: 'Pequeños Cuentistas',
      subtitle: 'Armar Oraciones',
      icon: '📚',
      color: 'from-emerald-400 to-teal-500',
      activeBorder: 'border-teal-600',
    },
    {
      id: 'pizarra' as ModuleId,
      title: 'Pizarra Libre',
      subtitle: 'Explora y Escucha',
      icon: '🎨',
      color: 'from-purple-400 to-indigo-500',
      activeBorder: 'border-indigo-600',
    },
    {
      id: 'album' as ModuleId,
      title: 'Mi Álbum',
      subtitle: 'Calcomanías',
      icon: '⭐',
      color: 'from-rose-400 to-pink-500',
      activeBorder: 'border-pink-600',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-3 pb-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x justify-start sm:justify-center">
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                playPopSound();
                onSelectModule(m.id);
              }}
              className={`shrink-0 snap-center flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all font-black text-left cursor-pointer border-3 ${
                isActive
                  ? `bg-gradient-to-r ${m.color} text-white ${m.activeBorder} shadow-lg scale-102 ring-4 ring-white/60`
                  : 'bg-white hover:bg-amber-100/70 text-slate-700 border-amber-200 shadow-xs hover:border-amber-300'
              }`}
            >
              <span className="text-2xl sm:text-3xl drop-shadow-xs">{m.icon}</span>
              <div>
                <span className="block text-xs sm:text-sm leading-tight font-extrabold">
                  {m.title}
                </span>
                <span className={`block text-[10px] leading-tight font-semibold ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                  {m.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

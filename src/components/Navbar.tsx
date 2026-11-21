import React from 'react';
import { Volume2, Star, Shield, Users, Sparkles, BookOpen } from 'lucide-react';
import { ChildProfile, ModuleId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { playPopSound, playTileSnap } from '../utils/audio';

interface NavbarProps {
  activeProfile: ChildProfile;
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onOpenProfileSelector: () => void;
  onOpenParentGate: () => void;
  onRepeatAudio: () => void;
  hasAudioInstruction: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  activeModule,
  onSelectModule,
  onOpenProfileSelector,
  onOpenParentGate,
  onRepeatAudio,
  hasAudioInstruction,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-amber-400/95 backdrop-blur-md shadow-md border-b-4 border-amber-500">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Child Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              playPopSound();
              onSelectModule('cazador');
            }}
            className="flex items-center gap-1.5 group cursor-pointer"
            title="Inicio LeoLeo"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-md border-2 border-amber-600 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
              🦁
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xl font-black text-amber-950 tracking-tight block">
                Leo<span className="text-white drop-shadow-sm">Leo</span>
              </span>
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest block">
                Lectura Inicial
              </span>
            </div>
          </button>

          {/* Active Child Profile Pill */}
          <button
            onClick={() => {
              playTileSnap();
              onOpenProfileSelector();
            }}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white px-2.5 sm:px-3 py-1.5 rounded-2xl border-2 border-amber-600 shadow-sm hover:shadow transition active:scale-95"
            title="Cambiar lector"
          >
            <span className="text-xl sm:text-2xl">{activeProfile.avatar}</span>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black text-slate-800 block truncate max-w-[80px] sm:max-w-[120px]">
                {activeProfile.name}
              </span>
              <span className="text-[10px] font-bold text-amber-700 block">
                Nivel {activeProfile.level}
              </span>
            </div>
          </button>
        </div>

        {/* Center / Big Repeat Audio Speaker Button */}
        <div className="flex items-center gap-2">
          {hasAudioInstruction && (
            <button
              onClick={() => {
                playPopSound();
                onRepeatAudio();
              }}
              className="relative flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-rose-300 animate-pulse"
              title="Escuchar de nuevo la instrucción"
              aria-label="Repetir audio"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="hidden xs:inline tracking-wide uppercase font-extrabold">
                ¡Repetir Voz!
              </span>
            </button>
          )}

          {/* Stars Counter */}
          <button
            onClick={() => {
              playPopSound();
              onSelectModule('album');
            }}
            className="flex items-center gap-1.5 bg-amber-100/90 hover:bg-white px-2.5 sm:px-3.5 py-1.5 rounded-2xl border-2 border-amber-500 shadow-xs hover:scale-105 transition"
            title="Ver mis estrellas y calcomanías"
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-base sm:text-lg font-black text-amber-950">
              {activeProfile.stars}
            </span>
          </button>
        </div>

        {/* Right Tools: PWA Install & Parental Lock */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton />

          {/* Parental Control Button */}
          <button
            onClick={() => {
              playTileSnap();
              onOpenParentGate();
            }}
            className="flex items-center gap-1.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 border-2 border-indigo-400"
            title="Panel de Padres y Tutores (Protegido)"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Tutores</span>
          </button>
        </div>
      </div>
    </header>
  );
};

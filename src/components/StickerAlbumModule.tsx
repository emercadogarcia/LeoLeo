import React, { useState, useRef } from 'react';
import { Sparkles, Lock, Star, Move, RotateCcw } from 'lucide-react';
import { ChildProfile, PlacedSticker } from '../types';
import { STICKERS_DATA } from '../data/learningData';
import { speakText, playPopSound, playStarCollect, playTileSnap } from '../utils/audio';

interface StickerAlbumModuleProps {
  activeProfile: ChildProfile;
  onUpdatePlacedStickers: (placed: PlacedSticker[]) => void;
}

export const StickerAlbumModule: React.FC<StickerAlbumModuleProps> = ({
  activeProfile,
  onUpdatePlacedStickers,
}) => {
  const [selectedStickerToPlace, setSelectedStickerToPlace] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const placed = activeProfile.placedStickers || [];

  // Tap sticker in drawer
  const handleSelectDrawerSticker = (stickerId: string, isUnlocked: boolean, name: string) => {
    if (!isUnlocked) {
      const sticker = STICKERS_DATA.find(s => s.id === stickerId);
      speakText(`Esta calcomanía se desbloquea con ${sticker?.starsRequired} estrellas. ¡Sigue jugando!`, {
        pitch: 1.15,
        rate: 0.85,
      });
      return;
    }

    playPopSound();
    speakText(`¡Calcomanía de ${name}! Toca el paisaje para pegarla.`, { pitch: 1.2 });
    setSelectedStickerToPlace(stickerId);
  };

  // Place sticker on landscape canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerToPlace || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    playStarCollect();
    const newPlaced: PlacedSticker = {
      id: `p_${Date.now()}`,
      stickerId: selectedStickerToPlace,
      x: Math.max(5, Math.min(92, x)),
      y: Math.max(8, Math.min(88, y)),
      scale: 1,
    };

    onUpdatePlacedStickers([...placed, newPlaced]);
    setSelectedStickerToPlace(null);
  };

  // Remove single placed sticker
  const handleRemovePlaced = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playPopSound();
    onUpdatePlacedStickers(placed.filter(p => p.id !== id));
  };

  // Clear canvas
  const handleResetCanvas = () => {
    playPopSound();
    onUpdatePlacedStickers([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-pink-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider">
            Álbum de Premios y Calcomanías
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 drop-shadow-sm">
            El Mundo de {activeProfile.name}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-rose-100">
            Desbloquea calcomanías ganando estrellas y pégalas en tu paisaje
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl border border-white/30 backdrop-blur-xs">
          <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          <span className="text-xl sm:text-2xl font-black">{activeProfile.stars} Estrellas</span>
        </div>
      </div>

      {/* Interactive Sticker Landscape Canvas */}
      <div className="w-full mt-6 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
            {selectedStickerToPlace ? '👉 ¡Toca el paisaje donde quieras colocar tu calcomanía!' : 'Paisaje para decorar'}
          </span>
          {placed.length > 0 && (
            <button
              onClick={handleResetCanvas}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar paisaje</span>
            </button>
          )}
        </div>

        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`w-full h-72 sm:h-96 rounded-3xl border-4 relative overflow-hidden shadow-2xl transition cursor-crosshair select-none ${
            selectedStickerToPlace
              ? 'ring-4 ring-rose-400 border-rose-500'
              : 'border-amber-300'
          }`}
          style={{
            background: 'linear-gradient(to bottom, #70d6ff 0%, #99e2b4 60%, #52b788 100%)',
          }}
        >
          {/* Sunny Sky Accents */}
          <div className="absolute top-4 right-8 text-4xl animate-pulse">☀️</div>
          <div className="absolute top-8 left-12 text-3xl opacity-60">☁️</div>
          <div className="absolute top-16 right-36 text-2xl opacity-50">☁️</div>
          {/* Hills & Grass */}
          <div className="absolute bottom-2 left-6 text-3xl">🌳</div>
          <div className="absolute bottom-4 right-10 text-3xl">🏡</div>
          <div className="absolute bottom-1 right-28 text-2xl">🌷</div>
          <div className="absolute bottom-2 left-32 text-2xl">🌻</div>

          {/* Placed Stickers */}
          {placed.map((item) => {
            const stickerDef = STICKERS_DATA.find(s => s.id === item.stickerId);
            if (!stickerDef) return null;

            return (
              <div
                key={item.id}
                onClick={(e) => handleRemovePlaced(item.id, e)}
                className="absolute text-5xl sm:text-6xl cursor-pointer hover:scale-125 transition-transform drop-shadow-lg group"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${stickerDef.name} (Toca para despegar)`}
              >
                <span>{stickerDef.emoji}</span>
                <span className="hidden group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-black/75 text-white font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                  Despegar
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stickers Showcase Drawer */}
      <div className="w-full mt-6 bg-white rounded-3xl p-5 sm:p-6 border-4 border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Colección de Calcomanías ({activeProfile.unlockedStickers?.length || 0} / {STICKERS_DATA.length})
          </span>
          <span className="text-xs font-bold text-amber-600">
            Toca una calcomanía desbloqueada para pegarla
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {STICKERS_DATA.map((sticker) => {
            const isUnlocked = activeProfile.unlockedStickers?.includes(sticker.id);
            const isSelected = selectedStickerToPlace === sticker.id;

            return (
              <button
                key={sticker.id}
                onClick={() => handleSelectDrawerSticker(sticker.id, isUnlocked, sticker.name)}
                className={`p-3 rounded-2xl border-3 flex flex-col items-center justify-center gap-1 transition-all relative ${
                  isSelected
                    ? 'bg-rose-100 border-rose-500 shadow-lg scale-105 ring-4 ring-rose-200'
                    : isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 hover:shadow-md hover:scale-105 cursor-pointer'
                    : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-4xl sm:text-5xl">{sticker.emoji}</span>
                    <span className="text-[11px] font-black text-slate-800 truncate max-w-full">
                      {sticker.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 my-1">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      ⭐ {sticker.starsRequired} estrellas
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

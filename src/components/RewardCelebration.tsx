import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import { playSuccessChime, playStarCollect, speakText } from '../utils/audio';

interface RewardCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  starsEarned: number;
  message?: string;
  unlockedStickerName?: string;
  unlockedStickerEmoji?: string;
}

export const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  isOpen,
  onClose,
  starsEarned,
  message = '¡Excelente trabajo, campeón!',
  unlockedStickerName,
  unlockedStickerEmoji,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSuccessChime();
      playStarCollect();

      // Confetti burst
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF9F1C', '#FFBF69', '#2EC4B6', '#E71D36', '#9B5DE5'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } catch {
        // Fallback if canvas-confetti is not supported
      }

      if (unlockedStickerName) {
        speakText(`¡Genial! ¡Ganaste estrellas y desbloqueaste la calcomanía de ${unlockedStickerName}!`);
      } else {
        speakText(`¡Bravo! ¡Excelente trabajo! Ganaste ${starsEarned} estrellas.`);
      }
    }
  }, [isOpen, starsEarned, unlockedStickerName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-400">
        {/* Floating Stars */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-400 border-4 border-white shadow-lg flex items-center justify-center animate-bounce text-2xl">
            ⭐
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-200 text-amber-900 font-extrabold text-sm tracking-wide mb-2 uppercase">
            ¡Misión Cumplida!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
            {message}
          </h2>
        </div>

        {/* Stars earned badge */}
        <div className="my-5 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white/90 shadow-inner border border-amber-200 max-w-xs mx-auto">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-2xl font-black text-amber-900">
            +{starsEarned} {starsEarned === 1 ? 'Estrella' : 'Estrellas'}
          </span>
        </div>

        {/* Unlocked sticker card */}
        {unlockedStickerName && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 border-2 border-purple-300 shadow-md">
            <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>¡Nueva Calcomanía Desbloqueada!</span>
            </div>
            <div className="text-5xl my-2 animate-bounce">
              {unlockedStickerEmoji || '🎁'}
            </div>
            <p className="text-lg font-black text-purple-900">
              {unlockedStickerName}
            </p>
            <p className="text-xs text-purple-700 font-medium">
              ¡Ya puedes pegarla en tu Álbum de Calcomanías!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg sm:text-xl shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 border-b-4 border-emerald-700"
        >
          <span>¡Seguir Jugando!</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, Trophy, Heart } from 'lucide-react';
import { PhonemeItem, ChildProfile } from '../types';
import { PHONEMES_DATA } from '../data/learningData';
import { speakText, playPopSound, playGentleBoing, playSuccessChime } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SoundHunterModuleProps {
  activeProfile: ChildProfile;
  onRecordAttempt: (type: 'phoneme' | 'syllable', itemId: string, isSuccess: boolean) => void;
  onRewardTrigger: (stars: number, message: string) => void;
  reinforceList?: string[]; // If coming from custom reinforcement
  onClearReinforce?: () => void;
}

const BALLOON_COLORS = [
  { bg: 'bg-rose-500', border: 'border-rose-600', shadow: 'shadow-rose-300', text: 'text-white' },
  { bg: 'bg-amber-400', border: 'border-amber-500', shadow: 'shadow-amber-300', text: 'text-amber-950' },
  { bg: 'bg-emerald-500', border: 'border-emerald-600', shadow: 'shadow-emerald-300', text: 'text-white' },
  { bg: 'bg-sky-500', border: 'border-sky-600', shadow: 'shadow-sky-300', text: 'text-white' },
  { bg: 'bg-purple-500', border: 'border-purple-600', shadow: 'shadow-purple-300', text: 'text-white' },
];

export const SoundHunterModule: React.FC<SoundHunterModuleProps> = ({
  activeProfile,
  onRecordAttempt,
  onRewardTrigger,
  reinforceList,
  onClearReinforce,
}) => {
  const [filterType, setFilterType] = useState<'todos' | 'vocales' | 'consonantes'>('todos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<PhonemeItem[]>([]);
  const [shakingLetter, setShakingLetter] = useState<string | null>(null);
  const [poppingLetter, setPoppingLetter] = useState<string | null>(null);
  const [scoreStreak, setScoreStreak] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Pool of items based on filter or custom reinforcement
  const activePool = React.useMemo(() => {
    let pool = PHONEMES_DATA;
    if (reinforceList && reinforceList.length > 0) {
      const filtered = pool.filter(p => reinforceList.includes(p.letter.toUpperCase()) || reinforceList.includes(p.id));
      if (filtered.length > 0) return filtered;
    }
    if (filterType === 'vocales') {
      return pool.filter(p => p.type === 'vocal');
    }
    if (filterType === 'consonantes') {
      return pool.filter(p => p.type === 'consonante');
    }
    return pool;
  }, [filterType, reinforceList]);

  const targetItem: PhonemeItem = activePool[currentIndex % activePool.length] || PHONEMES_DATA[0];

  // Speak instruction
  const announceCurrent = useCallback(() => {
    if (!targetItem) return;
    speakText(targetItem.instructionText, {
      pitch: 1.15,
      rate: 0.82,
    });
  }, [targetItem]);

  // Generate 4 randomized options (1 correct + 3 distinct distractors)
  const setupRound = useCallback(() => {
    if (!targetItem) return;
    const others = PHONEMES_DATA.filter(p => p.id !== targetItem.id);
    // Shuffle others and pick 3
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const roundBalloons = [targetItem, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setShuffledOptions(roundBalloons);
    setShakingLetter(null);
    setPoppingLetter(null);
    setIsTransitioning(false);

    // Auto-announce after small pause
    setTimeout(() => {
      announceCurrent();
    }, 350);
  }, [targetItem, announceCurrent]);

  useEffect(() => {
    setupRound();
  }, [currentIndex, filterType, reinforceList, setupRound]);

  // Handle balloon click
  const handleBalloonClick = (item: PhonemeItem) => {
    if (isTransitioning || poppingLetter) return;

    if (item.id === targetItem.id) {
      // Correct!
      setIsTransitioning(true);
      setPoppingLetter(item.letter);
      playPopSound();
      playSuccessChime();

      // Confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      const praise = `¡Excelente! ¡${item.letter} de ${item.exampleWord}!`;
      speakText(praise, {
        pitch: 1.2,
        rate: 0.88,
      });

      onRecordAttempt('phoneme', item.id, true);
      const newStreak = scoreStreak + 1;
      setScoreStreak(newStreak);

      // Reward every 4 correct answers
      if (newStreak % 4 === 0) {
        setTimeout(() => {
          onRewardTrigger(2, '¡Gran racha de fonemas cazados!');
        }, 1200);
      }

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1800);
    } else {
      // Mistake: gentle anti-frustration feedback
      playGentleBoing();
      setShakingLetter(item.letter);
      onRecordAttempt('phoneme', targetItem.id, false);
      setScoreStreak(0);

      speakText(`¡Casi! Escucha cómo suena: ${targetItem.pronouncePhoneme}. ¡Busca la letra ${targetItem.letter}!`, {
        pitch: 1.1,
        rate: 0.82,
      });

      setTimeout(() => {
        setShakingLetter(null);
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Reinforcement banner if active */}
      {reinforceList && reinforceList.length > 0 && (
        <div className="w-full mb-3 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span className="text-xs sm:text-sm font-black">
              Modo Refuerzo Personalizado: Practicando fonemas recomendados ({reinforceList.join(', ')})
            </span>
          </div>
          {onClearReinforce && (
            <button
              onClick={onClearReinforce}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl font-bold transition"
            >
              Salir
            </button>
          )}
        </div>
      )}

      {/* Category selector pills */}
      <div className="flex items-center gap-2 mb-4 bg-white/80 p-1.5 rounded-full border-2 border-amber-300 shadow-xs">
        {(['todos', 'vocales', 'consonantes'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              playPopSound();
              setFilterType(mode);
              setCurrentIndex(0);
            }}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black transition capitalize ${
              filterType === mode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode === 'todos' ? '🌈 Todas las letras' : mode === 'vocales' ? '🅰️ Solo Vocales' : '🔤 Consonantes'}
          </button>
        ))}
      </div>

      {/* Main Target Sound Instruction Banner */}
      <div className="w-full bg-gradient-to-b from-white to-amber-50 rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-amber-300 text-center relative overflow-hidden">
        {/* Soft background clouds */}
        <div className="absolute top-2 left-4 text-3xl opacity-30 select-none">☁️</div>
        <div className="absolute top-4 right-6 text-2xl opacity-30 select-none">☁️</div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Big Repeat Speaker Button (>= 64x64px) */}
          <button
            onClick={() => {
              playPopSound();
              announceCurrent();
            }}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-white ring-4 ring-rose-200 shrink-0 cursor-pointer group"
            title="Escuchar sonido otra vez"
            aria-label="Repetir fonema"
          >
            <Volume2 className="w-9 h-9 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Escuchar</span>
          </button>

          <div className="text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider mb-1">
              {targetItem.type === 'vocal' ? '¡Atrapa la vocal!' : '¡Atrapa la consonante!'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {targetItem.instructionText}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
              Pista: {targetItem.soundDescription}
            </p>
          </div>
        </div>

        {/* Current example preview badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 px-4 py-1.5 rounded-full border border-amber-300 text-xs sm:text-sm font-extrabold">
          <span>Ejemplo:</span>
          <span className="text-xl">{targetItem.exampleEmoji}</span>
          <span>{targetItem.exampleWord}</span>
        </div>
      </div>

      {/* Floating Animated Balloons Field */}
      <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 min-h-[260px] items-center justify-items-center">
        {shuffledOptions.map((item, idx) => {
          const color = BALLOON_COLORS[idx % BALLOON_COLORS.length];
          const isShaking = shakingLetter === item.letter;
          const isPopping = poppingLetter === item.letter;

          return (
            <div key={`${item.id}-${idx}`} className="relative flex flex-col items-center">
              <motion.button
                onClick={() => handleBalloonClick(item)}
                animate={
                  isPopping
                    ? { scale: [1, 1.4, 0], opacity: [1, 0.8, 0] }
                    : isShaking
                    ? { x: [-10, 10, -10, 10, 0] }
                    : {
                        y: [0, -12, 0],
                        rotate: [-2, 2, -2],
                      }
                }
                transition={
                  isPopping
                    ? { duration: 0.4 }
                    : isShaking
                    ? { duration: 0.5 }
                    : {
                        duration: 3 + idx * 0.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
                className={`relative w-28 h-36 sm:w-32 sm:h-42 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] ${color.bg} ${color.border} border-4 ${color.shadow} shadow-xl flex flex-col items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-transform group`}
                style={{
                  minWidth: '72px',
                  minHeight: '72px',
                }}
                aria-label={`Letra ${item.letter}`}
              >
                {/* Balloon highlight reflection */}
                <div className="absolute top-4 left-5 w-5 h-8 bg-white/40 rounded-full rotate-[-25deg] pointer-events-none" />

                {/* Big Bold Letter */}
                <span className={`text-5xl sm:text-6xl font-black ${color.text} drop-shadow-md select-none`}>
                  {item.letter}
                </span>

                {/* Knot at bottom of balloon */}
                <div className="absolute -bottom-2 w-3.5 h-3.5 bg-inherit rounded-sm rotate-45 border-b border-r border-black/20" />
              </motion.button>

              {/* Balloon String */}
              <div className="w-0.5 h-8 bg-slate-400 mt-1" />
            </div>
          );
        })}
      </div>

      {/* Friendly Bottom Help / Encouragement */}
      <div className="mt-4 flex items-center justify-between w-full max-w-md bg-white/70 px-4 py-2.5 rounded-2xl border border-amber-200 text-xs sm:text-sm font-bold text-slate-600 shadow-xs">
        <div className="flex items-center gap-1.5 text-amber-700">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Racha actual: {scoreStreak} aciertos</span>
        </div>
        <button
          onClick={() => {
            playPopSound();
            setCurrentIndex(prev => prev + 1);
          }}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Saltar letra</span>
        </button>
      </div>
    </div>
  );
};

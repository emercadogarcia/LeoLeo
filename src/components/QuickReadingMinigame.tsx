import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Timer,
  Trophy,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { HIGH_FREQUENCY_WORDS, HighFrequencyWord } from '../data/learningData';
import { ChildProfile } from '../types';
import {
  speakText,
  playPopSound,
  playSuccessChime,
  playStarCollect,
  playGentleBoing,
  playTileSnap,
} from '../utils/audio';
import confetti from 'canvas-confetti';

interface QuickReadingMinigameProps {
  activeProfile: ChildProfile;
  onRewardTrigger: (stars: number, message: string) => void;
  onSaveWord?: (word: string) => void;
  onBackToBoard: () => void;
}

export const QuickReadingMinigame: React.FC<QuickReadingMinigameProps> = ({
  activeProfile,
  onRewardTrigger,
  onSaveWord,
  onBackToBoard,
}) => {
  // Game states: 'ready' (intro) | 'reading' (5s ticking) | 'revealed' (result & audio)
  const [gameState, setGameState] = useState<'ready' | 'reading' | 'revealed'>('ready');
  const [currentWord, setCurrentWord] = useState<HighFrequencyWord>(() => {
    return HIGH_FREQUENCY_WORDS[Math.floor(Math.random() * HIGH_FREQUENCY_WORDS.length)];
  });
  const [timeLeft, setTimeLeft] = useState(5);
  const [wordsReadCount, setWordsReadCount] = useState(0);
  const [readInTime, setReadInTime] = useState(false);
  const [usedWordIds, setUsedWordIds] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick a new random word avoiding immediate repetition
  const pickRandomWord = useCallback((): HighFrequencyWord => {
    const available = HIGH_FREQUENCY_WORDS.filter((w) => !usedWordIds.includes(w.id));
    const pool = available.length > 0 ? available : HIGH_FREQUENCY_WORDS;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    setUsedWordIds((prev) => {
      const next = [...prev, picked.id];
      return next.length >= HIGH_FREQUENCY_WORDS.length ? [picked.id] : next;
    });

    return picked;
  }, [usedWordIds]);

  // Clean timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start round
  const startReadingRound = useCallback(() => {
    clearTimer();
    const word = pickRandomWord();
    setCurrentWord(word);
    setTimeLeft(5);
    setReadInTime(false);
    setGameState('reading');
    playTileSnap();

    // Friendly prompt on first run or start
    // Start 5-second interval
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearTimer();
        // Time expired! Reveal
        handleTimeExpired(word);
      }
    }, 200);
  }, [pickRandomWord]);

  // Handle when 5 seconds expire
  const handleTimeExpired = (word: HighFrequencyWord) => {
    setGameState('revealed');
    setReadInTime(false);
    playPopSound();

    speakText(`¡Tiempo! La palabra era ${word.word}. ${word.hint}`, {
      pitch: 1.15,
      rate: 0.85,
    });
  };

  // When child taps "¡Ya la leí!" before time runs out
  const handleSuccessRead = () => {
    if (gameState !== 'reading') return;
    clearTimer();
    setReadInTime(true);
    setGameState('revealed');

    playSuccessChime();
    playStarCollect();

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {}

    const newCount = wordsReadCount + 1;
    setWordsReadCount(newCount);

    speakText(`¡Súper veloz! ¡Leíste ${currentWord.word}!`, {
      pitch: 1.2,
      rate: 0.88,
    });

    onRewardTrigger(1, `¡Lectura relámpago lograda: ${currentWord.word}!`);

    if (onSaveWord) {
      onSaveWord(currentWord.word);
    }
  };

  // Listen to the word pronunciation
  const handleListenWord = () => {
    speakText(`La palabra es ${currentWord.word}. ${currentWord.hint}`, {
      pitch: 1.2,
      rate: 0.82,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Minigame Header */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-black text-xs uppercase tracking-wider">
                Lectura Rápida
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> 5 Segundos
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 drop-shadow-sm">
              ¡Desafío de Palabras Relámpago!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-100">
              Intenta leer la palabra en voz alta antes de que se esconda
            </p>
          </div>
        </div>

        {/* Score & Back button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/20 px-3.5 py-2 rounded-2xl border border-white/30 backdrop-blur-xs">
            <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-white/80 block">Leídas</span>
              <span className="text-lg font-black text-white">{wordsReadCount}</span>
            </div>
          </div>

          <button
            onClick={onBackToBoard}
            className="px-3.5 py-2 rounded-2xl bg-white text-slate-800 hover:bg-amber-100 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center gap-1"
            title="Volver a la Pizarra Libre"
          >
            <span>Volver a Pizarra</span>
          </button>
        </div>
      </div>

      {/* Main Play Arena */}
      <div className="w-full mt-6 bg-slate-900 rounded-3xl p-6 sm:p-10 border-4 border-amber-400 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
        {/* Soft magical star sparkles in the background */}
        <div className="absolute top-4 left-6 text-2xl opacity-40 select-none animate-pulse">✨</div>
        <div className="absolute bottom-6 right-8 text-3xl opacity-40 select-none animate-pulse">⭐</div>
        <div className="absolute top-6 right-12 text-2xl opacity-30 select-none">⚡</div>

        {/* STATE 1: Ready / Start Screen */}
        {gameState === 'ready' && (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-200 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-4xl mb-4 shadow-xl border-4 border-white animate-bounce">
              ⚡
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              ¿Listo para leer a toda velocidad?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-amber-200 max-w-md">
              Aparecerá una palabra por <strong>5 segundos</strong>. Léela fuerte antes de que desaparezca, ¡y luego descubre su sorpresa!
            </p>

            <button
              onClick={startReadingRound}
              className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xl sm:text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-emerald-700 cursor-pointer"
            >
              <Zap className="w-7 h-7 text-amber-300 fill-amber-300" />
              <span>¡Comenzar Desafío!</span>
            </button>
          </div>
        )}

        {/* STATE 2: Reading (5 seconds countdown active) */}
        {gameState === 'reading' && (
          <div className="w-full flex flex-col items-center text-center">
            {/* 5-second Visual Timer Bar & Badge */}
            <div className="w-full max-w-md mb-6">
              <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-1.5 px-1">
                <span className="text-amber-300 flex items-center gap-1">
                  <Timer className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                  ¡Léela en voz alta!
                </span>
                <span
                  className={`text-lg font-black px-3 py-0.5 rounded-full ${
                    timeLeft <= 2
                      ? 'bg-rose-500 text-white animate-ping'
                      : timeLeft <= 3
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700 p-0.5 shadow-inner">
                <motion.div
                  className={`h-full rounded-full ${
                    timeLeft <= 2
                      ? 'bg-gradient-to-r from-rose-500 to-red-600'
                      : timeLeft <= 3
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 5) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* The Big Flashcard Word */}
            <motion.div
              key={currentWord.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-4 px-6 sm:px-12 py-6 sm:py-8 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 rounded-3xl border-4 border-amber-200 shadow-2xl flex items-center justify-center select-none"
            >
              <span className="text-5xl sm:text-7xl md:text-8xl font-black text-slate-950 tracking-wider drop-shadow-sm font-['Fredoka',sans-serif]">
                {currentWord.word}
              </span>
            </motion.div>

            {/* Prompt buttons */}
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={handleSuccessRead}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg sm:text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-emerald-700 cursor-pointer"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                <span>¡Ya la leí!</span>
              </button>

              <button
                onClick={handleListenWord}
                className="px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold text-sm sm:text-base border border-slate-600 transition flex items-center gap-2"
                title="Escuchar una pista con la voz mágica"
              >
                <Volume2 className="w-5 h-5 text-amber-400" />
                <span>Escuchar pista</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: Revealed (Time expired or child completed) */}
        {gameState === 'revealed' && (
          <div className="w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="text-7xl sm:text-8xl mb-3 animate-bounce">
              {currentWord.emoji}
            </div>

            <div className="mb-2">
              <span className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-wider">
                {readInTime ? '🎉 ¡Fantástico! La leíste a tiempo' : '⏰ ¡Se escondió la palabra!'}
              </span>
              <h3 className="text-4xl sm:text-6xl font-black text-white tracking-widest mt-1">
                {currentWord.word}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 font-medium mt-1 max-w-md">
                « {currentWord.hint} »
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={handleListenWord}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-sm sm:text-base border border-slate-600 transition flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                <span>Repetir con voz</span>
              </button>

              <button
                onClick={startReadingRound}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-amber-600 cursor-pointer"
              >
                <span>¡Siguiente Palabra Rápida!</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High Frequency Words Reference Pill Tray */}
      <div className="w-full mt-6 bg-amber-50/90 rounded-3xl p-5 border-2 border-amber-200 text-center">
        <span className="text-xs font-black uppercase text-amber-800 tracking-wider block mb-2">
          Banco de palabras rápidas de alta frecuencia ({HIGH_FREQUENCY_WORDS.length} palabras clave)
        </span>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {HIGH_FREQUENCY_WORDS.slice(0, 12).map((w) => (
            <button
              key={w.id}
              onClick={() => {
                playPopSound();
                speakText(w.word, { pitch: 1.2 });
              }}
              className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-700 hover:border-amber-500 hover:scale-105 transition flex items-center gap-1 shadow-xs"
            >
              <span>{w.emoji}</span>
              <span>{w.word}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

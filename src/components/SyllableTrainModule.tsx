import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SyllableWordItem, ChildProfile } from '../types';
import { SYLLABLE_WORDS } from '../data/learningData';
import { speakText, playPopSound, playGentleBoing, playSuccessChime, playTrainWhistle, playTileSnap } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SyllableTrainModuleProps {
  activeProfile: ChildProfile;
  onRecordAttempt: (type: 'phoneme' | 'syllable', itemId: string, isSuccess: boolean) => void;
  onRecordWord: (word: string) => void;
  onRewardTrigger: (stars: number, message: string) => void;
  reinforceList?: string[];
}

export const SyllableTrainModule: React.FC<SyllableTrainModuleProps> = ({
  activeProfile,
  onRecordAttempt,
  onRecordWord,
  onRewardTrigger,
  reinforceList,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<Array<{ id: string; text: string }>>([]);
  const [placedTiles, setPlacedTiles] = useState<Array<{ id: string; text: string } | null>>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  // Pool of words
  const activePool = React.useMemo(() => {
    if (reinforceList && reinforceList.length > 0) {
      // Find words containing flagged syllables
      const matching = SYLLABLE_WORDS.filter(w =>
        w.syllables.some(s => reinforceList.includes(s.toUpperCase()))
      );
      if (matching.length > 0) return matching;
    }
    return SYLLABLE_WORDS;
  }, [reinforceList]);

  const currentWord: SyllableWordItem = activePool[wordIndex % activePool.length] || SYLLABLE_WORDS[0];

  // Initialize round
  const setupWordRound = useCallback(() => {
    if (!currentWord) return;
    setIsSuccess(false);
    setIsShaking(false);
    setPlacedTiles(new Array(currentWord.syllables.length).fill(null));

    // Scramble syllables
    const tiles = currentWord.syllables.map((syl, i) => ({
      id: `${syl}_${i}_${Math.random()}`,
      text: syl,
    }));
    // Ensure it's not accidentally in exact order if > 1 syllables
    const shuffled = [...tiles].sort(() => 0.5 - Math.random());
    setAvailableTiles(shuffled);

    // Speak introductory cue
    setTimeout(() => {
      speakText(`Vamos a formar la palabra: ${currentWord.word}. ¿Qué sílaba va primero?`, {
        pitch: 1.15,
        rate: 0.85,
      });
    }, 350);
  }, [currentWord]);

  useEffect(() => {
    setupWordRound();
  }, [wordIndex, reinforceList, setupWordRound]);

  // Read current word
  const speakCurrentWordPrompt = () => {
    speakText(`La palabra es ${currentWord.word}. Escucha sus sílabas: ${currentWord.syllables.join('... ')}`, {
      pitch: 1.15,
      rate: 0.82,
    });
  };

  // Place syllable into first open wagon or specific slot
  const placeSyllable = (tile: { id: string; text: string }, targetSlotIndex?: number) => {
    playTileSnap();
    // Speak syllable immediately!
    speakText(tile.text, { pitch: 1.25, rate: 0.9 });

    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));

    setPlacedTiles((prev) => {
      const next = [...prev];
      let slot = targetSlotIndex;
      if (slot === undefined || slot < 0 || next[slot] !== null) {
        // Find first empty slot
        slot = next.findIndex((item) => item === null);
      }
      if (slot !== -1) {
        next[slot] = tile;
      }
      return next;
    });
  };

  // Return placed syllable back to bottom tray
  const returnSyllable = (slotIndex: number) => {
    const tile = placedTiles[slotIndex];
    if (!tile || isSuccess) return;

    playPopSound();
    setPlacedTiles((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setAvailableTiles((prev) => [...prev, tile]);
  };

  // Verify correctness whenever all slots are filled
  useEffect(() => {
    const allFilled = placedTiles.every((t) => t !== null);
    if (!allFilled || isSuccess) return;

    const assembledWord = placedTiles.map((t) => t!.text).join('');
    const targetWordStr = currentWord.syllables.join('');

    if (assembledWord === targetWordStr) {
      // Victory!
      setIsSuccess(true);
      playSuccessChime();
      playTrainWhistle();

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch {}

      // Pronounce syllable by syllable then full word
      setTimeout(() => {
        speakText(
          `¡Muy bien! ¡${currentWord.syllables.join('... ')}! ¡${currentWord.word}!`,
          {
            pitch: 1.2,
            rate: 0.85,
            onEnd: () => {
              onRecordWord(currentWord.word);
              currentWord.syllables.forEach((syl) => {
                onRecordAttempt('syllable', syl, true);
              });
            },
          }
        );
      }, 400);

      // Reward trigger
      setTimeout(() => {
        onRewardTrigger(2, `¡Armaste la palabra ${currentWord.word}!`);
      }, 1800);
    } else {
      // Gentle anti-frustration shake
      playGentleBoing();
      setIsShaking(true);
      currentWord.syllables.forEach((syl) => {
        onRecordAttempt('syllable', syl, false);
      });

      speakText(
        `¡Casi! Escucha cómo empieza: ${currentWord.syllables[0]}. Toca los vagones para acomodar las sílabas.`,
        {
          pitch: 1.1,
          rate: 0.82,
        }
      );

      setTimeout(() => {
        setIsShaking(false);
      }, 700);
    }
  }, [placedTiles, isSuccess, currentWord, onRecordAttempt, onRecordWord, onRewardTrigger]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData('text/plain', tileId);
    setDraggedTileId(tileId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain') || draggedTileId;
    if (!tileId) return;

    const tile = availableTiles.find((t) => t.id === tileId);
    if (tile) {
      placeSyllable(tile, slotIndex);
    }
    setDraggedTileId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Target Word Illustration Card */}
      <div className="w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-sky-300 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Repeating Big Speaker Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playPopSound();
              speakCurrentWordPrompt();
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-blue-600 shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-blue-200 shrink-0 cursor-pointer group"
            title="Escuchar palabra"
            aria-label="Escuchar palabra"
          >
            <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Escuchar</span>
          </button>

          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider">
              {currentWord.category} • Nivel {currentWord.difficulty}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-1 drop-shadow-sm">
              Forma la palabra con el tren
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-blue-100">
              Arrastra o toca cada sílaba en el vagón correspondiente
            </p>
          </div>
        </div>

        {/* Big Friendly Word Illustration */}
        <div className="flex items-center gap-3 bg-white/20 px-5 py-3 rounded-2xl border border-white/30 backdrop-blur-xs">
          <span className="text-5xl sm:text-6xl drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
            {currentWord.emoji}
          </span>
          <div className="text-center">
            <span className="text-2xl sm:text-3xl font-black tracking-widest text-amber-200 block drop-shadow">
              {currentWord.word}
            </span>
            <span className="text-xs font-bold text-white/90">
              {currentWord.syllables.length} {currentWord.syllables.length === 1 ? 'sílaba' : 'sílabas'}
            </span>
          </div>
        </div>
      </div>

      {/* The Train Track and Wagons UI */}
      <div className="w-full mt-8 bg-amber-100/80 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-inner relative">
        {/* Animated Steam Clouds */}
        <div className="flex items-center justify-center mb-2">
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 text-slate-400 text-xs font-bold"
          >
            <span>💨</span>
            <span>💨</span>
            <span>¡Chu-chu! El tren de las sílabas</span>
          </motion.div>
        </div>

        {/* Train assembly flex container */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* Locomotive Head */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-b from-rose-500 to-rose-600 rounded-3xl border-4 border-rose-700 shadow-lg flex flex-col items-center justify-between p-2 relative">
              {/* Smokestack */}
              <div className="absolute -top-3 w-5 h-4 bg-slate-800 rounded-t-md" />
              {/* Train Face */}
              <div className="w-10 h-7 bg-sky-200 rounded-lg border border-slate-700 mt-1 flex items-center justify-center text-xs">
                👀
              </div>
              <div className="text-2xl">🚂</div>
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                LEO
              </span>
            </div>
            {/* Wheels */}
            <div className="flex gap-2 -mt-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-400 shadow" />
              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-400 shadow" />
            </div>
          </div>

          {/* Wagons / Syllable Drop Slots */}
          <motion.div
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center"
          >
            {placedTiles.map((slotTile, idx) => {
              const isFilled = slotTile !== null;
              return (
                <div key={`wagon_${idx}`} className="flex flex-col items-center">
                  {/* Wagon body dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => returnSyllable(idx)}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 transition-all flex flex-col items-center justify-center cursor-pointer relative shadow-md ${
                      isFilled
                        ? 'bg-gradient-to-br from-amber-400 to-orange-400 border-orange-600 shadow-orange-300'
                        : 'bg-white/80 border-dashed border-slate-400 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                    title={isFilled ? 'Toca para quitar la sílaba' : 'Arrastra o toca una sílaba aquí'}
                  >
                    {/* Wagon Number Indicator */}
                    <span className="absolute top-1.5 left-2 text-[10px] font-black text-slate-400">
                      Vagón {idx + 1}
                    </span>

                    {isFilled ? (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wider">
                          {slotTile.text}
                        </span>
                        <span className="text-[10px] font-bold text-orange-950 mt-1">
                          Toca para mover
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 text-center px-2">
                        Sílaba {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Wagon Wheels */}
                  <div className="flex gap-4 -mt-2">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-400 shadow" />
                    <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-400 shadow" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Railway tracks graphic */}
        <div className="w-full mt-4 h-3 bg-amber-800 rounded-full border-b-2 border-amber-950 relative flex justify-around">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-4 bg-amber-950 -mt-0.5 rounded-sm" />
          ))}
        </div>
      </div>

      {/* Scrambled Syllable Tiles Tray */}
      <div className="w-full mt-6 bg-white rounded-3xl p-5 sm:p-6 border-4 border-slate-200 shadow-lg text-center">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-3">
          Fichas de Sílabas (Toca o arrastra para colocar)
        </span>

        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap min-h-[72px]">
          {availableTiles.length === 0 ? (
            <div className="text-sm font-bold text-slate-400 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>¡Todas las sílabas están en el tren!</span>
            </div>
          ) : (
            availableTiles.map((tile) => (
              <button
                key={tile.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tile.id)}
                onClick={() => placeSyllable(tile)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-4 border-amber-600 shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-slate-900 font-black text-3xl sm:text-4xl"
                style={{ minWidth: '68px', minHeight: '68px' }}
                aria-label={`Sílaba ${tile.text}`}
              >
                <span>{tile.text}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Next Word / Navigation Buttons */}
      <div className="mt-5 flex items-center justify-between w-full max-w-md">
        <button
          onClick={() => {
            playPopSound();
            setupWordRound();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border-2 border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition text-xs sm:text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reiniciar palabra</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setWordIndex((prev) => prev + 1);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md hover:shadow-lg transition text-xs sm:text-sm active:scale-95"
        >
          <span>Siguiente palabra</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

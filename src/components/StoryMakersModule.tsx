import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, ArrowRight, BookOpen, Check } from 'lucide-react';
import { SentenceItem, ChildProfile } from '../types';
import { SENTENCES_DATA } from '../data/learningData';
import { speakText, playPopSound, playGentleBoing, playSuccessChime, playTileSnap } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StoryMakersModuleProps {
  activeProfile: ChildProfile;
  onRecordSentence: () => void;
  onRewardTrigger: (stars: number, message: string) => void;
}

export const StoryMakersModule: React.FC<StoryMakersModuleProps> = ({
  activeProfile,
  onRecordSentence,
  onRewardTrigger,
}) => {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [placedSubject, setPlacedSubject] = useState<string | null>(null);
  const [placedVerb, setPlacedVerb] = useState<string | null>(null);
  const [placedComplement, setPlacedComplement] = useState<string | null>(null);
  const [availableBlocks, setAvailableBlocks] = useState<Array<{ id: string; text: string; role: 'subject' | 'verb' | 'complement' }>>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const currentSentence: SentenceItem = SENTENCES_DATA[sentenceIndex % SENTENCES_DATA.length];

  const setupSentence = useCallback(() => {
    setIsSuccess(false);
    setIsShaking(false);
    setPlacedSubject(null);
    setPlacedVerb(null);
    setPlacedComplement(null);

    const blocks = [
      { id: 'subj', text: currentSentence.subject, role: 'subject' as const },
      { id: 'verb', text: currentSentence.verb, role: 'verb' as const },
      { id: 'comp', text: currentSentence.complement, role: 'complement' as const },
    ];

    // Scramble order
    setAvailableBlocks([...blocks].sort(() => 0.5 - Math.random()));

    setTimeout(() => {
      speakText(`Vamos a construir el cuento: ${currentSentence.fullSentence}`, {
        pitch: 1.15,
        rate: 0.85,
      });
    }, 350);
  }, [currentSentence]);

  useEffect(() => {
    setupSentence();
  }, [sentenceIndex, setupSentence]);

  const readFullSentence = () => {
    speakText(currentSentence.fullSentence, {
      pitch: 1.15,
      rate: 0.85,
    });
  };

  // Place a block into the correct or matching slot
  const handleSelectBlock = (block: { id: string; text: string; role: 'subject' | 'verb' | 'complement' }) => {
    if (isSuccess) return;

    playTileSnap();
    // Speak word immediately!
    speakText(block.text, { pitch: 1.2, rate: 0.88 });

    // Determine target slot
    if (!placedSubject) {
      setPlacedSubject(block.text);
      setAvailableBlocks(prev => prev.filter(b => b.id !== block.id));
      return;
    }
    if (!placedVerb) {
      setPlacedVerb(block.text);
      setAvailableBlocks(prev => prev.filter(b => b.id !== block.id));
      return;
    }
    if (!placedComplement) {
      setPlacedComplement(block.text);
      setAvailableBlocks(prev => prev.filter(b => b.id !== block.id));
      return;
    }
  };

  // Remove a block from slot
  const handleRemoveSlot = (slotType: 'subject' | 'verb' | 'complement') => {
    if (isSuccess) return;

    playPopSound();
    let textToReturn: string | null = null;
    let role: 'subject' | 'verb' | 'complement' = 'subject';

    if (slotType === 'subject' && placedSubject) {
      textToReturn = placedSubject;
      role = 'subject';
      setPlacedSubject(null);
    } else if (slotType === 'verb' && placedVerb) {
      textToReturn = placedVerb;
      role = 'verb';
      setPlacedVerb(null);
    } else if (slotType === 'complement' && placedComplement) {
      textToReturn = placedComplement;
      role = 'complement';
      setPlacedComplement(null);
    }

    if (textToReturn) {
      setAvailableBlocks(prev => [...prev, { id: `${role}_${Math.random()}`, text: textToReturn!, role }]);
    }
  };

  // Check if complete
  useEffect(() => {
    if (!placedSubject || !placedVerb || !placedComplement || isSuccess) return;

    const matchesSubject = placedSubject.trim().toLowerCase() === currentSentence.subject.trim().toLowerCase();
    const matchesVerb = placedVerb.trim().toLowerCase() === currentSentence.verb.trim().toLowerCase();
    const matchesComplement = placedComplement.trim().toLowerCase() === currentSentence.complement.trim().toLowerCase();

    if (matchesSubject && matchesVerb && matchesComplement) {
      // Victory!
      setIsSuccess(true);
      playSuccessChime();

      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        speakText(`¡Fantástico! ${currentSentence.fullSentence}`, {
          pitch: 1.2,
          rate: 0.85,
          onEnd: () => {
            onRecordSentence();
          },
        });
      }, 350);

      setTimeout(() => {
        onRewardTrigger(3, `¡Construiste la oración: "${currentSentence.fullSentence}"!`);
      }, 1900);
    } else {
      // Incorrect order
      playGentleBoing();
      setIsShaking(true);

      speakText(
        `¡Casi! Escucha: ¿Quién hace la acción? Primero va "${currentSentence.subject}". ¡Inténtalo de nuevo!`,
        {
          pitch: 1.1,
          rate: 0.82,
        }
      );

      setTimeout(() => {
        setIsShaking(false);
      }, 700);
    }
  }, [placedSubject, placedVerb, placedComplement, isSuccess, currentSentence, onRecordSentence, onRewardTrigger]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Story Illustration Header */}
      <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Big Repeat Speaker Button */}
          <button
            onClick={() => {
              playPopSound();
              readFullSentence();
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-emerald-600 shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-emerald-200 shrink-0 cursor-pointer group"
            title="Escuchar oración completa"
            aria-label="Escuchar oración"
          >
            <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Escuchar</span>
          </button>

          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider">
              Pequeños Cuentistas • Nivel {sentenceIndex + 1}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 drop-shadow-sm">
              Construye la oración mágica
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-100">
              {currentSentence.sceneDescription}
            </p>
          </div>
        </div>

        {/* Story Illustration Badge */}
        <div className="text-6xl sm:text-7xl p-3 bg-white/20 rounded-3xl border border-white/30 backdrop-blur-xs animate-bounce" style={{ animationDuration: '4s' }}>
          {currentSentence.emoji}
        </div>
      </div>

      {/* Color Code Guide Bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 my-4 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>Sujeto (¿Quién es?)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>Verbo (¿Qué hace?)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Complemento (El detalle)</span>
        </div>
      </div>

      {/* The Sentence Strip Drop Slots */}
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-3xl p-6 sm:p-8 border-4 border-slate-200 shadow-xl"
      >
        <span className="text-xs font-black uppercase text-slate-400 tracking-wider block text-center mb-4">
          Tira de la oración (Toca para remover un bloque)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Slot 1: Sujeto (Azul) */}
          <button
            onClick={() => handleRemoveSlot('subject')}
            className={`min-h-[90px] rounded-3xl border-4 p-4 flex flex-col items-center justify-center transition-all ${
              placedSubject
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-102 ring-4 ring-blue-200'
                : 'bg-blue-50/60 border-dashed border-blue-300 hover:border-blue-400 text-blue-600'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80">
              1. Sujeto (Azul)
            </span>
            {placedSubject ? (
              <span className="text-2xl sm:text-3xl font-black">{placedSubject}</span>
            ) : (
              <span className="text-xs font-bold opacity-60">Toca el sujeto aquí</span>
            )}
          </button>

          {/* Slot 2: Verbo (Verde) */}
          <button
            onClick={() => handleRemoveSlot('verb')}
            className={`min-h-[90px] rounded-3xl border-4 p-4 flex flex-col items-center justify-center transition-all ${
              placedVerb
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-102 ring-4 ring-emerald-200'
                : 'bg-emerald-50/60 border-dashed border-emerald-300 hover:border-emerald-400 text-emerald-600'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80">
              2. Verbo (Verde)
            </span>
            {placedVerb ? (
              <span className="text-2xl sm:text-3xl font-black">{placedVerb}</span>
            ) : (
              <span className="text-xs font-bold opacity-60">Toca la acción aquí</span>
            )}
          </button>

          {/* Slot 3: Complemento (Amarillo) */}
          <button
            onClick={() => handleRemoveSlot('complement')}
            className={`min-h-[90px] rounded-3xl border-4 p-4 flex flex-col items-center justify-center transition-all ${
              placedComplement
                ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-lg scale-102 ring-4 ring-amber-200'
                : 'bg-amber-50/60 border-dashed border-amber-300 hover:border-amber-400 text-amber-700'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80">
              3. Complemento (Amarillo)
            </span>
            {placedComplement ? (
              <span className="text-2xl sm:text-3xl font-black">{placedComplement}</span>
            ) : (
              <span className="text-xs font-bold opacity-60">Toca el complemento aquí</span>
            )}
          </button>
        </div>

        {/* Read aloud assembled full sentence preview if complete */}
        {isSuccess && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center animate-in fade-in">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider block">
              ¡Oración completa!
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
              « {currentSentence.fullSentence} »
            </p>
          </div>
        )}
      </motion.div>

      {/* Available Scrambled Story Blocks */}
      <div className="w-full mt-6 bg-amber-50/80 rounded-3xl p-5 sm:p-6 border-4 border-amber-200 text-center shadow-md">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-3">
          Bloques disponibles (Toca para colocar)
        </span>

        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap min-h-[72px]">
          {availableBlocks.length === 0 ? (
            <div className="text-sm font-bold text-slate-400 py-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
              <span>¡Todos los bloques están colocados!</span>
            </div>
          ) : (
            availableBlocks.map((b) => {
              const colorClasses =
                b.role === 'subject'
                  ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                  : b.role === 'verb'
                  ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                  : 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500';

              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBlock(b)}
                  className={`px-6 py-4 rounded-2xl border-4 font-black text-xl sm:text-2xl shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${colorClasses}`}
                >
                  {b.text}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-5 flex items-center justify-between w-full max-w-md">
        <button
          onClick={() => {
            playPopSound();
            setupSentence();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border-2 border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition text-xs sm:text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reiniciar oración</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setSentenceIndex(prev => prev + 1);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md hover:shadow-lg transition text-xs sm:text-sm active:scale-95"
        >
          <span>Siguiente historia</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

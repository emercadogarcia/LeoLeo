import React, { useState } from 'react';
import { Volume2, Sparkles, Trash2, BookmarkPlus, BookOpen, Star, RefreshCw, Zap } from 'lucide-react';
import { ChildProfile } from '../types';
import { COMMON_SYLLABLE_GROUPS } from '../data/learningData';
import { speakText, playPopSound, playTileSnap, playSuccessChime, playStarCollect } from '../utils/audio';
import { QuickReadingMinigame } from './QuickReadingMinigame';

interface FreeBoardModuleProps {
  activeProfile: ChildProfile;
  onSaveWord: (word: string) => void;
  onRewardTrigger: (stars: number, message: string) => void;
}

export const FreeBoardModule: React.FC<FreeBoardModuleProps> = ({
  activeProfile,
  onSaveWord,
  onRewardTrigger,
}) => {
  const [subMode, setSubMode] = useState<'pizarra' | 'lectura-rapida'>('pizarra');
  const [currentSyllables, setCurrentSyllables] = useState<string[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  const assembledWord = currentSyllables.join('');

  // Add syllable
  const handleAddSyllable = (syl: string) => {
    playTileSnap();
    // Speak syllable immediately!
    speakText(syl, { pitch: 1.25, rate: 0.9 });
    setCurrentSyllables((prev) => [...prev, syl]);
  };

  // Remove last syllable (backspace)
  const handleBackspace = () => {
    playPopSound();
    setCurrentSyllables((prev) => prev.slice(0, -1));
  };

  // Clear all
  const handleClear = () => {
    playPopSound();
    setCurrentSyllables([]);
  };

  // Speak what was invented
  const handleSpeakInvented = () => {
    if (!assembledWord) {
      speakText('Toca las sílabas abajo para inventar una palabra divertida.', {
        pitch: 1.15,
        rate: 0.85,
      });
      return;
    }

    playSuccessChime();
    speakText(`¡Escuchemos lo que inventaste! ... ${assembledWord.toLowerCase()}`, {
      pitch: 1.2,
      rate: 0.82,
    });
  };

  // Save to word chest
  const handleSaveToChest = () => {
    if (!assembledWord) return;
    playStarCollect();
    onSaveWord(assembledWord);
    setSavedSuccessAlert(true);
    speakText(`¡Guardada "${assembledWord}" en tu Baúl de Palabras!`, {
      pitch: 1.2,
      rate: 0.88,
    });

    onRewardTrigger(1, `¡Guardaste una nueva palabra inventada: ${assembledWord}!`);

    setTimeout(() => {
      setSavedSuccessAlert(false);
    }, 2500);
  };

  const currentGroup = COMMON_SYLLABLE_GROUPS[selectedGroupIndex];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Submode Switcher Tabs */}
      <div className="w-full flex items-center justify-center gap-3 mb-4">
        <button
          onClick={() => {
            playPopSound();
            setSubMode('pizarra');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all border-2 cursor-pointer ${
            subMode === 'pizarra'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102 ring-2 ring-purple-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg">🎨</span>
          <span>Pizarra Libre</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setSubMode('lectura-rapida');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all border-2 cursor-pointer ${
            subMode === 'lectura-rapida'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-600 shadow-md scale-102 ring-2 ring-amber-300'
              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50 shadow-xs'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>⚡ Minijuego: Lectura Rápida (5s)</span>
          <span className="hidden xs:inline px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold uppercase animate-pulse">
            Nuevo
          </span>
        </button>
      </div>

      {subMode === 'lectura-rapida' ? (
        <QuickReadingMinigame
          activeProfile={activeProfile}
          onRewardTrigger={onRewardTrigger}
          onSaveWord={onSaveWord}
          onBackToBoard={() => {
            playPopSound();
            setSubMode('pizarra');
          }}
        />
      ) : (
        <>
          {/* Magic Board Canvas Header */}
          <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-purple-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider">
                Pizarra Libre de Exploración
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 drop-shadow-sm">
                ¡Inventa tus propias palabras!
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-purple-100">
                Junta sílabas como tú quieras y escucha cómo suenan con la voz mágica
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick jump button to Minijuego */}
              <button
                onClick={() => {
                  playPopSound();
                  setSubMode('lectura-rapida');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md transition border-2 border-white cursor-pointer"
                title="Abrir desafío de lectura relámpago"
              >
                <Zap className="w-4 h-4 text-rose-600 fill-rose-500" />
                <span>¡Jugar Lectura 5s!</span>
              </button>

              <div className="text-4xl sm:text-5xl p-2 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-xs">
                🎨
              </div>
            </div>
          </div>

          {/* The Big Interactive Word Blackboard */}
          <div className="w-full mt-6 bg-slate-900 rounded-3xl p-6 sm:p-8 border-4 border-purple-400 shadow-2xl relative overflow-hidden">
            {/* Soft grid lines to resemble school chalkboard */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="text-center min-h-[90px] flex items-center justify-center flex-wrap gap-2">
              {currentSyllables.length === 0 ? (
                <span className="text-slate-500 font-bold text-lg sm:text-xl italic animate-pulse">
                  Toca las sílabas del teclado para escribir aquí...
                </span>
              ) : (
                currentSyllables.map((syl, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      speakText(syl);
                    }}
                    className="inline-block px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-3xl sm:text-5xl border-3 border-amber-300 shadow-md cursor-pointer hover:scale-105 transition-transform"
                    title="Toca para escuchar de nuevo"
                  >
                    {syl}
                  </span>
                ))
              )}
            </div>

            {/* Board Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackspace}
                  disabled={currentSyllables.length === 0}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>← Borrar una</span>
                </button>
                <button
                  onClick={handleClear}
                  disabled={currentSyllables.length === 0}
                  className="px-3.5 py-2 rounded-2xl bg-rose-900/60 hover:bg-rose-900 disabled:opacity-40 text-rose-200 font-bold text-xs sm:text-sm border border-rose-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Big Magic Wand Listen Button */}
                <button
                  onClick={handleSpeakInvented}
                  disabled={currentSyllables.length === 0}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-white font-black text-sm sm:text-base shadow-lg transition flex items-center gap-2 border-2 border-emerald-300 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>¡Escuchar qué inventé!</span>
                </button>

                {/* Save to Word Chest */}
                <button
                  onClick={handleSaveToChest}
                  disabled={currentSyllables.length === 0}
                  className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-amber-950 font-black text-sm sm:text-base shadow-lg transition flex items-center gap-1.5 border-2 border-amber-300 active:scale-95 cursor-pointer"
                  title="Guardar en mi baúl"
                >
                  <BookmarkPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Guardar en mi Baúl</span>
                </button>
              </div>
            </div>

            {savedSuccessAlert && (
              <div className="mt-3 py-2 px-4 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm text-center animate-in fade-in">
                ⭐ ¡Guardado en el Baúl de Palabras de {activeProfile.name}!
              </div>
            )}
          </div>

          {/* Syllable Category Tabs */}
          <div className="w-full mt-6">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-2 text-center">
              Elige una familia de sílabas
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
              {COMMON_SYLLABLE_GROUPS.map((grp, idx) => (
                <button
                  key={grp.group}
                  onClick={() => {
                    playPopSound();
                    setSelectedGroupIndex(idx);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition cursor-pointer ${
                    selectedGroupIndex === idx
                      ? 'bg-purple-600 text-white shadow-md scale-105'
                      : 'bg-white hover:bg-purple-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {grp.group}
                </button>
              ))}
            </div>
          </div>

          {/* Syllable Visual Keyboard */}
          <div className="w-full mt-3 bg-white rounded-3xl p-5 sm:p-6 border-4 border-slate-200 shadow-md">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {currentGroup.syllables.map((syl) => (
                <button
                  key={syl}
                  onClick={() => handleAddSyllable(syl)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 active:scale-90 border-3 border-purple-300 text-purple-950 font-black text-2xl sm:text-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  {syl}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Creations Word Chest */}
          {activeProfile.freeBoardCreations && activeProfile.freeBoardCreations.length > 0 && (
            <div className="w-full mt-6 bg-amber-50 rounded-3xl p-5 border-2 border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm mb-3">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Baúl de palabras de {activeProfile.name}:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeProfile.freeBoardCreations.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playPopSound();
                      speakText(word, { pitch: 1.2 });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 shadow-xs hover:shadow text-amber-900 font-bold text-sm flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                  >
                    <span>{word}</span>
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

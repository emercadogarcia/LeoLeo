import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  Download,
  Volume2,
  Sliders,
  User,
  ArrowLeft,
  Flame,
  Award,
} from 'lucide-react';
import { ChildProfile, ModuleId, AudioSettings } from '../types';
import { getDiagnosticMetrics } from '../utils/storage';
import { speakText, updateAudioSettings, getAudioSettings, playSuccessChime, playPopSound } from '../utils/audio';

interface ParentDashboardProps {
  activeProfile: ChildProfile;
  onClose: () => void;
  onLaunchCustomReinforcement: (targetItems: string[], module: 'cazador' | 'tren') => void;
  onOpenProfileSelector: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeProfile,
  onClose,
  onLaunchCustomReinforcement,
  onOpenProfileSelector,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'sesiones' | 'ajustes'>('diagnostico');
  const [audioConfig, setAudioConfig] = useState<AudioSettings>(getAudioSettings());

  const metrics = getDiagnosticMetrics(activeProfile);

  // Collect all flagged items
  const flaggedPhonemes = metrics.categorizedPhonemes.needsReinforcement;
  const flaggedSyllables = metrics.categorizedSyllables.needsReinforcement;
  const hasItemsToReinforce = flaggedPhonemes.length > 0 || flaggedSyllables.length > 0;

  // Handle launch reinforcement
  const handleStartReinforce = () => {
    playSuccessChime();
    if (flaggedPhonemes.length > 0) {
      onLaunchCustomReinforcement(flaggedPhonemes, 'cazador');
    } else if (flaggedSyllables.length > 0) {
      onLaunchCustomReinforcement(flaggedSyllables, 'tren');
    } else {
      // Default practice set
      onLaunchCustomReinforcement(['P', 'M', 'S'], 'cazador');
    }
  };

  // Handle voice testing
  const handleTestVoice = () => {
    speakText(`¡Hola! Soy LeoLeo. Estoy listo para aprender a leer juntos con ${activeProfile.name}.`, {
      rate: audioConfig.rate,
      pitch: audioConfig.pitch,
    });
  };

  const handleAudioChange = (changes: Partial<AudioSettings>) => {
    const updated = { ...audioConfig, ...changes };
    setAudioConfig(updated);
    updateAudioSettings(updated);
  };

  // Print/Export report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Top Bar with back button */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Regresar al Juego</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeProfile.avatar}</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Panel de Diagnóstico • {activeProfile.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {activeProfile.grade} • Nivel pedagógico actual: Nivel {activeProfile.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfileSelector}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <User className="w-4 h-4" />
            <span>Cambiar Niño</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('diagnostico')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition ${
            activeTab === 'diagnostico'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          📊 Mapa de Calor y Progreso
        </button>
        <button
          onClick={() => setActiveTab('sesiones')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition ${
            activeTab === 'sesiones'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🕒 Historial de Sesiones
        </button>
        <button
          onClick={() => setActiveTab('ajustes')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition ${
            activeTab === 'ajustes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ⚙️ Voz y Accesibilidad
        </button>
      </div>

      {activeTab === 'diagnostico' && (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">Avance Global</span>
              <div className="text-3xl font-black text-indigo-600">{metrics.masteryPercentage}%</div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.masteryPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">Tasa de Aciertos</span>
              <div className="text-3xl font-black text-emerald-600">{metrics.overallAccuracy}%</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">
                {metrics.totalSuccesses} aciertos de {metrics.totalAttempts} intentos
              </span>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">Palabras Dominadas</span>
              <div className="text-3xl font-black text-amber-500">{metrics.wordsCount}</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">
                En el tren de sílabas
              </span>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">Oraciones Construidas</span>
              <div className="text-3xl font-black text-teal-600">{metrics.sentencesCount}</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">
                En pequeños cuentistas
              </span>
            </div>
          </div>

          {/* Direct Action: Generar Sesión Personalizada de Refuerzo */}
          <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 p-6 rounded-3xl text-white shadow-xl border-4 border-indigo-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Algoritmo de Refuerzo Adaptativo
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Generar Sesión Personalizada de Refuerzo
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
                {hasItemsToReinforce
                  ? `Se detectaron dificultades en: ${[...flaggedPhonemes, ...flaggedSyllables].join(', ')}. Esta sesión concentrará al niño en estos puntos críticos con pistas amigables.`
                  : '¡El pequeño tiene un excelente dominio! Puedes lanzar una sesión de consolidación general.'}
              </p>
            </div>

            <button
              onClick={handleStartReinforce}
              className="px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-base shadow-lg transition-all shrink-0 flex items-center gap-2"
            >
              <Flame className="w-5 h-5 text-rose-600 fill-rose-500" />
              <span>Iniciar Sesión de Refuerzo</span>
            </button>
          </div>

          {/* Heatmap Section */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Mapa de Calor: Fonemas y Grafemas
                </h3>
                <p className="text-xs text-slate-500">
                  Estado de aprendizaje basado en intentos y aciertos
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  Dominada (≥80%)
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  En Aprendizaje
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  Refuerzo (&gt;2 fallos)
                </span>
              </div>
            </div>

            {/* Phonemes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
              {Object.entries(activeProfile.phonemeMastery || {}).map(([key, record]) => {
                const acc = record.attempts > 0 ? Math.round((record.successes / record.attempts) * 100) : 0;
                const isNeedsReinforce = record.consecutiveFails >= 2 || (record.attempts >= 2 && acc < 60);
                const isMastered = record.attempts >= 3 && acc >= 80;

                const colorClass = isNeedsReinforce
                  ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200'
                  : isMastered
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950';

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${colorClass}`}
                  >
                    <div className="text-2xl font-black uppercase">{key}</div>
                    <div className="text-xs font-bold mt-1">
                      {acc}% ({record.successes}/{record.attempts})
                    </div>
                    {isNeedsReinforce && (
                      <span className="text-[10px] font-black text-rose-600 block mt-0.5">
                        ⚠️ Refuerzo
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Syllables Heatmap */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Mapa de Calor: Sílabas Frecuentes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Object.entries(activeProfile.syllableMastery || {}).map(([syl, record]) => {
                  const acc = record.attempts > 0 ? Math.round((record.successes / record.attempts) * 100) : 0;
                  const isNeedsReinforce = record.consecutiveFails >= 2 || (record.attempts >= 2 && acc < 60);
                  const isMastered = record.attempts >= 2 && acc >= 80;

                  const colorClass = isNeedsReinforce
                    ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200'
                    : isMastered
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950';

                  return (
                    <div
                      key={syl}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${colorClass}`}
                    >
                      <div className="text-xl font-black uppercase">{syl}</div>
                      <div className="text-xs font-bold mt-1">
                        {acc}% acierto
                      </div>
                      {isNeedsReinforce && (
                        <span className="text-[10px] font-black text-rose-600 block mt-0.5">
                          ⚠️ Requiere atención
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions History Tab */}
      {activeTab === 'sesiones' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              Registro Cronológico de Sesiones
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Últimas {activeProfile.sessionLogs?.length || 0} sesiones
            </span>
          </div>

          {activeProfile.sessionLogs && activeProfile.sessionLogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activeProfile.sessionLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-lg">
                      {log.module === 'cazador' ? '🎈' : log.module === 'tren' ? '🚂' : '📚'}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">
                        {log.module === 'cazador' ? 'Cazador de Sonidos' : log.module === 'tren' ? 'El Tren de las Sílabas' : 'Pequeños Cuentistas'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {log.date} • {Math.round(log.durationSeconds / 60)} min
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 block">
                      {log.accuracy}% precisión
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {log.correctItems} / {log.totalItems} aciertos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm font-medium">
              Aún no hay sesiones registradas para este perfil.
            </div>
          )}
        </div>
      )}

      {/* Voice & Accessibility Tab */}
      {activeTab === 'ajustes' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Configuración de Síntesis de Voz y Audio
              </h3>
              <p className="text-xs text-slate-500">
                Ajusta la velocidad y tono para adaptarlo a la etapa de desarrollo de tu niño
              </p>
            </div>
            <button
              onClick={handleTestVoice}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>Probar Voz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">
                Velocidad de habla (Recomendado: 0.82 para 1.º Primaria):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={audioConfig.rate}
                  onChange={(e) => handleAudioChange({ rate: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="font-black text-sm text-indigo-700 w-12 text-right">
                  {audioConfig.rate.toFixed(2)}x
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">
                Tono amigable (Pitch infantil):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={audioConfig.pitch}
                  onChange={(e) => handleAudioChange({ pitch: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="font-black text-sm text-indigo-700 w-12 text-right">
                  {audioConfig.pitch.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-800 block">Voz Hablada (TTS)</span>
                <span className="text-xs text-slate-500">Instrucciones y lectura fonética</span>
              </div>
              <input
                type="checkbox"
                checked={audioConfig.speechEnabled}
                onChange={(e) => handleAudioChange({ speechEnabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-800 block">Efectos de Sonido Sintéticos</span>
                <span className="text-xs text-slate-500">Pop de globos, silbatos y arpegios</span>
              </div>
              <input
                type="checkbox"
                checked={audioConfig.sfxEnabled}
                onChange={(e) => handleAudioChange({ sfxEnabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

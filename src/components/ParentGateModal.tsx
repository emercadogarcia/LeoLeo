import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';
import { playGentleBoing, playTileSnap } from '../utils/audio';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [numA, setNumA] = useState(4);
  const [numB, setNumB] = useState(5);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 8) + 4; // 4 to 11
      const b = Math.floor(Math.random() * 8) + 3; // 3 to 10
      setNumA(a);
      setNumB(b);
      setUserAnswer('');
      setErrorMsg(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const correctAnswer = numA + numB;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === correctAnswer) {
      playTileSnap();
      onSuccess();
    } else {
      playGentleBoing();
      setErrorMsg(true);
      setUserAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">
            Control para Padres y Docentes
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Solo para adultos. Resuelve la operación para ingresar al panel de métricas y configuración pedagógica:
          </p>

          <div className="my-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-xs uppercase font-bold text-indigo-500 tracking-wider">
              Pregunta de verificación
            </span>
            <div className="text-3xl font-black text-indigo-900 mt-1">
              ¿Cuánto es {numA} + {numB}?
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setErrorMsg(false);
                }}
                placeholder="Escribe el resultado"
                className="w-full text-center text-2xl font-black rounded-2xl border-2 border-slate-300 py-3 px-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              />
              {errorMsg && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Respuesta incorrecta. Inténtalo de nuevo.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              <span>Entrar al Panel</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

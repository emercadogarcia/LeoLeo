import React, { useState } from 'react';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-emerald-300"
        title="Instalar LeoLeo en tu dispositivo"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow transition border border-emerald-300"
          title="Instalar en iPad o iPhone"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-3xl mb-3 shadow-inner">
                🦁
              </div>
              <h3 className="text-xl font-black text-slate-800">
                ¡Instala LeoLeo en tu iPad o iPhone!
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Para que tu pequeño juegue en pantalla completa sin internet:
              </p>

              <div className="mt-4 bg-amber-50 rounded-2xl p-4 text-left space-y-3 border border-amber-200 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Toca el botón <strong>Compartir</strong> en la barra de Safari.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Baja y selecciona <strong>«Agregar a Inicio»</strong> 📲.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>¡Listo! Ábrelo con un toque desde tu pantalla principal.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 shadow-md transition"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

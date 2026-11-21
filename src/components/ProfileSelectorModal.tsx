import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { ChildProfile } from '../types';
import { AVATAR_OPTIONS } from '../data/learningData';
import { playTileSnap, playPopSound } from '../utils/audio';

interface ProfileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ChildProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, avatar: string, avatarName: string, grade: 'Transición (5 años)' | '1.º Primaria (6-7 años)') => void;
}

export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedGrade, setSelectedGrade] = useState<'Transición (5 años)' | '1.º Primaria (6-7 años)'>('1.º Primaria (6-7 años)');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    playPopSound();
    onCreateProfile(newName.trim(), selectedAvatar.emoji, selectedAvatar.name, selectedGrade);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-amber-50 p-6 sm:p-8 shadow-2xl border-4 border-amber-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-amber-100 transition"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {!isCreating ? (
          <div>
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                ¿Quién va a jugar hoy?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                Elige tu Perfil
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 my-6">
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      playTileSnap();
                      onSelectProfile(p.id);
                      onClose();
                    }}
                    className={`relative p-5 rounded-3xl border-4 text-center transition-all flex flex-col items-center justify-center gap-2 group ${
                      isActive
                        ? 'bg-amber-100 border-amber-500 shadow-lg scale-102 ring-4 ring-amber-300'
                        : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">
                      {p.avatar}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-800">
                      {p.name}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                      ⭐ {p.stars} estrellas • Nivel {p.level}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                playTileSnap();
                setIsCreating(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-dashed border-amber-400 hover:border-amber-500 text-amber-900 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs hover:bg-amber-100/50 transition"
            >
              <UserPlus className="w-5 h-5 text-amber-600" />
              <span>+ Agregar nuevo pequeño lector</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                Nuevo Lector
              </span>
              <h2 className="text-2xl font-black text-slate-800">
                Crear Perfil Infantil
              </h2>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nombre del niño o niña:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas, Camila, Sofía..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-lg font-bold rounded-2xl border-2 border-slate-300 py-2.5 px-4 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nivel escolar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Transición (5 años)', '1.º Primaria (6-7 años)'] as const).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition ${
                        selectedGrade === grade
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Elige su personaje favorito:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.name}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`p-2.5 rounded-2xl border-2 text-center transition ${
                        selectedAvatar.name === av.name
                          ? 'bg-amber-200 border-amber-500 scale-105 shadow'
                          : 'bg-white border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="text-3xl">{av.emoji}</div>
                      <div className="text-[10px] font-bold text-slate-600 truncate mt-1">
                        {av.name.split(' ')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Crear Perfil!</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

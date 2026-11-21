import React, { useState, useEffect, useRef } from 'react';
import { ChildProfile, ModuleId, PlacedSticker } from './types';
import {
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createDefaultProfile,
  recordItemAttempt,
  recordLearnedWord,
  recordBuiltSentence,
  saveFreeBoardWord,
  savePlacedStickers,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { ModuleNav } from './components/ModuleNav';
import { SoundHunterModule } from './components/SoundHunterModule';
import { SyllableTrainModule } from './components/SyllableTrainModule';
import { StoryMakersModule } from './components/StoryMakersModule';
import { FreeBoardModule } from './components/FreeBoardModule';
import { StickerAlbumModule } from './components/StickerAlbumModule';
import { ParentDashboard } from './components/ParentDashboard';
import { ProfileSelectorModal } from './components/ProfileSelectorModal';
import { ParentGateModal } from './components/ParentGateModal';
import { RewardCelebration } from './components/RewardCelebration';
import { OfflineIndicator } from './components/OfflineIndicator';
import { STICKERS_DATA } from './data/learningData';
import { speakText, cancelSpeech } from './utils/audio';

export default function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => getActiveProfileId());
  const [activeModule, setActiveModule] = useState<ModuleId>('cazador');

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{
    stars: number;
    message: string;
    stickerName?: string;
    stickerEmoji?: string;
  }>({
    stars: 1,
    message: '¡Excelente!',
  });

  // Targeted custom reinforcement state
  const [reinforceList, setReinforceList] = useState<string[] | undefined>(undefined);

  // Active child profile
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || createDefaultProfile('p1', 'Mateo', '🦁', 'Leo el León', '1.º Primaria (6-7 años)');

  // Synchronize active profile changes
  const handleSelectProfile = (id: string) => {
    setActiveProfileIdState(id);
    setActiveProfileId(id);
    setReinforceList(undefined);
  };

  // Create child profile
  const handleCreateProfile = (
    name: string,
    avatar: string,
    avatarName: string,
    grade: 'Transición (5 años)' | '1.º Primaria (6-7 años)'
  ) => {
    const newId = `child_${Date.now()}`;
    const newProfile = createDefaultProfile(newId, name, avatar, avatarName, grade);
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    handleSelectProfile(newId);
  };

  // Handle item attempt (phoneme or syllable)
  const handleRecordAttempt = (type: 'phoneme' | 'syllable', itemId: string, isSuccess: boolean) => {
    const { updatedProfile, newlyUnlockedSticker } = recordItemAttempt(
      activeProfile.id,
      type,
      itemId,
      isSuccess
    );

    setProfiles((prev) => prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));

    if (newlyUnlockedSticker) {
      const stickerDef = STICKERS_DATA.find((s) => s.name === newlyUnlockedSticker);
      setRewardData({
        stars: 2,
        message: '¡Subiste de nivel y ganaste una calcomanía!',
        stickerName: newlyUnlockedSticker,
        stickerEmoji: stickerDef?.emoji,
      });
      setIsRewardOpen(true);
    }
  };

  // Handle learned word
  const handleRecordWord = (word: string) => {
    const updated = recordLearnedWord(activeProfile.id, word);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handle sentence completed
  const handleRecordSentence = () => {
    const updated = recordBuiltSentence(activeProfile.id);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handle save free board word
  const handleSaveFreeBoardWord = (word: string) => {
    const updated = saveFreeBoardWord(activeProfile.id, word);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handle update placed stickers
  const handleUpdatePlacedStickers = (placed: PlacedSticker[]) => {
    const updated = savePlacedStickers(activeProfile.id, placed);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Trigger celebration modal
  const handleRewardTrigger = (stars: number, message: string) => {
    setRewardData({
      stars,
      message,
    });
    setIsRewardOpen(true);
  };

  // Launch custom reinforcement from parent dashboard
  const handleLaunchReinforcement = (targetItems: string[], module: 'cazador' | 'tren') => {
    setReinforceList(targetItems);
    setActiveModule(module);
  };

  // Global Audio Instruction Re-trigger
  const handleRepeatCurrentAudio = () => {
    if (activeModule === 'cazador') {
      speakText('Escucha con atención y toca la letra que suena.', { pitch: 1.15, rate: 0.85 });
    } else if (activeModule === 'tren') {
      speakText('Arma la palabra colocando las sílabas en los vagones del tren.', { pitch: 1.15, rate: 0.85 });
    } else if (activeModule === 'cuentistas') {
      speakText('Toca los bloques de colores para armar la historia.', { pitch: 1.15, rate: 0.85 });
    } else if (activeModule === 'pizarra') {
      speakText('Toca las sílabas para inventar palabras nuevas, o acepta el desafío de lectura rápida de 5 segundos.', { pitch: 1.15, rate: 0.85 });
    } else if (activeModule === 'album') {
      speakText('Toca tus calcomanías ganadas para pegarlas en el paisaje.', { pitch: 1.15, rate: 0.85 });
    }
  };

  // Clean speech when switching tabs
  const handleSelectModuleWithAudioReset = (mod: ModuleId) => {
    cancelSpeech();
    setActiveModule(mod);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/50 to-amber-100/60 text-slate-800 flex flex-col selection:bg-amber-300">
      {/* Top Navbar */}
      <Navbar
        activeProfile={activeProfile}
        activeModule={activeModule}
        onSelectModule={handleSelectModuleWithAudioReset}
        onOpenProfileSelector={() => setIsProfileModalOpen(true)}
        onOpenParentGate={() => setIsParentGateOpen(true)}
        onRepeatAudio={handleRepeatCurrentAudio}
        hasAudioInstruction={activeModule !== 'padres'}
      />

      {/* Module Selector Bar (hidden when in parental dashboard) */}
      {activeModule !== 'padres' && (
        <ModuleNav
          activeModule={activeModule}
          onSelectModule={handleSelectModuleWithAudioReset}
        />
      )}

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col justify-start pb-12">
        {activeModule === 'cazador' && (
          <SoundHunterModule
            activeProfile={activeProfile}
            onRecordAttempt={handleRecordAttempt}
            onRewardTrigger={handleRewardTrigger}
            reinforceList={reinforceList}
            onClearReinforce={() => setReinforceList(undefined)}
          />
        )}

        {activeModule === 'tren' && (
          <SyllableTrainModule
            activeProfile={activeProfile}
            onRecordAttempt={handleRecordAttempt}
            onRecordWord={handleRecordWord}
            onRewardTrigger={handleRewardTrigger}
            reinforceList={reinforceList}
          />
        )}

        {activeModule === 'cuentistas' && (
          <StoryMakersModule
            activeProfile={activeProfile}
            onRecordSentence={handleRecordSentence}
            onRewardTrigger={handleRewardTrigger}
          />
        )}

        {activeModule === 'pizarra' && (
          <FreeBoardModule
            activeProfile={activeProfile}
            onSaveWord={handleSaveFreeBoardWord}
            onRewardTrigger={handleRewardTrigger}
          />
        )}

        {activeModule === 'album' && (
          <StickerAlbumModule
            activeProfile={activeProfile}
            onUpdatePlacedStickers={handleUpdatePlacedStickers}
          />
        )}

        {activeModule === 'padres' && (
          <ParentDashboard
            activeProfile={activeProfile}
            onClose={() => setActiveModule('cazador')}
            onLaunchCustomReinforcement={handleLaunchReinforcement}
            onOpenProfileSelector={() => setIsProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Profile Selector Modal */}
      <ProfileSelectorModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfile.id}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
      />

      {/* Parental Gate Modal */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setIsParentGateOpen(false);
          setActiveModule('padres');
        }}
      />

      {/* Reward Celebration Modal */}
      <RewardCelebration
        isOpen={isRewardOpen}
        onClose={() => setIsRewardOpen(false)}
        starsEarned={rewardData.stars}
        message={rewardData.message}
        unlockedStickerName={rewardData.stickerName}
        unlockedStickerEmoji={rewardData.stickerEmoji}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

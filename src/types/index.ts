export type ModuleId = 'cazador' | 'tren' | 'cuentistas' | 'pizarra' | 'album' | 'padres';

export interface PhonemeItem {
  id: string;
  letter: string;
  soundDescription: string;
  pronouncePhoneme: string; // e.g. "/mmm/"
  instructionText: string;
  exampleWord: string;
  exampleEmoji: string;
  type: 'vocal' | 'consonante';
}

export interface SyllableWordItem {
  id: string;
  word: string;
  syllables: string[];
  emoji: string;
  category: string;
  difficulty: 1 | 2 | 3;
}

export interface SentenceItem {
  id: string;
  subject: string;
  verb: string;
  complement: string;
  fullSentence: string;
  emoji: string;
  sceneDescription: string;
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  starsRequired: number;
  category: 'animales' | 'espacio' | 'fantasía' | 'premios';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
}

export interface MasteryRecord {
  attempts: number;
  successes: number;
  consecutiveFails: number;
  lastPracticed: number;
}

export interface SessionLog {
  id: string;
  date: string;
  module: ModuleId;
  durationSeconds: number;
  totalItems: number;
  correctItems: number;
  accuracy: number;
  flaggedItems: string[];
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string; // emoji representation e.g. '🦁'
  avatarName: string;
  grade: 'Transición (5 años)' | '1.º Primaria (6-7 años)';
  stars: number;
  level: number;
  unlockedStickers: string[];
  placedStickers: PlacedSticker[];
  phonemeMastery: Record<string, MasteryRecord>;
  syllableMastery: Record<string, MasteryRecord>;
  wordsLearned: string[];
  sentencesBuilt: number;
  freeBoardCreations: string[];
  sessionLogs: SessionLog[];
  createdAt: number;
}

export interface AudioSettings {
  volume: number; // 0 to 1
  rate: number; // 0.6 to 1.2
  pitch: number; // 0.8 to 1.4
  sfxVolume: number;
  speechEnabled: boolean;
  sfxEnabled: boolean;
}

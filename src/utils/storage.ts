import { ChildProfile, MasteryRecord, SessionLog, PlacedSticker, ModuleId } from '../types';
import { STICKERS_DATA } from '../data/learningData';

const STORAGE_KEY = 'leoleo_app_state_v1';
const ACTIVE_PROFILE_KEY = 'leoleo_active_profile_id_v1';

export function createDefaultProfile(id: string, name: string, avatar: string, avatarName: string, grade: 'Transición (5 años)' | '1.º Primaria (6-7 años)'): ChildProfile {
  return {
    id,
    name,
    avatar,
    avatarName,
    grade,
    stars: 3,
    level: 1,
    unlockedStickers: ['stk_lion', 'stk_star'],
    placedStickers: [
      { id: 'p1', stickerId: 'stk_lion', x: 25, y: 35, scale: 1.2 },
      { id: 'p2', stickerId: 'stk_star', x: 70, y: 25, scale: 1 },
    ],
    phonemeMastery: {
      a: { attempts: 6, successes: 6, consecutiveFails: 0, lastPracticed: Date.now() },
      e: { attempts: 5, successes: 5, consecutiveFails: 0, lastPracticed: Date.now() },
      m: { attempts: 8, successes: 7, consecutiveFails: 0, lastPracticed: Date.now() },
      p: { attempts: 7, successes: 4, consecutiveFails: 2, lastPracticed: Date.now() }, // Flagged for practice
      b: { attempts: 4, successes: 2, consecutiveFails: 2, lastPracticed: Date.now() }, // Flagged for practice
      s: { attempts: 5, successes: 4, consecutiveFails: 0, lastPracticed: Date.now() },
    },
    syllableMastery: {
      PA: { attempts: 4, successes: 4, consecutiveFails: 0, lastPracticed: Date.now() },
      TO: { attempts: 4, successes: 4, consecutiveFails: 0, lastPracticed: Date.now() },
      CA: { attempts: 3, successes: 3, consecutiveFails: 0, lastPracticed: Date.now() },
      SA: { attempts: 3, successes: 3, consecutiveFails: 0, lastPracticed: Date.now() },
      BO: { attempts: 4, successes: 2, consecutiveFails: 2, lastPracticed: Date.now() }, // Flagged
    },
    wordsLearned: ['PATO', 'CASA', 'MESA'],
    sentencesBuilt: 2,
    freeBoardCreations: ['MAMÁ', 'SOL', 'LUNA'],
    sessionLogs: [
      {
        id: 's_prev1',
        date: new Date(Date.now() - 86400000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        module: 'cazador',
        durationSeconds: 320,
        totalItems: 8,
        correctItems: 7,
        accuracy: 88,
        flaggedItems: ['p'],
      },
      {
        id: 's_prev2',
        date: new Date(Date.now() - 172800000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        module: 'tren',
        durationSeconds: 450,
        totalItems: 6,
        correctItems: 5,
        accuracy: 83,
        flaggedItems: ['BO'],
      },
    ],
    createdAt: Date.now(),
  };
}

export function loadProfiles(): ChildProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse profiles from localStorage', err);
  }

  // Pre-seed default profiles
  const defaults: ChildProfile[] = [
    createDefaultProfile('child_mateo', 'Mateo', '🦁', 'Leo el León', '1.º Primaria (6-7 años)'),
    createDefaultProfile('child_valentina', 'Valentina', '🦊', 'Sofi la Zorrita', 'Transición (5 años)'),
  ];
  saveProfiles(defaults);
  return defaults;
}

export function saveProfiles(profiles: ChildProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles to localStorage', err);
  }
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined') return 'child_mateo';
  const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
  return id || 'child_mateo';
}

export function setActiveProfileId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function recordItemAttempt(
  profileId: string,
  type: 'phoneme' | 'syllable',
  itemId: string,
  isSuccess: boolean
): { updatedProfile: ChildProfile; newlyUnlockedSticker?: string } {
  const profiles = loadProfiles();
  const profileIndex = profiles.findIndex(p => p.id === profileId);
  if (profileIndex === -1) {
    throw new Error('Profile not found');
  }

  const profile = { ...profiles[profileIndex] };
  const targetMap = type === 'phoneme' ? { ...profile.phonemeMastery } : { ...profile.syllableMastery };

  const prevRecord: MasteryRecord = targetMap[itemId] || {
    attempts: 0,
    successes: 0,
    consecutiveFails: 0,
    lastPracticed: Date.now(),
  };

  const updatedRecord: MasteryRecord = {
    attempts: prevRecord.attempts + 1,
    successes: isSuccess ? prevRecord.successes + 1 : prevRecord.successes,
    consecutiveFails: isSuccess ? 0 : prevRecord.consecutiveFails + 1,
    lastPracticed: Date.now(),
  };

  targetMap[itemId] = updatedRecord;

  if (type === 'phoneme') {
    profile.phonemeMastery = targetMap;
  } else {
    profile.syllableMastery = targetMap;
  }

  let newlyUnlockedSticker: string | undefined = undefined;

  if (isSuccess) {
    profile.stars += 1;
    // Check level progression (every 10 stars = new level)
    profile.level = Math.floor(profile.stars / 10) + 1;

    // Check newly unlocked stickers
    const currentUnlocked = new Set(profile.unlockedStickers);
    for (const sticker of STICKERS_DATA) {
      if (profile.stars >= sticker.starsRequired && !currentUnlocked.has(sticker.id)) {
        profile.unlockedStickers.push(sticker.id);
        newlyUnlockedSticker = sticker.name;
        break;
      }
    }
  }

  profiles[profileIndex] = profile;
  saveProfiles(profiles);

  return { updatedProfile: profile, newlyUnlockedSticker };
}

export function recordLearnedWord(profileId: string, word: string): ChildProfile {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return profiles[0];

  const profile = { ...profiles[index] };
  if (!profile.wordsLearned.includes(word)) {
    profile.wordsLearned.push(word);
    profile.stars += 2; // Extra stars for full word
  }
  profiles[index] = profile;
  saveProfiles(profiles);
  return profile;
}

export function recordBuiltSentence(profileId: string): ChildProfile {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return profiles[0];

  const profile = { ...profiles[index] };
  profile.sentencesBuilt += 1;
  profile.stars += 3; // 3 stars for sentence
  profiles[index] = profile;
  saveProfiles(profiles);
  return profile;
}

export function saveFreeBoardWord(profileId: string, word: string): ChildProfile {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return profiles[0];

  const profile = { ...profiles[index] };
  if (!profile.freeBoardCreations.includes(word)) {
    profile.freeBoardCreations.unshift(word);
  }
  profiles[index] = profile;
  saveProfiles(profiles);
  return profile;
}

export function savePlacedStickers(profileId: string, placed: PlacedSticker[]): ChildProfile {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return profiles[0];

  const profile = { ...profiles[index] };
  profile.placedStickers = placed;
  profiles[index] = profile;
  saveProfiles(profiles);
  return profile;
}

export function logSessionEnd(
  profileId: string,
  module: ModuleId,
  durationSeconds: number,
  totalItems: number,
  correctItems: number,
  flaggedItems: string[]
): ChildProfile {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index === -1) return profiles[0];

  const profile = { ...profiles[index] };
  const accuracy = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 100;

  const newLog: SessionLog = {
    id: `log_${Date.now()}`,
    date: new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
    module,
    durationSeconds,
    totalItems,
    correctItems,
    accuracy,
    flaggedItems,
  };

  profile.sessionLogs = [newLog, ...(profile.sessionLogs || [])].slice(0, 20); // Keep last 20 sessions
  profiles[index] = profile;
  saveProfiles(profiles);
  return profile;
}

// Compute diagnostic statistics for parents dashboard
export function getDiagnosticMetrics(profile: ChildProfile) {
  const allPhonemeEntries = Object.entries(profile.phonemeMastery);
  const allSyllableEntries = Object.entries(profile.syllableMastery);

  const categorizedPhonemes: {
    mastered: string[];
    learning: string[];
    needsReinforcement: string[];
  } = {
    mastered: [],
    learning: [],
    needsReinforcement: [],
  };

  allPhonemeEntries.forEach(([key, record]) => {
    const acc = record.attempts > 0 ? (record.successes / record.attempts) * 100 : 0;
    if (record.consecutiveFails >= 2 || (record.attempts >= 2 && acc < 60)) {
      categorizedPhonemes.needsReinforcement.push(key.toUpperCase());
    } else if (record.attempts >= 3 && acc >= 80) {
      categorizedPhonemes.mastered.push(key.toUpperCase());
    } else {
      categorizedPhonemes.learning.push(key.toUpperCase());
    }
  });

  const categorizedSyllables: {
    mastered: string[];
    learning: string[];
    needsReinforcement: string[];
  } = {
    mastered: [],
    learning: [],
    needsReinforcement: [],
  };

  allSyllableEntries.forEach(([key, record]) => {
    const acc = record.attempts > 0 ? (record.successes / record.attempts) * 100 : 0;
    if (record.consecutiveFails >= 2 || (record.attempts >= 2 && acc < 60)) {
      categorizedSyllables.needsReinforcement.push(key);
    } else if (record.attempts >= 2 && acc >= 80) {
      categorizedSyllables.mastered.push(key);
    } else {
      categorizedSyllables.learning.push(key);
    }
  });

  let totalAttempts = 0;
  let totalSuccesses = 0;

  allPhonemeEntries.forEach(([_, r]) => {
    totalAttempts += r.attempts;
    totalSuccesses += r.successes;
  });
  allSyllableEntries.forEach(([_, r]) => {
    totalAttempts += r.attempts;
    totalSuccesses += r.successes;
  });

  const overallAccuracy = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 90;
  const masteryPercentage = Math.min(100, Math.round((categorizedPhonemes.mastered.length + categorizedSyllables.mastered.length) * 8 + 20));

  return {
    categorizedPhonemes,
    categorizedSyllables,
    overallAccuracy,
    masteryPercentage,
    totalAttempts,
    totalSuccesses,
    wordsCount: profile.wordsLearned.length,
    sentencesCount: profile.sentencesBuilt,
  };
}

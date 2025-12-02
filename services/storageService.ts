import { Session, UserPreferences } from '../types';

const SESSIONS_KEY = 'herb_sessions';
const PREFS_KEY = 'herb_prefs';

export const StorageService = {
  getSessions: (): Session[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: Session) => {
    const sessions = StorageService.getSessions();
    const updated = [session, ...sessions];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  overwriteSessions: (sessions: Session[]) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return sessions;
  },

  clearSessions: () => {
    localStorage.removeItem(SESSIONS_KEY);
  },

  getPreferences: (): UserPreferences => {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : {
      hasOnboarded: false,
      hasPremium: false,
      dailyGoal: 3,
      weeklyGoal: 15,
      goalPeriod: 'day',
      costPerGram: 10,
      selectedGoal: 'Track usage',
      isDarkMode: false,
      tBreakTarget: null,
      isQuitting: false // 🆕 Default: Not quitting
    };
  },

  savePreferences: (prefs: Partial<UserPreferences>) => {
    const current = StorageService.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  }
};
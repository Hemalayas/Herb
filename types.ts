export type ConsumptionMethod = 'Joint' | 'Bong' | 'Vape' | 'Edible' | 'Other';

export interface Session {
  id: string;
  timestamp: string; // ISO string
  method: ConsumptionMethod;
  amount: string;
  strain?: string;
  cost?: number;
}

export interface UserPreferences {
  hasOnboarded: boolean;
  hasPremium: boolean;
  dailyGoal: number;
  weeklyGoal: number;
  goalPeriod: 'day' | 'week';
  costPerGram: number;
  selectedGoal: string;
  isDarkMode: boolean;
  tBreakTarget: string | null; 
  isQuitting: boolean; // 🆕 NEW FLAG
}

export type ScreenName = 'Onboarding' | 'Paywall' | 'Home' | 'Stats' | 'Settings';

export const COLORS = {
  green: '#00D084',
  white: '#FFFFFF',
  bg: '#F3F4F6',
};
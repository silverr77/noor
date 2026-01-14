// User types
export interface NotificationSettings {
  count: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface User {
  name: string;
  age?: string;
  gender?: 'female' | 'male' | 'others' | 'prefer-not-to-say';
  dailyTimeEstimate?: string;
  familiarity?: 'new' | 'occasional' | 'regular';
  selectedCategories?: string[];
  notificationSettings?: NotificationSettings;
  hasCompletedOnboarding: boolean;
}

// Quote/Do3aa types
export interface Quote {
  id: string;
  text: string;
  translation?: string;
  category: string;
  isLiked: boolean;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

// Onboarding types
export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'age'
  | 'gender'
  | 'relationship'
  | 'familiarity'
  | 'categories'
  | 'widgets'
  | 'complete';


// User types
export interface User {
  name: string;
  age?: string;
  gender?: 'female' | 'male' | 'others' | 'prefer-not-to-say';
  relationshipStatus?: string;
  familiarity?: 'new' | 'occasional' | 'regular';
  selectedCategories: string[];
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


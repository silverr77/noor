import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface UserContextType {
  user: User | null;
  updateUser: (userData: Partial<User>) => void;
  completeOnboarding: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    const updatedUser = { 
      ...user, 
      ...userData,
      selectedCategories: userData.selectedCategories || user?.selectedCategories || []
    } as User;
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error saving user:', error);
    }
    return updatedUser;
  };

  const completeOnboarding = async () => {
    const updatedUser = { 
      ...user, 
      hasCompletedOnboarding: true,
      selectedCategories: user?.selectedCategories || []
    } as User;
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
    return updatedUser;
  };

  return (
    <UserContext.Provider value={{ user, updateUser, completeOnboarding, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}


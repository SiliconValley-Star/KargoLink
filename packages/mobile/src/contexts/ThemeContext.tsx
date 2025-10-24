import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme as lightTheme, darkTheme, Theme} from '../styles/theme';

export interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'auto') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      } else if (savedTheme === 'auto') {
        // Auto mode based on system preference
        const systemDarkMode = checkSystemTheme();
        setIsDarkMode(systemDarkMode);
      } else {
        setIsDarkMode(false);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSystemTheme = (): boolean => {
    // In a real app, we would check system theme
    // For now, return false (light mode as default)
    return false;
  };

  const saveThemePreference = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveThemePreference(newMode ? 'dark' : 'light');
  };

  const setTheme = (mode: 'light' | 'dark' | 'auto') => {
    if (mode === 'auto') {
      const systemDarkMode = checkSystemTheme();
      setIsDarkMode(systemDarkMode);
    } else {
      setIsDarkMode(mode === 'dark');
    }
    saveThemePreference(mode);
  };

  const contextValue: ThemeContextType = {
    theme: isDarkMode ? darkTheme : lightTheme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  if (loading) {
    return null; // Or loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, darkColors, lightColors } from './colors';

const K_DARK_MODE = 'dark_mode'; // 'system' | 'light' | 'dark'

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  mode: 'system' | 'light' | 'dark';
  setMode: (mode: 'system' | 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<'system' | 'light' | 'dark'>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(K_DARK_MODE).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
      setLoaded(true);
    });
  }, []);

  const setMode = (next: 'system' | 'light' | 'dark') => {
    setModeState(next);
    AsyncStorage.setItem(K_DARK_MODE, next);
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => ({ colors, isDark, mode, setMode }), [colors, isDark, mode]);

  // Avoid a light->dark flash while the saved preference loads.
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

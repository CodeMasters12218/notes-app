import { DarkTheme, LightTheme } from '@/theme';
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  
  const theme = useMemo(() => {
    return systemScheme === 'dark' ? DarkTheme : LightTheme;
  }, [systemScheme]);

  return (
    <ThemeContext.Provider value={{ theme, scheme: systemScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
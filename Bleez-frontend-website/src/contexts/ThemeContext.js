import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to light mode, check localStorage for saved preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light'; // Default to light mode
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.setProperty('--background', '30 14% 97%');
      root.style.setProperty('--foreground', '222 47% 11%');
      root.style.setProperty('--card', '0 0% 98%');
      root.style.setProperty('--card-foreground', '222 47% 11%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222 47% 11%');
      root.style.setProperty('--muted', '270 40% 96%');
      root.style.setProperty('--muted-foreground', '215 16% 47%');
      root.style.setProperty('--accent', '270 60% 96%');
      root.style.setProperty('--border', '214 32% 91%');
      root.style.setProperty('--input', '214 32% 91%');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.setProperty('--background', '222 47% 2%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222 47% 5%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222 47% 5%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '217 33% 25%');
      root.style.setProperty('--muted-foreground', '215 20% 65%');
      root.style.setProperty('--accent', '222 47% 8%');
      root.style.setProperty('--border', '217 33% 17%');
      root.style.setProperty('--input', '217 33% 17%');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      setLightTheme, 
      setDarkTheme,
      isLight: theme === 'light',
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

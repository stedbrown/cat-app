import React, { createContext, useState, useContext } from 'react';

// Crea il contesto del tema
const ThemeContext = createContext();

// Crea un provider del contesto del tema
export function ThemeProvider({ children }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizzato per usare il contesto
export const useTheme = () => useContext(ThemeContext);

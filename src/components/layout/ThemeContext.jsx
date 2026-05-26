import React, { createContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const colorThemes = {
  blue: {
    primary: "bg-blue-500",
    secondary: "bg-blue-100",
    accent: "bg-blue-600",
    text: "text-blue-900",
    border: "border-blue-300",
    hover: "hover:bg-blue-50",
    bg: "bg-blue-50"
  },
  green: {
    primary: "bg-green-500",
    secondary: "bg-green-100", 
    accent: "bg-green-600",
    text: "text-green-900",
    border: "border-green-300",
    hover: "hover:bg-green-50",
    bg: "bg-green-50"
  },
  purple: {
    primary: "bg-purple-500",
    secondary: "bg-purple-100",
    accent: "bg-purple-600", 
    text: "text-purple-900",
    border: "border-purple-300",
    hover: "hover:bg-purple-50",
    bg: "bg-purple-50"
  },
  orange: {
    primary: "bg-orange-500",
    secondary: "bg-orange-100",
    accent: "bg-orange-600",
    text: "text-orange-900", 
    border: "border-orange-300",
    hover: "hover:bg-orange-50",
    bg: "bg-orange-50"
  },
  dark: {
    primary: "bg-gray-800",
    secondary: "bg-gray-950",
    accent: "bg-gray-700",
    text: "text-gray-100",
    border: "border-gray-600",
    hover: "hover:bg-gray-700",
    bg: "bg-gray-950"
  }
  
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "blue";
  });

  useEffect(() => {
    localStorage.setItem("colorTheme", currentTheme);
    
    // Apply global theme styles to body
    const theme = colorThemes[currentTheme];
    document.body.className = theme.bg;
    
  }, [currentTheme]);

  const theme = colorThemes[currentTheme];
  const themeNames = Object.keys(colorThemes);
  const currentIndex = themeNames.indexOf(currentTheme);

  const toggleTheme = () => {
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setCurrentTheme(themeNames[nextIndex]);
  };

  const setTheme = (themeName) => {
    if (colorThemes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
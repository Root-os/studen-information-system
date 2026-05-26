import { useContext } from "react";
import ThemeContext from "../components/layout/ThemeContext";

export const useTheme = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  
  const getThemeClasses = (lightClasses, darkClasses) => {
    return currentTheme === "dark" ? darkClasses : lightClasses;
  };
  
  const getBackgroundClass = (lightBg = "bg-white", darkBg = "bg-gray-800") => {
    return currentTheme === "dark" ? darkBg : lightBg;
  };
  
  const getTextClass = (lightText = "text-gray-900", darkText = "text-gray-100") => {
    return currentTheme === "dark" ? darkText : lightText;
  };
  
  const getBorderClass = (lightBorder = "border-gray-300", darkBorder = "border-gray-600") => {
    return currentTheme === "dark" ? darkBorder : lightBorder;
  };
  
  const getFormInputClass = () => {
    return currentTheme === "dark" 
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900";
  };
  
  return {
    theme,
    currentTheme,
    isDark: currentTheme === "dark",
    getThemeClasses,
    getBackgroundClass,
    getTextClass,
    getBorderClass,
    getFormInputClass
  };
};

import React, { useContext, useState } from "react";
import { FiBell, FiSearch, FiUser, FiSun, FiMoon, FiMenu, FiDroplet, FiChevronDown } from "react-icons/fi";
import ThemeContext  from "./ThemeContext";

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { theme, currentTheme, setTheme } = useContext(ThemeContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getThemeIcon = () => {
    switch(currentTheme) {
      case 'blue': return <FiDroplet className="text-blue-500" size={20} />;
      case 'green': return <FiDroplet className="text-green-500" size={20} />;
      case 'purple': return <FiDroplet className="text-purple-500" size={20} />;
      case 'orange': return <FiDroplet className="text-orange-500" size={20} />;
      case 'dark': return <FiMoon className="text-gray-400" size={20} />;
      default: return <FiDroplet size={20} />;
    }
  };

  const themes = [
    { name: 'blue', label: 'Blue', icon: <FiDroplet className="text-blue-500" size={16} /> },
    { name: 'green', label: 'Green', icon: <FiDroplet className="text-green-500" size={16} /> },
    { name: 'purple', label: 'Purple', icon: <FiDroplet className="text-purple-500" size={16} /> },
    { name: 'orange', label: 'Orange', icon: <FiDroplet className="text-orange-500" size={16} /> },
    { name: 'dark', label: 'Dark', icon: <FiMoon className="text-gray-400" size={16} /> }
  ];

  return (
    <header className={`flex items-center justify-between shadow px-4 md:px-6 py-4 sticky top-0 z-20 border-b-2 ${
      currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
    } ${theme.border}`}>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className={`md:hidden p-2 rounded-md ${theme.hover}`}
        >
          <FiMenu size={20} />
        </button>
        {/* <h1 className={`text-xl md:text-2xl font-bold ${theme.text}`}>Dashboard</h1>
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className={`pl-10 pr-4 py-2 rounded-md border ${theme.border} focus:ring-2 focus:outline-none ${
              currentTheme === 'dark' 
                ? 'bg-gray-700 text-white placeholder-gray-400' 
                : 'bg-white text-gray-900 placeholder-gray-500'
            } ${theme.text}`}
          />
          <FiSearch className={`absolute top-2.5 left-3 ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
        </div> */}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1 p-2 rounded-full ${theme.hover}`}
          >
            {getThemeIcon()}
            <FiChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border border-gray-200 z-50 ${
              currentTheme === 'dark' 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              {themes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => {
                    setTheme(themeOption.name);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left ${
                    currentTheme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-100' 
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${
                    currentTheme === themeOption.name 
                      ? (currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50') 
                      : ''
                  }`}
                >
                  {themeOption.icon}
                  <span>{themeOption.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button className={`p-2 rounded-full ${theme.hover}`}>
          <FiBell size={20} />
        </button>
        <button className={`flex items-center gap-2 p-2 rounded-full ${theme.hover}`}>
          <FiUser size={20} />
          {/* <span className={`hidden md:block font-medium ${theme.text}`}>John Doe</span> */}
        </button>
      </div>
    </header>
  );
};

export default Header;

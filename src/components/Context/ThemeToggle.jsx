import React from 'react';
import { useTheme } from './ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, setTheme, isDark } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: FaSun },
    { value: 'dark', label: 'Dark', icon: FaMoon },
    { value: 'system', label: 'System', icon: FaDesktop },
  ];

  return (
    <div className="relative group">
      <button 
        className="p-2 rounded-lg transition-colors duration-300"
        style={{
          color: 'var(--color-text)',
          backgroundColor: 'transparent',
        }}
      >
        {isDark ? <FaMoon className="h-5 w-5" /> : <FaSun className="h-5 w-5" />}
      </button>
      <div 
        className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
        style={{
          backgroundColor: 'var(--color-nav-bg)',
          borderColor: 'var(--color-nav-shadow)',
          boxShadow: '0 4px 6px -1px var(--color-nav-shadow), 0 2px 4px -1px var(--color-nav-shadow)',
        }}
      >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left first:rounded-t-lg last:rounded-b-lg transition-colors duration-300 ${
                isActive 
                  ? 'text-[var(--color-subtext)]' 
                  : 'text-[var(--color-text)] hover:bg-[var(--color-mobile-menu-bg)]'
              }`}
            >
              <Icon className="mr-3 h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeToggle;
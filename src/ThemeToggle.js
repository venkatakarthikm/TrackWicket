import { Sun, Moon } from 'lucide-react';
import { memo } from 'react';

const ThemeToggle = memo(({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={20} 
          className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
            theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 text-primary transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;

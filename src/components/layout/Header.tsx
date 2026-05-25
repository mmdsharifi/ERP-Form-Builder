import React, { useState, useRef, useEffect } from 'react';
import { Save, ChevronDown, MoreHorizontal, Globe, Sun, Moon, RotateCcw } from 'lucide-react';

interface HeaderProps {
  language: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
  onReset: () => void;
  t: (key: string) => string;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, onReset, t }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleTheme = (event?: React.MouseEvent) => {
    const nextDark = !isDark;

    if (!event || !(document as any).startViewTransition) {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    const transition = (document as any).startViewTransition(() => {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: nextDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: nextDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    });
  };

  const handleResetClick = () => {
    setIsDropdownOpen(false);
    if (window.confirm(t('confirmReset'))) {
      onReset();
    }
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 shrink-0 z-50 transition-colors duration-200">
      <div className="flex items-center space-x-reverse space-x-4 text-sm font-semibold">
        <span className="font-bold text-gray-800 dark:text-slate-200">{t('newForm')}</span>
        <span className="text-gray-300 dark:text-slate-700 mx-1">|</span>
        <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
          {t('company1')} <ChevronDown className="w-3.5 h-3.5" />
        </span>
        <span className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 px-2.5 py-1 rounded-full text-xs mr-2 font-bold">
          {t('draftStatus')}
        </span>
      </div>

      <div className="flex items-center space-x-reverse space-x-4">
        <button className="flex items-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-300 text-indigo-700 px-3 py-1.5 rounded-md text-sm transition cursor-pointer font-bold border border-indigo-200/20">
          <Save className="w-4 h-4" /> 
          <span>{t('save')}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1.5 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-md text-sm transition cursor-pointer font-bold">
          <span>{t('changeStatus')}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
        
        {/* More Actions Dropdown Wrapper */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md cursor-pointer transition flex items-center justify-center hover:shadow-sm"
            title={t('moreActions')}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute end-0 mt-2 w-56 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-100 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1 transition-all">
              {/* Language Selector Section */}
              <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  {t('language')}
                </span>
                <div className="flex gap-1 bg-gray-50 dark:bg-slate-950 p-1 rounded-lg">
                  <button 
                    onClick={() => { setLanguage('fa'); setIsDropdownOpen(false); }}
                    className={`flex-1 text-xs py-1 rounded-md transition-all font-bold cursor-pointer ${language === 'fa' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    فارسی
                  </button>
                  <button 
                    onClick={() => { setLanguage('en'); setIsDropdownOpen(false); }}
                    className={`flex-1 text-xs py-1 rounded-md transition-all font-bold cursor-pointer ${language === 'en' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>{t('theme')}</span>
                </div>
                <span className="text-[10px] bg-gray-100 dark:bg-slate-950 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full uppercase">
                  {isDark ? t('darkMode') : t('lightMode')}
                </span>
              </button>

              {/* Reset Canvas Button */}
              <button 
                onClick={handleResetClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer transition border-t border-gray-50 dark:border-slate-800/50 mt-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('resetCanvas')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

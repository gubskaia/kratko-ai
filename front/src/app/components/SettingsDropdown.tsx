import { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, Globe, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsDropdownProps {
  userName: string;
  onLogout: () => void;
}

export function SettingsDropdown({ userName, onLogout }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 dark:hover:bg-white/5 hover:bg-sidebar-accent transition-all duration-200 text-white/80 dark:text-white/80 text-sidebar-foreground/80 hover:text-white dark:hover:text-white hover:text-sidebar-foreground"
      >
        <Settings className="w-5 h-5" />
        <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>{t('settings')}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-white dark:bg-[#1a1f2e] bg-card backdrop-blur-xl border border-border shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-['Inter']" style={{ fontSize: '0.875rem' }}>
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-foreground font-['Inter'] truncate" style={{ fontSize: '0.875rem' }}>
                  {userName}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-secondary transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-foreground font-['Inter']" style={{ fontSize: '0.875rem' }}>
                  {t('theme')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-['Inter']" style={{ fontSize: '0.75rem' }}>
                  {theme === 'dark' ? t('dark') : t('light')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </button>

            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'ru' : 'en');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-secondary transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-['Inter']" style={{ fontSize: '0.875rem' }}>
                  {t('language')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-['Inter']" style={{ fontSize: '0.75rem' }}>
                  {language === 'en' ? t('english') : t('russian')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </button>
          </div>

          <div className="p-2 border-t border-border">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-red-500 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

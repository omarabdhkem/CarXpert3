import React, { useState } from 'react';
import { Sun, Moon, Car } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  className?: string;
  showCarThemeSelector?: boolean;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showCarThemeSelector = true,
}) => {
  const { theme, toggleTheme, carTheme, changeCarTheme } = useTheme();
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  // أنماط السيارات
  const carThemes = [
    { id: 'classic', name: 'كلاسيكي', icon: '🚗' },
    { id: 'luxury', name: 'فاخر', icon: '🏎️' },
    { id: 'sport', name: 'رياضي', icon: '🏁' },
    { id: 'electric', name: 'كهربائي', icon: '⚡' },
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-card border border-border hover:bg-opacity-80 transition-colors relative overflow-hidden group"
        aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      >
        <div className="relative z-10 transition-transform duration-500">
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </div>
        <div className="absolute inset-0 transform transition-transform duration-500 group-hover:scale-0 origin-right">
          <div className={`absolute inset-0 ${theme === 'dark' 
              ? 'bg-dark-gradient car-headlight-effect' 
              : 'bg-light-gradient car-reflection-effect'}`}
          />
        </div>
      </button>

      {showCarThemeSelector && (
        <div className="relative">
          <button
            onClick={() => setShowThemeOptions(prev => !prev)}
            className="p-2 rounded-full bg-card border border-border hover:bg-opacity-80 transition-colors mt-2 flex items-center gap-1"
            aria-label="تغيير نمط السيارة"
          >
            <Car className="h-4 w-4" />
            <span className="text-xs hidden md:inline-block">{carThemes.find(ct => ct.id === carTheme)?.name}</span>
          </button>
          
          {showThemeOptions && (
            <div className="absolute left-0 mt-1 bg-card border border-border shadow-lg rounded-md py-1 z-50 w-40 animate-fade-in">
              <div className="py-1 text-sm text-center text-muted-foreground">أنماط السيارات</div>
              {carThemes.map((carThemeOption) => (
                <button
                  key={carThemeOption.id}
                  onClick={() => {
                    changeCarTheme(carThemeOption.id as any);
                    setShowThemeOptions(false);
                  }}
                  className={cn(
                    "w-full text-right px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center",
                    carTheme === carThemeOption.id && "bg-muted"
                  )}
                >
                  <span className="mr-2">{carThemeOption.icon}</span>
                  {carThemeOption.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
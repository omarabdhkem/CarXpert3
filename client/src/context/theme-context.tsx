import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type CarTheme = 'luxury' | 'sport' | 'electric' | 'classic';

// تكوين الألوان المستوحاة من السيارات
const carThemeColors = {
  light: {
    luxury: {
      primary: '#8B7765', // لون بني ذهبي فاخر
      secondary: '#1E1E1E',
      accent: '#DDB982', // لون ذهبي
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0'
    },
    sport: {
      primary: '#D81E05', // أحمر رياضي
      secondary: '#1E1E1E',
      accent: '#FF6E00', // لون برتقالي
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0'
    },
    electric: {
      primary: '#3DA5D9', // أزرق كهربائي
      secondary: '#2364AA',
      accent: '#73BFB8', // لون أزرق-أخضر
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0'
    },
    classic: {
      primary: '#0F52BA', // أزرق كلاسيكي
      secondary: '#04346C',
      accent: '#FF6B00', // لون برتقالي كلاسيكي 
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0'
    }
  },
  dark: {
    luxury: {
      primary: '#BC9A6E', // لون ذهبي داكن
      secondary: '#6E5F50',
      accent: '#E6C99F', // لون ذهبي فاتح
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#E0E0E0',
      border: '#3A3A3A'
    },
    sport: {
      primary: '#FF2E2E', // أحمر رياضي
      secondary: '#B71C1C',
      accent: '#FF8A3D', // لون برتقالي
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#E0E0E0',
      border: '#3A3A3A'
    },
    electric: {
      primary: '#00C2FF', // أزرق كهربائي
      secondary: '#0277BD',
      accent: '#80DEEA', // لون فيروزي 
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#E0E0E0',
      border: '#3A3A3A'
    },
    classic: {
      primary: '#1565C0', // أزرق كلاسيكي
      secondary: '#0D47A1',
      accent: '#FF8C00', // لون برتقالي كلاسيكي
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#E0E0E0',
      border: '#3A3A3A'
    }
  }
};

interface ThemeContextProps {
  theme: Theme;
  carTheme: CarTheme;
  toggleTheme: () => void;
  changeCarTheme: (newTheme: CarTheme) => void;
  colors: typeof carThemeColors.light.classic;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // استخدام تفضيلات المتصفح كقيمة أولية
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // استرجاع الإعدادات المحفوظة من localStorage أو استخدام القيم الافتراضية
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || (prefersDarkMode ? 'dark' : 'light');
  });
  
  const [carTheme, setCarTheme] = useState<CarTheme>(() => {
    const savedCarTheme = localStorage.getItem('carTheme');
    return (savedCarTheme as CarTheme) || 'classic';
  });

  // تحديث تصميم الصفحة عند تغيير الوضع
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-car-theme', carTheme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('carTheme', carTheme);
    
    // تطبيق الألوان على المتغيرات CSS
    const colors = carThemeColors[theme][carTheme];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [theme, carTheme]);

  // تبديل بين الوضع الفاتح والداكن
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  // تغيير سمة السيارة
  const changeCarTheme = (newTheme: CarTheme) => {
    setCarTheme(newTheme);
  };

  const colors = carThemeColors[theme][carTheme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        carTheme,
        toggleTheme,
        changeCarTheme,
        colors
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
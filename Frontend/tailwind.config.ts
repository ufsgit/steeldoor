import type { Config } from 'tailwindcss';
import { themeColors } from './src/theme/colors';

// Clean copy of color tokens to ensure no module loader metadata/cycles attach
const safeColors = Object.fromEntries(
  Object.entries(themeColors).filter(([_, value]) => typeof value === 'string')
);

export default {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {
      colors: safeColors,
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(20, 83, 45, 0.07), 0 4px 6px -4px rgba(20, 83, 45, 0.05)',
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        elevated: '0 10px 30px -5px rgba(20, 83, 45, 0.12), 0 8px 10px -6px rgba(20, 83, 45, 0.08)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
} satisfies Config;

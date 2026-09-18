import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-alt': 'hsl(var(--surface-alt))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
        energia: '#FF8A00',
        destaque: '#FF2D95',
        vibe: '#7A2BFF',
      },
      backgroundImage: {
        'bora-gradient': 'linear-gradient(135deg, #FF8A00 0%, #FF2D95 55%, #7A2BFF 100%)',
        'bora-gradient-soft': 'linear-gradient(135deg, rgba(255,138,0,0.16) 0%, rgba(255,45,149,0.16) 55%, rgba(122,43,255,0.16) 100%)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        glow: '0 0 32px -4px rgba(255, 45, 149, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
        'mono-tech': ['var(--font-mono-tech)', 'Share Tech Mono', 'monospace'],
      },
      colors: {
        background: '#020408',
        surface: '#060f1a',
        surface2: '#081220',
        border: '#0d2137',
        borderGlow: '#00c8ff',
        cyan: '#00c8ff',
        cyanDim: '#0088aa',
        cyanGlow: 'rgba(0,200,255,0.15)',
        purple: '#7b2fff',
        purpleDim: '#5a1fcc',
        purpleGlow: 'rgba(123,47,255,0.15)',
        green: '#00ff88',
        gold: '#ffb800',
        pink: '#ff2d78',
        red: '#ff3366',
        yellow: '#ffcc00',
        text: 'rgba(200,230,255,0.9)',
        textMuted: 'rgba(100,140,170,0.4)',
        textDim: 'rgba(150,190,220,0.5)',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,200,255,0.3), 0 0 20px rgba(0,200,255,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0,200,255,0.6), 0 0 40px rgba(0,200,255,0.3)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
      },
      animation: {
        scanline: 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        flicker: 'flicker 5s infinite',
      },
    },
  },
  plugins: [],
}

export default config

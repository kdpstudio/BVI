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
      colors: {
        background: '#020408',
        surface: '#060d14',
        surface2: '#0a1628',
        border: '#0d2137',
        borderGlow: '#00c8ff',
        cyan: '#00c8ff',
        cyanDim: '#0088aa',
        cyanGlow: 'rgba(0,200,255,0.15)',
        purple: '#7b2fff',
        purpleDim: '#5a1fcc',
        purpleGlow: 'rgba(123,47,255,0.15)',
        green: '#00ff88',
        red: '#ff3366',
        yellow: '#ffcc00',
        text: '#e2e8f0',
        textMuted: '#64748b',
        textDim: '#334155',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
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

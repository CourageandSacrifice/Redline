/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neon racing palette
        'neon': {
          purple: '#bf00ff',
          cyan: '#00f0ff',
          pink: '#ff00aa',
          green: '#00ff88',
          orange: '#ff6600',
          red: '#ff0044',
        },
        'racing': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        'dark': {
          100: '#1a1a2e',
          200: '#16162a',
          300: '#121226',
          400: '#0f0f23',
          500: '#0a0a1a',
          600: '#050510',
          700: '#020208',
        },
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(191, 0, 255, 0.5), 0 0 40px rgba(191, 0, 255, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 0, 170, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-red': '0 0 20px rgba(255, 0, 68, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'speedometer': 'speedometer 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(191, 0, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 240, 255, 0.7)' },
        },
        speedometer: {
          '0%': { transform: 'rotate(-135deg)' },
          '100%': { transform: 'rotate(var(--needle-rotation))' },
        },
      },
    },
  },
  plugins: [],
}

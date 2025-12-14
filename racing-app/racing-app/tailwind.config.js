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
        // Aggressive red/black palette
        'neon': {
          red: '#ff0033',
          crimson: '#dc143c',
          blood: '#8b0000',
          orange: '#ff4500',
          white: '#ffffff',
          gray: '#71767b',
        },
        'dark': {
          50: '#2f3336',
          100: '#202327',
          200: '#1d1f23',
          300: '#16181c',
          400: '#12141a',
          500: '#0a0a0c',
          600: '#000000',
          700: '#000000',
        },
        'racing': {
          50: '#3a3a3a',
          100: '#2d2d2d',
          200: '#262626',
          300: '#1f1f1f',
          400: '#1a1a1a',
          500: '#141414',
          600: '#0f0f0f',
          700: '#0a0a0a',
          800: '#050505',
          900: '#000000',
          950: '#000000',
        },
        // X-style grays
        'x': {
          gray: '#71767b',
          lightgray: '#eff3f4',
          darkgray: '#2f3336',
          border: '#2f3336',
          hover: '#1d1f23',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(255, 0, 51, 0.5), 0 0 40px rgba(255, 0, 51, 0.3)',
        'neon-crimson': '0 0 20px rgba(220, 20, 60, 0.5), 0 0 40px rgba(220, 20, 60, 0.3)',
        'neon-orange': '0 0 20px rgba(255, 69, 0, 0.5)',
        'glow-red': '0 0 30px rgba(255, 0, 51, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'glow': 'glowRed 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glowRed: {
          '0%': { boxShadow: '0 0 20px rgba(255, 0, 51, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 0, 51, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

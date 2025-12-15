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
        // Deep red accent (like the cyan in the image but red)
        'accent': {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          dark: '#991b1b',
          glow: '#dc2626',
        },
        // X-style dark backgrounds
        'dark': {
          50: '#374151',
          100: '#1f2937',
          200: '#192231',
          300: '#15202b',
          400: '#101820',
          500: '#0d1117',
          600: '#000000',
        },
        // X-style grays for text and borders
        'x': {
          white: '#e7e9ea',
          gray: '#71767b',
          lightgray: '#8b98a5',
          border: '#38444d',
          hover: '#1d2f3f',
          card: '#192734',
        },
        // Keep neon-red for compatibility
        'neon': {
          red: '#dc2626',
          crimson: '#b91c1c',
        },
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'accent': '0 0 15px rgba(220, 38, 38, 0.4)',
        'accent-lg': '0 0 30px rgba(220, 38, 38, 0.5)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
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
      },
    },
  },
  plugins: [],
}

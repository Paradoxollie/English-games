/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}",
    "./src/**/*.{html,js,css}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'quest-gold': '#c9aa71',
        'quest-green': '#4CAF50',
        'quest-dark': 'rgba(0, 0, 0, 0.8)',
        'quest-accent': '#ffd700',
        'quest-red': '#ff4444',
        'quest-blue': '#3b82f6',
      },
      fontFamily: {
        'medieval': ['MedievalSharp', 'cursive'],
        'quest': ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'quest-pattern': "url('/images/background.webp')",
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 170, 113, 0.4)' },
          '50%': { boxShadow: '0 0 0 15px rgba(201, 170, 113, 0)' },
        },
      },
      container: {
        center: true,
        padding: '1rem',
      },
      transitionProperty: {
        'color': 'color',
      },
    },
  },
  plugins: [],
  safelist: [
    'text-quest-gold',
    'text-quest-red',
    'text-quest-blue',
    'active',
    'nav-link',
    'font-bold'
  ]
}


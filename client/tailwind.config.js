/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: '#09090b',
        panel: '#141414',
        raised: '#1c1c1c',
        line: '#2a2a2a',
        frost: '#f5f5f5',
        mist: '#a3a3a3',
        subtle: '#737373',
        accent: '#fafafa',
        link: '#60a5fa',
        warn: '#fbbf24',
        success: '#4ade80',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
        card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};

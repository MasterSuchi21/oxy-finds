/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1a1210',
        paper: '#faf7f2',
        clay: '#c45a1b',
        moss: '#2d3a2e',
        sand: '#e9e1d3',
      },
    },
  },
  plugins: [],
};

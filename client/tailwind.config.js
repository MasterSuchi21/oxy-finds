/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: '#05070d',
        panel: '#0b0f1a',
        line: 'rgba(148, 163, 199, 0.14)',
        neon: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          pink: '#f472b6',
        },
        mist: '#8b96ab',
        frost: '#e6edf7',
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.25)',
        'glow-violet': '0 0 24px rgba(167, 139, 250, 0.25)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 55%, #f472b6 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 14s linear infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: '#0b0d12',
        panel: '#12151c',
        raised: '#1a1e28',
        line: 'rgba(255,255,255,0.08)',
        frost: '#f0f4f8',
        mist: '#94a3b8',
        subtle: '#64748b',
        accent: '#f0f4f8',
        link: '#38bdf8',
        brand: '#22d3ee',
        'brand-2': '#6366f1',
        warn: '#fbbf24',
        success: '#34d399',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
        card: '0 4px 24px rgba(0, 0, 0, 0.25)',
        glow: '0 0 24px rgba(34, 211, 238, 0.12)',
        'glow-lg': '0 8px 40px rgba(99, 102, 241, 0.15)',
      },
      backgroundImage: {
        mesh: [
          'radial-gradient(ellipse 80% 55% at 50% -15%, rgba(34,211,238,0.09), transparent 55%)',
          'radial-gradient(ellipse 50% 40% at 100% 0%, rgba(99,102,241,0.07), transparent 50%)',
          'radial-gradient(ellipse 40% 35% at 0% 80%, rgba(34,211,238,0.05), transparent 50%)',
        ].join(', '),
        'brand-gradient': 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

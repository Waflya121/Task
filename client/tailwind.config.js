/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          start: '#2563eb', // blue-600
          end: '#7c3aed', // violet-600
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #eff6ff 100%)',
      },
      boxShadow: {
        glow: '0 10px 30px -8px rgba(124, 58, 237, 0.45)',
        'glow-blue': '0 10px 30px -8px rgba(37, 99, 235, 0.45)',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 12s ease infinite',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SSSGC Brand Palette
        saffron: {
          50: '#FFF8EB',
          100: '#FFEFC2',
          200: '#FFE099',
          300: '#FFD070',
          400: '#F2A830',
          500: '#E8860C', // Primary saffron
          600: '#C46F0A',
          700: '#A05808',
          800: '#7C4306',
          900: '#5A3004',
        },
        maroon: {
          50: '#FDF2F4',
          100: '#F8D9DE',
          200: '#F0B3BD',
          300: '#E08D9C',
          400: '#C4566E',
          500: '#8B2240',
          600: '#6B1D2A', // Primary maroon
          700: '#551724',
          800: '#40111C',
          900: '#2B0C14',
        },
        cream: {
          50: '#FFFDFB',
          100: '#FDF8F0', // Primary cream (background)
          200: '#F5EDE0',
          300: '#EDE2D0',
          400: '#DED0B8',
          500: '#CFBEA0',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5EBD4',
          200: '#EADAAA',
          300: '#DFC880',
          400: '#D4B656',
          500: '#C4922A', // Primary gold
          600: '#A37823',
          700: '#825E1C',
          800: '#614615',
          900: '#40300E',
        },
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['1.75rem', { lineHeight: '1.3' }],
        'h3': ['1.375rem', { lineHeight: '1.4' }],
        'h4': ['1.125rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(107, 29, 42, 0.08), 0 1px 2px rgba(107, 29, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(107, 29, 42, 0.12), 0 2px 4px rgba(107, 29, 42, 0.08)',
        'nav': '0 -1px 8px rgba(107, 29, 42, 0.08)',
      },
      spacing: {
        'sidebar': '220px',
        'icon-rail': '64px',
      },
    },
  },
  plugins: [],
};

export default config;

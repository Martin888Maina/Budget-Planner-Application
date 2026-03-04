/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          coral: '#E07A5F',
          sage: '#81B29A',
          amber: '#F2CC8F',
          danger: '#E76F51',
          blue: '#457B9D',
          dark: '#2D6A4F',
        },
        surface: {
          bg: '#F8FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
      },
    },
  },
  plugins: [],
};

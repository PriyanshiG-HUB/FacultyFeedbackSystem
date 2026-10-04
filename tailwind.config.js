/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./resources/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#010736',
          navy: '#0D1C42',
          primary: '#22396F',
          accent: '#FCF1D0',
          // keep a light version for subtle backgrounds
          50: '#F0F4F8',
          100: '#E1E9F2',
          200: '#C3D3E5',
          300: '#94B4D1',
          400: '#5E90BA',
          500: '#22396F', // same as brand-primary
          600: '#1C2F5C',
          700: '#0D1C42', // same as brand-navy
          800: '#0A1532',
          900: '#010736', // same as brand-dark
          950: '#000424',
        }
      },
    },
  },
  plugins: [],
}

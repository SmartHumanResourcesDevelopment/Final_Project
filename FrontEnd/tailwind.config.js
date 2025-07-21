/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Vite 기준
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
         'main-button': 'var(--main-button)',
        'main-button-hover': 'var(--main-button-hover)',
        'muted': 'var(--muted)',
        'edf-2f-7': 'var(--edf-2f-7)',
        'action-sec': 'var(--action-sec)',
        
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        racing: ["'Racing Sans One'", "sans-serif","Helvetica"],
        // 기본 sans를 교체하면 class="font-sans"만 써도 Noto Sans KR
        sans: ["'Noto Sans KR'", "sans-serif","Helvetica"],
      },
    },
  },
  plugins: [],
};
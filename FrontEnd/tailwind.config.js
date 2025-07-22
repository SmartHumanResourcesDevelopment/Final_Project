/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "action-sec": "var(--action-sec)",
        "edf-2f-7": "var(--edf-2f-7)",
        muted: "var(--muted)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],   // ★ 추가
      },
    },
  },
  plugins: [],
};

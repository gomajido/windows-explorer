/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        explorer: {
          bg: "#f3f3f3",
          sidebar: "#ffffff",
          toolbar: "#f9f9f9",
          border: "#e5e5e5",
          hover: "#e8f0fe",
          selected: "#cce8ff",
          text: "#1f1f1f",
          textSecondary: "#5f6368",
        },
      },
    },
  },
  plugins: [],
};

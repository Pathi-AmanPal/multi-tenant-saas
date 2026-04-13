/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind to scan all JSX files for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable dark mode via a class on the root element
  // We'll toggle "dark" class on <html> for dark mode support
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};

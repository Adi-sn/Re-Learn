/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace'],
      },
      colors: {
        'transparent-blue': 'rgba(59, 130, 246, 0.05)', // Light mode: very weak transparent blue
        'transparent-blue-dark': 'rgba(59, 130, 246, 0.15)', // Dark mode: slightly darker transparent blue
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#ec4899",
        accent: "#8b5cf6",
      },
      animation: {
        "typing-dot": "typing-dot 1.4s infinite",
      },
      keyframes: {
        "typing-dot": {
          "0%, 60%, 100%": { opacity: 0.5, transform: "translateY(0)" },
          "30%": { opacity: 1, transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}

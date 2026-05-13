/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cf: {
          blue: "#A8C4D9",
          blueSoft: "#D6E8F7",
          blueDark: "#3F5A6B",
          sage: "#C8DDD1",
          sageDark: "#3A6452",
          amber: "#E8D2A6",
          amberDark: "#7A5A1F",
          red: "#F5C0C0",
          redDark: "#8A3A3A",
          bg: "#FAFAF8",
          card: "#F0EDE8",
          cardSoft: "#F7F4EF",
          text: "#2A3340",
          text2: "#5C6773",
          slate: "#8A9AA8",
          slateDk: "#566472",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        cf: "0 1px 6px rgba(20,30,45,0.06)",
        cf2: "0 2px 10px rgba(20,30,45,0.08)",
        fab: "0 6px 18px rgba(70,110,140,0.32)",
      },
      borderColor: {
        cf: "rgba(70,75,85,0.10)",
        cf2: "rgba(70,75,85,0.18)",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        nifty: {
          black: "#1a1a1a",
          white: "#eeeeee",
          gray: {
            1: '#a5a5a5',
            2: '#757575'
          },
          dark: {
            background: "#212121",
            text: "#ffffff",
          },
          light: {
            background: "#ffffff",
            text: "#000000",
          },
        }
      },
      // shadow
      boxShadow: {
        'search': '0px 4px 10px rgba(0, 0, 0, 0.20)',
        'book': '-20px 10px 10px rgba(0, 0, 0, 0.15)',
      },
    },

  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CD2C58',
          light: '#E06B80',
          100: '#FFE6D4',
          200: '#FFC69D',
        }
      }
    },
  },
  plugins: [],
};
export default config;

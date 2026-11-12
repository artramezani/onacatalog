import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  'oklch(97% 0.02 250)',
          100: 'oklch(93% 0.04 250)',
          200: 'oklch(86% 0.08 250)',
          300: 'oklch(76% 0.12 250)',
          400: 'oklch(64% 0.16 250)',
          500: 'oklch(52% 0.20 250)',
          600: 'oklch(44% 0.20 250)',
          700: 'oklch(37% 0.18 250)',
          800: 'oklch(30% 0.15 250)',
          900: 'oklch(22% 0.10 250)',
        },
      },
    },
  },
  plugins: [],
}
export default config

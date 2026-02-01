/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#FFFFFF',
          'bg-secondary': '#F9FAFB',
        },
        text: {
          primary: '#111827',
          secondary: '#374151',
          muted: '#6B7280',
          placeholder: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          focus: '#3B82F6',
        },
        action: {
          primary: '#111827',
          secondary: '#F3F4F6',
          danger: '#DC2626',
          success: '#16A34A',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

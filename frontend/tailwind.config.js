module.exports = {
    content: [
        "./index.html",

        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Backgrounds
                background: {
                    DEFAULT: '#0f172a', // Slate 900
                    paper: '#1e293b',   // Slate 800
                    lighter: '#334155'  // Slate 700
                },
                // Primary Brand (Orange)
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // Secondary Accents (Blue)
                secondary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                success: {
                    500: '#10b981',
                    600: '#059669',
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
                text: {
                    primary: '#f8fafc',
                    secondary: '#94a3b8',
                }
            }
        },
    },
    plugins: [],
}
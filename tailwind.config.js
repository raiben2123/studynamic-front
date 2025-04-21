/** @type {import('tailwindcss').Config} */
const themeSwapper = require('tailwindcss-theme-swapper');

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        themeSwapper({
            themes: [
                {
                    name: 'default',
                    selectors: ['.theme-default', ':root:not(.theme-dark):not(.theme-green):not(.theme-purple)'],
                    theme: {
                        colors: {
                            primary: '#467BAA',
                            secondary: '#f5a623',
                            accent: '#5aa0f2',
                            background: '#e6f0fa',
                        }
                    }
                },
                {
                    name: 'dark',
                    selectors: ['.theme-dark'],
                    theme: {
                        colors: {
                            primary: '#2c3e50',
                            secondary: '#f39c12',
                            accent: '#3498db',
                            background: '#1a1a1a',
                        }
                    }
                },
                {
                    name: 'green',
                    selectors: ['.theme-green'],
                    theme: {
                        colors: {
                            primary: '#27ae60',
                            secondary: '#f1c40f',
                            accent: '#2ecc71',
                            background: '#e8f5e9',
                        }
                    }
                },
                {
                    name: 'purple',
                    selectors: ['.theme-purple'],
                    theme: {
                        colors: {
                            primary: '#8e44ad',
                            secondary: '#e74c3c',
                            accent: '#9b59b6',
                            background: '#f3e5f5',
                        }
                    }
                }
            ]
        })
    ],
}
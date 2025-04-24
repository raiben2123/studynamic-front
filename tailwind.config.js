/** @type {import('tailwindcss').Config} */
const themeSwapper = require('tailwindcss-theme-swapper');

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {}, // Eliminamos extend: colors, ya que theme-swapper manejará todo
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
                            'primary-light': '#bfdbfe', // blue-200
                            error: '#EF4444', // red-500
                            'task-finalizada': '#15803D', // green-700
                            'task-finalizada-bg': '#DCFCE7', // green-100
                            'task-vencida': '#B91C1C', // red-700
                            'task-vencida-bg': '#FEE2E2', // red-100
                            'task-hoy': '#C2410C', // orange-700
                            'task-hoy-bg': '#FFEDD5', // orange-100
                            'task-pronto': '#A16207', // yellow-700
                            'task-pronto-bg': '#FEF9C3', // yellow-100
                            'task-normal': '#1E40AF', // blue-800
                            'task-normal-bg': '#DBEAFE', // blue-100
                            'task-calificacion': '#1E40AF', // blue-800
                            'task-calificacion-bg': '#DBEAFE', // blue-100
                            'task-alta': '#EF4444', // red-500
                            'task-media': '#F59E0B', // orange-500
                            'task-baja': '#3B82F6', // blue-500
                            'event-pasado': '#1F2937', // gray-800
                            'event-pasado-bg': '#F3F4F6', // gray-100
                            'event-proximo': '#B91C1C', // red-700
                            'event-proximo-bg': '#FEE2E2', // red-100
                            'event-cercano': '#C2410C', // orange-700
                            'event-cercano-bg': '#FFEDD5', // orange-100
                            'event-futuro': '#15803D', // green-700
                            'event-futuro-bg': '#DCFCE7', // green-100
                            'activity-progress': '#467BAA', // primary
                            task: '#E11D48', // rose-600 (task-border)
                            event: '#8B5CF6', // violet-500 (event-border)
                            'task-text': '#E11D48', // rose-600
                            'event-text': '#8B5CF6' // violet-500
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
                            'primary-light': '#4b5e71', // azul grisáceo oscuro
                            error: '#F87171', // red-400
                            'task-finalizada': '#34D399', // green-400
                            'task-finalizada-bg': '#064E3B', // green-900
                            'task-vencida': '#FCA5A5', // red-300
                            'task-vencida-bg': '#7F1D1D', // red-900
                            'task-hoy': '#FDBA74', // orange-300
                            'task-hoy-bg': '#7C2D12', // orange-900
                            'task-pronto': '#FBBF24', // yellow-400
                            'task-pronto-bg': '#713F12', // yellow-900
                            'task-normal': '#93C5FD', // blue-300
                            'task-normal-bg': '#1E3A8A', // blue-900
                            'task-calificacion': '#93C5FD', // blue-300
                            'task-calificacion-bg': '#1E3A8A', // blue-900
                            'task-alta': '#F87171', // red-400
                            'task-media': '#FB923C', // orange-400
                            'task-baja': '#60A5FA', // blue-400
                            'event-pasado': '#D1D5DB', // gray-300
                            'event-pasado-bg': '#374151', // gray-700
                            'event-proximo': '#FCA5A5', // red-300
                            'event-proximo-bg': '#7F1D1D', // red-900
                            'event-cercano': '#FDBA74', // orange-300
                            'event-cercano-bg': '#7C2D12', // orange-900
                            'event-futuro': '#34D399', // green-400
                            'event-futuro-bg': '#064E3B', // green-900
                            'activity-progress': '#2c3e50', // primary
                            task: '#FCA5A5', // red-300 (task-border)
                            event: '#A78BFA', // violet-400 (event-border)
                            'task-text': '#FCA5A5', // red-300
                            'event-text': '#A78BFA' // violet-400
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
                            'primary-light': '#86efac', // green-300
                            error: '#EF4444', // red-500
                            'task-finalizada': '#15803D', // green-700
                            'task-finalizada-bg': '#DCFCE7', // green-100
                            'task-vencida': '#B91C1C', // red-700
                            'task-vencida-bg': '#FEE2E2', // red-100
                            'task-hoy': '#C2410C', // orange-700
                            'task-hoy-bg': '#FFEDD5', // orange-100
                            'task-pronto': '#A16207', // yellow-700
                            'task-pronto-bg': '#FEF9C3', // yellow-100
                            'task-normal': '#1E40AF', // blue-800
                            'task-normal-bg': '#DBEAFE', // blue-100
                            'task-calificacion': '#1E40AF', // blue-800
                            'task-calificacion-bg': '#DBEAFE', // blue-100
                            'task-alta': '#EF4444', // red-500
                            'task-media': '#F59E0B', // orange-500
                            'task-baja': '#3B82F6', // blue-500
                            'event-pasado': '#1F2937', // gray-800
                            'event-pasado-bg': '#F3F4F6', // gray-100
                            'event-proximo': '#B91C1C', // red-700
                            'event-proximo-bg': '#FEE2E2', // red-100
                            'event-cercano': '#C2410C', // orange-700
                            'event-cercano-bg': '#FFEDD5', // orange-100
                            'event-futuro': '#15803D', // green-700
                            'event-futuro-bg': '#DCFCE7', // green-100
                            'activity-progress': '#27ae60', // primary
                            task: '#E11D48', // rose-600 (task-border)
                            event: '#8B5CF6', // violet-500 (event-border)
                            'task-text': '#E11D48', // rose-600
                            'event-text': '#8B5CF6' // violet-500
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
                            'primary-light': '#d8b4fe', // purple-200
                            error: '#EF4444', // red-500
                            'task-finalizada': '#15803D', // green-700
                            'task-finalizada-bg': '#DCFCE7', // green-100
                            'task-vencida': '#B91C1C', // red-700
                            'task-vencida-bg': '#FEE2E2', // red-100
                            'task-hoy': '#C2410C', // orange-700
                            'task-hoy-bg': '#FFEDD5', // orange-100
                            'task-pronto': '#A16207', // yellow-700
                            'task-pronto-bg': '#FEF9C3', // yellow-100
                            'task-normal': '#1E40AF', // blue-800
                            'task-normal-bg': '#DBEAFE', // blue-100
                            'task-calificacion': '#1E40AF', // blue-800
                            'task-calificacion-bg': '#DBEAFE', // blue-100
                            'task-alta': '#EF4444', // red-500
                            'task-media': '#F59E0B', // orange-500
                            'task-baja': '#3B82F6', // blue-500
                            'event-pasado': '#1F2937', // gray-800
                            'event-pasado-bg': '#F3F4F6', // gray-100
                            'event-proximo': '#B91C1C', // red-700
                            'event-proximo-bg': '#FEE2E2', // red-100
                            'event-cercano': '#C2410C', // orange-700
                            'event-cercano-bg': '#FFEDD5', // orange-100
                            'event-futuro': '#15803D', // green-700
                            'event-futuro-bg': '#DCFCE7', // green-100
                            'activity-progress': '#8e44ad', // primary
                            task: '#E11D48', // rose-600 (task-border)
                            event: '#8B5CF6', // violet-500 (event-border)
                            'task-text': '#E11D48', // rose-600
                            'event-text': '#8B5CF6' // violet-500
                        }
                    }
                }
            ]
        })
    ],
};
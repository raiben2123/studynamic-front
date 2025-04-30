/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores primarios del tema
        'primary': 'var(--primary-color)',
        'primary-light': 'var(--color-primary-light)',
        'secondary': 'var(--secondary-color)',
        'accent': 'var(--accent-color)',
        'background': 'var(--background-color)',
        'error': 'var(--color-error)',
        
        // Colores para texto y fondos (importante para tema oscuro)
        'text': 'var(--text-color)',
        'text-secondary': 'var(--text-color-secondary)',
        'menu-bg': 'var(--menu-bg-color)',
        'card-bg': 'var(--card-bg-color)',
        'input-bg': 'var(--input-bg-color)',
        'border': 'var(--border-color)',
        
        // Colores para tareas
        'task-finalizada': 'var(--color-task-finalizada)',
        'task-finalizada-bg': 'var(--color-task-finalizada-bg)',
        'task-vencida': 'var(--color-task-vencida)',
        'task-vencida-bg': 'var(--color-task-vencida-bg)',
        'task-hoy': 'var(--color-task-hoy)',
        'task-hoy-bg': 'var(--color-task-hoy-bg)',
        'task-pronto': 'var(--color-task-pronto)',
        'task-pronto-bg': 'var(--color-task-pronto-bg)',
        'task-normal': 'var(--color-task-normal)',
        'task-normal-bg': 'var(--color-task-normal-bg)',
        'task-calificacion': 'var(--color-task-calificacion)',
        'task-calificacion-bg': 'var(--color-task-calificacion-bg)',
        'task-alta': 'var(--color-task-alta)',
        'task-media': 'var(--color-task-media)',
        'task-baja': 'var(--color-task-baja)',
        
        // Colores para eventos
        'event-pasado': 'var(--color-event-pasado)',
        'event-pasado-bg': 'var(--color-event-pasado-bg)',
        'event-proximo': 'var(--color-event-proximo)',
        'event-proximo-bg': 'var(--color-event-proximo-bg)',
        'event-cercano': 'var(--color-event-cercano)',
        'event-cercano-bg': 'var(--color-event-cercano-bg)',
        'event-futuro': 'var(--color-event-futuro)',
        'event-futuro-bg': 'var(--color-event-futuro-bg)',
        'activity-progress': 'var(--color-activity-progress)',
        
        // Colores para bordes y textos
        'task': 'var(--color-task-text)',
        'task-border': 'var(--color-task-border)',
        'event': 'var(--color-event-text)',
        'event-border': 'var(--color-event-border)',
      },
      spacing: {
        'mobile-padding': 'var(--mobile-padding)',
        'desktop-padding': 'var(--desktop-padding)',
        'bottom-nav-height': 'var(--bottom-nav-height)',
        'sidebar-width-desktop': 'var(--sidebar-width-desktop)',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      backgroundColor: {
        'dark': 'var(--card-bg-color)',
      },
      textColor: {
        'dark': 'var(--text-color)',
      },
      borderColor: {
        'dark': 'var(--border-color)',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Habilitar modo oscuro basado en clases
};

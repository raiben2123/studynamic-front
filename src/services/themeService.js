// src/services/themeService.js - Versión mejorada

/**
 * Definición de los temas disponibles en la aplicación
 */
export const colorThemes = [
    {
        id: 'default',
        name: 'Default',
        class: 'theme-default'
    },
    {
        id: 'dark',
        name: 'Modo Oscuro',
        class: 'theme-dark'
    },
    {
        id: 'green',
        name: 'Verde',
        class: 'theme-green'
    },
    {
        id: 'purple',
        name: 'Morado',
        class: 'theme-purple'
    }
];

/**
 * Aplica un tema específico al documento HTML
 * @param {string} themeId - Identificador del tema a aplicar
 */
export const applyTheme = (themeId) => {
    const theme = colorThemes.find(t => t.id === themeId);
    if (!theme) return;
    
    // Remover todas las clases de tema anteriores
    document.documentElement.classList.remove(
        'theme-default',
        'theme-dark', 
        'theme-green', 
        'theme-purple'
    );
    
    // Aplicar la nueva clase de tema (siempre añadir la clase, incluso para el tema default)
    document.documentElement.classList.add(theme.class);
    
    // Guardar en localStorage
    localStorage.setItem('theme', themeId);
    
    // Aplicar propiedades CSS personalizadas basadas en el tema
    if (themeId === 'dark') {
        document.documentElement.style.colorScheme = 'dark';
        document.documentElement.style.setProperty('--background-color', '#121212');
        document.documentElement.style.setProperty('--text-color', '#e6e6e6');
        document.documentElement.style.setProperty('--card-background', '#1e1e1e');
        document.documentElement.style.setProperty('--input-background', '#2d2d2d');
        document.documentElement.style.setProperty('--border-color', '#333333');
    } else if (themeId === 'default') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#e6f0fa');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
    } else if (themeId === 'green') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#e8f5e9');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
    } else if (themeId === 'purple') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#f3e5f5');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
    }
};

/**
 * Carga y aplica el tema del localStorage
 */
export const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    applyTheme(savedTheme);
    return savedTheme;
};
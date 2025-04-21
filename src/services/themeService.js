// src/services/themeService.js

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
        name: 'Púrpura',
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
    
    // Aplicar la nueva clase de tema
    if (theme.id !== 'default') {
        document.documentElement.classList.add(theme.class);
    }
    
    // Guardar en localStorage
    localStorage.setItem('theme', themeId);
    
};

/**
 * Carga y aplica el tema del localStorage
 */
export const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    applyTheme(savedTheme);
    return savedTheme;
};
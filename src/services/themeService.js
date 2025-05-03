// src/services/themeService.js - Versión mejorada para Capacitor
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

// Detectar si estamos en una plataforma nativa
const isNative = Capacitor.isNativePlatform();

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
 * Aplica un tema específico al documento HTML y a la interfaz nativa si está disponible
 * @param {string} themeId - Identificador del tema a aplicar
 */
export const applyTheme = async (themeId) => {
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
        
        // Configurar StatusBar para tema oscuro en dispositivos nativos
        if (isNative) {
            try {
                await StatusBar.setStyle({ style: Style.Dark });
                if (Capacitor.getPlatform() === 'android') {
                    StatusBar.setBackgroundColor({ color: '#121212' });
                }
            } catch (error) {
                console.error('Error al configurar StatusBar:', error);
            }
        }
    } else if (themeId === 'default') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#e6f0fa');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
        
        // Configurar StatusBar para tema claro en dispositivos nativos
        if (isNative) {
            try {
                await StatusBar.setStyle({ style: Style.Light });
                if (Capacitor.getPlatform() === 'android') {
                    StatusBar.setBackgroundColor({ color: '#467BAA' });
                }
            } catch (error) {
                console.error('Error al configurar StatusBar:', error);
            }
        }
    } else if (themeId === 'green') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#e8f5e9');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
        
        // Configurar StatusBar para tema verde en dispositivos nativos
        if (isNative) {
            try {
                await StatusBar.setStyle({ style: Style.Light });
                if (Capacitor.getPlatform() === 'android') {
                    StatusBar.setBackgroundColor({ color: '#4CAF50' });
                }
            } catch (error) {
                console.error('Error al configurar StatusBar:', error);
            }
        }
    } else if (themeId === 'purple') {
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.setProperty('--background-color', '#f3e5f5');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--card-background', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--border-color', '#e5e7eb');
        
        // Configurar StatusBar para tema morado en dispositivos nativos
        if (isNative) {
            try {
                await StatusBar.setStyle({ style: Style.Light });
                if (Capacitor.getPlatform() === 'android') {
                    StatusBar.setBackgroundColor({ color: '#9C27B0' });
                }
            } catch (error) {
                console.error('Error al configurar StatusBar:', error);
            }
        }
    }
};

/**
 * Carga y aplica el tema del localStorage
 */
export const loadSavedTheme = async () => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    await applyTheme(savedTheme);
    return savedTheme;
};
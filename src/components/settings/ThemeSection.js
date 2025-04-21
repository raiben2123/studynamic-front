// src/components/settings/ThemeSection.js
import React from 'react';
import PropTypes from 'prop-types';

const colorThemes = [
    {
        id: 'default',
        name: 'Default',
        primary: '#467BAA',
        secondary: '#f5a623',
        accent: '#5aa0f2',
        background: '#e6f0fa'
    },
    {
        id: 'dark',
        name: 'Modo Oscuro',
        primary: '#2c3e50',
        secondary: '#f39c12',
        accent: '#3498db',
        background: '#1a1a1a'
    },
    {
        id: 'green',
        name: 'Verde',
        primary: '#27ae60',
        secondary: '#f1c40f',
        accent: '#2ecc71',
        background: '#e8f5e9'
    },
    {
        id: 'purple',
        name: 'Púrpura',
        primary: '#8e44ad',
        secondary: '#e74c3c',
        accent: '#9b59b6',
        background: '#f3e5f5'
    }
];

const ThemeSection = ({ selectedTheme, onThemeChange }) => {
    const handleThemeChange = (themeId) => {
        onThemeChange(themeId);
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
            <h2 className="text-xl font-semibold mb-4">Temas y Apariencia</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {colorThemes.map((theme) => (
                    <div
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`
                            p-4 rounded-lg cursor-pointer transition
                            ${selectedTheme === theme.id ? 'ring-2 ring-[#467BAA] shadow-md' : 'hover:bg-gray-100'}
                        `}
                        style={{
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.primary}`
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex space-x-2 mb-2">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                            <span className="text-sm font-medium" style={{ color: theme.primary }}>
                                {theme.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-2 text-center text-sm text-gray-600">
                <p>Selecciona un tema para personalizar la apariencia de la aplicación.</p>
            </div>
        </div>
    );
};

ThemeSection.propTypes = {
    selectedTheme: PropTypes.string.isRequired,
    onThemeChange: PropTypes.func.isRequired
};

// Exportar los temas para que estén disponibles en otras partes de la aplicación
export { colorThemes };
export default ThemeSection;
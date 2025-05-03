import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { loadSavedTheme } from './services/themeService';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

// Cargar el tema guardado
loadSavedTheme();

// Configuración para dispositivos móviles
const setupMobileConfig = async () => {
  if (Capacitor.isNativePlatform()) {
    // Ocultar la barra de estado en Android
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({ color: '#467BAA' });
    } catch (err) {
      console.error('Error configurando StatusBar:', err);
    }
    
    // Configurar altura de viewport para móviles
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
  }
};

setupMobileConfig();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // Importamos el nuevo archivo CSS unificado
import App from './App';
import { loadSavedTheme } from './services/themeService';

loadSavedTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Aplicación inicializada
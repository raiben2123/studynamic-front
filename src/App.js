// src/App.js
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TasksPage from './pages/TasksPage';
import ResourcesPage from './pages/ResourcesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import SettingsPage from './pages/SettingsPage';
import { loadSavedTheme } from './services/themeService';

// Componente de tema que aplica el tema guardado
const ThemeProvider = ({ children }) => {
  const { userTheme } = useAuth();
  
  useEffect(() => {
    // Cargar el tema guardado al montar el componente
    loadSavedTheme();
  }, []);
  
  return children;
};

// Definimos PrivateRoute como un componente que usa el contexto de autenticación
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

function App() {
  // Establecer la ruta base para producción
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Configurar ruta base si es necesario
      const base = document.querySelector('base');
      if (!base) {
        const baseEl = document.createElement('base');
        baseEl.href = process.env.PUBLIC_URL || './';
        document.head.insertBefore(baseEl, document.head.firstChild);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Calendar key={Date.now()} />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <TasksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <PrivateRoute>
                  <ResourcesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <GroupsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <PrivateRoute>
                  <GroupDetailsPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } 
            />
            {/* Redirigimos cualquier ruta no definida a "/" */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
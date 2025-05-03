import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import NetworkStatusAlert from './components/NetworkStatusAlert';
import { loadSavedTheme } from './services/themeService';

// Importaciones de Capacitor
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Importaciones con carga diferida
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const GroupDetailsPage = lazy(() => import('./pages/GroupDetailsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const JoinGroupRedirect = lazy(() => import('./components/JoinGroupRedirect'));

// Componente de carga para Suspense
const LoadingFallback = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-text">Cargando...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Componente de tema que aplica el tema guardado
const ThemeProvider = React.memo(({ children }) => {
  useEffect(() => {
    // Cargar el tema guardado al montar el componente
    loadSavedTheme();
  }, []);
  
  return children;
});

ThemeProvider.displayName = 'ThemeProvider';

// Definimos PrivateRoute como un componente que usa el contexto de autenticación
const PrivateRoute = React.memo(({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
});

PrivateRoute.displayName = 'PrivateRoute';

function App() {
  // Estado para saber si se ha inicializado la aplicación
  const [appReady, setAppReady] = useState(false);

  // Inicializar características nativas al cargar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      // Establecer la ruta base para producción
      if (process.env.NODE_ENV === 'production') {
        // Configurar ruta base si es necesario
        const base = document.querySelector('base');
        if (!base) {
          const baseEl = document.createElement('base');
          baseEl.href = process.env.PUBLIC_URL || './';
          document.head.insertBefore(baseEl, document.head.firstChild);
        }
      }

      // Configurar características específicas de Capacitor en dispositivos nativos
      if (Capacitor.isNativePlatform()) {
        try {
          // Configurar la barra de estado
          await StatusBar.setStyle({ style: Style.Dark });
          
          // En Android, hacer que la barra de estado sea transparente
          if (Capacitor.getPlatform() === 'android') {
            StatusBar.setBackgroundColor({ color: '#467BAA' });
          }
          
          // Solicitar permisos para notificaciones locales
          await LocalNotifications.requestPermissions();
          
          // Ocultar el splash screen después de inicializar todo
          await SplashScreen.hide();
        } catch (error) {
          console.error('Error al inicializar capacidades nativas:', error);
        }
      }
      
      // Marcar la aplicación como inicializada
      setAppReady(true);
    };

    initializeApp();
  }, []);

  // Si la aplicación aún no está lista, mostramos una pantalla de carga
  if (!appReady && Capacitor.isNativePlatform()) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-text">Cargando Studynamic...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <NetworkStatusAlert />
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Calendar key={Date.now()} />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <TasksPage />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <ResourcesPage />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <GroupsPage />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <GroupDetailsPage />
                  </Suspense>
                </PrivateRoute>
              }
            />
            {/* Ruta para manejar enlaces de invitación a grupos */}
            <Route
              path="/groups/join/:groupId"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <JoinGroupRedirect />
                </Suspense>
              }
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
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
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import NetworkStatusAlert from './components/NetworkStatusAlert';
import { loadSavedTheme } from './services/themeService';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const GroupDetailsPage = lazy(() => import('./pages/GroupDetailsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const JoinGroupRedirect = lazy(() => import('./components/JoinGroupRedirect'));

const LoadingFallback = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-text">Cargando...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const ThemeProvider = React.memo(({ children }) => {
  useEffect(() => {
    loadSavedTheme();
  }, []);
  
  return children;
});

ThemeProvider.displayName = 'ThemeProvider';

const PrivateRoute = React.memo(({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
});

PrivateRoute.displayName = 'PrivateRoute';

function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (process.env.NODE_ENV === 'production') {
        const base = document.querySelector('base');
        if (!base) {
          const baseEl = document.createElement('base');
          baseEl.href = process.env.PUBLIC_URL || './';
          document.head.insertBefore(baseEl, document.head.firstChild);
        }
      }

      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          
          if (Capacitor.getPlatform() === 'android') {
            StatusBar.setBackgroundColor({ color: '#467BAA' });
          }
          
          await LocalNotifications.requestPermissions();
          await SplashScreen.hide();
        } catch (error) {
          console.error('Error al inicializar capacidades nativas:', error);
        }
      }
      
      setAppReady(true);
    };

    initializeApp();
  }, []);

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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
// Utilidades para manejar la autenticación

// Importamos las funciones síncronas de auth.js
import { getTokenSync, getUserIdSync } from '../api/auth';

// Obtener el token de autenticación del localStorage
export const getAuthToken = () => {
  // Usamos la función sincrona
  return getTokenSync();
};

// Obtener el ID del usuario del localStorage
export const getUserId = () => {
  // Usamos la función síncrona
  return getUserIdSync();
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Almacenar credenciales de autenticación
export const setAuthCredentials = (token, userId) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
};

// Limpiar credenciales de autenticación
export const clearAuthCredentials = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

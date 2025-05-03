// src/api/users.js
import { getAuthToken } from '../utils/authUtils';
import { getTokenSync } from './auth';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Obtener información de un usuario
export const getUserById = async (userId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener usuario: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Actualizar información de un usuario
export const updateUser = async (userId, userData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        ...userData
      })
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar usuario: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Subir foto de perfil
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Usar el método síncrono para obtener el token
    const token = getTokenSync();
    const formData = new FormData();
    formData.append('file', file);

    // Comprobar que el token existe
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('Enviando con token:', token); // Debugging
    console.log('Enviando a userId:', userId);

    const response = await fetch(`${API_URL}/users/${userId}/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error al subir foto de perfil: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// src/api/auth.js
import { Capacitor } from '@capacitor/core';
import { setSecureValue, getSecureValue, removeSecureValue } from '../services/storageService';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const isNative = Capacitor.isNativePlatform();

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const data = await response.json();
        return { token: data.token, userId: data.userId, email: data.email, theme: data.theme, name: data.name, username: data.username, password: data.password };

    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const register = async (username, email, password, name = '') => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                name
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el registro');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
};

export const saveAuthData = async (token, userId, email, name, theme, username, password) => {
    // Guardar usando el servicio de almacenamiento seguro
    await setSecureValue('token', token);
    await setSecureValue('userId', userId.toString());

    if (email) await setSecureValue('userEmail', email);
    if (name) await setSecureValue('name', name);
    if (theme) await setSecureValue('userTheme', theme);
    if (username) await setSecureValue('username', username);
    await setSecureValue('password', password);

    // También guardar en localStorage para acceso síncrono en apps web
    if (!isNative) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId.toString());
        if (email) localStorage.setItem('userEmail', email);
        if (name) localStorage.setItem('name', name);
        if (theme) localStorage.setItem('userTheme', theme);
        if (username) localStorage.setItem('username', username);
        localStorage.setItem('password', password);
    }
};

export const getToken = async () => {
    return await getSecureValue('token');
};

// Método síncrono para obtener el token (para uso en API)
export const getTokenSync = () => {
    return localStorage.getItem('token');
};

// Método síncrono para obtener el ID de usuario
export const getUserIdSync = () => {
    return localStorage.getItem('userId');
};

export const getUserId = async () => {
    return await getSecureValue('userId');
};

export const getUserEmail = async () => {
    return await getSecureValue('userEmail');
};

export const getName = async () => {
    return await getSecureValue('name');
};

export const getUserUsername = async () => {
    return await getSecureValue('username');
};

export const getUserTheme = async () => {
    return await getSecureValue('userTheme');
};

export const getPassword = async () => {
    return await getSecureValue('password');
};

export const removeAuthData = async () => {
    // Eliminar datos del almacenamiento seguro
    await removeSecureValue('token');
    await removeSecureValue('userId');
    await removeSecureValue('loginDate');
    await removeSecureValue('userEmail');
    await removeSecureValue('name');
    await removeSecureValue('username');
    await removeSecureValue('userTheme');
    await removeSecureValue('password');
    await removeSecureValue('profilePicture');

    // Eliminar datos de localStorage (solo para web)
    if (!isNative) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginDate');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('name');
        localStorage.removeItem('username');
        localStorage.removeItem('theme');
        localStorage.removeItem('password');
        localStorage.removeItem('profilePicture');
    }
};

export const updateUserProfile = async (userData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const dataToSend = {
            id: parseInt(userId),
            username: userData.username || await getUserUsername(),
            email: userData.email || await getUserEmail(),
            name: userData.name || await getName(),
            theme: userData.theme || await getUserTheme(),
            password: userData.password || await getPassword()
        };
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar perfil');
        }

        // Actualizar en almacenamiento seguro
        if (userData.email) await setSecureValue('userEmail', userData.email);
        if (userData.name) await setSecureValue('name', userData.name);
        if (userData.theme) await setSecureValue('userTheme', userData.theme);
        if (userData.username) await setSecureValue('username', userData.username);
        if (userData.password) await setSecureValue('password', userData.password);

        // Actualizar también en localStorage para web
        if (!isNative) {
            if (userData.email) localStorage.setItem('userEmail', userData.email);
            if (userData.name) localStorage.setItem('name', userData.name);
            if (userData.theme) localStorage.setItem('userTheme', userData.theme);
            if (userData.username) localStorage.setItem('username', userData.username);
            if (userData.password) localStorage.setItem('password', userData.password);
        }
        
        return true;
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        throw error;
    }
};

export const updateProfilePicture = async (file) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/users/${userId}/profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la foto de perfil');
        }

        const data = await response.json();
        
        // Guardar la URL de la imagen en almacenamiento seguro
        if (data.profilePicture) {
            await setSecureValue('profilePicture', data.profilePicture);
            
            // Guardar también en localStorage para web
            if (!isNative) {
                localStorage.setItem('profilePicture', data.profilePicture);
            }
        }
        
        return data.profilePicture;
    } catch (error) {
        console.error('Error actualizando foto de perfil:', error);

        // En desarrollo, simular la subida
        if (process.env.NODE_ENV === 'development') {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const dataUrl = reader.result;
                    await setSecureValue('profilePicture', dataUrl);
                    
                    if (!isNative) {
                        localStorage.setItem('profilePicture', dataUrl);
                    }
                    
                    resolve(dataUrl);
                };
                reader.readAsDataURL(file);
            });
        }

        throw error;
    }
};
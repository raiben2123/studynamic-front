// src/api/auth.js
import { Preferences } from '@capacitor/preferences';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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
        return { token: data.token, userId: data.userId }; // Asumimos que el backend devuelve token y userId
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const register = async (username, email, password, name = '') => {
    try {
        const response = await fetch(`${API_URL}/users`, {
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

export const saveAuthData = async (token, userId) => {
    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'userId', value: userId.toString() });
    
    // También guardamos la fecha de inicio de sesión para posibles validaciones
    await Preferences.set({ key: 'loginDate', value: new Date().toISOString() });
};

export const getToken = async () => {
    const { value } = await Preferences.get({ key: 'token' });
    return value;
};

export const getUserId = async () => {
    const { value } = await Preferences.get({ key: 'userId' });
    return value;
};

export const removeAuthData = async () => {
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'userId' });
    await Preferences.remove({ key: 'loginDate' });
    
    // Eliminar datos de perfil en localStorage
    localStorage.removeItem('theme');
    // Mantener otros datos para comodidad del usuario si vuelve a iniciar sesión
};

export const updateUserProfile = async (userData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: parseInt(userId),
                username: userData.username,
                email: userData.email,
                name: userData.name || '',
                theme: userData.theme
                // No incluir password para no modificarlo inadvertidamente
            }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar perfil');
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
        return data.profilePicture;
    } catch (error) {
        console.error('Error actualizando foto de perfil:', error);
        
        // En desarrollo, simular la subida
        if (process.env.NODE_ENV === 'development') {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    localStorage.setItem('profilePicture', reader.result);
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        }
        
        throw error;
    }
};
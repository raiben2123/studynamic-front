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
        return { token: data.token, userId: data.userId, email: data.email, theme: data.theme, name: data.name, username: data.username }; 

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

export const saveAuthData = async (token, userId, email, name, theme, username) => {
    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'userId', value: userId.toString() });
    
    // Guardar datos adicionales del usuario
    if (email) await Preferences.set({ key: 'userEmail', value: email });
    if (name) await Preferences.set({ key: 'name', value: name });
    if (theme) await Preferences.set({ key: 'userTheme', value: theme });
    if (username) await Preferences.set({ key: 'username', value: username });

};

export const getToken = async () => {
    const { value } = await Preferences.get({ key: 'token' });
    return value;
};

export const getUserId = async () => {
    const { value } = await Preferences.get({ key: 'userId' });
    return value;
};

export const getUserEmail = async () => {
    const { value } = await Preferences.get({ key: 'userEmail' });
    return value;
};

export const getName = async () => {
    const { value } = await Preferences.get({ key: 'name' });
    return value;
};

export const getUserUsername = async () => {
    const { value } = await Preferences.get({ key: 'username' });
    return value;
}

export const getUserTheme = async () => {
    const { value } = await Preferences.get({ key: 'theme' });
    return value;
};

export const removeAuthData = async () => {
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'userId' });
    await Preferences.remove({ key: 'loginDate' });
    await Preferences.remove({ key: 'userEmail' });
    await Preferences.remove({ key: 'name' });
    await Preferences.remove({ key: 'username' });
    
    // Eliminar tema del localStorage
    localStorage.removeItem('theme');
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
            theme: userData.theme || await getUserTheme()
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

        if (userData.email) await Preferences.set({ key: 'userEmail', value: userData.email });
        if (userData.name) await Preferences.set({ key: 'name', value: userData.name });
        if (userData.theme) await Preferences.set({ key: 'theme', value: userData.theme });
        if (userData.username) await Preferences.set({ key: 'username', value: userData.username });
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
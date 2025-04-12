// src/api/auth.js
import { Storage } from '@capacitor/storage';

const API_URL = process.env.REACT_APP_API_URL

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

export const saveAuthData = async (token, userId) => {
    await Storage.set({ key: 'token', value: token });
    await Storage.set({ key: 'userId', value: userId });
};

export const getToken = async () => {
    const { value } = await Storage.get({ key: 'token' });
    return value;
};

export const getUserId = async () => {
    const { value } = await Storage.get({ key: 'userId' });
    return value;
};

export const removeAuthData = async () => {
    await Storage.remove({ key: 'token' });
    await Storage.remove({ key: 'userId' });
};
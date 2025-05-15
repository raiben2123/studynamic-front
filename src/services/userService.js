import { getToken, getUserId } from '../api/auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const getUserProfile = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del perfil');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        
        if (process.env.NODE_ENV === 'development') {
            return {
                firstName: localStorage.getItem('firstName') || '',
                lastName: localStorage.getItem('lastName') || '',
                profilePicture: localStorage.getItem('profilePicture') || null,
                theme: localStorage.getItem('theme') || 'default',
                notificationSettings: {
                    emailNotifications: localStorage.getItem('emailNotifications') === 'true',
                    pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
                    taskReminders: localStorage.getItem('taskReminders') !== 'false'
                }
            };
        }
        
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar los datos del perfil');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        
        if (process.env.NODE_ENV === 'development') {
            if (profileData.firstName !== undefined) {
                localStorage.setItem('firstName', profileData.firstName);
            }
            
            if (profileData.lastName !== undefined) {
                localStorage.setItem('lastName', profileData.lastName);
            }
            
            if (profileData.profilePicture !== undefined) {
                if (profileData.profilePicture === null) {
                    localStorage.removeItem('profilePicture');
                } else {
                    localStorage.setItem('profilePicture', profileData.profilePicture);
                }
            }
            
            if (profileData.theme !== undefined) {
                localStorage.setItem('theme', profileData.theme);
            }
            
            if (profileData.notificationSettings) {
                const { emailNotifications, pushNotifications, taskReminders } = profileData.notificationSettings;
                if (emailNotifications !== undefined) {
                    localStorage.setItem('emailNotifications', emailNotifications);
                }
                if (pushNotifications !== undefined) {
                    localStorage.setItem('pushNotifications', pushNotifications);
                }
                if (taskReminders !== undefined) {
                    localStorage.setItem('taskReminders', taskReminders);
                }
            }
            
            return {
                ...profileData,
                id: userId
            };
        }
        
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
        formData.append('profilePicture', file);
        
        const response = await fetch(`${BASE_URL}/users/${userId}/profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la foto de perfil');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateProfilePicture:', error);
        
        if (process.env.NODE_ENV === 'development') {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result;
                    localStorage.setItem('profilePicture', base64String);
                    resolve({ profilePicture: base64String });
                };
                reader.readAsDataURL(file);
            });
        }
        
        throw error;
    }
};

export const getUserTheme = () => {
    return localStorage.getItem('theme') || 'default';
};

export const saveUserTheme = (themeId) => {
    localStorage.setItem('theme', themeId);
};

export default {
    getUserProfile,
    updateUserProfile,
    updateProfilePicture,
    getUserTheme,
    saveUserTheme
};
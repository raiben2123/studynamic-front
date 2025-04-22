// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    login, 
    saveAuthData, 
    getToken, 
    getUserId,
    getUserEmail,
    getName,
    getUserUsername,
    getUserTheme,
    removeAuthData, 
    updateUserProfile,
    updateProfilePicture
} from '../api/auth';
import { applyTheme } from '../services/themeService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Para la configuración de temas
    const [userTheme, setUserTheme] = useState('default');

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await getToken();
                const storedUserId = await getUserId();
                
                if (storedToken && storedUserId) {
                    setToken(storedToken);
                    setUserId(storedUserId);
                    
                    // Obtener datos del usuario
                    const email = await getUserEmail();
                    const name = await getName();
                    const theme = await getUserTheme();
                    const username = await getUserUsername();
                    
                    // Cargar tema del usuario
                    const savedTheme = theme || localStorage.getItem('theme') || 'default';
                    console.log('Tema Auth:', savedTheme);
                    setUserTheme(savedTheme);
                    applyTheme(savedTheme);
                    
                    // Establecer datos del usuario
                    setUser({ 
                        id: storedUserId,
                        name: name || '',
                        username: username || '',
                        email: email || '',
                        profilePicture: localStorage.getItem('profilePicture') || null,
                        theme: savedTheme
                    });
                }
            } catch (error) {
                console.error('Error cargando datos de autenticación:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadAuthData();
    }, []);

    const handleLogin = async (username, password) => {
        try {
            const { token, userId, email, theme, name } = await login(username, password);
            await saveAuthData(token, userId, email, name, theme, username);
            setToken(token);
            setUserId(userId);
            
            // Cargar el tema del usuario o el predeterminado
            const userTheme = theme || localStorage.getItem('theme') || 'default';
            setUserTheme(userTheme);
            applyTheme(userTheme);
            
            setUser({ 
                id: userId, 
                username: username || '',
                name: name || '',
                email: email || '',
                profilePicture: null,
                theme: userTheme
            });
            
            return true;
        } catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    };

    const logout = async () => {
        setToken(null);
        setUserId(null);
        setUser(null);
        await removeAuthData();
    };
    
    const updateUserTheme = async (themeId) => {
        try {
            // Actualizar estado local
            setUserTheme(themeId);
            
            // Aplicar tema visualmente
            applyTheme(themeId);
            
            // Actualizar el estado del usuario
            setUser(prevUser => ({
                ...prevUser,
                theme: themeId
            }));
            
            // Actualizar en el backend y localStorage
            if (token && userId) {
                await updateUserProfile({
                    theme: themeId
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error actualizando tema:', error);
            return false;
        }
    };
    
    const updateProfile = async (updateData) => {
        try {
            setLoading(true);
            
            if (!token || !userId) {
                throw new Error('No autenticado');
            }
            
            // Si hay cambio de foto de perfil
            let updatedProfilePicture = updateData.profilePicture;
            if (updateData.profilePicture instanceof File) {
                updatedProfilePicture = await updateProfilePicture(updateData.profilePicture);
            }
            
            // Preparar los datos para actualizar
            const dataToUpdate = {};
            if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
            if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
            if (updateData.theme !== undefined) dataToUpdate.theme = updateData.theme;
            if (updateData.username !== undefined) dataToUpdate.username = updateData.username;
            
            // Actualizar información del usuario en el backend
            if (Object.keys(dataToUpdate).length > 0) {
                await updateUserProfile(dataToUpdate);
            }
            
            // Guardar en localStorage para respaldo
            if (updateData.name !== undefined) {
                localStorage.setItem('name', updateData.name);
            }
            
            if (updateData.email !== undefined) {
                localStorage.setItem('userEmail', updateData.email);
            }
            
            if (updatedProfilePicture !== undefined) {
                localStorage.setItem('profilePicture', updatedProfilePicture);
            }

            if (updateData.username !== undefined) {
                localStorage.setItem('username', updateData.username);
            }
            
            // Actualizar el estado del usuario
            setUser(prevUser => ({
                ...prevUser,
                name: updateData.name !== undefined ? updateData.name : prevUser?.name,
                email: updateData.email !== undefined ? updateData.email : prevUser?.email,
                profilePicture: updatedProfilePicture !== undefined ? updatedProfilePicture : prevUser?.profilePicture,
                theme: updateData.theme !== undefined ? updateData.theme : prevUser?.theme,
                username: updateData.username !== undefined ? updateData.username : prevUser?.username
            }));
            
            return true;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ 
            token, 
            userId, 
            user, 
            userTheme,
            login: handleLogin, 
            logout,
            updateProfile,
            updateUserTheme,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
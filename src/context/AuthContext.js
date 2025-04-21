// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    login, 
    saveAuthData, 
    getToken, 
    getUserId, 
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
                    
                    // Cargar tema del usuario desde localStorage
                    const savedTheme = localStorage.getItem('theme') || 'default';
                    setUserTheme(savedTheme);
                    applyTheme(savedTheme);
                    
                    // Establecer datos básicos del usuario
                    // En una implementación real, cargaríamos más datos del backend
                    setUser({ 
                        id: storedUserId,
                        name: localStorage.getItem('userName') || '',
                        username: localStorage.getItem('username') || '',
                        email: localStorage.getItem('userEmail') || '',
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
            const { token, userId } = await login(username, password);
            await saveAuthData(token, userId);
            setToken(token);
            setUserId(userId);
            
            // Cargar el tema predeterminado o el guardado
            const savedTheme = localStorage.getItem('theme') || 'default';
            setUserTheme(savedTheme);
            applyTheme(savedTheme);
            
            // En una implementación real, podríamos obtener los datos del usuario aquí
            // pero por ahora simplemente guardamos el username
            localStorage.setItem('username', username);
            
            setUser({ 
                id: userId, 
                username,
                name: '',
                email: '',
                profilePicture: null,
                theme: savedTheme
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
        
        // Restaurar tema por defecto al cerrar sesión
        applyTheme('default');
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
            
            // Intentar guardar en el backend (si está implementado)
            if (token && userId) {
                try {
                    await updateUserProfile({
                        ...user,
                        theme: themeId
                    });
                } catch (err) {
                    console.warn('No se pudo guardar el tema en el backend, usando localStorage como fallback');
                }
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
            
            // Actualizar información del usuario en el backend
            if (updateData.name !== undefined || updateData.email !== undefined) {
                await updateUserProfile({
                    ...user,
                    name: updateData.name !== undefined ? updateData.name : user?.name,
                    email: updateData.email !== undefined ? updateData.email : user?.email,
                });
            }
            
            // Actualizar tema si ha cambiado
            if (updateData.theme !== undefined && updateData.theme !== userTheme) {
                await updateUserTheme(updateData.theme);
            }
            
            // Guardar en localStorage para persistencia simulada
            if (updateData.name !== undefined) {
                localStorage.setItem('userName', updateData.name);
            }
            
            if (updateData.email !== undefined) {
                localStorage.setItem('userEmail', updateData.email);
            }
            
            if (updatedProfilePicture !== undefined) {
                localStorage.setItem('profilePicture', updatedProfilePicture);
            }
            
            // Actualizar el estado del usuario
            setUser(prevUser => ({
                ...prevUser,
                name: updateData.name !== undefined ? updateData.name : prevUser?.name,
                email: updateData.email !== undefined ? updateData.email : prevUser?.email,
                profilePicture: updatedProfilePicture !== undefined ? updatedProfilePicture : prevUser?.profilePicture,
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
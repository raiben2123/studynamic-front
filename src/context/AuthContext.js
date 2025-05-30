import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    login, 
    register,
    saveAuthData, 
    getToken, 
    getUserId,
    getUserEmail,
    getName,
    getUserUsername,
    getUserTheme,
    getPassword,
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
    
    const [userTheme, setUserTheme] = useState('default');

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await getToken();
                const storedUserId = await getUserId();
                
                if (storedToken && storedUserId) {
                    setToken(storedToken);
                    setUserId(storedUserId);
                    
                    const email = await getUserEmail();
                    const name = await getName();
                    const theme = await getUserTheme();
                    const username = await getUserUsername();
                    const password = await getPassword();
                    
                    const savedTheme = theme || localStorage.getItem('theme') || 'default';
                    setUserTheme(savedTheme);
                    applyTheme(savedTheme);
                    
                    setUser({ 
                        id: storedUserId,
                        name: name || '',
                        username: username || '',
                        email: email || '',
                        password: password || '',
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
            const { token, userId, email, theme, name, password: userPassword } = await login(username, password);
            await saveAuthData(token, userId, email, name, theme, username, userPassword);
            setToken(token);
            setUserId(userId);
            
            const userTheme = theme || localStorage.getItem('theme') || 'default';
            setUserTheme(userTheme);
            applyTheme(userTheme);
            
            setUser({ 
                id: userId, 
                username: username || '',
                name: name || '',
                email: email || '',
                password: userPassword || '',
                profilePicture: null,
                theme: userTheme
            });
            
            return true;
        } catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    };

    const handleRegister = async (username, email, password) => {
        try {
            const { token, userId, name, theme } = await register(username, email, password);
            await saveAuthData(token, userId, email, name, theme, username, password);
            setToken(token);
            setUserId(userId);
            
            const userTheme = theme || localStorage.getItem('theme') || 'default';
            setUserTheme(userTheme);
            applyTheme(userTheme);
            
            setUser({ 
                id: userId,
                username: username || '',
                name: name || '',
                email: email || '',
                password: password || '',
                profilePicture: null,
                theme: userTheme
            });
            
            return true;
        } catch (error) {
            console.error('Error en registro:', error);
            return false;
        }
    }

    const logout = async () => {
        setToken(null);
        setUserId(null);
        setUser(null);
        await removeAuthData();
    };
    
    const updateUserTheme = async (themeId) => {
        try {
            setUserTheme(themeId);
            
            applyTheme(themeId);
            
            setUser(prevUser => ({
                ...prevUser,
                theme: themeId
            }));
            
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
            
            let updatedProfilePicture = updateData.profilePicture;
            if (updateData.profilePicture instanceof File) {
                updatedProfilePicture = await updateProfilePicture(updateData.profilePicture);
            }
            
            const dataToUpdate = {};
            if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
            if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
            if (updateData.theme !== undefined) dataToUpdate.theme = updateData.theme;
            if (updateData.username !== undefined) dataToUpdate.username = updateData.username;
            if (updateData.password !== undefined) dataToUpdate.password = updateData.password;
            
            if (Object.keys(dataToUpdate).length > 0) {
                await updateUserProfile(dataToUpdate);
            }
            
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
            
            if (updateData.password !== undefined) {
                localStorage.setItem('password', updateData.password);
            }

            setUser(prevUser => ({
                ...prevUser,
                name: updateData.name !== undefined ? updateData.name : prevUser?.name,
                email: updateData.email !== undefined ? updateData.email : prevUser?.email,
                profilePicture: updatedProfilePicture !== undefined ? updatedProfilePicture : prevUser?.profilePicture,
                theme: updateData.theme !== undefined ? updateData.theme : prevUser?.theme,
                username: updateData.username !== undefined ? updateData.username : prevUser?.username,
                password: updateData.password !== undefined ? updateData.password : prevUser?.password
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
            register: handleRegister,
            setUser,
            setToken,
            setUserId,
            setUserTheme,
            updateUserProfile,
            updateProfilePicture,
            updateProfile,
            updateUserTheme,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
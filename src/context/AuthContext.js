// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, saveAuthData, getToken, getUserId, removeAuthData } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            const storedToken = await getToken();
            const storedUserId = await getUserId();
            if (storedToken && storedUserId) {
                setToken(storedToken);
                setUserId(storedUserId);
                setUser({ id: storedUserId });
            }
            setLoading(false);
        };
        loadAuthData();
    }, []);

    const handleLogin = async (username, password) => {
        try {
            const { token, userId } = await login(username, password);
            await saveAuthData(token, userId);
            setToken(token);
            setUserId(userId);
            setUser({ id: userId, username });
            return true;
        } catch (error) {
            return false;
        }
    };

    const logout = async () => {
        setToken(null);
        setUserId(null);
        setUser(null);
        await removeAuthData();
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ token, userId, user, login: handleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
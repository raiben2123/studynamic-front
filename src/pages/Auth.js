// src/pages/Auth.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Importamos useAuth
import AuthHeader from '../components/auth/AuthHeader';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth(); // Usamos el login del contexto
    const navigate = useNavigate();

    // Actualización de la función handleLogin en Auth.js
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (success) {
            // Verificar si hay una redirección pendiente después de iniciar sesión
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                // Limpiar la redirección pendiente
                localStorage.removeItem('redirectAfterLogin');
                // Redirigir a la URL guardada
                navigate(redirectPath);
            } else {
                // Comportamiento normal - ir al dashboard
                navigate('/home');
            }
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        const success = await register(username, email, password);
        if (success) {
            // Verificar si hay una redirección pendiente después de registrarse
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                // Limpiar la redirección pendiente
                localStorage.removeItem('redirectAfterLogin');
                // Redirigir a la URL guardada
                navigate(redirectPath);
            } else {
                // Comportamiento normal - ir al dashboard
                navigate('/home');
            }
        } else {
            setError('Error al registrarse. Intenta de nuevo.');
        }
    };

    const loginVariants = {
        initial: { opacity: 0, x: -100, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: 100, y: 0 },
    };

    const signUpVariants = {
        initial: { opacity: 0, x: 100, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: -100, y: 0 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f0fa] to-[#4a90e2]">
            <div className="text-center">
                <AuthHeader />
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <LoginForm
                            username={username}
                            setUsername={setUsername}
                            password={password}
                            setPassword={setPassword}
                            error={error}
                            handleSubmit={handleLogin}
                            variants={loginVariants}
                            isLogin={isLogin}
                            setIsLogin={setIsLogin}
                        />
                    ) : (
                        <SignUpForm
                            username={username}
                            setUsername={setUsername}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            error={error}
                            handleSubmit={handleSignUp}
                            variants={signUpVariants}
                            isLogin={isLogin}
                            setIsLogin={setIsLogin}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;
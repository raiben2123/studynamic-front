import React from 'react';
import { motion } from 'framer-motion';

const SignUpForm = ({ username, setUsername, email, setEmail, password, setPassword, error, handleSubmit, variants, isLogin, setIsLogin }) => {
    return (
        <motion.div
            key="signup"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-80 text-left h-[400px]"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-2xl mb-1">USUARIO</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingresa tu usuario"
                        className="w-full p-3 rounded-xl bg-blue-200 text-black placeholder-gray-500 focus:outline-none border-blue-600 border-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-2xl mb-1">CORREO ELECTRÓNICO</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingresa tu correo"
                        className="w-full p-3 rounded-xl bg-blue-200 text-black placeholder-gray-500 focus:outline-none border-blue-600 border-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-2xl mb-1">CONTRASEÑA</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="w-full p-3 rounded-xl bg-blue-200 text-black placeholder-gray-500 focus:outline-none border-blue-600 border-2"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsLogin(true)}
                        type="button"
                        className="w-2/5 p-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition text-sm"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="submit"
                        className="w-3/5 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        Registrarse
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default SignUpForm;
// src/components/Sidebar.js - Versión Modernizada con Soporte para Temas
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaHome,
    FaCalendarAlt,
    FaTasks,
    FaBook,
    FaUsers,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import defaultProfile from '../assets/default_profile_picture1.png';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isExpanded, setIsExpanded] = useState(false);
    const { logout, user, userTheme } = useAuth(); // Obtener userTheme
    const userProfilePic = user?.profilePicture || null;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cierra el menú lateral en dispositivos móviles cuando se navega
    useEffect(() => {
        if (isMobile) {
            setIsExpanded(false);
        }
    }, [location.pathname, isMobile]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Mobile drawer
    const toggleDrawer = () => {
        setIsExpanded(!isExpanded);
    };

    // Lista de menú para ambas vistas
    const menuItems = [
        { path: '/home', name: 'Inicio', icon: <FaHome /> },
        { path: '/calendar', name: 'Calendario', icon: <FaCalendarAlt /> },
        { path: '/tasks', name: 'Tareas', icon: <FaTasks /> },
        { path: '/resources', name: 'Recursos', icon: <FaBook /> },
        { path: '/groups', name: 'Grupos', icon: <FaUsers /> },
        { path: '/settings', name: 'Configuración', icon: <FaCog /> },
    ];

    // Variantes de animación para el drawer móvil
    const drawerVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0 }
    };

    // Estilo para indicar elemento activo
    const getActiveStyle = (path) => {
        if (path === '/groups' && location.pathname.startsWith('/groups')) {
            return true;
        }
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile Bottom Tab Bar */}
            {isMobile && (
                <div className="w-full h-14 bg-primary fixed bottom-0 left-0 z-20 flex items-center justify-around py-1 shadow-lg">
                    <button onClick={toggleDrawer} className="p-2 text-white flex flex-col items-center justify-center">
                        <FaBars className="text-xl" />
                        <span className="text-xs">Menú</span>
                    </button>

                    {/* Botones de navegación rápida */}
                    {menuItems.slice(0, 4).map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="p-1 flex flex-col items-center justify-center"
                        >
                            <div className={`p-1 ${getActiveStyle(item.path) ? 'text-white' : 'text-accent'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] ${getActiveStyle(item.path) ? 'text-white' : 'text-accent'}`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobile && isExpanded && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-30"
                            onClick={() => setIsExpanded(false)}
                        />

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={drawerVariants}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-y-0 left-0 max-w-[280px] w-4/5 bg-white transform z-40 py-4 px-2 shadow-xl flex flex-col h-screen"
                        >
                            <div className="flex justify-between items-center px-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={userProfilePic || defaultProfile}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full border-2 border-primary object-cover"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800 truncate max-w-[180px]">
                                            {user?.name || 'Usuario'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {user?.email || ''}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-1 px-2">
                                    {menuItems.map(item => (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                navigate(item.path);
                                                setIsExpanded(false);
                                            }}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-lg ${getActiveStyle(item.path)
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div>{item.icon}</div>
                                            <span>{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto px-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50"
                                >
                                    <FaSignOutAlt />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="w-20 min-h-screen bg-primary flex flex-col items-center py-6 shadow-xl relative group hover:w-56 transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden whitespace-nowrap absolute top-0 left-0 w-full py-6 flex flex-col items-center z-10">
                        <div className="relative">
                            <img
                                src={userProfilePic || defaultProfile}
                                alt="Profile"
                                className="w-14 h-14 rounded-full border-2 border-white object-cover"
                                onClick={() => navigate('/settings')}
                                style={{ cursor: 'pointer' }}
                                title="Ver configuración de perfil"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="mt-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="font-medium truncate w-40">{user?.name || 'Usuario'}</p>
                            <p className="text-xs text-accent truncate w-40">{user?.email || ''}</p>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6 mt-32">
                        {menuItems.map(item => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`group-hover:w-48 w-12 h-12 rounded-full group-hover:rounded-lg transition-all duration-300 flex items-center group-hover:justify-start group-hover:px-4 ${getActiveStyle(item.path)
                                        ? 'bg-white text-primary'
                                        : 'text-white hover:bg-accent'
                                    }`}
                                title={item.name}
                            >
                                <div className="text-xl">{item.icon}</div>
                                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {item.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-auto group-hover:w-48 w-12 h-12 rounded-full group-hover:rounded-lg transition-all duration-300 flex items-center group-hover:justify-start group-hover:px-4 text-white hover:bg-red-500"
                        title="Cerrar Sesión"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            )}
        </>
    );
};

export default Sidebar;
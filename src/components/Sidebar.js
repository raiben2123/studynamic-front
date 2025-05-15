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
    const { logout, user } = useAuth();
    const userProfilePic = user?.profilePicture || null;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsExpanded(false);
        }
    }, [location.pathname, isMobile]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDrawer = () => {
        setIsExpanded(!isExpanded);
    };

    const menuItems = [
        { path: '/home', name: 'Inicio', icon: <FaHome /> },
        { path: '/calendar', name: 'Calendario', icon: <FaCalendarAlt /> },
        { path: '/tasks', name: 'Tareas', icon: <FaTasks /> },
        { path: '/resources', name: 'Apuntes', icon: <FaBook /> },
        { path: '/groups', name: 'Grupos', icon: <FaUsers /> },
        { path: '/settings', name: 'Configuración', icon: <FaCog /> },
    ];

    const drawerVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0 }
    };

    const getActiveStyle = (path) => {
        if (path === '/groups' && location.pathname.startsWith('/groups')) {
            return true;
        }
        return location.pathname === path;
    };

    return (
        <>
            {isMobile && (
                <div className="w-full h-16 bg-primary-sidebar fixed bottom-0 left-0 z-[9999] flex items-center justify-around py-2 shadow-lg">
                    <button
                        onClick={toggleDrawer}
                        className="p-2 text-white flex flex-col items-center justify-center"
                        style={{ minWidth: '48px' }}
                    >
                        <FaBars className="text-xl" />
                        <span className="text-xs mt-1">Menú</span>
                    </button>

                    {menuItems.slice(0, 3).map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="p-1 flex flex-col items-center justify-center"
                            style={{ minWidth: '48px' }}
                        >
                            <div className={`p-1 ${getActiveStyle(item.path) ? 'text-white' : 'text-white/70'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] mt-1 ${getActiveStyle(item.path) ? 'text-white' : 'text-white/70'}`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isMobile && isExpanded && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-50"
                            onClick={() => setIsExpanded(false)}
                        />

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={drawerVariants}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-y-0 left-0 max-w-[280px] w-4/5 bg-card-bg transform z-50 py-4 px-2 shadow-xl flex flex-col h-screen"
                        >
                            <div className="flex justify-between items-center px-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={userProfilePic || defaultProfile}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full border-2 border-primary object-cover"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-task-finalizada rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text truncate max-w-[180px]">
                                            {user?.name || 'Usuario'}
                                        </span>
                                        <span className="text-xs text-text-secondary">
                                            {user?.email || ''}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 rounded-full text-text-secondary hover:bg-border"
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
                                                : 'hover:bg-border text-text'
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
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-task-vencida hover:bg-task-vencida/10"
                                >
                                    <FaSignOutAlt />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {!isMobile && (
                <div className="fixed left-0 top-0 h-full w-20 bg-primary-sidebar flex flex-col items-center py-6 shadow-xl group hover:w-56 transition-all duration-300 ease-in-out z-50">
                    <div className="overflow-hidden whitespace-nowrap flex-shrink-0 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={userProfilePic || defaultProfile}
                                    alt="Profile"
                                    className="w-14 h-14 rounded-full border-2 border-white object-cover"
                                    onClick={() => navigate('/settings')}
                                    style={{ cursor: 'pointer' }}
                                    title="Ver configuración de perfil"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-task-finalizada rounded-full border-2 border-white"></div>
                            </div>

                            <div className="mt-2 invisible group-hover:visible w-40 text-center">
                                <p className="font-medium text-white truncate">{user?.name || user?.username}</p>
                                <p className="text-xs text-white/80 truncate">{user?.email || ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6 items-center flex-1">
                        {menuItems.map(item => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`group relative w-12 h-12 rounded-full group-hover:w-48 group-hover:rounded-lg group-hover:justify-start group-hover:pl-4 transition-all duration-300 flex items-center justify-center ${getActiveStyle(item.path)
                                        ? 'bg-white text-primary'
                                        : 'text-white hover:bg-white/20'
                                    }`}
                                title={item.name}
                            >
                                <div className="text-xl">{item.icon}</div>
                                <span className="invisible absolute left-12 group-hover:static group-hover:visible group-hover:ml-3 font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group relative w-12 h-12 rounded-full group-hover:w-48 group-hover:rounded-lg group-hover:justify-start group-hover:pl-4 transition-all duration-300 flex items-center justify-center text-white hover:bg-task-vencida mt-auto"
                        title="Cerrar Sesión"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="invisible absolute left-12 group-hover:static group-hover:visible group-hover:ml-3 font-medium whitespace-nowrap">
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            )}

            {!isMobile && <div className="w-20 flex-shrink-0"></div>}
        </>
    );
};

export default Sidebar;
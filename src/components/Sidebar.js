// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendar, FaTasks, FaBook, FaUsers, FaCog, FaArrowLeft, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import defaultProfile1 from '../assets/default_profile_picture1.png';
import defaultProfile2 from '../assets/default_profile_picture2.png';
import defaultProfile3 from '../assets/default_profile_picture3.png';

const defaultImages = [defaultProfile1, defaultProfile2, defaultProfile3];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        if (!userProfilePic) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % defaultImages.length);
            }, 3000000000000);
            return () => clearInterval(interval);
        }
    }, [userProfilePic]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Cierra el menú lateral en dispositivos móviles cuando se navega
    useEffect(() => {
        if (isMobile) {
            setIsExpanded(false);
        }
    }, [location.pathname, isMobile]);

    // Mobile drawer
    const toggleDrawer = () => {
        setIsExpanded(!isExpanded);
    };

    const renderMobileMenu = () => (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity z-20 ${
                    isExpanded ? 'opacity-50' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsExpanded(false)}
            />
            
            <div
                className={`fixed inset-y-0 left-0 max-w-[250px] w-3/4 bg-primary transform transition-transform z-30 ${
                    isExpanded ? 'translate-x-0' : '-translate-x-full'
                } py-4 px-2 flex flex-col h-screen`}
            >
                <div className="flex justify-between items-center px-2 mb-6">
                    <div className="flex items-center">
                        <img
                            src={userProfilePic || defaultImages[currentImageIndex]}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <span className="ml-2 text-white font-medium truncate max-w-[150px]">
                            {user?.name || 'Usuario'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-white p-1 rounded-full hover:bg-accent"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                <div className="flex flex-col space-y-2 flex-1">
                    <NavItem
                        icon={<FaHome />}
                        text="Inicio"
                        path="/home"
                        isActive={location.pathname === '/home'}
                        onClick={() => navigate('/home')}
                    />
                    <NavItem
                        icon={<FaCalendar />}
                        text="Calendario"
                        path="/calendar"
                        isActive={location.pathname === '/calendar'}
                        onClick={() => navigate('/calendar')}
                    />
                    <NavItem
                        icon={<FaTasks />}
                        text="Tareas"
                        path="/tasks"
                        isActive={location.pathname === '/tasks'}
                        onClick={() => navigate('/tasks')}
                    />
                    <NavItem
                        icon={<FaBook />}
                        text="Recursos"
                        path="/resources"
                        isActive={location.pathname === '/resources'}
                        onClick={() => navigate('/resources')}
                    />
                    <NavItem
                        icon={<FaUsers />}
                        text="Grupos"
                        path="/groups"
                        isActive={location.pathname.startsWith('/groups')}
                        onClick={() => navigate('/groups')}
                    />
                    <NavItem
                        icon={<FaCog />}
                        text="Configuración"
                        path="/settings"
                        isActive={location.pathname === '/settings'}
                        onClick={() => navigate('/settings')}
                    />
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center space-x-2 p-2 text-white hover:bg-accent rounded-lg w-full"
                >
                    <FaArrowLeft />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    // Mobile bottom tab bar
    const renderMobileTabBar = () => (
        <div className="w-full h-14 bg-primary fixed bottom-0 left-0 z-20 flex flex-row items-center justify-around py-1 bottom-nav">
            <button onClick={toggleDrawer} className="p-2 text-secondary">
                <FaBars className="text-xl" />
            </button>
            <TabItem
                icon={<FaHome className="text-xl" />}
                isActive={location.pathname === '/home'}
                onClick={() => navigate('/home')}
            />
            <TabItem
                icon={<FaCalendar className="text-xl" />}
                isActive={location.pathname === '/calendar'}
                onClick={() => navigate('/calendar')}
            />
            <TabItem
                icon={<FaTasks className="text-xl" />}
                isActive={location.pathname === '/tasks'}
                onClick={() => navigate('/tasks')}
            />
            <TabItem
                icon={<FaUsers className="text-xl" />}
                isActive={location.pathname.startsWith('/groups')}
                onClick={() => navigate('/groups')}
            />
        </div>
    );

    // Desktop sidebar
    const renderDesktopSidebar = () => (
        <div className="w-20 min-h-screen bg-primary flex flex-col items-center py-6">
            <div className="mb-8">
                <img
                    src={userProfilePic || defaultImages[currentImageIndex]}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border-2 border-white"
                    onClick={() => navigate('/settings')}
                    style={{ cursor: 'pointer' }}
                    title="Ver configuración de perfil"
                />
                {user?.name && (
                    <p className="text-white text-xs mt-2 text-center overflow-hidden text-ellipsis w-full">
                        {user.name.split(' ')[0]}
                    </p>
                )}
            </div>

            <div className="flex flex-col space-y-6">
                <button
                    onClick={() => navigate('/home')}
                    className={`p-3 rounded-full ${location.pathname === '/home' ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Inicio"
                >
                    <FaHome className="text-secondary text-xl" />
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className={`p-3 rounded-full ${location.pathname === '/calendar' ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Calendario"
                >
                    <FaCalendar className="text-secondary text-xl" />
                </button>
                <button
                    onClick={() => navigate('/tasks')}
                    className={`p-3 rounded-full ${location.pathname === '/tasks' ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Tareas"
                >
                    <FaTasks className="text-secondary text-xl" />
                </button>
                <button
                    onClick={() => navigate('/resources')}
                    className={`p-3 rounded-full ${location.pathname === '/resources' ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Recursos"
                >
                    <FaBook className="text-secondary text-xl" />
                </button>
                <button
                    onClick={() => navigate('/groups')}
                    className={`p-3 rounded-full ${location.pathname.startsWith('/groups') ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Grupos"
                >
                    <FaUsers className="text-secondary text-xl" />
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className={`p-3 rounded-full ${location.pathname === '/settings' ? 'bg-accent' : 'hover:bg-accent'}`}
                    title="Configuración"
                >
                    <FaCog className="text-secondary text-xl" />
                </button>
            </div>

            <button
                onClick={handleLogout}
                className="mt-auto flex items-center p-3 hover:bg-accent rounded-full"
                title="Cerrar Sesión"
            >
                <FaArrowLeft className="text-secondary text-xl" />
            </button>
        </div>
    );

    return (
        <>
            {isMobile ? (
                <>
                    {renderMobileTabBar()}
                    {renderMobileMenu()}
                </>
            ) : (
                renderDesktopSidebar()
            )}
        </>
    );
};

// Componente de ítem de navegación para el menú lateral móvil
const NavItem = ({ icon, text, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 rounded-lg ${
            isActive ? 'bg-accent text-white' : 'text-white hover:bg-accent/50'
        }`}
    >
        <span>{icon}</span>
        <span>{text}</span>
    </button>
);

// Componente de pestaña para la barra inferior móvil
const TabItem = ({ icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
    >
        {React.cloneElement(icon, {
            className: `text-secondary ${isActive ? 'text-white' : ''}`
        })}
    </button>
);

export default Sidebar;
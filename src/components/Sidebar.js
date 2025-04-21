// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendar, FaTasks, FaBook, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import defaultProfile1 from '../assets/default_profile_picture1.png';
import defaultProfile2 from '../assets/default_profile_picture2.png';
import defaultProfile3 from '../assets/default_profile_picture3.png';

const defaultImages = [defaultProfile1, defaultProfile2, defaultProfile3];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { logout, user } = useAuth();
    const userProfilePic = user?.profilePicture || null;

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

    return (
        <div
            className="
        w-full h-14 bg-primary fixed bottom-0 left-0 z-20
        flex flex-row items-center justify-around py-1
        md:w-28 md:min-h-screen md:flex-col md:justify-start md:py-6 md:static md:left-auto md:bottom-auto
        "
        >
            <div className="hidden md:block md:mb-8">
                <img
                    src={userProfilePic || defaultImages[currentImageIndex]}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-white"
                    onClick={() => navigate('/settings')}
                    style={{ cursor: 'pointer' }}
                    title="Ver configuración de perfil"
                />
                {user?.name && (
                    <p className="text-white text-xs mt-2 text-center overflow-hidden text-ellipsis w-full">
                        {user.name}
                    </p>
                )}
            </div>

            <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-6">
                <button
                    onClick={() => navigate('/home')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/home' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaHome className="text-secondary text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/calendar' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaCalendar className="text-secondary text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/tasks')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/tasks' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaTasks className="text-secondary text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/resources')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/resources' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaBook className="text-secondary text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/groups')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/groups' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaUsers className="text-secondary text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/settings' ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                    <FaCog className="text-secondary text-xl md:text-2xl" />
                </button>
            </div>

            <div className="md:mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-full"
                >
                    <FaArrowLeft className="text-secondary text-lg md:text-xl" />
                    <span className="text-white text-sm hidden md:inline">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
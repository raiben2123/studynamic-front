// src/components/dashboard/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendar, FaTasks, FaBook, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa';
import defaultProfile1 from '../assets/default_profile_picture1.png';
import defaultProfile2 from '../assets/default_profile_picture2.png';
import defaultProfile3 from '../assets/default_profile_picture3.png';

const defaultImages = [defaultProfile1, defaultProfile2, defaultProfile3];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userProfilePic, setUserProfilePic] = useState(null);

    useEffect(() => {
        if (!userProfilePic) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % defaultImages.length);
            }, 3000000000000);
            return () => clearInterval(interval);
        }
    }, [userProfilePic]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div
            className="
        w-full h-14 bg-[#467BAA] fixed bottom-0 left-0 z-20
        flex flex-row items-center justify-around py-1
        md:w-28 md:min-h-screen md:flex-col md:justify-start md:py-6 md:static md:left-auto md:bottom-auto
        "
        >
            <div className="hidden md:block md:mb-8">
                <img
                    src={userProfilePic || defaultImages[currentImageIndex]}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-white"
                />
            </div>

            <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-6">
                <button
                    onClick={() => navigate('/home')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/home' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaHome className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/calendar' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaCalendar className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/tasks')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/tasks' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaTasks className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/resources')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/resources' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaBook className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/groups')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/groups' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaUsers className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className={`p-2 rounded-full md:p-4 ${location.pathname === '/settings' ? 'bg-[#5aa0f2]' : 'hover:bg-[#5aa0f2]'}`}
                >
                    <FaCog className="text-[#f5a623] text-xl md:text-2xl" />
                </button>
            </div>

            <div className="md:mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 hover:bg-[#5aa0f2] rounded-full"
                >
                    <FaArrowLeft className="text-[#f5a623] text-lg md:text-xl" />
                    <span className="text-white text-sm hidden md:inline">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
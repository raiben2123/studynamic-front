// src/components/auth/AuthHeader.js
import React from 'react';
import Logo from '../../assets/Logo.png';

const AuthHeader = () => {
    return (
        <div className="mb-8">
            <img src={Logo} alt="StudyNamic Logo" className="w-52 h-52 mx-auto" />
            <h1 className="text-6xl text-black">STUDYNAMIC</h1>
        </div>
    );
};

export default AuthHeader;
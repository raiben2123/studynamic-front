// src/components/modals/Modal.js - Componente base para modales responsivos
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    // Prevenir el scroll en el body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);
    
    // Detectar si es móvil
    const isMobile = window.innerWidth < 768;
    
    if (!isOpen) return null;
    
    // Determinar el tamaño del modal
    let sizeClass = 'max-w-md'; // Default (medium)
    if (size === 'sm') sizeClass = 'max-w-sm';
    if (size === 'lg') sizeClass = 'max-w-lg';
    if (size === 'xl') sizeClass = 'max-w-xl';
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-overlay">
            <div 
                className={`bg-white rounded-lg shadow-lg w-full mx-4 ${sizeClass} ${
                    isMobile ? 'max-h-[90vh] overflow-y-auto' : ''
                }`}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-primary">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Cerrar"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className={`p-4 ${isMobile ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};

export default Modal;
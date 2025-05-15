import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
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
    
    const isMobile = window.innerWidth < 768;
    
    if (!isOpen) return null;
    
    let sizeClass = 'max-w-md';
    if (size === 'sm') sizeClass = 'max-w-sm';
    if (size === 'lg') sizeClass = 'max-w-lg';
    if (size === 'xl') sizeClass = 'max-w-xl';
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-overlay">
            <div 
                className={`bg-card-bg text-text rounded-lg shadow-lg w-full mx-4 ${sizeClass} ${
                    isMobile ? 'max-h-[90vh] overflow-y-auto' : ''
                } border border-border`}
            >
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-primary">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="text-text-secondary hover:text-text"
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
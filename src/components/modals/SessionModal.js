import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

const SessionModal = ({ isOpen, onClose, onSave, defaultDate }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(defaultDate || '');
    const [zoomLink, setZoomLink] = useState('');
    const [notificationDate, setNotificationDate] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setStart(defaultDate || '');
        }
    }, [isOpen, defaultDate]);

    const resetForm = () => {
        setTitle('');
        setStart(defaultDate || '');
        setZoomLink('');
        setNotificationDate('');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!start) {
            newErrors.start = 'La fecha de inicio es obligatoria';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        onSave({
            title,
            start,
            zoomLink: zoomLink || `https://zoom.us/j/${Date.now()}`,
            notificationDate,
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose}
            title="Añadir Sesión de Estudio"
            size="md"
        >
            <form onSubmit={handleSave} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Título *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la sesión"
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fecha *</label>
                    <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.start ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.start && (
                        <p className="text-red-500 text-xs mt-1">{errors.start}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Enlace de Zoom (opcional)</label>
                    <input
                        type="text"
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

SessionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    defaultDate: PropTypes.string
};

export default SessionModal;
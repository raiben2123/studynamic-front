// src/components/modals/EventModal.js - Implementación usando el Modal base
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

const EventModal = ({ isOpen, onClose, onSave, event, defaultDate }) => {
    const [formData, setFormData] = useState({
        title: '',
        startDateTime: defaultDate ? `${defaultDate}T00:00` : '',
        endDateTime: '',
        description: '',
        notification: '',
    });
    const [errors, setErrors] = useState({});
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id,
                title: event.title || '',
                startDateTime: event.startDateTime ? event.startDateTime.replace('Z', '') : '',
                endDateTime: event.endDateTime ? event.endDateTime.replace('Z', '') : '',
                description: event.description || '',
                notification: event.notification ? event.notification.replace('Z', '') : '',
            });
        } else {
            setFormData({
                title: '',
                startDateTime: defaultDate ? `${defaultDate}T00:00` : '',
                endDateTime: '',
                description: '',
                notification: '',
            });
        }
        setErrors({});
    }, [event, defaultDate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!formData.startDateTime) {
            newErrors.startDateTime = 'La fecha y hora de inicio son obligatorias';
        }
        if (formData.endDateTime && formData.startDateTime && formData.endDateTime < formData.startDateTime) {
            newErrors.endDateTime = 'La fecha de fin no puede ser anterior a la de inicio';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={event ? 'Editar Evento' : 'Nuevo Evento'}
            size={isMobile ? 'md' : 'lg'}
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Título *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fecha y Hora de Inicio *</label>
                    <input
                        type="datetime-local"
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.startDateTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.startDateTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.startDateTime}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fecha y Hora de Fin *</label>
                    <input
                        type="datetime-local"
                        name="endDateTime"
                        value={formData.endDateTime}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.endDateTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.endDateTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.endDateTime}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Notificación</label>
                    <input
                        type="datetime-local"
                        name="notification"
                        value={formData.notification}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
                    >
                        {event ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

EventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    event: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        startDateTime: PropTypes.string,
        endDateTime: PropTypes.string,
        description: PropTypes.string,
        notification: PropTypes.string,
    }),
    defaultDate: PropTypes.string,
};

export default EventModal;
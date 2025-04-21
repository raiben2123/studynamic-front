// src/components/modals/EventModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EventModal = ({ isOpen, onClose, onSave, event, defaultDate }) => {
    const [formData, setFormData] = useState({
        title: '',
        startDateTime: defaultDate ? `${defaultDate}T00:00` : '',
        endDateTime: '',
        description: '',
        notification: '',
    });
    const [errors, setErrors] = useState({});

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
        if (!event) {
            setFormData({
                title: '',
                startDateTime: defaultDate ? `${defaultDate}T00:00` : '',
                endDateTime: '',
                description: '',
                notification: '',
            });
        }
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {event ? 'Editar Evento' : 'Añadir Evento'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
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
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
                                errors.startDateTime ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.startDateTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.startDateTime}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Fecha y Hora de Fin</label>
                        <input
                            type="datetime-local"
                            name="endDateTime"
                            value={formData.endDateTime}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
                                errors.endDateTime ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
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
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#467BAA] text-white rounded hover:bg-[#5aa0f2] transition"
                        >
                            {event ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
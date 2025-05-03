// src/components/modals/EventModal.js - Actualizado para usar variables de tema
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

    // Función para reiniciar el formulario
    const resetForm = () => {
        setFormData({
            title: '',
            startDateTime: defaultDate ? `${defaultDate}T00:00` : '',
            endDateTime: '',
            description: '',
            notification: '',
        });
        setErrors({});
    };

    // Este efecto se ejecuta cuando cambia event, defaultDate o isOpen
    useEffect(() => {
        if (isOpen) {
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
        }
    }, [event, defaultDate, isOpen]);

    // Función para manejar el cierre del modal
    const handleClose = () => {
        // Reiniciar el formulario explícitamente al cerrar
        resetForm();
        onClose();
    };

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
        // No reseteamos aquí porque onSave puede fallar
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
            onClose={handleClose} // Usamos handleClose en vez de onClose
            title={event ? 'Editar Evento' : 'Nuevo Evento'}
            size={isMobile ? 'md' : 'lg'}
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-text">Título *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.title ? 'border-error' : 'border-border'
                        }`}
                        required
                    />
                    {errors.title && (
                        <p className="text-error text-xs mt-1">{errors.title}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-text">Fecha y Hora de Inicio *</label>
                    <input
                        type="datetime-local"
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChange={handleChange}
                        className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.startDateTime ? 'border-error' : 'border-border'
                        }`}
                        required
                    />
                    {errors.startDateTime && (
                        <p className="text-error text-xs mt-1">{errors.startDateTime}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-text">Fecha y Hora de Fin *</label>
                    <input
                        type="datetime-local"
                        name="endDateTime"
                        value={formData.endDateTime}
                        onChange={handleChange}
                        className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.endDateTime ? 'border-error' : 'border-border'
                        }`}
                        required
                    />
                    {errors.endDateTime && (
                        <p className="text-error text-xs mt-1">{errors.endDateTime}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-text">Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 bg-input-bg text-text border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                    />
                </div>
                {/* <div>
                    <label className="block text-sm font-medium mb-1 text-text">Notificación</label>
                    <input
                        type="datetime-local"
                        name="notification"
                        value={formData.notification}
                        onChange={handleChange}
                        className="w-full p-2 bg-input-bg text-text border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div> */}
                <div className="flex justify-end space-x-2 pt-3">
                    <button
                        type="button"
                        onClick={handleClose} // Usamos handleClose también aquí
                        className="px-3 py-2 bg-input-bg text-text rounded-lg hover:bg-border transition"
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
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { extractDateFromIso } from '../../utils/dateUtils';
import Modal from './Modal';

const TaskModalGroup = ({ isOpen, onClose, onSave, task }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        dueDate: '',
        importance: 'Baja',
        status: 'Pendiente',
        markObtained: '',
        markMax: '',
        notificationDate: '',
    });
    const [errors, setErrors] = useState({});
    const isMobile = window.innerWidth < 768;

    const resetForm = () => {
        setFormData({
            id: '',
            title: '',
            dueDate: '',
            importance: 'Baja',
            status: 'Pendiente',
            markObtained: '',
            markMax: '',
            notificationDate: '',
        });
        setErrors({});
    };

    useEffect(() => {
        if (isOpen) {
            if (task) {
                const normalizedDueDate = extractDateFromIso(task.dueDate);
                const normalizedNotificationDate = extractDateFromIso(task.notificationDate);

                setFormData({
                    id: task.id || '',
                    title: task.title || '',
                    dueDate: normalizedDueDate,
                    importance: task.importance || 'Baja',
                    status: task.status || 'Pendiente',
                    markObtained: task.markObtained || '',
                    markMax: task.markMax || '',
                    notificationDate: normalizedNotificationDate,
                });
            } else {
                resetForm();
            }
        }
    }, [task, isOpen]);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'La fecha de entrega es obligatoria';
        }
        if (
            formData.markObtained &&
            formData.markMax &&
            Number(formData.markObtained) > Number(formData.markMax)
        ) {
            newErrors.marks = 'La nota obtenida no puede ser mayor que la nota máxima';
        }
        if (
            formData.notificationDate &&
            formData.dueDate &&
            new Date(formData.notificationDate) > new Date(formData.dueDate)
        ) {
            newErrors.notificationDate = 'La notificación no puede ser posterior a la fecha de entrega';
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
            onClose={handleClose}
            title={task ? 'Editar Tarea' : 'Nueva Tarea'}
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
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de Entrega *</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.dueDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Importancia</label>
                        <select
                            name="importance"
                            value={formData.importance}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En curso">En curso</option>
                            <option value="Finalizada">Finalizada</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Nota Obtenida</label>
                        <input
                            type="number"
                            name="markObtained"
                            value={formData.markObtained}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.marks ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Nota Máxima</label>
                        <input
                            type="number"
                            name="markMax"
                            value={formData.markMax}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.marks ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                </div>
                {errors.marks && <p className="text-red-500 text-xs mt-1">{errors.marks}</p>}

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
                        {task ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

TaskModalGroup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        title: PropTypes.string,
        dueDate: PropTypes.string,
        importance: PropTypes.string,
        status: PropTypes.string,
        markObtained: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        markMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        notificationDate: PropTypes.string,
    }),
};

export default TaskModalGroup;
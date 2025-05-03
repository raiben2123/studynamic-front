// src/components/modals/TaskModalCalendar.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { extractDateFromIso } from '../../utils/dateUtils';

const TaskModalCalendar = ({ isOpen, onClose, onSave, subjects, task, defaultDate }) => {
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        importance: 'Baja',
        status: 'Pendiente',
        subjectId: '',
        notificationDate: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log('TaskModalCalendar - defaultDate:', defaultDate);
        console.log('TaskModalCalendar - task:', task);
        console.log('TaskModalCalendar - subjects:', subjects);
        
        if (task) {
            // Normalizar fechas
            const normalizedDueDate = extractDateFromIso(task.dueDate);
            const normalizedNotificationDate = extractDateFromIso(task.notificationDate);
            
            setFormData({
                id: task.id,
                title: task.title || '',
                dueDate: normalizedDueDate,
                importance: task.importance || 'Baja',
                status: task.status || 'Pendiente',
                subjectId: task.subjectId ? String(task.subjectId) : '', // Convertir a string para <select>
                notificationDate: normalizedNotificationDate,
            });
        } else {
            setFormData({
                title: '',
                dueDate: defaultDate ? extractDateFromIso(defaultDate) : '', // Usar defaultDate normalizado
                importance: 'Baja',
                status: 'Pendiente',
                subjectId: '',
                notificationDate: '',
            });
        }
        setErrors({});
    }, [task, defaultDate, subjects]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'La fecha de entrega es obligatoria';
        }
        
        // Validar que la fecha de notificación no sea posterior a la fecha de entrega
        if (formData.notificationDate && formData.dueDate && 
            new Date(formData.notificationDate) > new Date(formData.dueDate)) {
            newErrors.notificationDate = 'La notificación no puede ser posterior a la fecha de entrega';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('TaskModalCalendar - formData:', formData);
        if (!validateForm()) {
            return;
        }
        
        // Preparar los datos de la tarea para enviar
        const taskData = {
            ...formData,
            subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
            // Si existe, buscar la asignatura para incluir su título
            subject: formData.subjectId ? 
                subjects.find(s => s.id === parseInt(formData.subjectId))?.title || '' : '',
        };
        
        // Enviar datos
        onSave(taskData);
        
        if (!task) {
            setFormData({
                title: '',
                dueDate: defaultDate || '',
                importance: 'Baja',
                status: 'Pendiente',
                subjectId: '',
                notificationDate: '',
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
                <h2 className="text-xl font-semibold mb-4 text-primary">{task ? 'Editar Tarea' : 'Añadir Tarea'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Asignatura</label>
                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.subjectId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.title}
                                </option>
                            ))}
                        </select>
                        {errors.subjectId && (
                            <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>
                        )}
                    </div>
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
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de Entrega *</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.dueDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Importancia</label>
                        <select
                            name="importance"
                            value={formData.importance}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
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
                    {/* <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Notificación</label>
                        <input
                            type="date"
                            name="notificationDate"
                            value={formData.notificationDate}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.notificationDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.notificationDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.notificationDate}</p>
                        )}
                    </div> */}
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
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
                        >
                            {task ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

TaskModalCalendar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
        })
    ).isRequired,
    task: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        dueDate: PropTypes.string,
        importance: PropTypes.string,
        status: PropTypes.string,
        subjectId: PropTypes.number, // Cambiado a subjectId
        notificationDate: PropTypes.string,
    }),
    defaultDate: PropTypes.string,
};

export default TaskModalCalendar;
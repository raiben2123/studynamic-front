// src/components/modals/TaskModalCalendar.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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
            setFormData({
                id: task.id,
                title: task.title || '',
                dueDate: task.dueDate || '',
                importance: task.importance || 'Baja',
                status: task.status || 'Pendiente',
                subjectId: task.subjectId ? String(task.subjectId) : '', // Convertir a string para <select>
                notificationDate: task.notificationDate || '',
            });
        } else {
            setFormData({
                title: '',
                dueDate: defaultDate || '', // Usar defaultDate
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('TaskModalCalendar - formData:', formData);
        if (!validateForm()) {
            return;
        }
        // Enviar formData con subjectId como número
        onSave({
            ...formData,
            subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
        });
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
                <h2 className="text-xl font-semibold mb-4">{task ? 'Editar Tarea' : 'Añadir Tarea'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Asignatura</label>
                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
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
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
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
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA] ${
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
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
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
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
                        >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En curso">En curso</option>
                            <option value="Finalizada">Finalizada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Notificación</label>
                        <input
                            type="datetime-local"
                            name="notificationDate"
                            value={formData.notificationDate}
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
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SubjectScheduleModal = ({ isOpen, onClose, onSave, subject, editingSchedule }) => {
    const [scheduleData, setScheduleData] = useState({
        dayOfWeek: 1,
        startTime: '08:00',
        durationMinutes: 60,
        weekType: 0,
        subjectId: subject?.id || ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (subject) {
            setScheduleData(prev => ({
                ...prev,
                subjectId: subject.id
            }));
        }

        if (editingSchedule) {
            let formattedTime = '';
            if (typeof editingSchedule.startTime === 'string') {
                formattedTime = editingSchedule.startTime;
            } else if (editingSchedule.startTime) {
                const hours = String(editingSchedule.startTime.hours || 0).padStart(2, '0');
                const minutes = String(editingSchedule.startTime.minutes || 0).padStart(2, '0');
                formattedTime = `${hours}:${minutes}`;
            }

            setScheduleData({
                dayOfWeek: editingSchedule.dayOfWeek || 1,
                startTime: formattedTime || '08:00',
                durationMinutes: editingSchedule.durationMinutes || 60,
                weekType: editingSchedule.weekType || 0,
                subjectId: subject?.id || editingSchedule.subjectId,
                id: editingSchedule.id
            });
        } else {
            setScheduleData({
                dayOfWeek: 1,
                startTime: '08:00',
                durationMinutes: 60,
                weekType: 0,
                subjectId: subject?.id || ''
            });
        }
        setError('');
    }, [subject, editingSchedule, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setScheduleData({
            ...scheduleData,
            [name]: name === 'dayOfWeek' || name === 'durationMinutes' || name === 'weekType' 
                ? parseInt(value, 10) 
                : value
        });
        setError('');
    };

    const validateForm = () => {
        if (!scheduleData.startTime) {
            setError('La hora de inicio es obligatoria');
            return false;
        }
        if (scheduleData.durationMinutes <= 0) {
            setError('La duración debe ser mayor a 0 minutos');
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;
        
        onSave(scheduleData);
        onClose();
    };

    const days = [
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
        { value: 0, label: 'Domingo' }
    ];

    const weekTypes = [
        { value: 0, label: 'Todas las semanas' },
        { value: 1, label: 'Semanas pares' },
        { value: 2, label: 'Semanas impares' }
    ];

    const durationOptions = [
        { value: 30, label: '30 minutos' },
        { value: 45, label: '45 minutos' },
        { value: 60, label: '1 hora' },
        { value: 90, label: '1 hora 30 minutos' },
        { value: 120, label: '2 horas' },
        { value: 180, label: '3 horas' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card-bg text-text p-6 rounded-xl shadow-lg w-full max-w-md border border-border">
                <h2 className="text-xl font-semibold mb-4 text-primary">
                    {editingSchedule ? 'Editar Horario' : 'Añadir Horario'}
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">
                            Día de la semana
                        </label>
                        <select
                            name="dayOfWeek"
                            value={scheduleData.dayOfWeek}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-border rounded bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {days.map(day => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">
                            Hora de inicio
                        </label>
                        <input
                            type="time"
                            name="startTime"
                            value={scheduleData.startTime}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-border rounded bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">
                            Duración
                        </label>
                        <select
                            name="durationMinutes"
                            value={scheduleData.durationMinutes}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-border rounded bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {durationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">
                            Recurrencia
                        </label>
                        <select
                            name="weekType"
                            value={scheduleData.weekType}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-border rounded bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {weekTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {error && (
                        <p className="text-error text-sm">{error}</p>
                    )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-input-bg text-text rounded hover:bg-border"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-accent"
                    >
                        {editingSchedule ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

SubjectScheduleModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subject: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        title: PropTypes.string
    }),
    editingSchedule: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        dayOfWeek: PropTypes.number,
        startTime: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        durationMinutes: PropTypes.number,
        weekType: PropTypes.number,
        subjectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
};

export default SubjectScheduleModal;
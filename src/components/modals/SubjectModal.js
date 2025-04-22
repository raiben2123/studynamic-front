// src/components/modals/SubjectModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SubjectScheduleModal from './SubjectScheduleModal';
import { getSchedulesBySubject, addSchedule, updateSchedule, deleteSchedule } from '../../api/subjectSchedules';

const SubjectModal = ({ isOpen, onClose, onSave, subject }) => {
    const [subjectName, setSubjectName] = useState('');
    const [error, setError] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [loading, setLoading] = useState(false);

    // Obtener los horarios cuando se edita una asignatura existente
    useEffect(() => {
        const fetchSchedules = async () => {
            if (subject?.id) {
                setLoading(true);
                try {
                    const data = await getSchedulesBySubject(subject.id);
                    setSchedules(data);
                } catch (error) {
                    console.error("Error al cargar horarios:", error);
                    setError("No se pudieron cargar los horarios.");
                } finally {
                    setLoading(false);
                }
            } else {
                setSchedules([]);
            }
        };

        if (isOpen && subject?.id) {
            fetchSchedules();
        }

        if (subject) {
            setSubjectName(subject.title || '');
        } else {
            setSubjectName('');
        }

        setError('');
    }, [isOpen, subject]);

    const handleSaveSubject = () => {
        if (!subjectName.trim()) {
            setError('Por favor, introduce un nombre para la asignatura.');
            return;
        }
        setError('');
        onSave(subjectName, schedules);
        setSubjectName('');
        setSchedules([]);
    };

    const handleSaveSchedule = async (scheduleData) => {
        try {
            setLoading(true);
            let updatedSchedule;
            
            if (editingSchedule?.id) {
                // Actualizar horario existente
                updatedSchedule = await updateSchedule(editingSchedule.id, scheduleData);
                setSchedules(schedules.map(s => 
                    s.id === editingSchedule.id ? updatedSchedule : s
                ));
            } else {
                // Añadir nuevo horario
                if (subject?.id) {
                    // Si estamos editando una asignatura existente, podemos guardar directamente
                    updatedSchedule = await addSchedule(scheduleData);
                    setSchedules([...schedules, updatedSchedule]);
                } else {
                    // Si es una nueva asignatura, añadimos a la lista temporal
                    setSchedules([...schedules, { 
                        ...scheduleData, 
                        id: `temp-${Date.now()}`, 
                        isTemporary: true 
                    }]);
                }
            }
            
            setEditingSchedule(null);
        } catch (error) {
            console.error("Error al guardar horario:", error);
            setError("No se pudo guardar el horario.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setIsScheduleModalOpen(true);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            setLoading(true);
            
            if (scheduleId.toString().startsWith('temp-')) {
                // Si es un horario temporal (nuevo), solo lo eliminamos del array
                setSchedules(schedules.filter(s => s.id !== scheduleId));
            } else {
                // Si es un horario existente, lo eliminamos en el backend
                await deleteSchedule(scheduleId);
                setSchedules(schedules.filter(s => s.id !== scheduleId));
            }
        } catch (error) {
            console.error("Error al eliminar horario:", error);
            setError("No se pudo eliminar el horario.");
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (dayOfWeek) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayOfWeek] || 'Desconocido';
    };

    const getWeekTypeName = (weekType) => {
        const types = ['Todas las semanas', 'Semanas pares', 'Semanas impares'];
        return types[weekType] || 'Desconocido';
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        // Si ya está en formato HH:MM
        if (typeof timeString === 'string' && timeString.includes(':')) {
            return timeString;
        }
        
        try {
            // Si es un objeto con horas y minutos
            if (typeof timeString === 'object' && 'hours' in timeString) {
                const hours = String(timeString.hours).padStart(2, '0');
                const minutes = String(timeString.minutes).padStart(2, '0');
                return `${hours}:${minutes}`;
            }
            
            return timeString;
        } catch (e) {
            console.error("Error formateando hora:", e);
            return timeString;
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins} minutos`;
        } else if (mins === 0) {
            return hours === 1 ? `${hours} hora` : `${hours} horas`;
        } else {
            return `${hours}h ${mins}min`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-primary">
                    {subject ? 'Editar Asignatura' : 'Añadir Asignatura'}
                </h2>
                
                {/* Nombre de la asignatura */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                        Nombre de la asignatura
                    </label>
                    <input
                        type="text"
                        value={subjectName}
                        onChange={(e) => {
                            setSubjectName(e.target.value);
                            setError('');
                        }}
                        placeholder="Nombre de la asignatura"
                        className={`w-full p-2 border rounded ${
                            error ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                </div>
                
                {/* Sección de horarios */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-primary">Horarios</h3>
                        <button
                            onClick={() => {
                                setEditingSchedule(null);
                                setIsScheduleModalOpen(true);
                            }}
                            className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm"
                            disabled={loading}
                        >
                            + Añadir Horario
                        </button>
                    </div>
                    
                    {loading ? (
                        <p className="text-gray-500 text-center py-4">Cargando...</p>
                    ) : schedules.length > 0 ? (
                        <div className="max-h-[40vh] overflow-y-auto space-y-2">
                            {schedules.map((schedule) => (
                                <div 
                                    key={schedule.id} 
                                    className={`p-3 rounded-lg flex justify-between items-center ${
                                        schedule.isTemporary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100'
                                    }`}
                                >
                                    <div>
                                        <p className="font-medium">{getDayName(schedule.dayOfWeek)}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatTime(schedule.startTime)} ({formatDuration(schedule.durationMinutes)})
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {getWeekTypeName(schedule.weekType)}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditSchedule(schedule)}
                                            className="text-primary hover:text-accent"
                                            disabled={loading}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de eliminar este horario?')) {
                                                    handleDeleteSchedule(schedule.id);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={loading}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No hay horarios configurados
                        </p>
                    )}
                </div>
                
                {/* Botones de acción */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveSubject}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
                        disabled={loading}
                    >
                        {subject ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
                
                {/* Modal para añadir/editar horarios */}
                <SubjectScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => {
                        setIsScheduleModalOpen(false);
                        setEditingSchedule(null);
                    }}
                    onSave={handleSaveSchedule}
                    subject={subject || { id: 'temp-subject', title: subjectName }}
                    editingSchedule={editingSchedule}
                />
            </div>
        </div>
    );
};

SubjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subject: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    }),
};

export default SubjectModal;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import SubjectScheduleModal from './SubjectScheduleModal';
import { getSchedulesBySubject, addSchedule, updateSchedule, deleteSchedule } from '../../api/subjectSchedules';

const SubjectModal = ({ isOpen, onClose, onSave, subject }) => {
    const [subjectName, setSubjectName] = useState('');
    const [error, setError] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const isMobile = window.innerWidth < 768;

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
                updatedSchedule = await updateSchedule(editingSchedule.id, scheduleData);
                setSchedules(schedules.map(s => 
                    s.id === editingSchedule.id ? updatedSchedule : s
                ));
            } else {
                if (subject?.id) {
                    updatedSchedule = await addSchedule(scheduleData);
                    setSchedules(prevSchedules => [...prevSchedules, updatedSchedule]);
                } else {
                    const newTempSchedule = { 
                        ...scheduleData, 
                        id: `temp-${Date.now()}`, 
                        isTemporary: true 
                    };
                    setSchedules(prevSchedules => [...prevSchedules, newTempSchedule]);
                }
            }
            
            setEditingSchedule(null);
            setIsScheduleModalOpen(false);
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
                setSchedules(prevSchedules => prevSchedules.filter(s => s.id !== scheduleId));
            } else {
                await deleteSchedule(scheduleId);
                setSchedules(prevSchedules => prevSchedules.filter(s => s.id !== scheduleId));
            }
        } catch (error) {
            console.error("Error al eliminar horario:", error);
            setError("No se pudo eliminar el horario.");
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (dayOfWeek) => {
        const days = isMobile 
            ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'] 
            : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayOfWeek] || 'Desconocido';
    };

    const getWeekTypeName = (weekType) => {
        const types = isMobile 
            ? ['Todas', 'Pares', 'Impares']
            : ['Todas las semanas', 'Semanas pares', 'Semanas impares'];
        return types[weekType] || 'Desconocido';
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        if (typeof timeString === 'string' && timeString.includes(':')) {
            return timeString;
        }
        
        try {
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
        
        if (isMobile) {
            return hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
        }
        
        if (hours === 0) {
            return `${mins} minutos`;
        } else if (mins === 0) {
            return hours === 1 ? `${hours} hora` : `${hours} horas`;
        } else {
            return `${hours}h ${mins}m`;
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={subject ? 'Editar Asignatura' : 'Añadir Asignatura'}
            size="lg"
        >
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-text">
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
                    className={`w-full p-2 border rounded bg-input-bg text-text ${
                        error ? 'border-error' : 'border-border'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {error && (
                    <p className="text-error text-xs mt-1">{error}</p>
                )}
            </div>
            
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
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
                    <p className="text-text-secondary text-center py-2">Cargando...</p>
                ) : schedules.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {schedules.map((schedule) => (
                            <div 
                                key={schedule.id} 
                                className={`p-2 rounded-lg flex justify-between items-center border ${
                                    schedule.isTemporary ? 'bg-input-bg border-primary/30' : 'bg-input-bg border-border'
                                }`}
                            >
                                <div>
                                    <p className="font-medium text-sm text-text">{getDayName(schedule.dayOfWeek)}</p>
                                    <p className="text-xs text-text-secondary">
                                        {formatTime(schedule.startTime)} ({formatDuration(schedule.durationMinutes)})
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {getWeekTypeName(schedule.weekType)}
                                    </p>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEditSchedule(schedule)}
                                        className="text-primary hover:text-accent p-1"
                                        disabled={loading}
                                        aria-label="Editar horario"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Estás seguro de eliminar este horario?')) {
                                                handleDeleteSchedule(schedule.id);
                                            }
                                        }}
                                        className="text-error hover:text-error/80 p-1"
                                        disabled={loading}
                                        aria-label="Eliminar horario"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-center py-2">
                        No hay horarios configurados
                    </p>
                )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
                <button
                    onClick={onClose}
                    className="px-3 py-2 bg-input-bg text-text rounded-lg hover:bg-border transition"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSaveSubject}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
                    disabled={loading}
                >
                    {subject ? 'Actualizar' : 'Guardar'}
                </button>
            </div>
            
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
        </Modal>
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
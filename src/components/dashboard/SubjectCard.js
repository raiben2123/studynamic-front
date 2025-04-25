// src/components/dashboard/SubjectCard.js - Modified to use confirmation modal
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaBook, FaClock, FaCalendarAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';

const SubjectCard = ({ subject, onUpdate, onDelete }) => {
    const [showSchedules, setShowSchedules] = useState(false);

    const formatTimeSpan = (timeSpan) => {
        if (!timeSpan) return '';
        
        if (typeof timeSpan === 'string' && timeSpan.includes(':')) {
            return timeSpan;
        }
        
        if (typeof timeSpan === 'object' && 'hours' in timeSpan) {
            const hours = String(timeSpan.hours || 0).padStart(2, '0');
            const minutes = String(timeSpan.minutes || 0).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        return '';
    };

    const getDayName = (dayOfWeek) => {
        const days = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']; // Abreviados para móvil
        return days[dayOfWeek] || '?';
    };

    const getWeekTypeName = (weekType) => {
        const isMobile = window.innerWidth < 768;
        const weekTypes = isMobile 
            ? ['Todas', 'Pares', 'Impares'] 
            : ['Todas las semanas', 'Semanas pares', 'Semanas impares'];
        return weekTypes[weekType] || '?';
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        // Más compacto para móviles
        if (window.innerWidth < 768) {
            return hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
        }
        
        if (hours === 0) {
            return `${mins} min`;
        } else if (mins === 0) {
            return hours === 1 ? `${hours} hora` : `${hours} horas`;
        } else {
            return `${hours}h ${mins}m`;
        }
    };

    const hasSchedules = subject.schedules && subject.schedules.length > 0;
    
    // Generate a "random" subject color from the subject name
    const getSubjectColor = () => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-yellow-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-teal-500'
        ];
        
        // Use the subject title to deterministically choose a color
        const charCodeSum = subject.title
            .split('')
            .reduce((sum, char) => sum + char.charCodeAt(0), 0);
        
        return colors[charCodeSum % colors.length];
    };
    
    const subjectColor = getSubjectColor();

    const handleDeleteClick = () => {
        // En lugar de usar window.confirm, simplemente llamamos a onDelete
        // El componente padre ahora se encargará de mostrar el modal de confirmación
        onDelete(subject.id);
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${subjectColor}`}>
                        <FaBook className="text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-primary truncate">{subject.title || 'Sin título'}</h3>
                </div>
                <div className="flex space-x-1">
                    <button
                        onClick={() => onUpdate(subject)}
                        className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition"
                        title="Editar"
                        aria-label="Editar asignatura"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-1.5 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition"
                        title="Eliminar"
                        aria-label="Eliminar asignatura"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </div>
            
            {hasSchedules ? (
                <div className="mt-3">
                    <button 
                        onClick={() => setShowSchedules(!showSchedules)}
                        className="text-xs flex items-center text-primary hover:text-accent font-medium"
                    >
                        <span>Horarios ({subject.schedules.length})</span>
                        {showSchedules ? 
                            <FaAngleUp className="ml-1" /> : 
                            <FaAngleDown className="ml-1" />
                        }
                    </button>
                    
                    {showSchedules && (
                        <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                            {subject.schedules.map((schedule) => (
                                <div 
                                    key={schedule.id} 
                                    className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between items-center"
                                >
                                    <div className="flex items-center text-gray-700 text-xs">
                                        <FaCalendarAlt className="mr-1 text-gray-400" />
                                        <span className="font-medium">{getDayName(schedule.dayOfWeek)}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-700">
                                        <FaClock className="mr-1 text-gray-400" />
                                        <span>{formatTimeSpan(schedule.startTime)}</span>
                                        <span className="mx-1 text-gray-400">•</span>
                                        <span>{formatDuration(schedule.durationMinutes)}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {getWeekTypeName(schedule.weekType)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-3 text-xs text-gray-500">No hay horarios configurados</p>
            )}
            
            {/* Stats or progress indicators could go here */}
            <div className="mt-3 pt-2 border-t">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Clases por semana: {hasSchedules ? subject.schedules.length : 0}</span>
                    <span>{hasSchedules ? 'Configurado' : 'No configurado'}</span>
                </div>
            </div>
        </div>
    );
};

SubjectCard.propTypes = {
    subject: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        schedules: PropTypes.array
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default SubjectCard;
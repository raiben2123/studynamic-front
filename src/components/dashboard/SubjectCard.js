// src/components/dashboard/SubjectCard.js - Versión responsiva
import React, { useState } from 'react';
import PropTypes from 'prop-types';

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
            return hours === 1 ? `${hours} h` : `${hours} h`;
        } else {
            return `${hours}h ${mins}m`;
        }
    };

    const hasSchedules = subject.schedules && subject.schedules.length > 0;

    return (
        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <div className="flex justify-between items-center">
                <div className="w-[calc(100%-60px)]">
                    <p className="font-medium text-sm sm:text-base text-primary truncate">{subject.title}</p>
                    {hasSchedules && (
                        <button 
                            onClick={() => setShowSchedules(!showSchedules)}
                            className="text-xs text-primary hover:text-accent underline mt-1"
                        >
                            {showSchedules ? 'Ocultar' : `Horarios (${subject.schedules.length})`}
                        </button>
                    )}
                    {!hasSchedules && (
                        <p className="text-xs text-gray-500 mt-1">Sin horarios</p>
                    )}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                    <button
                        onClick={() => onUpdate(subject)}
                        className="text-gray-600 hover:text-primary transition p-1"
                        title="Editar"
                        aria-label="Editar asignatura"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar esta asignatura?')) {
                                onDelete(subject.id);
                            }
                        }}
                        className="text-gray-600 hover:text-red-500 transition p-1"
                        title="Eliminar"
                        aria-label="Eliminar asignatura"
                    >
                        🗑️
                    </button>
                </div>
            </div>
            
            {showSchedules && (
                <div className="mt-2 border-t pt-2 space-y-1 max-h-28 overflow-y-auto">
                    {subject.schedules.map((schedule) => (
                        <div key={schedule.id} className="flex justify-between text-xs bg-white p-1 sm:p-2 rounded">
                            <div className="flex flex-wrap gap-1">
                                <span className="font-semibold">{getDayName(schedule.dayOfWeek)}</span>
                                <span className="mx-1">·</span>
                                <span>{formatTimeSpan(schedule.startTime)}</span>
                                <span className="mx-1">·</span>
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
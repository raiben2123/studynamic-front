// src/components/EventPanel.js - Con mejoras de responsividad
import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaTasks, FaCalendarAlt, FaVideo, FaLink, FaPlus } from 'react-icons/fa';

const EventPanel = ({ selectedDay, events, position = 'bottom', onAddEvent }) => {
    const isMobile = window.innerWidth < 768;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(parseISO(dateString), 'EEEE, d MMMM', { locale: es })
                .charAt(0)
                .toUpperCase() +
                format(parseISO(dateString), 'EEEE, d MMMM', { locale: es }).slice(1);
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            return format(parseISO(dateString), 'HH:mm');
        } catch (error) {
            console.error('Error formateando hora:', error);
            return '';
        }
    };

    const renderDayEvents = () => {
        if (events.length === 0) {
            return (
                <div className="text-center py-6">
                    <p className="text-gray-500 text-center mb-3">No hay eventos para este día</p>
                    {onAddEvent && (
                        <button
                            onClick={() => onAddEvent(selectedDay)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                        >
                            <span className="flex items-center justify-center">
                                <FaPlus className="mr-2" /> Añadir evento
                            </span>
                        </button>
                    )}
                </div>
            );
        }

        // Formato adaptativo para móvil o desktop
        return (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {events.map((event, index) => {
                    const isTask = event.type === 'task' || event.status !== undefined;
                    const isSession = event.type === 'session';
                    const time = event.dueDate || event.startDateTime;
                    
                    return (
                        <div
                            key={`${event.id || index}-${index}`}
                            className={`bg-white p-3 rounded-lg border-l-4 ${
                                isTask ? 'border-task' : 
                                isSession ? 'border-primary' : 
                                'border-event'
                            } shadow-sm`}
                        >
                            <h4 className="font-medium text-gray-800">{event.title}</h4>
                            {time && (
                                <p className="text-gray-600 text-sm">
                                    {formatTime(time)}
                                </p>
                            )}
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                                {isTask && (
                                    <>
                                        <FaTasks className="mr-1" /> Tarea
                                        {event.subject && <span className="ml-2">• {event.subject}</span>}
                                    </>
                                )}
                                {isSession && (
                                    <>
                                        <FaVideo className="mr-1" /> Sesión
                                    </>
                                )}
                                {!isTask && !isSession && (
                                    <>
                                        <FaCalendarAlt className="mr-1" /> Evento
                                    </>
                                )}
                            </div>
                            {isSession && event.zoomLink && (
                                <a
                                    href={event.zoomLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-accent mt-2 flex items-center"
                                >
                                    <FaLink className="mr-1" /> Unirse
                                </a>
                            )}
                        </div>
                    );
                })}
                
                {onAddEvent && (
                    <div className="text-center pt-2">
                        <button
                            onClick={() => onAddEvent(selectedDay)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                        >
                            <span className="flex items-center justify-center">
                                <FaPlus className="mr-1" /> Añadir otro evento
                            </span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Versión simplificada para mantener la consistencia entre los diferentes dispositivos y layouts
    return (
        <div className={`bg-gray-50 p-4 ${position === 'side' ? 'md:w-1/3 md:border-t-0 md:border-l' : 'border-t'}`}>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                {format(selectedDay, 'EEEE, d MMMM', { locale: es })
                    .charAt(0)
                    .toUpperCase() +
                    format(selectedDay, 'EEEE, d MMMM', { locale: es }).slice(1)}
            </h3>
            {renderDayEvents()}
        </div>
    );
};

export default EventPanel;
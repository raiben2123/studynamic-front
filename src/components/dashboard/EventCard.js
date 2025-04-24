// src/components/dashboard/EventCard.js - Enhanced for modern design with Theme Support
import React from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { dayjs } from '../../dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


const EventCard = ({ event, onUpdate, onDelete }) => {
    console.log('Event recibido:', event); // Log para depuración

    // Verifica si event existe
    if (!event) {
        console.warn('Event es undefined o null');
        return <div className="text-error">Error: Evento no disponible</div>;
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Sin fecha';
        try {
            const date = dayjs.utc(dateString).tz('Europe/Madrid'); // ajusta a tu zona horaria
            const isMobile = window.innerWidth < 768;
            return isMobile
                ? date.format('DD/MM HH:mm')
                : date.format('DD/MM/YYYY HH:mm');
        } catch (error) {
            console.error('Error con dayjs:', error);
            return 'Error en fecha';
        }
    };
    
    const getTimeUntil = () => {
        if (!event.startDateTime) return 'Sin fecha';
        try {
            const eventDate = dayjs.utc(event.startDateTime).tz('Europe/Madrid');
            const now = dayjs().tz('Europe/Madrid');
    
            if (eventDate.isBefore(now)) return 'Evento pasado';
    
            const diffDays = eventDate.diff(now, 'day');
            const diffHours = eventDate.diff(now, 'hour') % 24;
            const diffMinutes = eventDate.diff(now, 'minute') % 60;
    
            if (diffDays > 0) {
                return `En ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
            } else if (diffHours > 0) {
                return `En ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
            } else {
                return `En ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
            }
        } catch (error) {
            console.error('Error calculando tiempo:', error);
            return 'Error en fecha';
        }
    };

    const timeUntil = getTimeUntil();

    // Determine badge color based on time until event
    const getBadgeColor = () => {
        if (timeUntil === 'Evento pasado') return 'bg-event-pasado text-event-pasado';
        if (timeUntil === 'Sin fecha' || timeUntil === 'Fecha inválida') return 'bg-event-normal text-event-normal';
        if (timeUntil.includes('minutos') || (timeUntil.includes('hora') && !timeUntil.includes('horas'))) {
            return 'bg-event-proximo text-event-proximo';
        }
        if (timeUntil.includes('horas') || timeUntil.includes('1 día')) {
            return 'bg-event-cercano text-event-cercano';
        }
        return 'bg-event-futuro text-event-futuro';
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm transition-all duration-300 relative z-0 mx-1">
            <div className="flex items-start mb-3">
                <div className="mr-3 p-2 rounded-full bg-primary-light">
                    <FaCalendarAlt className="text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-primary truncate">{event.title || 'Sin título'}</h3>
                    {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{event.description}</p>
                    )}
                </div>
                <div className="flex space-x-1 ml-2">
                    <button
                        onClick={() => onUpdate(event)}
                        className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition"
                        title="Editar"
                        aria-label="Editar evento"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                                onDelete(event.id);
                            }
                        }}
                        className="p-1.5 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition"
                        title="Eliminar"
                        aria-label="Eliminar evento"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-y-2 text-xs">
                <div className="flex items-center mr-3">
                    <FaCalendarAlt className="text-gray-400 mr-1" size={12} />
                    <span className="text-gray-600">{formatDateTime(event.startDateTime)}</span>
                </div>

                {event.endDateTime && (
                    <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-1" size={12} />
                        <span className="text-gray-600">{formatDateTime(event.endDateTime)}</span>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor()}`}>
                    {timeUntil}
                </span>
            </div>
        </div>
    );
};

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string,
        startDateTime: PropTypes.string, // Opcional
        endDateTime: PropTypes.string,
        description: PropTypes.string,
        notification: PropTypes.string,
    }),
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default EventCard;
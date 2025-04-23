// src/components/dashboard/EventCard.js - Versión responsiva
import React from 'react';
import PropTypes from 'prop-types';

const EventCard = ({ event, onUpdate, onDelete }) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const isMobile = window.innerWidth < 768;
        
        // En móvil, formato más compacto
        return isMobile 
            ? `${day}/${month} ${hours}:${minutes}`
            : `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 transition">
            <div className="w-[calc(100%-60px)]">
                <p className="font-medium text-sm sm:text-base text-primary truncate">{event.title}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                    {formatDateTime(event.startDateTime)}{' '}
                    {event.endDateTime ? `- ${formatDateTime(event.endDateTime)}` : ''}
                </p>
                {event.description && (
                    <p className="text-xs sm:text-sm text-gray-600 truncate max-w-xs">{event.description}</p>
                )}
            </div>
            <div className="flex space-x-1 sm:space-x-2">
                <button
                    onClick={() => onUpdate(event)}
                    className="text-gray-600 hover:text-primary transition p-1"
                    title="Editar"
                    aria-label="Editar evento"
                >
                    ✏️
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                            onDelete(event.id);
                        }
                    }}
                    className="text-gray-600 hover:text-red-500 transition p-1"
                    title="Eliminar"
                    aria-label="Eliminar evento"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        startDateTime: PropTypes.string,
        endDateTime: PropTypes.string,
        description: PropTypes.string,
        notification: PropTypes.string,
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default EventCard;
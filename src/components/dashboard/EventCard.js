// src/components/dashboard/EventCard.js
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
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 transition">
            <div>
                <p className="font-medium text-primary">{event.title}</p>
                <p className="text-sm text-gray-600">
                    {formatDateTime(event.startDateTime)}{' '}
                    {event.endDateTime ? `- ${formatDateTime(event.endDateTime)}` : ''}
                </p>
                {event.description && (
                    <p className="text-sm text-gray-600 truncate max-w-xs">{event.description}</p>
                )}
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onUpdate(event)}
                    className="text-gray-600 hover:text-primary transition"
                    title="Editar"
                >
                    ✏️
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                            onDelete(event.id);
                        }
                    }}
                    className="text-gray-600 hover:text-red-500 transition"
                    title="Eliminar"
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
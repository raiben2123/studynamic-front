// src/components/dashboard/EventCard.js
import React from 'react';

const EventCard = ({ event }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
            <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-600">
                    {event.date} {event.time}
                </p>
            </div>
            <button className="text-sm px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                Ver Detalles
            </button>
        </div>
    );
};

export default EventCard;
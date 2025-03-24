// src/components/dashboard/GroupCard.js
import React from 'react';

const GroupCard = ({ group }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
            <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-600">{group.members} miembros</p>
            </div>
            <button className="text-sm px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600">
                Ver Grupo
            </button>
        </div>
    );
};

export default GroupCard;
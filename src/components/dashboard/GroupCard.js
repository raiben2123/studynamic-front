// src/components/dashboard/GroupCard.js - Versión responsiva
import React from 'react';
import PropTypes from 'prop-types';

const GroupCard = ({ group, onNavigate }) => {
    return (
        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 transition">
            <div className="w-[calc(100%-80px)]">
                <p className="font-medium text-sm sm:text-base text-primary truncate">{group.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                    {group.members ? group.members.length : group.memberCount || 0} miembros
                </p>
            </div>
            <button 
                className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-primary text-white rounded-full hover:bg-accent"
                onClick={() => onNavigate(group.id)}
            >
                Ver Grupo
            </button>
        </div>
    );
};

GroupCard.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        members: PropTypes.array,
        memberCount: PropTypes.number
    }).isRequired,
    onNavigate: PropTypes.func.isRequired,
};

export default GroupCard;

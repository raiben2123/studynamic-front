// src/components/dashboard/GroupCard.js - Enhanced for carousel with Theme Support
import React from 'react';
import PropTypes from 'prop-types';
import { FaUsers, FaArrowRight } from 'react-icons/fa';

const GroupCard = ({ group, onNavigate }) => {
    return (
        <div className="p-3 sm:p-4 bg-white rounded-xl shadow-sm transition duration-300 h-full flex flex-col justify-between relative z-0 mx-1">
            <div>
                <div className="flex items-center mb-2">
                    <div className="mr-3 p-2 rounded-full bg-primary-light">
                        <FaUsers className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary truncate">{group.name}</h3>
                        <p className="text-xs text-gray-600">
                            {group.members ? group.members.length : group.memberCount || 0} miembros
                        </p>
                    </div>
                </div>
                
                {/* Group Activity Indicator */}
                <div className="mt-3 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                            className="bg-activity-progress h-1 rounded-full" 
                            style={{ width: `${Math.min(100, (group.memberCount || 1) * 10)}%` }} 
                        ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">Actividad</span>
                </div>
            </div>
            
            <button 
                className="mt-4 p-2 bg-primary text-white rounded-lg hover:bg-accent transition duration-300 flex justify-center items-center group"
                onClick={() => onNavigate(group.id)}
            >
                <span>Ver Grupo</span>
                <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
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
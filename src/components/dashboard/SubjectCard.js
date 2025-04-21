// src/components/dashboard/SubjectCard.js
import React from 'react';
import PropTypes from 'prop-types';

const SubjectCard = ({ subject, onUpdate, onDelete }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 transition">
            <div>
                <p className="font-medium text-primary">{subject.title}</p>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onUpdate(subject)}
                    className="text-gray-600 hover:text-primary transition"
                    title="Editar"
                >
                    ✏️
                </button>
                <button
                    onClick={() => onDelete(subject.id)}
                    className="text-gray-600 hover:text-red-500 transition"
                    title="Eliminar"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

SubjectCard.propTypes = {
    subject: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default SubjectCard;
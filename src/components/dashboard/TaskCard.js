// src/components/dashboard/TaskCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { formatDateForDisplay } from '../../utils/dateUtils';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            onDelete(task.id);
        }
    };

    return (
        <div className="bg-gray-100 p-3 rounded-lg mb-2 shadow-sm">
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium text-base">{task.title}</p>
                        <p className="text-sm text-gray-600">Fecha límite: {formatDateForDisplay(task.dueDate)}</p>
                        <p className="text-sm text-gray-600">Asignatura: {task.subject}</p>
                        {(task.markObtained || task.markMax) && (
                            <p className="text-sm text-gray-600">
                                Nota: {task.markObtained || 'N/A'} / {task.markMax || 'N/A'}
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onUpdate(task)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                            task.status === 'Pendiente'
                                ? 'bg-red-100 text-red-800'
                                : task.status === 'En curso'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                    >
                        {task.status}
                    </span>
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                            task.importance === 'Alta'
                                ? 'bg-red-100 text-red-800'
                                : task.importance === 'Media'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {task.importance}
                    </span>
                </div>
            </div>
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string.isRequired,
        dueDate: PropTypes.string,
        status: PropTypes.string.isRequired,
        importance: PropTypes.string.isRequired,
        markObtained: PropTypes.string,
        markMax: PropTypes.string,
        subject: PropTypes.string.isRequired,
        notificationDate: PropTypes.string
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TaskCard;
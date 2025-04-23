// src/components/dashboard/TaskCard.js - Versión responsiva
import React from 'react';
import PropTypes from 'prop-types';
import { formatDateForDisplay } from '../../utils/dateUtils';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            onDelete(task.id);
        }
    };

    // Detectar si es móvil para ajustar el diseño
    const isMobile = window.innerWidth < 768;

    return (
        <div className="bg-gray-100 p-2 sm:p-3 rounded-lg mb-2 shadow-sm hover:bg-gray-200 transition">
            <div className="flex flex-col space-y-1 sm:space-y-2">
                <div className="flex justify-between items-start">
                    <div className="w-[calc(100%-60px)]">
                        <p className="font-medium text-sm sm:text-base text-primary truncate">{task.title}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Fecha: {formatDateForDisplay(task.dueDate)}</p>
                        {!isMobile && <p className="text-xs sm:text-sm text-gray-600 truncate">Asignatura: {task.subject}</p>}
                    </div>
                    <div className="flex space-x-1 sm:space-x-2">
                        <button
                            onClick={() => onUpdate(task)}
                            className="text-gray-500 hover:text-primary p-1"
                            aria-label="Editar tarea"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-500 hover:text-red-500 p-1"
                            aria-label="Eliminar tarea"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                {isMobile && (
                    <p className="text-xs text-gray-600 truncate">Asignatura: {task.subject}</p>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span
                        className={`text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded-full ${
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
                        className={`text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                            task.importance === 'Alta'
                                ? 'bg-red-100 text-red-800'
                                : task.importance === 'Media'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {task.importance}
                    </span>
                    {(task.markObtained || task.markMax) && (
                        <span className="text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded-full bg-blue-100 text-blue-800">
                            {task.markObtained || '0'}/{task.markMax || '0'}
                        </span>
                    )}
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
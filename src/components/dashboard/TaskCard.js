// src/components/dashboard/TaskCard.js
import React from 'react';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            onDelete(task.id);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="bg-gray-100 p-3 rounded-lg mb-2 shadow-sm">
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium text-base">{task.title}</p>
                        <p className="text-sm text-gray-600">Fecha límite: {formatDate(task.dueDate)}</p>
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

export default TaskCard;
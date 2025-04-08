// src/components/dashboard/TaskCard.js
import React, { useState } from 'react';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });

    const handleSave = () => {
        if (
            editedTask.markObtained &&
            editedTask.markMax &&
            Number(editedTask.markObtained) > Number(editedTask.markMax)
        ) {
            alert('La nota obtenida no puede ser mayor que la nota máxima.');
            return;
        }
        onUpdate(editedTask);
        setIsEditing(false);
    };

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
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={editedTask.title}
                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Título de la tarea"
                    />
                    <input
                        type="date"
                        value={editedTask.dueDate} // Cambiamos 'start' por 'dueDate' para consistencia
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <select
                        value={editedTask.status}
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="Completada">Completada</option>
                    </select>
                    <select
                        value={editedTask.importance}
                        onChange={(e) => setEditedTask({ ...editedTask, importance: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="No Urgente">No Urgente</option>
                        <option value="Media">Media</option>
                        <option value="Urgente">Urgente</option>
                    </select>
                    <select
                        value={editedTask.subject}
                        onChange={(e) => setEditedTask({ ...editedTask, subject: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={editedTask.markObtained || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, markObtained: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Nota obtenida"
                        min="0"
                    />
                    <input
                        type="number"
                        value={editedTask.markMax || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, markMax: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Nota máxima"
                        min="0"
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-gray-200 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            ) : (
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
                                onClick={() => setIsEditing(true)}
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
                            className={`text-xs font-medium px-2 py-1 rounded-full ${task.status === 'Pendiente'
                                    ? 'bg-red-100 text-red-800'
                                    : task.status === 'En Progreso'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                        >
                            {task.status}
                        </span>
                        <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${task.importance === 'Urgente'
                                    ? 'bg-blue-100 text-blue-800'
                                    : task.importance === 'Media'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {task.importance}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
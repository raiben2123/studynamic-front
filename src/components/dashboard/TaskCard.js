// src/components/dashboard/TaskCard.js
import React from 'react';

const TaskCard = ({ task }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-lg">
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-gray-600">Fecha límite: {task.dueDate}</p>
            <span
                className={`text-sm px-3 py-1 rounded-full mt-2 inline-block ${task.status === 'Pendiente'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
            >
                {task.status}
            </span>
        </div>
    );
};

export default TaskCard;
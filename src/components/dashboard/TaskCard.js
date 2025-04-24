// src/components/dashboard/TaskCard.js - Enhanced for the new design with Theme Support
import React from 'react';
import PropTypes from 'prop-types';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { FaEdit, FaTrash, FaBookmark, FaExclamationCircle, FaCheck } from 'react-icons/fa';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    console.log('Task recibido:', task); // Log para depuración

    // Verifica si task existe
    if (!task) {
        console.warn('Task es undefined o null');
        return <div className="text-error">Error: Tarea no disponible</div>;
    }

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            onDelete(task.id);
        }
    };

    // Calculate days remaining
    const calculateDaysRemaining = () => {
        if (!task.dueDate) {
            console.warn('No hay dueDate:', task);
            return null;
        }

        try {
            const dueDate = new Date(task.dueDate);
            if (isNaN(dueDate.getTime())) {
                console.warn('dueDate inválido:', task.dueDate);
                return null;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normaliza a medianoche

            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays;
        } catch (error) {
            console.error('Error calculando días restantes:', error);
            return null;
        }
    };

    const daysRemaining = calculateDaysRemaining();

    // Apply different styling based on status and days remaining
    const getTaskStatusColor = () => {
        if (task.status === 'Finalizada') return 'bg-task-finalizada text-task-finalizada';
        if (daysRemaining === null) return 'bg-task-normal text-task-normal';
        if (daysRemaining < 0) return 'bg-task-vencida text-task-vencida';
        if (daysRemaining === 0) return 'bg-task-hoy text-task-hoy';
        if (daysRemaining <= 2) return 'bg-task-pronto text-task-pronto';
        return 'bg-task-normal text-task-normal';
    };

    const getImportanceIcon = () => {
        switch (task.importance) {
            case 'Alta':
                return <FaExclamationCircle className="text-task-alta" />;
            case 'Media':
                return <FaBookmark className="text-task-media" />;
            default:
                return <FaBookmark className="text-task-baja" />;
        }
    };

    const getStatusText = () => {
        if (task.status === 'Finalizada') return 'Completada';
        if (daysRemaining === null) return 'Sin fecha de vencimiento';
        if (daysRemaining < 0) return `Vencida (${Math.abs(daysRemaining)} días)`;
        if (daysRemaining === 0) return 'Vence hoy';
        if (daysRemaining === 1) return 'Vence mañana';
        return `${daysRemaining} días restantes`;
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm transition-all duration-300 relative z-0 mx-1">
            <div className="flex items-start mb-2">
                <div className="mr-2 text-primary">{getImportanceIcon()}</div>
                <div className="flex-1">
                    <h3 className="font-semibold text-primary truncate">{task.title || 'Sin título'}</h3>
                    <p className="text-sm text-gray-600">{task.subject || 'Sin asignatura'}</p>
                </div>
                <div className="flex space-x-1 ml-2">
                    <button
                        onClick={() => onUpdate(task)}
                        className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition"
                        aria-label="Editar tarea"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition"
                        aria-label="Eliminar tarea"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                    <div className="mr-2 w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-gray-600">
                        {task.dueDate ? formatDateForDisplay(task.dueDate) : 'Sin fecha'}
                    </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            {task.status === 'Finalizada' && (
                <div className="mt-2 flex items-center text-task-finalizada text-xs">
                    <FaCheck className="mr-1" />
                    <span>Completada</span>
                </div>
            )}

            {(task.markObtained || task.markMax) && (
                <div className="mt-2 text-xs font-medium px-2 py-1 rounded-full bg-task-calificacion text-task-calificacion inline-block">
                    Calificación: {task.markObtained || '0'}/{task.markMax || '0'}
                </div>
            )}
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string,
        dueDate: PropTypes.string, // Opcional
        status: PropTypes.string,
        importance: PropTypes.string,
        markObtained: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        markMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        subject: PropTypes.string,
        notificationDate: PropTypes.string
    }),
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.string)
};

export default TaskCard;
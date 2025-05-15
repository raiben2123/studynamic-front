import React from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaBookmark, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import dayjs from '../../utils/dayjsConfig';

const TaskCardGroup = ({ task, onUpdate, onDelete }) => {
    console.log('Task recibido:', task);

    if (!task) {
        console.warn('Task es undefined o null');
        return <div className="text-error">Error: Tarea no disponible</div>;
    }

    const handleDelete = () => {
        onDelete(task.id);
    };

    const calculateDaysRemaining = () => {
        if (!task.dueDate) {
            console.warn('No hay dueDate:', task);
            return null;
        }

        try {
            const dueDate = dayjs(task.dueDate).startOf('day');
            const today = dayjs().startOf('day');
            return dueDate.diff(today, 'day');
        } catch (error) {
            console.error('Error calculando días restantes:', error);
            return null;
        }
    };

    const daysRemaining = calculateDaysRemaining();

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

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        try {
            const date = dayjs(dateString);
            return date.format('DD/MM/YYYY');
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Error en fecha';
        }
    };

    return (
        <div className="bg-card-bg rounded-xl p-4 shadow-sm transition-all duration-300 relative z-0 mx-1 border border-border">
            <div className="flex items-start mb-2">
                <div className="mr-2 text-primary">{getImportanceIcon()}</div>
                <div className="flex-1">
                    <h3 className="font-semibold text-primary truncate">{task.title || 'Sin título'}</h3>
                </div>
                <div className="flex space-x-1 ml-2">
                    <button
                        onClick={() => onUpdate(task)}
                        className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-input-bg transition"
                        aria-label="Editar tarea"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-text-secondary hover:text-error rounded-full hover:bg-input-bg transition"
                        aria-label="Eliminar tarea"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                    <div className="mr-2 w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-text-secondary">
                        {formatDate(task.dueDate)}
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

TaskCardGroup.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string,
        dueDate: PropTypes.string,
        status: PropTypes.string,
        importance: PropTypes.string,
        markObtained: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        markMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        notificationDate: PropTypes.string,
    }),
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TaskCardGroup;
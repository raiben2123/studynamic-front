import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaBookmark, FaExclamationCircle, FaCheck, FaPaperclip } from 'react-icons/fa';
import dayjs from '../../utils/dayjsConfig';
import { getFilesByTask } from '../../api/files';

const TaskCard = ({ task, onUpdate, onDelete, subjects }) => {
    const [hasAttachments, setHasAttachments] = useState(false);
    const [attachmentsCount, setAttachmentsCount] = useState(0);

    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                if (task && task.id) {
                    const files = await getFilesByTask(task.id);
                    setHasAttachments(files && files.length > 0);
                    setAttachmentsCount(files ? files.length : 0);
                }
            } catch (error) {
                console.error('Error al cargar archivos adjuntos:', error);
                setHasAttachments(false);
                setAttachmentsCount(0);
            }
        };

        fetchAttachments();
    }, [task]);

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

    return (
        <div className="bg-card-bg rounded-xl p-4 shadow-sm transition-all duration-300 relative z-0 mx-1 border border-border">
            <div className="flex items-start mb-2">
                <div className="mr-2 text-primary">{getImportanceIcon()}</div>
                <div className="flex-1">
                    <h3 className="font-semibold text-primary truncate">{task.title || 'Sin título'}</h3>
                    <p className="text-sm text-text-secondary">{task.subject || 'Sin asignatura'}</p>
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
                        {task.dueDate
                            ? dayjs(task.dueDate).format('DD/MM/YYYY')
                            : 'Sin fecha'}
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
                <div className="mt-2 text-xs font-medium px-2 py-1 rounded-full bg-task-calificacion-bg text-task-calificacion inline-block">
                    Calificación: {task.markObtained || '0'}/{task.markMax || '0'}
                </div>
            )}

            {hasAttachments && (
                <div className="mt-2 flex items-center text-primary text-xs">
                    <FaPaperclip className="mr-1" />
                    <span>{attachmentsCount} {attachmentsCount === 1 ? 'archivo adjunto' : 'archivos adjuntos'}</span>
                </div>
            )}
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string,
        dueDate: PropTypes.string,
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
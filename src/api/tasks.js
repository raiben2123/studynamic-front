// src/api/tasks.js
import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const PRIORITY_MAP = {
    'Alta': 1,
    'Media': 2,
    'Baja': 3,
};
const STATUS_MAP = {
    'Pendiente': 1,
    'En curso': 2,
    'Finalizada': 3,
};

const mapTaskFromDTO = (dto) => ({
    id: dto.id,
    title: dto.title,
    dueDate: dto.dueDate.split('T')[0],
    status: dto.statusName,
    markObtained: dto.mark.toString(),
    markMax: dto.sobreMark.toString(),
    importance: dto.priorityName,
    subject: dto.subjectTitle,
    notificationDate: dto.notification ? dto.notification.split('T')[0] : '',
});

export const getTasks = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/tasks/user/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error al obtener las tareas');
    }

    const tasksData = await response.json();
    return Array.isArray(tasksData) ? tasksData.map(mapTaskFromDTO) : [mapTaskFromDTO(tasksData)];
};

export const addTask = async (task, isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    const taskDTO = {
        id: task.id || null,
        [isGroup ? 'groupId' : 'userId']: isGroup ? parseInt(groupId) : parseInt(userId),
        subjectId: parseInt(task.subjectId),
        title: task.title,
        dueDate: `${task.dueDate}T00:00:00`,
        priorityId: PRIORITY_MAP[task.importance] || 3,
        statusId: STATUS_MAP[task.status] || 1,
        mark: parseInt(task.markObtained) || 0,
        sobreMark: parseInt(task.markMax) || 0,
        notification: task.notificationDate ? `${task.notificationDate}T00:00:00` : null,
    };

    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskDTO),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al añadir la tarea: ${errorText || response.statusText}`);
    }

    const addedTask = await response.json();
    return mapTaskFromDTO(addedTask);
};

export const updateTask = async (taskId, task, isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    const taskDTO = {
        id: parseInt(taskId),
        [isGroup ? 'groupId' : 'userId']: isGroup ? parseInt(groupId) : parseInt(userId),
        subjectId: parseInt(task.subjectId),
        title: task.title,
        dueDate: `${task.dueDate}T00:00:00`,
        priorityId: PRIORITY_MAP[task.importance] || 3,
        statusId: STATUS_MAP[task.status] || 1,
        mark: parseInt(task.markObtained) || 0,
        sobreMark: parseInt(task.markMax) || 0,
        notification: task.notificationDate ? `${task.notificationDate}T00:00:00` : null,
    };

    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskDTO),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || response.statusText;
        } catch (e) {
            const errorText = await response.text();
            errorMessage = errorText || response.statusText;
        }
        throw new Error(`Error al actualizar la tarea: ${errorMessage}`);
    }

    if (response.status === 204) {
        return mapTaskFromDTO({
            id: taskDTO.id,
            title: taskDTO.title,
            dueDate: taskDTO.dueDate,
            statusName: Object.keys(STATUS_MAP).find((key) => STATUS_MAP[key] === taskDTO.statusId),
            mark: taskDTO.mark,
            sobreMark: taskDTO.sobreMark,
            priorityName: Object.keys(PRIORITY_MAP).find((key) => PRIORITY_MAP[key] === taskDTO.priorityId),
            subjectTitle: task.subject,
            notification: taskDTO.notification,
        });
    }

    const updatedTask = await response.json();
    return mapTaskFromDTO(updatedTask);
};

export const deleteTask = async (taskId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar la tarea: ${errorText || response.statusText}`);
    }

    return true;
};
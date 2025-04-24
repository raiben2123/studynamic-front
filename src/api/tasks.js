// src/api/tasks.js
import { getToken, getUserId } from './auth';
import { prepareDateForApi, extractDateFromIso } from '../utils/dateUtils';

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

const mapTaskFromDTO = (dto) => {
    // Aseguramos que las fechas estén en formato YYYY-MM-DD
    const dueDate = dto.dueDate ? extractDateFromIso(dto.dueDate) : '';
    const notificationDate = dto.notification ? extractDateFromIso(dto.notification) : '';
    
    return {
        id: dto.id,
        title: dto.title,
        dueDate: dueDate,
        status: dto.statusName,
        markObtained: dto.mark ? dto.mark.toString() : '',
        markMax: dto.sobreMark ? dto.sobreMark.toString() : '',
        importance: dto.priorityName,
        subject: dto.subjectTitle,
        subjectId: dto.subjectId,
        notificationDate: notificationDate,
        groupId: dto.groupId, // Añadimos el groupId para poder filtrar tareas de grupos
        groupName: dto.groupName,
        userId: dto.userId,
        username: dto.username
    };
};

/**
 * Obtiene las tareas según el contexto (usuario o grupo)
 * @param {boolean} isGroup - Indica si se deben obtener las tareas de un grupo
 * @param {number} groupId - ID del grupo (solo si isGroup es true)
 * @returns {Promise<Array>} Lista de tareas
 */
export const getTasks = async (isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    // Determinamos la URL a utilizar
    let url;
    if (isGroup && groupId) {
        url = `${BASE_URL}/usertasks/group/${groupId}`;
    } else {
        url = `${BASE_URL}/usertasks/user/${userId}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error al obtener las tareas ${isGroup ? 'del grupo' : 'del usuario'}`);
    }

    const tasksData = await response.json();
    return Array.isArray(tasksData) ? tasksData.map(mapTaskFromDTO) : [mapTaskFromDTO(tasksData)];
};

/**
 * Añade una nueva tarea
 * @param {Object} task - Datos de la tarea
 * @param {boolean} isGroup - Indica si es una tarea de grupo
 * @param {number} groupId - ID del grupo (solo si isGroup es true)
 * @returns {Promise<Object>} Tarea añadida
 */
export const addTask = async (task, isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    // Preparar las fechas para enviar a la API
    const dueDateForApi = prepareDateForApi(task.dueDate);
    const notificationDateForApi = task.notificationDate ? prepareDateForApi(task.notificationDate) : null;

    const taskDTO = {
        id: task.id || null,
        userId: isGroup ? null : parseInt(userId),
        groupId: isGroup ? parseInt(groupId) : null,
        subjectId: parseInt(task.subjectId),
        title: task.title,
        dueDate: dueDateForApi,
        priorityId: PRIORITY_MAP[task.importance] || 3,
        statusId: STATUS_MAP[task.status] || 1,
        mark: parseInt(task.markObtained) || 0,
        sobreMark: parseInt(task.markMax) || 0,
        notification: notificationDateForApi,
    };

    const response = await fetch(`${BASE_URL}/usertasks`, {
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

/**
 * Actualiza una tarea existente
 * @param {number} taskId - ID de la tarea a actualizar
 * @param {Object} task - Nuevos datos de la tarea
 * @param {boolean} isGroup - Indica si es una tarea de grupo
 * @param {number} groupId - ID del grupo (solo si isGroup es true)
 * @returns {Promise<Object>} Tarea actualizada
 */
export const updateTask = async (taskId, task, isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    // Preparar las fechas para enviar a la API
    const dueDateForApi = prepareDateForApi(task.dueDate);
    const notificationDateForApi = task.notificationDate ? prepareDateForApi(task.notificationDate) : null;

    const taskDTO = {
        id: parseInt(taskId),
        userId: isGroup ? null : parseInt(userId),
        groupId: isGroup ? parseInt(groupId) : null,
        subjectId: parseInt(task.subjectId),
        title: task.title,
        dueDate: dueDateForApi,
        priorityId: PRIORITY_MAP[task.importance] || 3,
        statusId: STATUS_MAP[task.status] || 1,
        mark: parseInt(task.markObtained) || 0,
        sobreMark: parseInt(task.markMax) || 0,
        notification: notificationDateForApi,
    };

    console.log('Actualizando tarea en la API:', taskDTO);

    const response = await fetch(`${BASE_URL}/usertasks/${taskId}`, {
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
        // Cuando el servidor no devuelve contenido (204), construimos la respuesta
        return mapTaskFromDTO({
            id: taskDTO.id,
            title: taskDTO.title,
            dueDate: taskDTO.dueDate,
            statusName: Object.keys(STATUS_MAP).find((key) => STATUS_MAP[key] === taskDTO.statusId),
            mark: taskDTO.mark,
            sobreMark: taskDTO.sobreMark,
            priorityName: Object.keys(PRIORITY_MAP).find((key) => PRIORITY_MAP[key] === taskDTO.priorityId),
            subjectTitle: task.subject,
            subjectId: taskDTO.subjectId,
            notification: taskDTO.notification,
            groupId: taskDTO.groupId,
            userId: taskDTO.userId
        });
    }

    const updatedTask = await response.json();
    return mapTaskFromDTO(updatedTask);
};

/**
 * Elimina una tarea
 * @param {number} taskId - ID de la tarea a eliminar
 * @returns {Promise<boolean>} Resultado de la operación
 */
export const deleteTask = async (taskId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/usertasks/${taskId}`, {
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

/**
 * Obtiene las tareas de un grupo específico
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Array>} Lista de tareas del grupo
 */
export const getGroupTasks = async (groupId) => {
    return getTasks(true, groupId);
};

export default {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getGroupTasks
};
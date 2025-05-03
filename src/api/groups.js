// src/api/groups.js - Actualizado con funciones para invitaciones
import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const mapGroupFromDTO = (dto) => ({
    id: dto.id,
    name: dto.name,
    membersIds: dto.membersIds,
    memberCount: dto.memberIds?.length || 0,
    description: dto.description
});

/**
 * Obtiene todos los grupos disponibles en el sistema.
 * @returns {Promise<Array>} Lista de todos los grupos
 */
export const getAllGroups = async () => {
    const token = await getToken();

    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los grupos');
        }

        const groupsData = await response.json();
        return Array.isArray(groupsData) ? groupsData.map(mapGroupFromDTO) : [mapGroupFromDTO(groupsData)];
    } catch (error) {
        console.error('Error en getAllGroups:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return [
                { id: 100, name: 'Grupo de Matemáticas Avanzadas', memberCount: 20, description: 'Grupo para discutir temas avanzados de matemáticas universitarias' },
                { id: 101, name: 'Grupo de Física Cuántica', memberCount: 15, description: 'Estudio de principios básicos de física cuántica' },
                { id: 102, name: 'Grupo de Programación Python', memberCount: 25, description: 'Aprende Python desde cero hasta nivel avanzado' },
                { id: 103, name: 'Historia del Arte', memberCount: 12, description: 'Grupo para analizar movimientos artísticos y sus contextos históricos' },
                { id: 104, name: 'Inglés Conversacional', memberCount: 18, description: 'Practica inglés con otros estudiantes' },
                { id: 105, name: 'Biología Molecular', memberCount: 14, description: 'Estudio de procesos biológicos a nivel molecular' }
            ];
        }
        
        throw error;
    }
};


/**
 * Obtiene los grupos a los que pertenece el usuario autenticado.
 * @returns {Promise<Array>} Lista de grupos
 */

export const getGroupsByUserId = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/groupmembers/user/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 404) {
        // Si el error 404 es porque no hay grupos, devolvemos lista vacía
        const errorText = await response.text();
        if (errorText.includes("No se encontraron grupos para este usuario")) {
            return [];
        } else {
            throw new Error(`Error 404 inesperado: ${errorText}`);
        }
    }

    if (!response.ok) {
        throw new Error('Error al obtener los grupos');
    }

    const groupsData = await response.json();
    return Array.isArray(groupsData) ? groupsData.map(mapGroupFromDTO) : [mapGroupFromDTO(groupsData)];
};


/**
 * Obtiene los detalles de un grupo específico
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Object>} Detalles del grupo
 */
export const getGroupById = async (groupId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los detalles del grupo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getGroupById:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return {
                id: parseInt(groupId),
                name: `Grupo ${groupId}`,
                password: 'password123',
                description: 'Descripción del grupo generada para desarrollo'
            };
        }
        
        throw error;
    }
};

/**
 * Obtiene los miembros de un grupo
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Array>} Lista de miembros del grupo
 */
export const getGroupMembers = async (groupId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groupmembers/group/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los miembros del grupo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getGroupMembers:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return [
                { userId: 1, username: 'Usuario 1', roleId: 1, roleName: 'Admin' },
                { userId: parseInt(userId), username: 'Tú', roleId: 2, roleName: 'Miembro' },
                { userId: 3, username: 'Usuario 3', roleId: 2, roleName: 'Miembro' },
            ];
        }
        
        throw error;
    }
};

/**
 * Obtiene las tareas de un grupo específico
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Array>} Lista de tareas del grupo
 */
export const getGroupTasks = async (groupId) => {
    const token = await getToken();

    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/usertasks/group/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener las tareas del grupo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getGroupTasks:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    id: 1001,
                    title: 'Tarea grupal 1',
                    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                    statusName: 'Pendiente',
                    priorityName: 'Alta',
                    subjectTitle: 'Matemáticas',
                    groupId: parseInt(groupId)
                },
                {
                    id: 1002,
                    title: 'Tarea grupal 2',
                    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
                    statusName: 'En curso',
                    priorityName: 'Media',
                    subjectTitle: 'Física',
                    groupId: parseInt(groupId)
                }
            ];
        }
        
        throw error;
    }
};

/**
 * Obtiene los eventos de un grupo específico
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Array>} Lista de eventos del grupo
 */
export const getGroupEvents = async (groupId) => {
    const token = await getToken();

    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/events/group/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los eventos del grupo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getGroupEvents:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    id: 2001,
                    title: 'Reunión de grupo',
                    startDateTime: new Date(Date.now() + 86400000 * 2).toISOString(),
                    endDateTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
                    description: 'Reunión para discutir el progreso del proyecto',
                    groupId: parseInt(groupId)
                },
                {
                    id: 2002,
                    title: 'Presentación final',
                    startDateTime: new Date(Date.now() + 86400000 * 15).toISOString(),
                    endDateTime: new Date(Date.now() + 86400000 * 15 + 5400000).toISOString(),
                    description: 'Presentación de resultados al profesor',
                    groupId: parseInt(groupId)
                }
            ];
        }
        
        throw error;
    }
};

/**
 * Crea un nuevo grupo
 * @param {Object} groupData - Datos del grupo a crear
 * @returns {Promise<Object>} Datos del grupo creado
 */
export const createGroup = async (groupData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        // Primero creamos el grupo
        const groupResponse = await fetch(`${BASE_URL}/groups`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: groupData.name,
                password: groupData.password
            }),
        });

        if (!groupResponse.ok) {
            throw new Error('Error al crear el grupo');
        }

        const newGroup = await groupResponse.json();

        // Luego añadimos al creador como admin del grupo
        // NOTA: Este es el único caso donde el roleId debe ser 1 (admin)
        const memberResponse = await fetch(`${BASE_URL}/groupmembers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupId: newGroup.id,
                userId: parseInt(userId),
                roleId: 1, // Rol de admin - CORRECTO, el creador es admin
                password: groupData.password
            }),
        });

        if (!memberResponse.ok) {
            throw new Error('Error al añadir al creador como admin');
        }

        return newGroup;
    } catch (error) {
        console.error('Error en createGroup:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return {
                id: Date.now(),
                name: groupData.name,
                password: groupData.password
            };
        }
        
        throw error;
    }
};

/**
 * Actualiza la información de un grupo
 * @param {number} groupId - ID del grupo
 * @param {Object} groupData - Nuevos datos del grupo
 * @returns {Promise<Object>} Datos actualizados del grupo
 */
export const updateGroup = async (groupId, groupData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/${groupId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: parseInt(groupId),
                name: groupData.name,
                password: groupData.password,
                description: groupData.description
            }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el grupo');
        }

        // El endpoint devuelve 204 No Content
        if (response.status === 204) {
            return {
                id: parseInt(groupId),
                name: groupData.name,
                password: groupData.password,
                description: groupData.description
            };
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateGroup:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return {
                id: parseInt(groupId),
                name: groupData.name,
                password: groupData.password,
                description: groupData.description
            };
        }
        
        throw error;
    }
};

/**
 * Elimina un grupo
 * @param {number} groupId - ID del grupo a eliminar
 * @returns {Promise<boolean>} Resultado de la operación
 */
export const deleteGroup = async (groupId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el grupo');
        }

        return true;
    } catch (error) {
        console.error('Error en deleteGroup:', error);
        
        // Si estamos en desarrollo, simulamos éxito
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
        
        throw error;
    }
};

/**
 * Genera un enlace de invitación para unirse a un grupo
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Object>} Objeto con el enlace de invitación
 */
export const generateInviteLink = async (groupId) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/invite/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al generar el enlace de invitación');
        }

        return await response.json();
    } catch (error) {
        console.error('Error generando enlace de invitación:', error);
        
        // Para desarrollo, generamos un enlace local
        if (process.env.NODE_ENV === 'development') {
            const inviteLink = `${window.location.origin}/#/groups/join/${groupId}`;
            return { inviteLink };
        }
        
        throw error;
    }
};

/**
 * Une a un usuario a un grupo usando la contraseña
 * @param {number} groupId - ID del grupo
 * @param {string} password - Contraseña del grupo
 * @returns {Promise<Object>} Información del miembro añadido
 */
export const joinGroup = async (groupId, password) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        // Llamada directa al endpoint para unirse usando el nuevo formato
        // CORRECCIÓN: Siempre usamos roleId: 2 (miembro) cuando un usuario se une a un grupo
        const memberResponse = await fetch(`${BASE_URL}/groupmembers/user/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                GroupId: parseInt(groupId),
                UserId: parseInt(userId),
                RoleId: 2, // Rol de miembro normal (forzamos siempre el 2 para miembros)
                Password: password
            }),
        });

        if (!memberResponse.ok) {
            if (memberResponse.status === 401) {
                throw new Error('Contraseña incorrecta o no tienes permisos para unirte a este grupo');
            }
            throw new Error('Error al unirse al grupo');
        }

        return await memberResponse.json();
    } catch (error) {
        console.error('Error en joinGroup:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return {
                GroupId: parseInt(groupId),
                UserId: parseInt(userId),
                RoleId: 2, // Siempre 2 para nuevos miembros
                Username: 'Tú',
                RoleName: 'Miembro'
            };
        }
        
        throw error;
    }
};

/**
 * Unirse a un grupo a través de un enlace de invitación
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Object>} Resultado de la operación
 */
export const joinGroupWithLink = async (groupId) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        // IMPORTANTE: el servidor debe asignar RoleId = 2 (miembro) cuando se une con enlace
        // Esta implementación asume que el backend asigna correctamente el rol de miembro
        const response = await fetch(`${BASE_URL}/groups/join/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Si el grupo requiere contraseña, devolvemos un objeto con esa información
            if (response.status === 302 || response.status === 307) {
                const locationHeader = response.headers.get('Location');
                if (locationHeader && locationHeader.includes('invite=true')) {
                    return { requiresPassword: true, groupId };
                }
            }
            throw new Error('Error al unirse al grupo a través del enlace');
        }

        // Si se ha unido exitosamente, devolvemos los datos del grupo
        return { success: true, groupId };
    } catch (error) {
        console.error('Error al unirse al grupo con enlace:', error);
        
        // Para desarrollo
        if (process.env.NODE_ENV === 'development') {
            return { success: true, groupId };
        }
        
        throw error;
    }
};

/**
 * Hace que un usuario abandone un grupo
 * @param {number} groupId - ID del grupo
 * @param {number} memberId - ID del miembro (opcional, si no se proporciona usa el userId actual)
 * @returns {Promise<boolean>} Resultado de la operación
 */
export const leaveGroup = async (groupId, memberId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const targetUserId = memberId || userId;

    try {
        const response = await fetch(`${BASE_URL}/groupmembers/${groupId}/${targetUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al abandonar el grupo');
        }

        return true;
    } catch (error) {
        console.error('Error en leaveGroup:', error);
        
        // Si estamos en desarrollo, simulamos éxito
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
        
        throw error;
    }
};

const groupsService = {
    getGroupsByUserId,
    getGroupById,
    getGroupMembers,
    getGroupTasks,
    getGroupEvents,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getAllGroups,
    generateInviteLink,
    joinGroupWithLink
};

export default groupsService;
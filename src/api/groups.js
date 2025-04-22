import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const mapGroupFromDTO = (dto) => ({
    id: dto.id,
    name: dto.name,
    membersIds: dto.membersIds,
    memberCount: dto.memberIds.length
});

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

    if (!response.ok) {
        throw new Error('Error al obtener los grupos');
    }

    const groupsData = await response.json();
    return Array.isArray(groupsData) ? groupsData.map(mapGroupFromDTO) : [mapGroupFromDTO(groupsData)];

}

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
                password: 'password123'
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
        const memberResponse = await fetch(`${BASE_URL}/groupmembers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupId: newGroup.id,
                userId: parseInt(userId),
                roleId: 1 // Rol de admin
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
                password: groupData.password
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
                password: groupData.password
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
                password: groupData.password
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
        // Verificar que la contraseña es correcta
        const groupResponse = await fetch(`${BASE_URL}/groups/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!groupResponse.ok) {
            throw new Error('Error al obtener información del grupo');
        }

        const group = await groupResponse.json();
        if (group.password !== password) {
            throw new Error('Contraseña incorrecta');
        }

        // Añadir al usuario como miembro
        const memberResponse = await fetch(`${BASE_URL}/groupmembers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupId: parseInt(groupId),
                userId: parseInt(userId),
                roleId: 2 // Rol de miembro normal
            }),
        });

        if (!memberResponse.ok) {
            throw new Error('Error al unirse al grupo');
        }

        return await memberResponse.json();
    } catch (error) {
        console.error('Error en joinGroup:', error);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (process.env.NODE_ENV === 'development') {
            return {
                userId: parseInt(userId),
                groupId: parseInt(groupId),
                roleId: 2,
                username: 'Tú',
                roleName: 'Miembro'
            };
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

export default {
    getGroupsByUserId,
    getGroupById,
    getGroupMembers,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup
};


import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const mapGroupFromDTO = (dto) => ({
    id: dto.id,
    name: dto.name,
    membersIds: dto.membersIds,
    memberCount: dto.memberIds?.length || 0,
    description: dto.description
});

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

export const createGroup = async (groupData) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
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

        const memberResponse = await fetch(`${BASE_URL}/groupmembers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupId: newGroup.id,
                userId: parseInt(userId),
                roleId: 1,
                password: groupData.password
            }),
        });

        if (!memberResponse.ok) {
            throw new Error('Error al añadir al creador como admin');
        }

        return newGroup;
    } catch (error) {
        console.error('Error en createGroup:', error);

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
        
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
        
        throw error;
    }
};

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
        
        if (process.env.NODE_ENV === 'development') {
            const inviteLink = `${window.location.origin}/#/groups/join/${groupId}`;
            return { inviteLink };
        }
        
        throw error;
    }
};

export const joinGroup = async (groupId, password) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const memberResponse = await fetch(`${BASE_URL}/groupmembers/user/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                GroupId: parseInt(groupId),
                UserId: parseInt(userId),
                RoleId: 2,
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
        
        if (process.env.NODE_ENV === 'development') {
            return {
                GroupId: parseInt(groupId),
                UserId: parseInt(userId),
                RoleId: 2,
                Username: 'Tú',
                RoleName: 'Miembro'
            };
        }
        
        throw error;
    }
};

export const joinGroupWithLink = async (groupId) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/groups/join/${groupId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 302 || response.status === 307) {
                const locationHeader = response.headers.get('Location');
                if (locationHeader && locationHeader.includes('invite=true')) {
                    return { requiresPassword: true, groupId };
                }
            }
            throw new Error('Error al unirse al grupo a través del enlace');
        }

        return { success: true, groupId };
    } catch (error) {
        console.error('Error al unirse al grupo con enlace:', error);
        
        if (process.env.NODE_ENV === 'development') {
            return { success: true, groupId };
        }
        
        throw error;
    }
};

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
import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// export const getGroups = async () => {
//     const response = await axios.get(`${BASE_URL}/groups`);
//     return response.data;
// };

// export const getGroupById = async (groupId) => {
//     const response = await axios.get(`${BASE_URL}/groups/${groupId}`);
//     return response.data;
// };

// export const addGroupEvent = async (groupId, event) => {
//     const response = await axios.post(`${BASE_URL}/groups/${groupId}/events`, event);
//     return response.data;
// };

const mapGroupFromDTO = (dto) => ({
    id: dto.id,
    name: dto.name,
    membersIds: dto.membersIds,
    memberCount: dto.memberIds.length
});

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


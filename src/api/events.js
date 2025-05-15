import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const mapEventFromDTO = (dto) => ({
    id: dto.id,
    title: dto.title,
    startDateTime: dto.startDateTime || '',
    endDateTime: dto.endDateTime || '',
    description: dto.description || '',
    notification: dto.notification || '',
    groupId: dto.groupId,
    groupName: dto.groupName || '',
    userId: dto.userId,
    username: dto.username || ''
});

export const getEvents = async (isGroup = false, groupId = null) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    let url;
    if (isGroup && groupId) {
        url = `${BASE_URL}/events/group/${groupId}`;
    } else {
        url = `${BASE_URL}/events/user/${userId}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error al obtener los eventos ${isGroup ? 'del grupo' : 'del usuario'}`);
    }

    const eventsData = await response.json();
    return Array.isArray(eventsData) ? eventsData.map(mapEventFromDTO) : [mapEventFromDTO(eventsData)];
};

export const addEvent = async (event, isGroup = false) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    const eventDTO = {
        userId: isGroup ? null : parseInt(userId),
        groupId: isGroup ? event.groupId : null,
        title: event.title,
        startDateTime: event.startDateTime || null,
        endDateTime: event.endDateTime || null,
        description: event.description || null,
        notification: event.notification || null,
    };

    console.log('eventDTO (POST)', eventDTO);

    const response = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDTO),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al añadir el evento: ${errorText || response.statusText}`);
    }

    const addedEvent = await response.json();
    return mapEventFromDTO(addedEvent);
};

export const updateEvent = async (eventId, event, isGroup = false) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || (!userId && !isGroup)) {
        throw new Error('No autenticado');
    }

    const eventDTO = {
        id: parseInt(eventId),
        userId: isGroup ? null : parseInt(userId),
        groupId: isGroup ? event.groupId : null,
        title: event.title,
        startDateTime: event.startDateTime || null,
        endDateTime: event.endDateTime || null,
        description: event.description || null,
        notification: event.notification || null,
    };

    console.log('eventDTO (PUT)', { eventId, eventDTO, url: `${BASE_URL}/events/${eventId}` });

    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDTO),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar el evento: ${errorText || response.statusText}`);
    }

    if (response.status === 204) {
        return mapEventFromDTO(eventDTO);
    }

    const updatedEvent = await response.json();
    return mapEventFromDTO(updatedEvent);
};

export const deleteEvent = async (eventId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar el evento: ${errorText || response.statusText}`);
    }

    return true;
};

export const getGroupEvents = async (groupId) => {
    return getEvents(true, groupId);
};

const eventsService = {
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getGroupEvents
};

export default eventsService;
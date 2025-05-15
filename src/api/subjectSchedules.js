import { getToken } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const formatTimeSpan = (timeSpan) => {
    if (!timeSpan) return '';
    
    if (typeof timeSpan === 'string') {
        if (timeSpan.includes(':')) {
            const parts = timeSpan.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        return timeSpan;
    }
    
    if (typeof timeSpan === 'object') {
        const hours = String(timeSpan.hours || 0).padStart(2, '0');
        const minutes = String(timeSpan.minutes || 0).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    return '';
};

const formatTimeForAPI = (timeString) => {
    if (!timeString) return null;
    
    if (timeString.split(':').length === 3) {
        return timeString;
    }
    
    return `${timeString}:00`;
};

const mapScheduleFromDTO = (dto) => ({
    id: dto.id,
    subjectId: dto.subjectId,
    dayOfWeek: dto.dayOfWeek,
    startTime: typeof dto.startTime === 'string' 
        ? dto.startTime 
        : formatTimeSpan(dto.startTime),
    durationMinutes: dto.durationMinutes,
    weekType: dto.weekType
});

export const getSchedules = async () => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjectschedules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los horarios');
        }

        const schedulesData = await response.json();
        return Array.isArray(schedulesData) 
            ? schedulesData.map(mapScheduleFromDTO) 
            : [mapScheduleFromDTO(schedulesData)];
    } catch (error) {
        console.error('Error en getSchedules:', error);
        throw error;
    }
};

export const getSchedulesBySubject = async (subjectId) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjectschedules/subject/${subjectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los horarios de la asignatura');
        }

        const schedulesData = await response.json();
        return Array.isArray(schedulesData) 
            ? schedulesData.map(mapScheduleFromDTO) 
            : [mapScheduleFromDTO(schedulesData)];
    } catch (error) {
        console.error(`Error al obtener horarios para asignatura ${subjectId}:`, error);
        throw error;
    }
};

export const addSchedule = async (schedule) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const scheduleDTO = {
            subjectId: parseInt(schedule.subjectId, 10),
            dayOfWeek: parseInt(schedule.dayOfWeek, 10),
            startTime: formatTimeForAPI(schedule.startTime),
            durationMinutes: parseInt(schedule.durationMinutes, 10),
            weekType: parseInt(schedule.weekType, 10)
        };

        const response = await fetch(`${BASE_URL}/subjectschedules`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleDTO),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al añadir el horario: ${errorText || response.statusText}`);
        }

        const addedSchedule = await response.json();
        return mapScheduleFromDTO(addedSchedule);
    } catch (error) {
        console.error('Error en addSchedule:', error);
        throw error;
    }
};

export const updateSchedule = async (scheduleId, schedule) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const scheduleDTO = {
            id: parseInt(scheduleId, 10),
            subjectId: parseInt(schedule.subjectId, 10),
            dayOfWeek: parseInt(schedule.dayOfWeek, 10),
            startTime: formatTimeForAPI(schedule.startTime),
            durationMinutes: parseInt(schedule.durationMinutes, 10),
            weekType: parseInt(schedule.weekType, 10)
        };

        const response = await fetch(`${BASE_URL}/subjectschedules/${scheduleId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleDTO),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar el horario: ${errorText || response.statusText}`);
        }

        if (response.status === 204) {
            return {
                id: scheduleId,
                ...schedule
            };
        }

        const updatedSchedule = await response.json();
        return mapScheduleFromDTO(updatedSchedule);
    } catch (error) {
        console.error(`Error al actualizar horario ${scheduleId}:`, error);
        throw error;
    }
};

export const deleteSchedule = async (scheduleId) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjectschedules/${scheduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar el horario: ${errorText || response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`Error al eliminar horario ${scheduleId}:`, error);
        throw error;
    }
};

const schedulesService = {
    getSchedules,
    getSchedulesBySubject,
    addSchedule,
    updateSchedule,
    deleteSchedule
};

export default schedulesService;
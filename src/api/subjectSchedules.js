// src/api/subjectSchedules.js
import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Convertir TimeSpan de C# a formato de hora legible
const formatTimeSpan = (timeSpan) => {
    if (!timeSpan) return '';
    
    // Si es un string (HH:mm:ss), lo convertimos a HH:mm
    if (typeof timeSpan === 'string') {
        if (timeSpan.includes(':')) {
            const parts = timeSpan.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        return timeSpan;
    }
    
    // Si es un objeto TimeSpan de .NET
    if (typeof timeSpan === 'object') {
        const hours = String(timeSpan.hours || 0).padStart(2, '0');
        const minutes = String(timeSpan.minutes || 0).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    return '';
};

// Convertir formato de hora HH:MM a HH:MM:SS para el API
const formatTimeForAPI = (timeString) => {
    if (!timeString) return null;
    
    // Si ya tiene segundos (HH:MM:SS), lo devolvemos tal cual
    if (timeString.split(':').length === 3) {
        return timeString;
    }
    
    // Si solo tiene horas y minutos (HH:MM), añadimos los segundos
    return `${timeString}:00`;
};

// Mapear la respuesta del API a nuestro formato
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

// Obtener todos los horarios
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

// Obtener horarios por asignatura
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

// Añadir un nuevo horario
export const addSchedule = async (schedule) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        // Preparar los datos para enviar al API
        const scheduleDTO = {
            subjectId: parseInt(schedule.subjectId, 10),
            dayOfWeek: parseInt(schedule.dayOfWeek, 10),
            startTime: formatTimeForAPI(schedule.startTime), // Usar formato HH:MM:SS
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

// Actualizar un horario existente
export const updateSchedule = async (scheduleId, schedule) => {
    const token = await getToken();
    
    if (!token) {
        throw new Error('No autenticado');
    }

    try {
        // Preparar los datos para enviar al API
        const scheduleDTO = {
            id: parseInt(scheduleId, 10),
            subjectId: parseInt(schedule.subjectId, 10),
            dayOfWeek: parseInt(schedule.dayOfWeek, 10),
            startTime: formatTimeForAPI(schedule.startTime), // Usar formato HH:MM:SS
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

        // Si el servidor devuelve No Content (204)
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

// Eliminar un horario
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

export default {
    getSchedules,
    getSchedulesBySubject,
    addSchedule,
    updateSchedule,
    deleteSchedule
};
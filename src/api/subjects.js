import { getToken, getUserId } from './auth';
import { addSchedule } from './subjectSchedules';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const mapSubjectFromDTO = (dto) => ({
    id: dto.id,
    title: dto.title,
    userId: dto.userId,
    username: dto.username || '',
    schedules: dto.schedules || []
});

export const getSubjects = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjects/withSchedules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener las asignaturas');
        }

        const subjectsData = await response.json();
        return Array.isArray(subjectsData) 
            ? subjectsData.map(mapSubjectFromDTO) 
            : [mapSubjectFromDTO(subjectsData)];
    } catch (error) {
        console.error('Error en getSubjects:', error);
        throw error;
    }
};

export const getSubjectsByUser = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjects/user/${userId}/withSchedules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener las asignaturas del usuario');
        }

        const subjectsData = await response.json();
        return Array.isArray(subjectsData) 
            ? subjectsData.map(mapSubjectFromDTO) 
            : [mapSubjectFromDTO(subjectsData)];
    } catch (error) {
        console.error('Error en getSubjectsByUser:', error);
        throw error;
    }
};

export const addSubject = async (subject, schedules = []) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const subjectDTO = {
            title: subject.title || subject,
            userId: parseInt(userId, 10)
        };

        const response = await fetch(`${BASE_URL}/subjects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subjectDTO),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al añadir la asignatura: ${errorText || response.statusText}`);
        }

        const addedSubject = await response.json();
        
        if (schedules && schedules.length > 0) {
            const addedSchedules = [];
            
            for (const schedule of schedules) {
                if (schedule.isTemporary) {
                    const scheduleToAdd = {
                        ...schedule,
                        subjectId: addedSubject.id
                    };
                    delete scheduleToAdd.isTemporary;
                    delete scheduleToAdd.id;
                    
                    const addedSchedule = await addSchedule(scheduleToAdd);
                    addedSchedules.push(addedSchedule);
                }
            }
            
            return {
                ...mapSubjectFromDTO(addedSubject),
                schedules: addedSchedules
            };
        }
        
        return mapSubjectFromDTO(addedSubject);
    } catch (error) {
        console.error('Error en addSubject:', error);
        throw error;
    }
};

export const updateSubject = async (subjectId, subject, schedules = []) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const subjectDTO = {
            id: parseInt(subjectId, 10),
            title: subject.title || subject,
            userId: parseInt(userId, 10)
        };

        const response = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subjectDTO),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar la asignatura: ${errorText || response.statusText}`);
        }

        if (schedules && schedules.length > 0) {
            for (const schedule of schedules) {
                if (schedule.isTemporary) {
                    const scheduleToAdd = {
                        ...schedule,
                        subjectId: parseInt(subjectId, 10)
                    };
                    delete scheduleToAdd.isTemporary;
                    delete scheduleToAdd.id;
                    
                    await addSchedule(scheduleToAdd);
                }
            }
        }

        if (response.status === 204) {
            return {
                id: parseInt(subjectId, 10),
                title: subject.title || subject,
                userId: parseInt(userId, 10)
            };
        }

        const updatedSubject = await response.json();
        return mapSubjectFromDTO(updatedSubject);
    } catch (error) {
        console.error(`Error al actualizar asignatura ${subjectId}:`, error);
        throw error;
    }
};

export const deleteSubject = async (subjectId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    try {
        const response = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar la asignatura: ${errorText || response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`Error al eliminar asignatura ${subjectId}:`, error);
        throw error;
    }
};

const subjectsService = {
    getSubjects,
    getSubjectsByUser,
    addSubject,
    updateSubject,
    deleteSubject
};

export default subjectsService;
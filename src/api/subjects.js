// src/api/subjects.js
import { getToken, getUserId } from './auth';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const getSubjects = async () => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const response = await fetch(`${BASE_URL}/subjects/user/${userId}`, {
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
    return subjectsData.map((subject) => ({
        id: subject.id,
        title: subject.title,
    }));
};

export const addSubject = async (subject) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const subjectDTO = {
        title: subject.title,
        userId: parseInt(userId),
    };

    console.log('subjectDTO (POST)', subjectDTO);

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
    return {
        id: addedSubject.id,
        title: addedSubject.title,
    };
};

export const updateSubject = async (subjectId, subject) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

    const subjectDTO = {
        id: parseInt(subjectId),
        title: subject.title,
        userId: parseInt(userId),
    };

    console.log('subjectDTO (PUT)', { subjectId, subjectDTO, url: `${BASE_URL}/subjects/${subjectId}` });

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

    // Manejar 204 No Content
    if (response.status === 204) {
        return {
            id: subjectDTO.id,
            title: subjectDTO.title,
        };
    }

    const updatedSubject = await response.json();
    return {
        id: updatedSubject.id,
        title: updatedSubject.title,
    };
};

export const deleteSubject = async (subjectId) => {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
        throw new Error('No autenticado');
    }

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
};
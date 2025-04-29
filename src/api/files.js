import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const uploadFile = async (file, fileType, userId, subjectId, groupId, taskId, token) => {
    const formData = new FormData();
    formData.append('File', file);
    
    // Mapear fileType del frontend a FileType del backend
    const fileTypeMap = {
        'Apuntes': 'SubjectResource',
        'Exámenes': 'SubjectResource',
        'Trabajos': 'SubjectResource'
    };
    formData.append('FileType', fileTypeMap[fileType] || 'SubjectResource'); // Por defecto, usa SubjectResource
    
    formData.append('SubjectId', subjectId ? subjectId.toString() : '');
    formData.append('GroupId', groupId ? groupId.toString() : '');
    formData.append('TaskId', taskId ? taskId.toString() : '');

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }
    try {
        const response = await axios.post(`${BASE_URL}/file/upload`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        const errorDetails = error.response?.data?.errors
            ? JSON.stringify(error.response.data.errors, null, 2)
            : error.response?.data?.title || error.message;
        console.error('Error uploading file:', errorDetails);
        throw new Error(errorDetails);
    }
};

// Descargar un archivo
export const downloadFile = async (fileId, token) => {
    try {
        const response = await axios.get(`${BASE_URL}/file/download/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob', // Para manejar archivos binarios
        });
        return response;
    } catch (error) {
        console.error('Error downloading file:', error.response?.data || error.message);
        throw new Error(error.response?.data || 'Error al descargar el archivo');
    }
};

// Obtener archivos por asignatura (nuevo endpoint que necesitarás en el backend)
export const getFilesBySubject = async (subjectId, token) => {
    try {
        const response = await axios.get(`${BASE_URL}/file/subject/${subjectId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching files by subject:', error.response?.data || error.message);
        throw new Error(error.response?.data || 'Error al obtener los archivos');
    }
};

export const deleteFile = async (fileId, token) => {
    try {
        const response = await axios.delete(`${BASE_URL}/file/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // NoContent no devuelve datos, pero axios resuelve la promesa
    } catch (error) {
        const errorDetails = error.response?.data?.title || error.message;
        console.error('Error deleting file:', errorDetails);
        throw new Error(errorDetails);
    }
};
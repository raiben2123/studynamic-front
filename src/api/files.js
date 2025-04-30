// Constantes para FileType (deben coincidir con el enum FileType del backend)
const FileType = {
  SubjectResource: 0,
  TaskAttachment: 1,
  GroupResource: 2,
  ProfilePicture: 3
};

// Obtener archivos por carpeta
export const getFilesByFolder = async (folderId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/folder/${folderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener archivos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files by folder:', error);
    throw error;
  }
};

// src/api/files.js

// El API_URL es la URL base para las solicitudes a la API
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  // Intenta obtener el token del localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    // Si no existe en localStorage, intentar obtenerlo desde la sesión
    return sessionStorage.getItem('token');
  }
  return token;
};

// Obtener archivos por tarea
export const getFilesByTask = async (taskId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener archivos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files by task:', error);
    throw error;
  }
};

// Obtener archivos por asignatura
export const getFilesBySubject = async (subjectId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/subject/${subjectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener archivos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files by subject:', error);
    throw error;
  }
};

// Obtener archivos por grupo
export const getFilesByGroup = async (groupId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/group/${groupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener archivos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching files by group:', error);
    throw error;
  }
};

// Descargar archivo
export const downloadFile = (fileId) => {
  const token = getAuthToken();
  return `${API_URL}/file/download/${fileId}?token=${token}`;
};

export const uploadFile = async (file, fileType, userId = null, subjectId = null, groupId = null, taskId = null, folderId = null) => {
  try {
    console.log('uploadFile recibió los siguientes parámetros:');
    console.log('- file:', file.name, file.type, file.size);
    console.log('- fileType:', fileType);
    console.log('- userId:', userId);
    console.log('- subjectId:', subjectId);
    console.log('- groupId:', groupId);
    console.log('- taskId:', taskId);
    console.log('- folderId:', folderId);
    
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    // Mapear el tipo de archivo al enum correspondiente
    let fileTypeEnum;
    if (typeof fileType === 'string') {
      // Si es un string, hacer la conversión según el valor
      switch (fileType) {
        case 'GroupResource':
          fileTypeEnum = FileType.GroupResource;
          break;
        case 'TaskAttachment':
          fileTypeEnum = FileType.TaskAttachment;
          break;
        case 'ProfilePicture':
          fileTypeEnum = FileType.ProfilePicture;
          break;
        default:
          fileTypeEnum = FileType.SubjectResource;
      }
    } else if (typeof fileType === 'number' && fileType >= 0 && fileType <= 3) {
      // Si ya es un número válido, usarlo directamente
      fileTypeEnum = fileType;
    } else {
      // Valor por defecto
      fileTypeEnum = FileType.SubjectResource;
    }
    
    console.log('- fileTypeEnum (convertido):', fileTypeEnum);
    
    formData.append('fileType', fileTypeEnum);
    formData.append('fileName', file.name);

    if (userId) formData.append('userId', userId);
    if (subjectId) formData.append('subjectId', subjectId);
    if (groupId) formData.append('groupId', groupId);
    if (taskId) formData.append('taskId', taskId);
    if (folderId) formData.append('folderId', folderId);
    
    console.log('Enviando solicitud a', `${API_URL}/file/upload`);
    
    const response = await fetch(`${API_URL}/file/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      // Intentar obtener más información sobre el error
      let errorDetail = '';
      try {
        const errorData = await response.text();
        errorDetail = errorData ? `: ${errorData}` : '';
      } catch (e) {}
      
      throw new Error(`Error al subir archivo: ${response.status}${errorDetail}`);
    }

    const result = await response.json();
    console.log('Respuesta exitosa:', result);
    return result;
  } catch (error) {
    console.error('Error detallado al subir archivo:', error);
    throw error;
  }
};

// Renombrar archivo
export const renameFile = async (fileId, newFileName) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/rename/${fileId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newFileName })
    });

    if (!response.ok) {
      throw new Error(`Error al renombrar archivo: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};

// Eliminar archivo
export const deleteFile = async (fileId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/file/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar archivo: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Actualizar el contenido de un archivo
export const updateFileContent = async (fileId, file) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/file/update/${fileId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar archivo: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating file content:', error);
    throw error;
  }
};

// Obtener URL de descarga
export const getDownloadUrl = (fileId) => {
  const token = getAuthToken();
  return `${API_URL}/file/download/${fileId}?token=${token}`;
};

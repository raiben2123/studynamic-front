const FileType = {
  SubjectResource: 0,
  TaskAttachment: 1,
  GroupResource: 2,
  ProfilePicture: 3
};

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

const API_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return sessionStorage.getItem('token');
  }
  return token;
};

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
    
    let fileTypeEnum;
    if (typeof fileType === 'string') {
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
      fileTypeEnum = fileType;
    } else {
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

export const getDownloadUrl = (fileId) => {
  const token = getAuthToken();
  return `${API_URL}/file/download/${fileId}?token=${token}`;
};

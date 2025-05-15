const API_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return sessionStorage.getItem('token');
  }
  return token;
};

export const getGroupFolders = async (groupId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/group/${groupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener carpetas del grupo: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching folders for group ${groupId}:`, error);
    throw error;
  }
};

export const getUserFolders = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener carpetas: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user folders:', error);
    throw error;
  }
};

export const getFoldersBySubject = async (subjectId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/subject/${subjectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener carpetas de la asignatura: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching folders for subject ${subjectId}:`, error);
    throw error;
  }
};

export const createFolder = async (name, description, userId = null, groupId = null, subjectId = null, type = 4) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        userId,
        groupId,
        subjectId,
        type
      })
    });

    if (!response.ok) {
      throw new Error(`Error al crear carpeta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const createStandardFoldersForSubject = async (subjectId, userId) => {
  try {
    const existingFolders = await getFoldersBySubject(subjectId);

    const standardFolders = [
      { name: 'Apuntes', type: 1, description: 'Apuntes de clase' },
      { name: 'Exámenes', type: 2, description: 'Exámenes anteriores' },
      { name: 'Trabajos', type: 3, description: 'Trabajos y tareas' },
    ];

    const folderMap = {};

    for (const existingFolder of existingFolders) {
      if (existingFolder.name === 'Apuntes') {
        folderMap.Apuntes = existingFolder.id;
      } else if (existingFolder.name === 'Exámenes') {
        folderMap.Exámenes = existingFolder.id;
      } else if (existingFolder.name === 'Trabajos') {
        folderMap.Trabajos = existingFolder.id;
      }
    }

    const createdFolders = [];
    for (const folder of standardFolders) {
      let folderType = folder.name;

      if (!folderMap[folderType]) {
        const newFolder = await createFolder(
          folder.name,
          folder.description,
          userId,
          null,
          subjectId,
          folder.type
        );
        folderMap[folderType] = newFolder.id;
        createdFolders.push(newFolder);
      }
    }

    return {
      folders: existingFolders.concat(createdFolders),
      folderMap: {
        Apuntes: folderMap.Apuntes,
        Exámenes: folderMap.Exámenes,
        Trabajos: folderMap.Trabajos
      }
    };
  } catch (error) {
    console.error(`Error creating standard folders for subject ${subjectId}:`, error);
    throw error;
  }
};

export const updateFolder = async (id, name, description, type) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        name,
        description,
        type
      })
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar carpeta: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

export const deleteFolder = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar carpeta: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

export const addFileToFolder = async (folderId, fileId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/${folderId}/files/${fileId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al añadir archivo a carpeta: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding file to folder:', error);
    throw error;
  }
};

export const moveFileToFolder = async (fileId, newFolderId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/folders/files/${fileId}/move/${newFolderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al mover archivo: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error moving file to folder:', error);
    throw error;
  }
};

const folderService = {
  getUserFolders,
  getFoldersBySubject,
  getGroupFolders,
  createFolder,
  createStandardFoldersForSubject,
  updateFolder,
  deleteFolder,
  addFileToFolder,
  moveFileToFolder
};

export default folderService;

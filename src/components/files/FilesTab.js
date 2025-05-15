import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaFolder, FaFolderOpen, FaPlus } from 'react-icons/fa';
import FilesList from './FilesList';
import FileUpload from './FileUpload';
import { getFilesByGroup, getFilesByFolder } from '../../api/files';
import { getGroupFolders, createFolder } from '../../api/folders';

const FilesTab = ({ groupId }) => {
  const [activeFolder, setActiveFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  
  useEffect(() => {
    const loadFolders = async () => {
      if (!groupId) return;
      
      setLoading(true);
      try {
        const groupFolders = await getGroupFolders(groupId);
        console.log('Carpetas del grupo obtenidas:', groupFolders);
        
        setFolders(groupFolders);
        
        if (groupFolders.length > 0 && !activeFolder) {
          setActiveFolder(groupFolders[0].id);
        }
      } catch (error) {
        console.error('Error loading group folders:', error);
        const defaultFolders = [
          { id: 'general', name: 'General', files: [] },
          { id: 'assignments', name: 'Tareas', files: [] },
          { id: 'resources', name: 'Recursos', files: [] }
        ];
        
        setFolders(defaultFolders);
        
        if (!activeFolder) {
          setActiveFolder('general');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadFolders();
  }, [groupId]);
  
  useEffect(() => {
    const loadFiles = async () => {
      if (!activeFolder) return;
      
      setFileLoading(true);
      try {
        let folderFiles;
        
        if (typeof activeFolder === 'string') {
          folderFiles = await getFilesByGroup(parseInt(groupId));
        } else {
          folderFiles = await getFilesByFolder(activeFolder);
        }
        
        setFiles(folderFiles || []);
      } catch (error) {
        console.error('Error loading folder files:', error);
        setFiles([]);
      } finally {
        setFileLoading(false);
      }
    };
    
    loadFiles();
  }, [activeFolder, groupId]);
  
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const newFolder = await createFolder(
        newFolderName.trim(),
        `Carpeta creada por usuario`,
        null,
        parseInt(groupId),
        null,
        4
      );

      setFolders([...folders, newFolder]);
      
      setNewFolderName('');
      setShowNewFolderInput(false);
      
      setActiveFolder(newFolder.id);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  
  const handleFileUploaded = (file) => {
    setFiles([...files, file]);
  };
  
  const handleRefreshFiles = async () => {
    if (!activeFolder) return;
    
    try {
      setFileLoading(true);
      
      let refreshedFiles;
      
      if (typeof activeFolder === 'string') {
        refreshedFiles = await getFilesByGroup(parseInt(groupId));
      } else {
        refreshedFiles = await getFilesByFolder(activeFolder);
      }
      
      setFiles(refreshedFiles || []);
    } catch (error) {
      console.error('Error refreshing files:', error);
    } finally {
      setFileLoading(false);
    }
  };
  
  const getActiveFolder = () => {
    if (!activeFolder) return null;
    return folders.find(f => f.id === activeFolder);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Archivos del Grupo</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2">
          {folders.length === 0 && !loading ? (
            <div className="text-center p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
              <p className="mb-3 text-sm text-text-secondary">
                No hay carpetas creadas en este grupo.
              </p>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm"
              >
                Crear primera carpeta
              </button>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              <p className="mb-4">Primero debes crear carpetas en este grupo.</p>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
              >
                Crear primera carpeta
              </button>
            </div>
          ) : (
            folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-left ${
                  activeFolder === folder.id 
                    ? 'bg-primary text-white' 
                    : 'bg-input-bg text-text hover:bg-primary-light'
                }`}
              >
                {activeFolder === folder.id ? (
                  <FaFolderOpen className="mr-2" />
                ) : (
                  <FaFolder className="mr-2" />
                )}
                <span className="truncate">{folder.name}</span>
                {folder.files && folder.files.length > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                    activeFolder === folder.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {folder.files.length}
                  </span>
                )}
              </button>
            ))
          )}
          
          {showNewFolderInput ? (
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Nombre de carpeta"
                className="flex-1 p-2 text-sm border border-border rounded bg-input-bg text-text"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddFolder();
                  if (e.key === 'Escape') {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }
                }}
              />
              <button
                onClick={handleAddFolder}
                className="p-2 bg-primary text-white rounded"
                disabled={!newFolderName.trim()}
              >
                <FaPlus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center w-full px-4 py-2 rounded-lg text-left bg-input-bg text-text-secondary hover:bg-primary-light"
            >
              <FaPlus className="mr-2" />
              <span>Nueva carpeta</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 border border-border rounded-lg p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : activeFolder ? (
            <div className="space-y-6">
              <div className="border-b border-border pb-4 mb-4">
                <h3 className="text-lg font-medium text-text mb-4">
                  {getActiveFolder()?.name || 'Carpeta'} 
                </h3>
                
                <FileUpload 
                  fileType="GroupResource"
                  groupId={parseInt(groupId)}
                  folderId={typeof activeFolder === 'string' ? null : activeFolder}
                  onUploadSuccess={handleFileUploaded}
                  buttonText="Subir archivo"
                />
              </div>
              
              {fileLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <FilesList 
                  files={files}
                  onRefresh={handleRefreshFiles}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-text-secondary">
              {folders.length === 0 ?
                <>
                  <p className="mb-4">No hay carpetas creadas en este grupo.</p>
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    Crear primera carpeta
                  </button>
                </>
              :
                <p>Selecciona una carpeta para ver sus archivos</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FilesTab.propTypes = {
  groupId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default FilesTab;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFile, FaFileAlt, FaFileExcel, FaFilePdf, FaFilePowerpoint, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import { renameFile, deleteFile, getDownloadUrl } from '../../api/files';

const FilesList = ({ files, onRename, onDelete, onRefresh }) => {
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState('');

  const getFileIcon = (fileExtension) => {
    const extension = fileExtension.toLowerCase();
    
    if (extension === '.pdf') return <FaFilePdf className="text-red-500" />;
    if (['.xls', '.xlsx', '.csv'].includes(extension)) return <FaFileExcel className="text-green-600" />;
    if (['.ppt', '.pptx'].includes(extension)) return <FaFilePowerpoint className="text-orange-500" />;
    if (['.doc', '.docx', '.txt'].includes(extension)) return <FaFileAlt className="text-blue-500" />;
    return <FaFile className="text-primary" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleStartEdit = (file) => {
    setEditingFile(file);
    const nameWithoutExtension = file.fileName.split('.').slice(0, -1).join('.');
    setNewFileName(nameWithoutExtension);
  };

  const handleSaveEdit = async () => {
    if (!newFileName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    try {
      await renameFile(editingFile.id, newFileName);
      setEditingFile(null);
      setError('');
      
      if (onRename) {
        onRename(editingFile.id, newFileName);
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      setError('Error al renombrar el archivo');
      console.error('Error renaming file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      
      if (onDelete) {
        onDelete(fileId);
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Error al eliminar el archivo');
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-6 bg-input-bg rounded-lg">
        <p className="text-text-secondary">No hay archivos adjuntos</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="mb-2 text-sm text-error bg-error/10 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-input-bg">
            <tr>
              <th className="px-4 py-2 text-left text-xs uppercase text-text-secondary">Archivo</th>
              <th className="px-4 py-2 text-left text-xs uppercase text-text-secondary">Tamaño</th>
              <th className="px-4 py-2 text-left text-xs uppercase text-text-secondary">Fecha</th>
              <th className="px-4 py-2 text-left text-xs uppercase text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-border hover:bg-input-bg">
                <td className="px-4 py-3">
                  {editingFile && editingFile.id === file.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="block w-full p-1 text-sm border border-border rounded bg-input-bg text-text"
                        autoFocus
                      />
                      <span className="ml-1 text-text-secondary">{file.fileExtension}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">{getFileIcon(file.fileExtension)}</span>
                      {file.fileName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {formatFileSize(file.fileSize)}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {editingFile && editingFile.id === file.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-primary hover:text-accent"
                        aria-label="Guardar"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingFile(null);
                          setError('');
                        }}
                        className="p-1 text-text-secondary hover:text-error"
                        aria-label="Cancelar"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <a
                        href={getDownloadUrl(file.id)}
                        download
                        className="p-1 text-primary hover:text-accent transition"
                        aria-label="Descargar archivo"
                      >
                        <FaDownload size={16} />
                      </a>
                      <button
                        onClick={() => handleStartEdit(file)}
                        className="p-1 text-text-secondary hover:text-primary transition"
                        aria-label="Renombrar archivo"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1 text-text-secondary hover:text-error transition"
                        aria-label="Eliminar archivo"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

FilesList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      fileName: PropTypes.string.isRequired,
      fileExtension: PropTypes.string.isRequired,
      fileSize: PropTypes.number.isRequired,
      uploadDate: PropTypes.string.isRequired,
      fileUrl: PropTypes.string
    })
  ).isRequired,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func
};

export default FilesList;

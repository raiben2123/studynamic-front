import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { uploadFile } from '../../api/files';
import { useAuth } from '../../context/AuthContext';

const FileUpload = ({ fileType, subjectId, groupId, taskId, folderId, onUploadSuccess, buttonText = 'Subir archivo' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { userId } = useAuth(); // Obtener el userId del contexto de autenticación

  // Validar el tipo de archivo
  const validateFile = (file) => {
    // Extensiones permitidas
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'
    ];
    
    // Tamaño máximo en bytes (10MB)
    const maxSize = 10 * 1024 * 1024;
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'El tipo de archivo no está permitido. Solo se permiten archivos PDF, Word, Excel, PowerPoint y TXT.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
      };
    }
    
    return { valid: true };
  };

  // Manejar click en el botón de subida
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Manejar cambio en el input de archivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validar el archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
  
    setLoading(true);
    setError('');
    
    console.log('Subiendo archivo con los siguientes parámetros:');
    console.log('- fileType:', fileType);
    console.log('- userId:', userId);
    console.log('- subjectId:', subjectId);
    console.log('- groupId:', groupId);
    console.log('- taskId:', taskId);
    console.log('- folderId:', folderId);
  
    try {
      const uploadedFile = await uploadFile(file, fileType, userId, subjectId, groupId, taskId, folderId);
      
      console.log('Archivo subido exitosamente:', uploadedFile);
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadedFile);
      }
      
      // Limpiar el input para permitir subir el mismo archivo de nuevo si es necesario
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error al subir el archivo. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-error bg-error/10 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />
        
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg
            ${loading ? 'bg-primary/70' : 'bg-primary hover:bg-accent'} 
            text-white transition-colors duration-200`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <FaUpload />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>
      
      <p className="mt-2 text-xs text-text-secondary">
        Formatos permitidos: PDF, Word, Excel, PowerPoint, TXT. Tamaño máximo: 10MB
      </p>
    </div>
  );
};

FileUpload.propTypes = {
  fileType: PropTypes.string.isRequired,
  subjectId: PropTypes.number,
  groupId: PropTypes.number,
  taskId: PropTypes.number,
  folderId: PropTypes.number,
  onUploadSuccess: PropTypes.func,
  buttonText: PropTypes.string
};

export default FileUpload;

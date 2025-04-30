import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaCamera, FaSpinner, FaUser } from 'react-icons/fa';
import { uploadProfilePicture } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const ProfilePictureUploader = ({ onSuccess, size = 'md' }) => {
  const { userId, updateProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar imagen existente si hay
  useEffect(() => {
    if (user && user.profilePicture) {
      setPreview(user.profilePicture);
    }
  }, [user]);

  // Obtener el userId del contexto de autenticación
  useEffect(() => {
    if (!userId) {
      console.warn('El ID de usuario no está disponible en el contexto de autenticación');
    } else {
      console.log('ProfilePictureUploader - userId cargado:', userId);
    }
  }, [userId]);

  // Determinar tamaño del componente
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16';
      case 'lg':
        return 'w-32 h-32';
      case 'xl':
        return 'w-40 h-40';
      case 'md':
      default:
        return 'w-24 h-24';
    }
  };

  // Validar la imagen subida
  const validateImage = (file) => {
    // Verificar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'El formato del archivo no es válido. Por favor, sube una imagen JPG, PNG o GIF.'
      };
    }

    // Verificar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'La imagen es demasiado grande. El tamaño máximo permitido es de 2MB.'
      };
    }

    return { valid: true };
  };

  // Manejar el clic en el botón de subida
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Manejar cambio en el input de archivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar archivo
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setLoading(true);
    setError('');

    try {
      if (!userId) {
        throw new Error('ID de usuario no disponible. Por favor, inicia sesión nuevamente.');
      }
      
      console.log('Enviando foto con userId:', userId);
      const result = await uploadProfilePicture(userId, file);
      
      // Actualizar perfil en el contexto de autenticación
      if (updateProfile) {
        await updateProfile({ profilePicture: result.profilePicture });
      }
      
      if (onSuccess) {
        onSuccess(result.profilePicture);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(`Error al subir la imagen: ${error.message || 'Intenta iniciando sesión nuevamente.'}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${getSizeClass()} bg-input-bg rounded-full overflow-hidden flex items-center justify-center border border-border group cursor-pointer`}
        onClick={handleUploadClick}
      >
        {/* Preview de la imagen o placeholder */}
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUser className="w-1/2 h-1/2 text-text-secondary" />
        )}

        {/* Overlay para hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {loading ? (
            <FaSpinner className="animate-spin text-white text-xl" />
          ) : (
            <FaCamera className="text-white text-xl" />
          )}
        </div>

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-2 text-xs text-error text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Texto de ayuda */}
      <div className="mt-2 text-xs text-text-secondary text-center">
        Haz clic para cambiar tu foto de perfil
      </div>
    </div>
  );
};

ProfilePictureUploader.propTypes = {
  onSuccess: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};

export default ProfilePictureUploader;
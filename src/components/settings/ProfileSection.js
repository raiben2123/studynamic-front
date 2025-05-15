import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProfileSection = ({ 
    firstName,
    lastName,
    profilePicture,
    defaultImage,
    onProfileUpdate
}) => {
    const [previewImage, setPreviewImage] = useState(profilePicture);
    const [newFirstName, setNewFirstName] = useState(firstName);
    const [newLastName, setNewLastName] = useState(lastName);
    const fileInputRef = useRef(null);
    
    useEffect(() => {
        setNewFirstName(firstName);
        setNewLastName(lastName);
        setPreviewImage(profilePicture);
    }, [firstName, lastName, profilePicture]);
    
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen es demasiado grande. El tamaño máximo es 2MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        onProfileUpdate({
            firstName: newFirstName,
            lastName: newLastName,
            profilePicture: previewImage
        });
    };
    
    const handleRemovePhoto = () => {
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
            <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>
            
            <div className="mb-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-[#467BAA]">
                    <img 
                        src={previewImage || defaultImage} 
                        alt="Perfil"
                        className="w-full h-full object-cover"
                    />
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                >
                    Cambiar foto
                </button>
                {previewImage && (
                    <button
                        onClick={handleRemovePhoto}
                        className="mt-2 text-red-500 hover:text-red-700"
                    >
                        Eliminar foto
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
                        placeholder="Introduce tu nombre"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                        Apellidos
                    </label>
                    <input
                        type="text"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#467BAA]"
                        placeholder="Introduce tus apellidos"
                    />
                </div>
                
                <div className="pt-4">
                    <button
                        onClick={handleSaveChanges}
                        className="w-full p-2 bg-[#467BAA] text-white rounded hover:bg-[#5aa0f2] transition"
                    >
                        Actualizar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

ProfileSection.propTypes = {
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    profilePicture: PropTypes.string,
    defaultImage: PropTypes.string.isRequired,
    onProfileUpdate: PropTypes.func.isRequired
};

ProfileSection.defaultProps = {
    firstName: '',
    lastName: '',
    profilePicture: null
};

export default ProfileSection;
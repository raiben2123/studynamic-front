// src/pages/SettingsPage.js - actualizado para manejar correctamente el tema
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import defaultProfile1 from '../assets/default_profile_picture1.png';
import { applyTheme, colorThemes } from '../services/themeService';

const SettingsPage = () => {
    const { user, userTheme, updateProfile, loading: authLoading } = useAuth();
    const [savedMessage, setSavedMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState('default');

    useEffect(() => {
        // Cargar datos del usuario
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPreviewImage(user.profilePicture || null);
        }

        // Cargar tema guardado
        if (userTheme) {
            setSelectedTheme(userTheme);
        }
    }, [user, userTheme]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            // Limitar tamaño a 2MB
            if (file.size > 2 * 1024 * 1024) {
                setError('La imagen es demasiado grande. El tamaño máximo es 2MB.');
                return;
            }

            setProfilePicture(file);

            // Mostrar vista previa
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThemeChange = (themeId) => {
        setSelectedTheme(themeId);
    };

    const handleRemovePhoto = () => {
        setProfilePicture(null);
        setPreviewImage(null);
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            setError(null);

            // Preparar datos para actualización
            const updateData = {};

            // Solo incluir campos que han cambiado
            if (name !== (user?.name || '')) {
                updateData.name = name;
            }

            if (email !== (user?.email || '')) {
                updateData.email = email;
            }

            if (selectedTheme !== userTheme) {
                updateData.theme = selectedTheme;
                setSelectedTheme(selectedTheme);
                applyTheme(selectedTheme);
            }

            // Incluir foto de perfil solo si se cambió
            if (profilePicture) {
                updateData.profilePicture = profilePicture;
            }

            if (Object.keys(updateData).length === 0 && !profilePicture) {
                setSavedMessage('No hay cambios que guardar');
                setTimeout(() => setSavedMessage(''), 3000);
                setLoading(false);
                return;
            }

            // Actualizar perfil a través del contexto
            const success = await updateProfile(updateData);

            if (success) {
                setSavedMessage('Cambios guardados correctamente');
                setTimeout(() => setSavedMessage(''), 3000);
            } else {
                setError('No se pudieron guardar los cambios');
            }
        } catch (err) {
            console.error('Error guardando cambios:', err);
            setError(err.message || 'Error al actualizar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleResetToDefault = () => {
        if (window.confirm('¿Estás seguro de que quieres restaurar la configuración predeterminada?')) {
            setSelectedTheme('default');

            updateProfile({
                theme: 'default'
            });

            setSavedMessage('Configuración restaurada a valores predeterminados');
            setTimeout(() => setSavedMessage(''), 3000);
        }
    };

    // Determinar si hay cambios sin guardar
    const hasUnsavedChanges = () => {
        if (!user) return false;

        return name !== (user.name || '') ||
            email !== (user.email || '') ||
            profilePicture !== null ||
            selectedTheme !== userTheme;
    };

    // Obtener el color primario según el tema seleccionado
    const getThemeColors = (themeId) => {
        switch (themeId) {
            case 'dark':
                return {
                    primary: '#2c3e50',
                    secondary: '#f39c12',
                    accent: '#3498db',
                    background: '#1a1a1a'
                };
            case 'green':
                return {
                    primary: '#27ae60',
                    secondary: '#f1c40f',
                    accent: '#2ecc71',
                    background: '#e8f5e9'
                };
            case 'purple':
                return {
                    primary: '#8e44ad',
                    secondary: '#e74c3c',
                    accent: '#9b59b6',
                    background: '#f3e5f5'
                };
            default:
                return {
                    primary: '#467BAA',
                    secondary: '#f5a623',
                    accent: '#5aa0f2',
                    background: '#e6f0fa'
                };
        }
    };

    return (
        <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div
                className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8"
                style={{
                    backgroundImage: `url(${Logo})`,
                    backgroundSize: '50%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 1,
                    position: 'relative',
                }}
            >
                <div className="relative z-10">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {savedMessage && (
                        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                            {savedMessage}
                        </div>
                    )}

                    <h1 className="text-2xl md:text-3xl mb-6">Configuración</h1>

                    {authLoading || loading ? (
                        <div className="bg-white p-6 rounded-xl shadow-md flex justify-center items-center">
                            <p className="text-gray-500">Cargando...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Perfil de Usuario */}
                            <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>

                                <div className="mb-6 flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-primary">
                                        <img
                                            src={previewImage || defaultProfile1}
                                            alt="Perfil"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <label className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent cursor-pointer">
                                            Cambiar Foto
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {previewImage && (
                                            <button
                                                onClick={handleRemovePhoto}
                                                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Temas y Apariencia */}
                            <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                <h2 className="text-xl font-semibold mb-4">Temas y Apariencia</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    {colorThemes.map((theme) => {
                                        const colors = getThemeColors(theme.id);
                                        return (
                                            <div
                                                key={theme.id}
                                                onClick={() => handleThemeChange(theme.id)}
                                                className={`
                                                    p-4 rounded-lg cursor-pointer transition
                                                    ${selectedTheme === theme.id ? 'ring-2 ring-primary shadow-md' : 'hover:bg-gray-100'}
                                                `}
                                                style={{
                                                    backgroundColor: colors.background,
                                                    border: `1px solid ${colors.primary}`
                                                }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="flex space-x-2 mb-2">
                                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.secondary }}></div>
                                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                                        {theme.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 text-sm text-gray-500 text-center">
                                    <p>Personaliza los colores de la aplicación según tus preferencias</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleResetToDefault}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition"
                            disabled={loading}
                        >
                            Restaurar Predeterminados
                        </button>

                        <button
                            onClick={handleSaveChanges}
                            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition"
                            disabled={loading || !hasUnsavedChanges()}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
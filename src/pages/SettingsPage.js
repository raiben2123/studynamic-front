// src/pages/SettingsPage.js - actualizado para manejar correctamente el tema y contraseña
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import { applyTheme, colorThemes } from '../services/themeService';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import ProfilePictureUploader from '../components/profile/ProfilePictureUploader';

const SettingsPage = () => {
    const { user, userTheme, updateProfile, loading: authLoading } = useAuth();
    const [savedMessage, setSavedMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Estados para formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estado para el modal de confirmación
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning',
        confirmText: 'Confirmar'
    });

    useEffect(() => {
        // Cargar datos del usuario
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPreviewImage(user.profilePicture || null);
            setPassword(user.password || '');
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

            if (password !== (user?.password || '')) {
                updateData.password = password;
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
        setConfirmationModal({
            isOpen: true,
            title: 'Restaurar Configuración',
            message: '¿Estás seguro de que quieres restaurar la configuración predeterminada?',
            onConfirm: () => {
                setSelectedTheme('default');

                updateProfile({
                    theme: 'default'
                });

                setSavedMessage('Configuración restaurada a valores predeterminados');
                setTimeout(() => setSavedMessage(''), 3000);
            },
            type: 'warning',
            confirmText: 'Restaurar'
        });
    };

    // Cerrar el modal de confirmación
    const closeConfirmationModal = () => {
        setConfirmationModal({
            ...confirmationModal,
            isOpen: false
        });
    };

    // Determinar si hay cambios sin guardar
    const hasUnsavedChanges = () => {
        if (!user) return false;

        return name !== (user.name || '') ||
            email !== (user.email || '') ||
            profilePicture !== null ||
            selectedTheme !== userTheme ||
            password !== (user.password || '');
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
                    paddingBottom: isMobile ? '5rem' : '2rem',
                }}
            >
                <div className="relative z-10">
                    {error && (
                        <div className="bg-task-vencida text-task-vencida p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {savedMessage && (
                        <div className="bg-task-finalizada text-task-finalizada p-3 rounded-lg mb-4">
                            {savedMessage}
                        </div>
                    )}

                    <h1 className="text-2xl md:text-3xl mb-6 text-primary font-bold">Configuración</h1>

                    {authLoading || loading ? (
                        <div className="bg-card-bg p-6 rounded-xl shadow-md flex justify-center items-center">
                            <p className="text-text-secondary">Cargando...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Perfil de Usuario */}
                            <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95">
                                <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>

                                <div className="mb-6 flex flex-col items-center">
                                    <ProfilePictureUploader
                                        onSuccess={(imageUrl) => {
                                            setPreviewImage(imageUrl);
                                            setSavedMessage('Foto de perfil actualizada correctamente');
                                            setTimeout(() => setSavedMessage(''), 3000);
                                        }}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-text">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-text">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-text">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-text-secondary hover:text-text"
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1">Deja en blanco para mantener la contraseña actual</p>
                                    </div>
                                </div>
                            </div>

                            {/* Temas y Apariencia */}
                            <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95">
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
                                                    ${selectedTheme === theme.id ? 'ring-2 ring-primary shadow-md' : 'hover:bg-border'}
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

                                <div className="mt-4 text-sm text-text-secondary text-center">
                                    <p>Personaliza los colores de la aplicación según tus preferencias</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleResetToDefault}
                            className="px-4 py-2 bg-border text-text rounded-full hover:bg-border/80 transition"
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

            {/* Modal de Confirmación */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText}
            />
        </div>
    );
};

export default SettingsPage;
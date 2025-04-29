// src/components/JoinGroupRedirect.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinGroup, joinGroupWithLink } from '../api/groups';
import { FaUsers, FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';
import Logo from '../assets/Logo_opacidad33.png';

const JoinGroupRedirect = () => {
    const { groupId } = useParams();
    const { token, userId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Estados para manejar el proceso de unión
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [requiresPassword, setRequiresPassword] = useState(false);

    useEffect(() => {
        // Si el usuario no está autenticado, guardamos la URL y redirigimos
        if (!token || !userId) {
            localStorage.setItem('redirectAfterLogin', location.pathname);
            navigate('/');
            return;
        }

        // Si el usuario está autenticado, intentamos unirlo al grupo
        const joinUserToGroup = async () => {
            setLoading(true);
            try {
                // Intentamos unir al usuario al grupo sin contraseña primero
                // (algunos grupos pueden no requerir contraseña)
                await joinGroupWithLink(groupId, '');

                // Si no hay error, la unión fue exitosa
                setSuccess(true);
                setTimeout(() => {
                    navigate(`/groups/${groupId}`);
                }, 1500);
            } catch (error) {
                console.error("Error uniendo al grupo:", error);

                // Si el error es por contraseña incorrecta, pedimos la contraseña
                if (error.message && (
                    error.message.includes('Contraseña incorrecta') ||
                    error.message.includes('password') ||
                    error.message.includes('contraseña')
                )) {
                    setRequiresPassword(true);
                } else {
                    setError('No se pudo unir al grupo. Por favor, intenta más tarde.');
                }
            } finally {
                setLoading(false);
            }
        };

        joinUserToGroup();
    }, [token, userId, groupId, navigate, location.pathname]);

    const handleJoinWithPassword = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Por favor, introduce la contraseña del grupo');
            return;
        }

        setJoining(true);
        setError(null);

        try {
            await joinGroupWithLink(groupId, password);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/groups/${groupId}`);
            }, 1500);
        } catch (err) {
            console.error('Error al unirse al grupo:', err);
            setError('Contraseña incorrecta o no se pudo unir al grupo');
        } finally {
            setJoining(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                    <div className="flex justify-center">
                        <FaCheckCircle className="text-task-finalizada text-5xl mb-4" />
                    </div>
                    <h2 className="text-2xl font-semibold text-primary mb-2">¡Te has unido al grupo correctamente!</h2>
                    <p className="text-gray-600 mb-6">Redirigiendo a la página del grupo...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                    <div className="flex justify-center">
                        <FaSpinner className="text-primary text-5xl mb-4 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-semibold text-primary mb-2">Procesando invitación...</h2>
                    <p className="text-gray-600">Por favor, espera mientras te unimos al grupo</p>
                </div>
            </div>
        );
    }

    if (error && !requiresPassword) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                    <div className="flex justify-center">
                        <FaTimes className="text-error text-5xl mb-4" />
                    </div>
                    <h2 className="text-2xl font-semibold text-primary mb-2">No se pudo unir al grupo</h2>
                    <p className="text-error mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/groups')}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                        Volver a Grupos
                    </button>
                </div>
            </div>
        );
    }

    if (requiresPassword) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background"
                style={{
                    backgroundImage: `url(${Logo})`,
                    backgroundSize: '50%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 1,
                }}
            >
                <div className="relative z-10 w-full max-w-md">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center p-3 bg-primary-light rounded-full mb-4">
                            <FaUsers className="text-primary text-3xl" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">Unirse a Grupo</h1>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold text-primary mb-2">Unirse al grupo</h2>
                        <p className="text-gray-600 mb-6">Para unirte a este grupo, necesitas introducir la contraseña.</p>

                        {error && (
                            <div className="bg-error/10 text-error p-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleJoinWithPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Contraseña del grupo
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Introduce la contraseña"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/groups')}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
                                    disabled={joining}
                                >
                                    {joining ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" /> Uniéndose...
                                        </>
                                    ) : (
                                        'Unirse al Grupo'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback en caso de un estado no manejado
    return null;
};

export default JoinGroupRedirect;
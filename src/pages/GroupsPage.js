import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import {
    FaSearch,
    FaTimes,
    FaShareAlt,
    FaUsers,
    FaPlus,
    FaLock,
    FaUserPlus,
    FaEllipsisV
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroupsByUserId, getAllGroups, createGroup, joinGroup, leaveGroup } from '../api/groups';

const GroupsPage = () => {
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    const [groups, setGroups] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupPassword, setNewGroupPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [joinGroupId, setJoinGroupId] = useState(null);
    const [isTooltipOpen, setIsTooltipOpen] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [searchResults, setSearchResults] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [activePage, setActivePage] = useState('my-groups');

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const [userGroups, allAvailableGroups] = await Promise.all([
                    getGroupsByUserId(),
                    getAllGroups()
                ]);

                setGroups(userGroups);
                setAllGroups(allAvailableGroups);
                setError(null);
            } catch (err) {
                console.error('Error fetching groups:', err);
                setError('Error al cargar los grupos');
            } finally {
                setLoading(false);
            }
        };

        if (token && userId) {
            fetchGroups();
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [token, userId]);

    const sortedGroups = [...groups].sort((a, b) =>
        (b.members?.length || b.memberCount || 0) - (a.members?.length || a.memberCount || 0)
    );

    useEffect(() => {
        const availableGroups = allGroups.filter(group =>
            !groups.some(g => g.id === group.id)
        );

        if (searchQuery.trim() === '') {
            setSearchResults(availableGroups);
            return;
        }

        const results = availableGroups.filter(group =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(results);
    }, [searchQuery, allGroups, groups]);

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({
            ...confirmationModal,
            isOpen: false
        });
    };

    const handleJoinGroup = async (groupId) => {
        setJoinGroupId(groupId);

        const alreadyMember = groups.some(g => g.id === groupId);
        if (alreadyMember) {
            showNotification('Ya eres miembro de este grupo.', 'error');
            setJoinPassword('');
            return;
        }
    };

    const confirmJoinGroup = async () => {
        if (!joinGroupId || !joinPassword) {
            showNotification('Por favor, introduce la contraseña del grupo.', 'error');
            return;
        }

        setLoading(true);
        try {
            await joinGroup(joinGroupId, joinPassword);

            const updatedGroups = await getGroupsByUserId();
            setGroups(updatedGroups);

            setJoinPassword('');
            setJoinGroupId(null);
            setSearchQuery('');
            setError(null);

            showNotification('¡Te has unido al grupo correctamente!', 'success');
        } catch (err) {
            console.error('Error joining group:', err);
            setError(err.message || 'Error al unirse al grupo. Verifica la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = async () => {
        if (!newGroupName || !newGroupPassword) {
            showNotification('Por favor, completa todos los campos.', 'error');
            return;
        }

        setLoading(true);
        try {
            const createdGroup = await createGroup({
                name: newGroupName,
                password: newGroupPassword
            });

            const updatedGroups = await getGroupsByUserId();
            setGroups(updatedGroups);

            setNewGroupName('');
            setNewGroupPassword('');
            setIsAddModalOpen(false);
            setError(null);
            showNotification(`Grupo ${newGroupName} creado con éxito`, 'success');

            navigate(`/groups/${createdGroup.id}`);
        } catch (err) {
            console.error('Error creating group:', err);
            setError('Error al crear el grupo');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async (groupId) => {
        const group = groups.find(g => g.id === groupId);
        const userMember = group?.members?.find(m => m.userId === parseInt(userId));

        if (userMember?.roleId === 1 && group?.members?.length > 1) {
            showNotification('No puedes abandonar un grupo como administrador si hay otros miembros.', 'error');
            return;
        }

        setConfirmationModal({
            isOpen: true,
            title: 'Abandonar Grupo',
            message: '¿Estás seguro de que quieres abandonar este grupo? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await leaveGroup(groupId);
                    setGroups(groups.filter(g => g.id !== groupId));
                    setError(null);
                    showNotification('Has abandonado el grupo correctamente', 'success');
                } catch (err) {
                    console.error('Error leaving group:', err);
                    setError('Error al abandonar el grupo');
                } finally {
                    setLoading(false);
                }
            },
            type: 'danger',
            confirmText: 'Abandonar'
        });
    };

    const getGroupColor = (groupName) => {
        const colors = [
            'bg-primary',
            'bg-accent',
            'bg-task-finalizada',
            'bg-task-vencida',
            'bg-primary-light',
            'bg-task'
        ];

        const hash = groupName.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
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
                    {notification && (
                        <motion.div
                            className={`fixed top-4 right-4 p-3 rounded-lg shadow-md ${notification.type === 'success' ? 'bg-task-finalizada text-task-finalizada' : 'bg-task-vencida text-task-vencida'}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            className="bg-task-vencida text-task-vencida p-3 rounded-lg mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">Mis Grupos</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-colors duration-300 flex items-center"
                                disabled={loading}
                            >
                                <FaPlus className="mr-2" /> Crear Grupo
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex border-b-2 border-border">
                            <button
                                onClick={() => setActivePage('my-groups')}
                                className={`py-2 px-4 font-medium ${activePage === 'my-groups'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                Mis Grupos
                            </button>
                            <button
                                onClick={() => setActivePage('join-groups')}
                                className={`py-2 px-4 font-medium ${activePage === 'join-groups'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                Unirme a Grupos
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activePage === 'my-groups' ? (
                            <motion.div
                                key="my-groups"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-card-bg p-6 rounded-xl shadow-md">
                                    {loading && (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    )}

                                    {!loading && sortedGroups.length === 0 && (
                                        <div className="text-center py-10 bg-primary-light rounded-lg">
                                            <FaUsers className="mx-auto text-text-secondary text-4xl mb-4" />
                                            <p className="text-text mb-3">No estás en ningún grupo.</p>
                                            <p className="text-text-secondary mb-4">Crea un nuevo grupo o únete a alguno existente</p>
                                            <div className="flex space-x-3 justify-center">
                                                <button
                                                    onClick={() => setIsAddModalOpen(true)}
                                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                                >
                                                    Crear grupo
                                                </button>
                                                <button
                                                    onClick={() => setActivePage('join-groups')}
                                                    className="bg-border text-text px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                                                >
                                                    Buscar grupos
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!loading && sortedGroups.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sortedGroups.map((group) => (
                                                <motion.div
                                                    key={group.id}
                                                    className="bg-input-bg rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-border"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className={`h-8 ${getGroupColor(group.name)}`}></div>
                                                    <div className="p-4">
                                                        <div className="flex justify-between">
                                                            <h3 className="font-semibold text-lg text-text mb-1">{group.name}</h3>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setIsTooltipOpen(isTooltipOpen === group.id ? null : group.id)}
                                                                    className="text-text-secondary hover:text-text p-1 rounded-full hover:bg-border"
                                                                >
                                                                    <FaEllipsisV size={16} />
                                                                </button>

                                                                {isTooltipOpen === group.id && (
                                                                    <motion.div
                                                                        className="absolute right-0 mt-1 w-40 bg-card-bg rounded-md shadow-lg z-10 border border-primary/20"
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 10 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <ul className="py-1">
                                                                            <li>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setIsTooltipOpen(null);
                                                                                        handleLeaveGroup(group.id);
                                                                                    }}
                                                                                    className="px-4 py-2 text-sm text-task-vencida hover:bg-task-vencida/10 w-full text-left flex items-center"
                                                                                >
                                                                                    <FaTimes className="mr-2" /> Abandonar
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const url = `${window.location.origin}/groups/join/${group.id}`;
                                                                                        navigator.clipboard.writeText(url);
                                                                                        setIsTooltipOpen(null);
                                                                                        showNotification('Enlace copiado al portapapeles', 'success');
                                                                                    }}
                                                                                    className="px-4 py-2 text-sm text-primary hover:bg-primary-light w-full text-left flex items-center"
                                                                                >
                                                                                    <FaShareAlt className="mr-2" /> Compartir
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center text-text-secondary text-sm mb-3">
                                                            <FaUsers className="mr-1 text-text-secondary" />
                                                            <span>{group.members?.length || group.memberCount || 0} miembros</span>
                                                        </div>

                                                        <Link
                                                            to={`/groups/${group.id}`}
                                                            className="block mt-3 bg-primary text-white text-center py-2 rounded-lg hover:bg-accent transition-colors"
                                                        >
                                                            Ver Grupo
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="join-groups"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="bg-card-bg p-6 rounded-xl shadow-md"
                            >
                                <div className="mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-primary" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Buscar grupos..."
                                            className="pl-10 pr-4 py-2 w-full border border-border bg-input-bg text-text rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {searchResults.length === 0 ? (
                                    <div className="text-center py-10 bg-primary-light rounded-lg">
                                        <FaSearch className="mx-auto text-text-secondary text-4xl mb-4" />
                                        <p className="text-text">No se encontraron grupos{searchQuery ? ` para "${searchQuery}"` : ''}.</p>
                                        <p className="text-text-secondary mt-2">Intenta con otra búsqueda o crea un nuevo grupo</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {searchResults.map((group) => (
                                            <motion.div
                                                key={group.id}
                                                className="bg-input-bg rounded-lg p-4 border border-border hover:border-primary/50 hover:bg-primary-light/50 transition-colors"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                                    <div className="mb-3 md:mb-0">
                                                        <h3 className="font-semibold text-lg text-text">{group.name}</h3>
                                                        <p className="text-text-secondary text-sm">
                                                            {group.description || 'Sin descripción'} • {group.memberCount} miembros
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center">
                                                        {joinGroupId === group.id ? (
                                                            <div className="flex w-full md:w-auto">
                                                                <div className="relative flex-1 md:w-44">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                                        <FaLock className="text-text-secondary" />
                                                                    </div>
                                                                    <input
                                                                        type="password"
                                                                        value={joinPassword}
                                                                        onChange={(e) => setJoinPassword(e.target.value)}
                                                                        placeholder="Contraseña"
                                                                        className="pl-10 pr-4 py-2 w-full border border-border bg-input-bg text-text rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={confirmJoinGroup}
                                                                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-accent transition-colors"
                                                                    disabled={loading}
                                                                >
                                                                    Unirme
                                                                </button>
                                                                <button
                                                                    onClick={() => setJoinGroupId(null)}
                                                                    className="ml-2 text-text-secondary hover:text-text p-2 rounded-full hover:bg-border"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleJoinGroup(group.id)}
                                                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                                                disabled={loading}
                                                            >
                                                                <FaUserPlus className="mr-2" /> Unirme
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {isAddModalOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-card-bg p-6 rounded-xl shadow-lg w-full max-w-md mx-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">
                            Crear Nuevo Grupo
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-text">
                                    Nombre del grupo
                                </label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ej: Grupo de Matemáticas"
                                    className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-text">
                                    Contraseña de acceso
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaLock className="text-text-secondary" />
                                    </div>
                                    <input
                                        type="password"
                                        value={newGroupPassword}
                                        onChange={(e) => setNewGroupPassword(e.target.value)}
                                        placeholder="Contraseña para unirse al grupo"
                                        className="w-full pl-10 p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-text-secondary mt-1">
                                    Esta contraseña será necesaria para que otros usuarios se unan al grupo.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-border text-text rounded-lg hover:bg-border/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddGroup}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        <span>Creando...</span>
                                    </div>
                                ) : 'Crear Grupo'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText || 'Confirmar'}
            />
        </div>
    );
};

export default GroupsPage;
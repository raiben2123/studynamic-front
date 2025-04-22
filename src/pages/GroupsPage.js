// src/pages/GroupsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import { FaSearch, FaTimes, FaUsers } from 'react-icons/fa';

// API imports
import { getGroupsByUserId, createGroup, joinGroup, leaveGroup } from '../api/groups';

const GroupsPage = () => {
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    
    // State
    const [groups, setGroups] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupPassword, setNewGroupPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinGroupId, setJoinGroupId] = useState(null);

    // Search results
    const [searchResults, setSearchResults] = useState([]);
    const [allGroups, setAllGroups] = useState([]);

    // Load user's groups
    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const userGroups = await getGroupsByUserId();
                setGroups(userGroups);
                
                // En un sistema real, aquí obtendríamos todos los grupos disponibles para unirse
                // Por ahora, simularemos grupos adicionales para la búsqueda
                setAllGroups([
                    ...userGroups,
                    { id: 100, name: 'Grupo de Matemáticas Avanzadas', members: 20 },
                    { id: 101, name: 'Grupo de Física Cuántica', members: 15 },
                    { id: 102, name: 'Grupo de Programación Python', members: 25 },
                ]);
                
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
    }, [token, userId]);

    // Sort groups by member count (most popular first)
    const sortedGroups = [...groups].sort((a, b) => 
        b.members?.length - a.members?.length || 
        b.memberCount - a.memberCount || 
        0
    );

    // Filter groups based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        
        const results = allGroups.filter(group => 
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !groups.some(g => g.id === group.id)
        );
        
        setSearchResults(results);
    }, [searchQuery, allGroups, groups]);

    const handleJoinGroup = async (groupId) => {
        setJoinGroupId(groupId);
        
        // In a real implementation, we would validate if the user is already a member
        const alreadyMember = groups.some(g => g.id === groupId);
        if (alreadyMember) {
            alert('Ya eres miembro de este grupo.');
            setJoinPassword('');
            return;
        }
    };

    const confirmJoinGroup = async () => {
        if (!joinGroupId || !joinPassword) {
            alert('Por favor, introduce la contraseña del grupo.');
            return;
        }
        
        setLoading(true);
        try {
            await joinGroup(joinGroupId, joinPassword);
            
            // Refresh groups list
            const updatedGroups = await getGroupsByUserId();
            setGroups(updatedGroups);
            
            setJoinPassword('');
            setJoinGroupId(null);
            setIsSearchOpen(false);
            setError(null);
            
            alert('Te has unido al grupo correctamente');
        } catch (err) {
            console.error('Error joining group:', err);
            setError('Error al unirse al grupo. Verifica la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = async () => {
        if (!newGroupName || !newGroupPassword) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        
        setLoading(true);
        try {
            await createGroup({
                name: newGroupName,
                password: newGroupPassword
            });
            
            // Refresh groups list
            const updatedGroups = await getGroupsByUserId();
            setGroups(updatedGroups);
            
            setNewGroupName('');
            setNewGroupPassword('');
            setIsAddModalOpen(false);
            setError(null);
        } catch (err) {
            console.error('Error creating group:', err);
            setError('Error al crear el grupo');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async (groupId) => {
        // Check if the user is admin and there are other members
        const group = groups.find(g => g.id === groupId);
        const userMember = group?.members?.find(m => m.userId === parseInt(userId));
        
        if (userMember?.roleId === 1 && group?.members?.length > 1) {
            alert('No puedes abandonar un grupo como administrador si hay otros miembros.');
            return;
        }
        
        if (window.confirm('¿Estás seguro de que quieres abandonar este grupo?')) {
            setLoading(true);
            try {
                await leaveGroup(groupId);
                
                // Update the local state
                setGroups(groups.filter(g => g.id !== groupId));
                setError(null);
            } catch (err) {
                console.error('Error leaving group:', err);
                setError('Error al abandonar el grupo');
            } finally {
                setLoading(false);
            }
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
                    
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl text-primary">Grupos</h1>
                        <div className="flex space-x-2">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary hover:text-accent">
                                <FaSearch size={24} />
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent"
                                disabled={loading}
                            >
                                + Añadir Grupo
                            </button>
                        </div>
                    </div>

                    {isSearchOpen && (
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6 mb-6 opacity-95">
                            <h2 className="text-xl font-semibold mb-4 text-primary">Buscar Grupos</h2>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre..."
                                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="max-h-[20vh] overflow-y-auto">
                                {searchResults.length === 0 ? (
                                    <p>No se encontraron grupos.</p>
                                ) : (
                                    searchResults.map((group) => (
                                        <div key={group.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-lg mb-2">
                                            <div className="flex items-center">
                                                <FaUsers className="text-primary mr-2" />
                                                <span>
                                                    {group.name}
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({group.members?.length || group.memberCount || 0} miembros)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                {joinGroupId === group.id ? (
                                                    <>
                                                        <input
                                                            type="password"
                                                            value={joinPassword}
                                                            onChange={(e) => setJoinPassword(e.target.value)}
                                                            placeholder="Contraseña"
                                                            className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                        <button
                                                            onClick={confirmJoinGroup}
                                                            className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                                            disabled={loading}
                                                        >
                                                            Confirmar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinGroup(group.id)}
                                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                                        disabled={loading}
                                                    >
                                                        Unirse
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl shadow-md md:p-6 opacity-95">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Mis Grupos</h2>
                        
                        {loading ? (
                            <div className="text-center py-4">Cargando grupos...</div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto">
                                {sortedGroups.length === 0 ? (
                                    <p className="text-gray-600 text-center py-4">No estás en ningún grupo.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedGroups.map((group) => (
                                            <div key={group.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                                                <Link to={`/groups/${group.id}`} className="flex-1 hover:bg-gray-200 p-2 rounded">
                                                    <p className="font-medium text-lg text-primary">{group.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {group.members?.length || group.memberCount || 0} miembros
                                                    </p>
                                                </Link>
                                                <button
                                                    onClick={() => handleLeaveGroup(group.id)}
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                    disabled={loading}
                                                >
                                                    <FaTimes size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para crear grupo */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-primary">Crear Nuevo Grupo</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Nombre del grupo
                                </label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ej: Grupo de Matemáticas"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={newGroupPassword}
                                    onChange={(e) => setNewGroupPassword(e.target.value)}
                                    placeholder="Contraseña para unirse al grupo"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Esta contraseña será necesaria para que otros usuarios se unan al grupo.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddGroup}
                                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-accent"
                                disabled={loading}
                            >
                                {loading ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;
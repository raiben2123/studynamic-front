// src/pages/GroupsPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import { FaSearch, FaTimes } from 'react-icons/fa';

const initialGroups = [
    {
        id: 1,
        name: 'Grupo de Matemáticas',
        password: 'math123',
        members: [
            { id: 1, name: 'Usuario 1', role: 'admin' },
            { id: 2, name: 'Tú', role: 'user' },
        ],
        tasks: [{ id: 1, title: 'Resolver ejercicios', dueDate: '2025-03-25' }],
        events: [{ id: 1, title: 'Examen Final', date: '2025-03-26' }],
        notes: [{ id: 1, content: 'Fórmulas importantes' }],
        studySessions: [{ id: 1, title: 'Repaso capítulo 5', date: '2025-03-24' }],
        messages: [{ id: 1, user: 'Usuario 1', content: '¿Alguien tiene los apuntes?', timestamp: '2025-03-23 10:00' }],
    },
    {
        id: 2,
        name: 'Grupo de Física',
        password: 'phys456',
        members: [{ id: 3, name: 'Tú', role: 'admin' }],
        tasks: [{ id: 2, title: 'Preparar presentación', dueDate: '2025-03-27' }],
        events: [],
        notes: [],
        studySessions: [],
        messages: [],
    },
];

const GroupsPage = () => {
    const [groups, setGroups] = useState(initialGroups);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupPassword, setNewGroupPassword] = useState('');

    const sortedGroups = groups.sort((a, b) => b.members.length - a.members.length);
    const filteredGroups = sortedGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = (group) => {
        const alreadyMember = group.members.some((m) => m.name === 'Tú');
        if (alreadyMember) {
            alert('Ya estás en este grupo.');
            return;
        }
        if (joinPassword === group.password) {
            setGroups(groups.map((g) => (g.id === group.id ? { ...g, members: [...g.members, { id: Date.now(), name: 'Tú', role: 'user' }] } : g)));
            setJoinPassword('');
            setIsSearchOpen(false);
            alert(`Te has unido a ${group.name}`);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleAddGroup = () => {
        if (!newGroupName || !newGroupPassword) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        const newGroup = {
            id: Date.now(),
            name: newGroupName,
            password: newGroupPassword,
            members: [{ id: Date.now(), name: 'Tú', role: 'admin' }],
            tasks: [],
            events: [],
            notes: [],
            studySessions: [],
            messages: [],
        };
        setGroups([...groups, newGroup]);
        setNewGroupName('');
        setNewGroupPassword('');
        setIsAddModalOpen(false);
    };

    const handleLeaveGroup = (groupId) => {
        const group = groups.find((g) => g.id === groupId);
        const isAdmin = group.members.find((m) => m.name === 'Tú')?.role === 'admin';
        if (isAdmin && group.members.length > 1) {
            alert('No puedes abandonar un grupo como administrador si hay otros miembros.');
            return;
        }
        setGroups(groups.filter((g) => g.id !== groupId));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div
                className="flex-1 bg-[#e6f0fa] p-4 pb-20 md:p-8 md:pb-8"
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl">Mis Grupos</h1>
                        <div className="flex space-x-2">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#467BAA] hover:text-[#5aa0f2]">
                                <FaSearch size={24} />
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                            >
                                + Añadir Grupo
                            </button>
                        </div>
                    </div>

                    {isSearchOpen && (
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Buscar Grupos</h2>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre..."
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                            />
                            <div className="max-h-[20vh] overflow-y-auto">
                                {filteredGroups.length === 0 ? (
                                    <p>No se encontraron grupos.</p>
                                ) : (
                                    filteredGroups.map((group) => (
                                        <div key={group.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-lg mb-2">
                                            <span>{group.name} ({group.members.length} miembros)</span>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="password"
                                                    value={joinPassword}
                                                    onChange={(e) => setJoinPassword(e.target.value)}
                                                    placeholder="Contraseña"
                                                    className="p-1 border border-gray-300 rounded text-sm"
                                                />
                                                <button
                                                    onClick={() => handleJoinGroup(group)}
                                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                                >
                                                    Unirse
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                        <h2 className="text-xl font-semibold mb-4">Mis Grupos</h2>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {sortedGroups.length === 0 ? (
                                <p>No estás en ningún grupo.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sortedGroups.map((group) => (
                                        <div key={group.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                            <Link to={`/groups/${group.id}`} className="flex-1 hover:bg-gray-200">
                                                <p className="font-medium text-lg">{group.name}</p>
                                                <p className="text-sm text-gray-600">{group.members.length} miembros</p>
                                            </Link>
                                            <button
                                                onClick={() => handleLeaveGroup(group.id)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                <FaTimes size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Crear Nuevo Grupo</h3>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Nombre del grupo"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        />
                        <input
                            type="password"
                            value={newGroupPassword}
                            onChange={(e) => setNewGroupPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddGroup}
                                className="px-4 py-2 bg-[#467BAA] text-white rounded-full hover:bg-[#5aa0f2]"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;
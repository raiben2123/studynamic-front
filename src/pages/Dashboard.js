// src/pages/Dashboard.js
import React from 'react';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import EventCard from '../components/dashboard/EventCard';
import GroupCard from '../components/dashboard/GroupCard';

const tasks = [
    { id: 1, title: 'Completar proyecto de Matemáticas', dueDate: '2025-03-25', status: 'Pendiente' },
    { id: 2, title: 'Preparar presentación de Física', dueDate: '2025-03-27', status: 'En Progreso' },
    { id: 3, title: 'Leer capítulo 5 de Programación', dueDate: '2025-03-24', status: 'Pendiente' },
];

const events = [
    { title: 'Reunión de Estudio - Matemáticas', date: '2025-03-23', time: '10:00 - 11:30' },
    { title: 'Examen de Física', date: '2025-03-25', time: 'Todo el día' },
    { title: 'Clase de Programación', date: '2025-03-24', time: '09:00 - 10:30' },
];

const groups = [
    { id: 1, name: 'Grupo de Estudio de Matemáticas', members: 5 },
    { id: 2, name: 'Equipo de Programación', members: 3 },
    { id: 3, name: 'Club de Física', members: 7 },
];

const Dashboard = () => {
    // Ordenar y limitar tareas por fecha límite (más cercana primero)
    const sortedTasks = [...tasks]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 6);

    // Ordenar y limitar eventos por fecha (más próxima primero)
    const sortedEvents = [...events]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6);

    // Ordenar y limitar grupos por cantidad de miembros (más miembros primero)
    const sortedGroups = [...groups]
        .sort((a, b) => b.members - a.members)
        .slice(0, 6);

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
                    <h1 className="text-2xl mb-4 md:text-3xl md:mb-6">Panel de Control</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sección de Tareas */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <h2 className="text-xl font-semibold mb-4">Tareas Pendientes</h2>
                            {sortedTasks.length === 0 ? (
                                <p>No hay tareas pendientes.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sortedTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sección de Eventos */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
                            {sortedEvents.length === 0 ? (
                                <p>No hay eventos próximos.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sortedEvents.map((event, index) => (
                                        <EventCard key={index} event={event} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sección de Grupos */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <h2 className="text-xl font-semibold mb-4">Mis Grupos</h2>
                            {sortedGroups.length === 0 ? (
                                <p>No estás en ningún grupo.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sortedGroups.map((group) => (
                                        <GroupCard key={group.id} group={group} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
// src/pages/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SubjectModal from '../components/modals/SubjectModal'; // Nuevo import

const initialTasks = [
    { id: 1, title: 'Completar proyecto de Matemáticas', dueDate: '2025-03-25', status: 'Pendiente', markObtained: '', markMax: '', importance: 'No Urgente', subject: 'Matemáticas', notificationDate: '2025-03-24T10:00' },
    { id: 2, title: 'Preparar presentación de Física', dueDate: '2025-03-27', status: 'En Progreso', markObtained: '85', markMax: '100', importance: 'Urgente', subject: 'Física', notificationDate: '' },
    { id: 3, title: 'Leer capítulo 5 de Programación', dueDate: '2025-03-24', status: 'Pendiente', markObtained: '', markMax: '', importance: 'No Urgente', subject: 'Programación', notificationDate: '' },
    { id: 4, title: 'Revisar notas de Química', dueDate: '2025-03-26', status: 'Completada', markObtained: '90', markMax: '100', importance: 'No Urgente', subject: 'Química', notificationDate: '' },
    { id: 5, title: 'Entregar tarea de Literatura', dueDate: '2025-03-28', status: 'En Progreso', markObtained: '70', markMax: '80', importance: 'Media', subject: 'Literatura', notificationDate: '' },
];

const initialEvents = [
    { id: 1, title: 'Examen de Matemáticas', date: '2025-03-26', notificationDate: '2025-03-25T09:00' },
    { id: 2, title: 'Clase de Física', date: '2025-03-25', notificationDate: '' },
    { id: 3, title: 'Taller de Programación', date: '2025-03-24', notificationDate: '' },
];

const initialGroups = [
    { id: 1, name: 'Grupo de Matemáticas', members: 15 },
    { id: 2, name: 'Grupo de Física', members: 10 },
    { id: 3, name: 'Grupo de Programación', members: 8 },
];

const initialSubjects = ['Matemáticas', 'Física', 'Programación', 'Química', 'Literatura'];

const Dashboard = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [events, setEvents] = useState(initialEvents);
    const [groups] = useState(initialGroups);
    const [subjects, setSubjects] = useState(initialSubjects); // Ahora subjects es editable
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false); // Nuevo estado
    const navigate = useNavigate();

    const handleTaskUpdate = (updatedTask) => {
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    };

    const handleAddTask = (newTask) => {
        setTasks([...tasks, { ...newTask, id: tasks.length + 1 }]);
        setIsTaskModalOpen(false);
    };

    const handleAddEvent = (newEvent) => {
        setEvents([...events, { ...newEvent, id: events.length + 1 }]);
        setIsEventModalOpen(false);
    };

    const handleAddSubject = (newSubject) => {
        setSubjects([...subjects, newSubject]);
        setIsSubjectModalOpen(false);
    };

    const handleAddGroup = () => {
        navigate('/groups');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const pendingTasks = tasks
        .filter((task) => task.status !== 'Completada')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const upcomingEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedGroups = groups.sort((a, b) => b.members - a.members);

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
                    <h1 className="text-2xl md:text-3xl mb-6">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tareas Pendientes */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Tareas Pendientes</h2>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                >
                                    + Añadir Tarea
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {pendingTasks.length === 0 ? (
                                    <p>No hay tareas pendientes.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={{ ...task, dueDate: formatDate(task.dueDate) }}
                                                onUpdate={handleTaskUpdate}
                                                subjects={subjects}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Próximos Eventos */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Próximos Eventos</h2>
                                <button
                                    onClick={() => setIsEventModalOpen(true)}
                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                >
                                    + Añadir Evento
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {upcomingEvents.length === 0 ? (
                                    <p>No hay eventos próximos.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="font-medium">{event.title}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mis Grupos */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Mis Grupos</h2>
                                <button
                                    onClick={handleAddGroup}
                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                >
                                    + Añadir Grupo
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {sortedGroups.length === 0 ? (
                                    <p>No estás en ningún grupo.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="font-medium">{group.name}</p>
                                                    <p className="text-sm text-gray-600">{group.members} miembros</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección de Asignaturas */}
                    <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Mis Asignaturas</h2>
                            <button
                                onClick={() => setIsSubjectModalOpen(true)} // Abrir modal
                                className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                            >
                                + Añadir Asignatura
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {subjects.length === 0 ? (
                                <p>No tienes asignaturas registradas.</p>
                            ) : (
                                subjects.map((subject) => (
                                    <div
                                        key={subject}
                                        className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                                    >
                                        <p className="font-medium">{subject}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleAddTask}
                subjects={subjects}
            />
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleAddEvent}
            />
            <SubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSave={handleAddSubject}
            />
        </div>
    );
};

export default Dashboard;
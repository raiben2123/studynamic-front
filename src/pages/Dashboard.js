// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import SubjectCard from '../components/dashboard/SubjectCard';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SubjectModal from '../components/modals/SubjectModal';

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

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [events, setEvents] = useState(initialEvents);
    const [groups] = useState(initialGroups);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, userId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, subjectsData] = await Promise.all([getTasks(), getSubjects()]);
                setTasks(tasksData);
                setSubjects(subjectsData);
                setError(null);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        if (token && userId) fetchData();
    }, [token, userId]);

    const handleAddTask = async (newTask) => {
        setLoading(true);
        try {
            const addedTask = await addTask(newTask);
            setTasks([...tasks, addedTask]);
            setIsTaskModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Error adding task:', error);
            setError(error.message || 'Error al añadir la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskUpdate = async (updatedTask) => {
        setLoading(true);
        try {
            console.log('Enviando a updateTask:', updatedTask);
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);
            setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTaskFromBackend : task)));
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setError(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setError(error.message || 'Error al actualizar la tarea');
            setEditingTask(updatedTask);
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskDelete = async (taskId) => {
        setLoading(true);
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter((task) => task.id !== taskId));
            setError(null);
        } catch (error) {
            console.error('Error deleting task:', error);
            setError(error.message || 'Error al eliminar la tarea');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (subjectName) => {
        setLoading(true);
        try {
            const newSubject = await addSubject({ title: subjectName });
            setSubjects([...subjects, newSubject]);
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
            setError(null);
        } catch (error) {
            console.error('Error adding subject:', error);
            setError(error.message || 'Error al añadir la asignatura');
            setIsSubjectModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsSubjectModalOpen(true);
    };

    const handleSubjectUpdate = async (subjectName) => {
        if (!editingSubject) return;
        setLoading(true);
        try {
            const updatedSubject = await updateSubject(editingSubject.id, { title: subjectName });
            setSubjects(
                subjects.map((subject) =>
                    subject.id === editingSubject.id ? updatedSubject : subject
                )
            );
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
            setError(null);
        } catch (error) {
            console.error('Error updating subject:', error);
            setError(error.message || 'Error al actualizar la asignatura');
            setIsSubjectModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectDelete = async (subjectId) => {
        setLoading(true);
        try {
            await deleteSubject(subjectId);
            setSubjects(subjects.filter((subject) => subject.id !== subjectId));
            setError(null);
        } catch (error) {
            console.error('Error deleting subject:', error);
            setError(error.message || 'Error al eliminar la asignatura');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = (newEvent) => {
        setEvents([...events, { ...newEvent, id: events.length + 1 }]);
        setIsEventModalOpen(false);
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
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4">Cargando...</div>
                    )}
                    <h1 className="text-2xl md:text-3xl mb-6">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tareas Pendientes */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Tareas Pendientes</h2>
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                    disabled={loading}
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
                                                onUpdate={handleEditTask}
                                                onDelete={handleTaskDelete}
                                                subjects={subjects.map((s) => s.title)}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                onClick={() => {
                                    setEditingSubject(null);
                                    setIsSubjectModalOpen(true);
                                }}
                                className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                disabled={loading}
                            >
                                + Añadir Asignatura
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {subjects.length === 0 ? (
                                <p>No tienes asignaturas registradas.</p>
                            ) : (
                                subjects.map((subject) => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        onUpdate={handleEditSubject}
                                        onDelete={handleSubjectDelete}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                    setError(null);
                }}
                onSave={editingTask ? handleTaskUpdate : handleAddTask}
                subjects={subjects}
                task={editingTask}
            />
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleAddEvent}
            />
            <SubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => {
                    setIsSubjectModalOpen(false);
                    setEditingSubject(null);
                    setError(null);
                }}
                onSave={editingSubject ? handleSubjectUpdate : handleAddSubject}
                subject={editingSubject}
            />
        </div>
    );
};

export default Dashboard;
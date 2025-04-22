// src/pages/Dashboard.js - versión actualizada utilizando clases de tema
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../api/subjects';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getGroupsByUserId } from '../api/groups';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import SubjectCard from '../components/dashboard/SubjectCard';
import EventCard from '../components/dashboard/EventCard';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SubjectModal from '../components/modals/SubjectModal';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, userId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, subjectsData, eventsData, groupsData] = await Promise.all([
                    getTasks(),
                    getSubjects(),
                    getEvents(),
                    getGroupsByUserId(),
                ]);
                
                // Ordenamos las tareas por fecha
                const sortedTasks = [...tasksData].sort((a, b) => {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                
                // Ordenamos los eventos por fecha
                const sortedEvents = [...eventsData].sort((a, b) => {
                    return new Date(a.startDateTime) - new Date(b.startDateTime);
                });
                
                setTasks(sortedTasks);
                setSubjects(subjectsData);
                setEvents(sortedEvents);
                setGroups(groupsData);
                console.log('Grupos:', groupsData);
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
            console.log('Dashboard - Añadiendo tarea:', newTask);
            const addedTask = await addTask(newTask);
            
            // Añadimos la nueva tarea y reordenamos
            const updatedTasks = [...tasks, addedTask].sort((a, b) => {
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            
            setTasks(updatedTasks);
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
        console.log('Dashboard - Editando tarea:', task);
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskUpdate = async (updatedTask) => {
        setLoading(true);
        try {
            console.log('Dashboard - Actualizando tarea:', updatedTask);
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);
            
            // Actualizamos la tarea y reordenamos
            const updatedTasks = tasks
                .map((task) => (task.id === updatedTask.id ? updatedTaskFromBackend : task))
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            setTasks(updatedTasks);
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

    const handleAddEvent = async (newEvent) => {
        setLoading(true);
        try {
            console.log('Dashboard - Añadiendo evento:', newEvent);
            const addedEvent = await addEvent(newEvent);
            
            // Añadimos el nuevo evento y reordenamos
            const updatedEvents = [...events, addedEvent].sort((a, b) => {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            });
            
            setEvents(updatedEvents);
            setIsEventModalOpen(false);
            setEditingEvent(null);
            setError(null);
        } catch (error) {
            console.error('Error adding event:', error);
            setError(error.message || 'Error al añadir el evento');
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event) => {
        console.log('Dashboard - Editando evento:', event);
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const handleEventUpdate = async (updatedEvent) => {
        if (!editingEvent) return;
        setLoading(true);
        try {
            console.log('Dashboard - Actualizando evento:', updatedEvent);
            const updatedEventFromBackend = await updateEvent(editingEvent.id, updatedEvent);
            
            // Actualizamos el evento y reordenamos
            const updatedEvents = events
                .map((event) => event.id === editingEvent.id ? updatedEventFromBackend : event)
                .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
                
            setEvents(updatedEvents);
            setIsEventModalOpen(false);
            setEditingEvent(null);
            setError(null);
        } catch (error) {
            console.error('Error updating event:', error);
            setError(error.message || 'Error al actualizar el evento');
            setEditingEvent(updatedEvent);
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEventDelete = async (eventId) => {
        setLoading(true);
        try {
            await deleteEvent(eventId);
            setEvents(events.filter((event) => event.id !== eventId));
            setError(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            setError(error.message || 'Error al eliminar el evento');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = () => {
        navigate('/groups');
    };

    // Filtramos las tareas pendientes y las ordenamos por fecha
    const pendingTasks = tasks
        .filter((task) => task.status !== 'Finalizada')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Ordenamos los eventos próximos por fecha
    const upcomingEvents = events
        .sort((a, b) => a.startDateTime && b.startDateTime 
            ? new Date(a.startDateTime) - new Date(b.startDateTime) 
            : 0);

    const sortedGroups = groups.sort((a, b) => b.memberCount - a.memberCount);

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
                    {loading && (
                        <div className="text-center mb-4">Cargando...</div>
                    )}
                    <h1 className="text-2xl md:text-3xl mb-6 text-primary">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tareas Pendientes */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-primary">Tareas Pendientes</h2>
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                    disabled={loading}
                                >
                                    + Añadir Tarea
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {pendingTasks.length === 0 ? (
                                    <p className="text-gray-600">No hay tareas pendientes.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
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
                                <h2 className="text-xl font-semibold text-primary">Próximos Eventos</h2>
                                <button
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setIsEventModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                    disabled={loading}
                                >
                                    + Añadir Evento
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-gray-600">No hay eventos próximos.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                onUpdate={handleEditEvent}
                                                onDelete={handleEventDelete}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mis Grupos */}
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-primary">Mis Grupos</h2>
                                <button
                                    onClick={handleAddGroup}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                    disabled={loading}
                                >
                                    + Añadir Grupo
                                </button>
                            </div>
                            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                                {sortedGroups.length === 0 ? (
                                    <p className="text-gray-600">No estás en ningún grupo.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className="p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200 transition"
                                            >
                                                <div>
                                                    <p className="font-medium text-primary">{group.name}</p>
                                                    <p className="text-sm text-gray-600">{group.memberCount} miembros</p>
                                                </div>
                                                <button 
                                                    className="text-sm px-3 py-1 bg-primary text-white rounded-full hover:bg-accent"
                                                    onClick={() => navigate(`/groups/${group.id}`)}
                                                >
                                                    Ver Grupo
                                                </button>
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
                            <h2 className="text-xl font-semibold text-primary">Mis Asignaturas</h2>
                            <button
                                onClick={() => {
                                    setEditingSubject(null);
                                    setIsSubjectModalOpen(true);
                                }}
                                className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent"
                                disabled={loading}
                            >
                                + Añadir Asignatura
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {subjects.length === 0 ? (
                                <p className="text-gray-600">No tienes asignaturas registradas.</p>
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
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                    setError(null);
                }}
                onSave={editingEvent ? handleEventUpdate : handleAddEvent}
                event={editingEvent}
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
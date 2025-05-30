import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjectsByUser, addSubject, updateSubject, deleteSubject } from '../api/subjects';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getGroupsByUserId } from '../api/groups';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import SubjectCard from '../components/dashboard/SubjectCard';
import EventCard from '../components/dashboard/EventCard';
import GroupCard from '../components/dashboard/GroupCard';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SubjectModal from '../components/modals/SubjectModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Carousel from '../components/Carousel';
import ErrorBoundary from '../components/ErrorBoundary';
import { FaPlus } from 'react-icons/fa';

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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { token, userId, userTheme } = useAuth();
    const navigate = useNavigate();

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tasksData, subjectsData, eventsData, groupsData] = await Promise.all([
                getTasks(),
                getSubjectsByUser(),
                getEvents(),
                getGroupsByUserId(),
            ]);

            const sortedTasks = [...tasksData].sort((a, b) => {
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            const sortedEvents = [...eventsData].sort((a, b) => {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            });

            setTasks(sortedTasks);
            setSubjects(subjectsData);
            setEvents(sortedEvents);
            setGroups(groupsData);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token && userId) fetchData();
    }, [token, userId, fetchData]);

    const handleAddTask = async (newTask) => {
        setLoading(true);
        try {
            const addedTask = await addTask(newTask);

            let taskWithSubject = { ...addedTask };

            if (addedTask.subjectId) {
                const subject = subjects.find(s => s.id === parseInt(addedTask.subjectId));
                if (subject) {
                    taskWithSubject.subject = subject.title;
                }
            }

            const updatedTasks = [...tasks, taskWithSubject].sort((a, b) => {
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
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };
    const handleTaskUpdate = async (updatedTask) => {
        setLoading(true);
        try {
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);

            let taskWithSubject = { ...updatedTaskFromBackend };

            if (updatedTaskFromBackend.subjectId) {
                const subject = subjects.find(s => s.id === parseInt(updatedTaskFromBackend.subjectId));
                if (subject) {
                    taskWithSubject.subject = subject.title;
                }
            }

            const updatedTasks = tasks
                .map((task) => (task.id === updatedTask.id ? taskWithSubject : task))
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
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Tarea',
            message: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
            onConfirm: async () => {
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
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleAddSubject = async (subjectName, schedules = []) => {
        setLoading(true);
        try {
            const newSubject = await addSubject({ title: subjectName }, schedules);

            await fetchData();

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

    const handleSubjectUpdate = async (subjectName, schedules = []) => {
        if (!editingSubject) return;
        setLoading(true);
        try {
            await updateSubject(editingSubject.id, { title: subjectName }, schedules);

            await fetchData();

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
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Asignatura',
            message: '¿Estás seguro de que quieres eliminar esta asignatura? Se eliminarán también todos los horarios asociados.',
            onConfirm: async () => {
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
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleAddEvent = async (newEvent) => {
        setLoading(true);
        try {
            const addedEvent = await addEvent(newEvent);

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
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const handleEventUpdate = async (updatedEvent) => {
        if (!editingEvent) return;
        setLoading(true);
        try {
            const updatedEventFromBackend = await updateEvent(editingEvent.id, updatedEvent);

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
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Evento',
            message: '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
            onConfirm: async () => {
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
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleNavigateToGroup = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    const handleAddGroup = () => {
        navigate('/groups');
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({
            ...confirmationModal,
            isOpen: false
        });
    };

    const pendingTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        return tasks
            .filter(task => task && task.status !== 'Finalizada')
            .sort((a, b) => new Date(a?.dueDate || 0) - new Date(b?.dueDate || 0));
    }, [tasks]);
    const upcomingEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];
        return events
            .filter(event => {
                if (!event) return false;
                if (!event.startDateTime) return true;

                const eventDate = new Date(event.startDateTime);
                if (isNaN(eventDate.getTime())) return false;

                const currentDate = new Date();
                const eventDateOnly = new Date(
                    eventDate.getFullYear(),
                    eventDate.getMonth(),
                    eventDate.getDate()
                );
                const currentDateOnly = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate()
                );

                return eventDateOnly >= currentDateOnly;
            })
            .sort((a, b) => new Date(a?.startDateTime || 0) - new Date(b?.startDateTime || 0));
    }, [events]);

    const sortedGroups = groups.sort((a, b) => b.memberCount - a.memberCount);

    const createCarouselItems = (items, Component, onUpdate, onDelete, props = {}) => {
        if (!Array.isArray(items)) {
            console.warn('Items no es un array:', items);
            return [];
        }

        let itemType = '';
        if (Component === TaskCard) itemType = 'task';
        else if (Component === EventCard) itemType = 'event';
        else if (Component === GroupCard) itemType = 'group';

        return items
            .filter(item => item && typeof item === 'object')
            .map((item, index) => (
                <div key={item?.id || index} className="min-w-full">
                    <Component
                        {...props}
                        {...{ [itemType]: item }}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                </div>
            ));
    };

    const taskItems = useMemo(() => {
        return createCarouselItems(
            pendingTasks.slice(0, 5),
            TaskCard,
            handleEditTask,
            handleTaskDelete,
            { subjects: subjects.map(s => s.title) }
        );
    }, [pendingTasks, subjects, handleEditTask, handleTaskDelete]);

    const eventItems = useMemo(() => {
        return createCarouselItems(
            upcomingEvents.slice(0, 5),
            EventCard,
            handleEditEvent,
            handleEventDelete
        );
    }, [upcomingEvents, handleEditEvent, handleEventDelete]);

    const groupItems = useMemo(() => {
        return createCarouselItems(
            sortedGroups.slice(0, 5),
            GroupCard,
            null,
            null,
            { onNavigate: handleNavigateToGroup }
        );
    }, [sortedGroups, handleNavigateToGroup]);

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
                        <div className="bg-error/10 text-error p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4 text-text">Cargando...</div>
                    )}

                    <div className="bg-card-bg p-4 sm:p-6 rounded-xl shadow-md mb-6 opacity-95 border border-border">
                        <h1 className="text-2xl md:text-3xl mb-2 text-primary font-bold">
                            ¡Bienvenido a StudyNamic!
                        </h1>
                        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                            <div className="bg-card-bg rounded">
                                <p className="text-sm text-primary font-medium">Tareas</p>
                                <p className="text-lg font-bold text-text">{tasks.length}</p>
                            </div>

                            <div className="bg-card-bg rounded">
                                <p className="text-sm text-primary font-medium">Eventos</p>
                                <p className="text-lg font-bold text-text">{events.length}</p>
                            </div>

                            <div className="bg-card-bg rounded">
                                <p className="text-sm text-primary font-medium">Asignaturas</p>
                                <p className="text-lg font-bold text-text">{subjects.length}</p>
                            </div>

                            <div className="bg-card-bg rounded">
                                <p className="text-sm text-primary font-medium">Grupos</p>
                                <p className="text-lg font-bold text-text">{groups.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95 border border-border">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-semibold text-primary">Tareas Pendientes</h2>
                                    <span className="ml-2 text-xs text-text-secondary">
                                        ({Array.isArray(pendingTasks) ? pendingTasks.length : 0})
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent flex items-center"
                                >
                                    <FaPlus className="mr-1" />
                                    {!isMobile && "Añadir"}
                                </button>
                            </div>

                            {!Array.isArray(pendingTasks) || pendingTasks.length === 0 ? (
                                <p className="text-text-secondary">No hay tareas pendientes.</p>
                            ) : (
                                <div className="max-h-[300px] relative">
                                    <ErrorBoundary>
                                        <Carousel autoSlide={false} autoSlideInterval={5000} showArrows={true} showDots={true}>
                                            {taskItems}
                                        </Carousel>
                                    </ErrorBoundary>
                                </div>
                            )}

                            {pendingTasks.length > 0 && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => navigate('/tasks')}
                                        className="text-primary hover:text-accent text-sm"
                                    >
                                        Ver todas las tareas
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95 border border-border">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-semibold text-primary">Próximos Eventos</h2>
                                    <span className="ml-2 text-xs text-text-secondary">({upcomingEvents.length})</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setIsEventModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent flex items-center"
                                >
                                    <FaPlus className="mr-1" />
                                    {!isMobile && "Añadir"}
                                </button>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <p className="text-text-secondary">No hay eventos próximos.</p>
                            ) : (
                                <div className="max-h-[300px] relative">
                                    <Carousel autoSlide={false} autoSlideInterval={6000} showArrows={true} showDots={true}>
                                        {eventItems}
                                    </Carousel>
                                </div>
                            )}

                            {upcomingEvents.length > 0 && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => navigate('/calendar')}
                                        className="text-primary hover:text-accent text-sm"
                                    >
                                        Ver calendario completo
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95 border border-border">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-semibold text-primary">Mis Grupos</h2>
                                    <span className="ml-2 text-xs text-text-secondary">({sortedGroups.length})</span>
                                </div>
                                <button
                                    onClick={handleAddGroup}
                                    className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent flex items-center"
                                >
                                    <FaPlus className="mr-1" />
                                    {!isMobile && "Añadir"}
                                </button>
                            </div>

                            {sortedGroups.length === 0 ? (
                                <p className="text-text-secondary">No estás en ningún grupo.</p>
                            ) : (
                                <div className="max-h-[300px] relative">
                                    <Carousel autoSlide={false} autoSlideInterval={7000} showArrows={true} showDots={true}>
                                        {groupItems}
                                    </Carousel>
                                </div>
                            )}

                            {sortedGroups.length > 0 && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => navigate('/groups')}
                                        className="text-primary hover:text-accent text-sm"
                                    >
                                        Ver todos los grupos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card-bg p-4 rounded-xl shadow-md md:p-6 opacity-95 border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <h2 className="text-xl font-semibold text-primary">Mis Asignaturas</h2>
                                <span className="ml-2 text-xs text-text-secondary">({subjects.length})</span>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingSubject(null);
                                    setIsSubjectModalOpen(true);
                                }}
                                className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent flex items-center"
                            >
                                <FaPlus className="mr-1" />
                                {!isMobile && "Añadir Asignatura"}
                            </button>
                        </div>

                        {subjects.length === 0 ? (
                            <p className="text-text-secondary">No tienes asignaturas registradas.</p>
                        ) : (
                            <>
                                <div className="hidden md:grid md:grid-cols-3 gap-4">
                                    {subjects.map((subject) => (
                                        <SubjectCard
                                            key={subject.id}
                                            subject={subject}
                                            onUpdate={handleEditSubject}
                                            onDelete={handleSubjectDelete}
                                        />
                                    ))}
                                </div>
                                <div className="md:hidden relative">
                                    <Carousel autoSlide={false} autoSlideInterval={4000} showArrows={true} showDots={true}>
                                        {subjects.map((subject) => (
                                            <div key={subject.id} className="min-w-full">
                                                <SubjectCard
                                                    subject={subject}
                                                    onUpdate={handleEditSubject}
                                                    onDelete={handleSubjectDelete}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

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

export default Dashboard;
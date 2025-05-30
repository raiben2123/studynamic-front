import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCardGroup from '../components/dashboard/TaskCardGroup';
import ModernCalendar from '../components/ModernCalendar';
import TaskModalGroup from '../components/modals/TaskModalGroup';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import EventModal from '../components/modals/EventModal';
import SessionModal from '../components/modals/SessionModal';
import Modal from '../components/modals/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaComments,
    FaTimes,
    FaShareAlt,
    FaUsers,
    FaTasks,
    FaCalendarAlt,
    FaBook,
    FaCog,
    FaPlus,
    FaEllipsisV,
    FaCrown,
    FaVideo,
    FaUserMinus,
    FaLink,
    FaLock,
    FaFile
} from 'react-icons/fa';
import { formatDateForDisplay } from '../utils/dateUtils';
import FilesTab from '../components/files/FilesTab';

import { deleteGroup, getGroupById, getGroupMembers, leaveGroup, getGroupsByUserId, joinGroup } from '../api/groups';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getSubjects } from '../api/subjects';

const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { token, userId } = useAuth();

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [notes, setNotes] = useState({});
    const [studySessions, setStudySessions] = useState([]);
    const [activeTab, setActiveTab] = useState('members');

    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [joinPassword, setJoinPassword] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [shareLink, setShareLink] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [memberTooltip, setMemberTooltip] = useState(null);

    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning',
        confirmText: 'Confirmar'
    });

    const closeConfirmationModal = () => {
        setConfirmationModal({
            ...confirmationModal,
            isOpen: false
        });
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkGroupAccess = async () => {
            setCheckingAccess(true);
            try {
                const userGroups = await getGroupsByUserId();

                const isMember = userGroups.some(group => group.id === parseInt(groupId));

                if (isMember) {
                    setHasAccess(true);
                    fetchGroupData();
                } else {
                    setHasAccess(false);
                    setGroup(await getGroupById(groupId));
                }
            } catch (error) {
                console.error('Error verificando acceso al grupo:', error);
                setError('No tienes acceso a este grupo o el grupo no existe');
                setHasAccess(false);
            } finally {
                setCheckingAccess(false);
                setLoading(false);
            }
        };

        if (token && userId && groupId) {
            checkGroupAccess();
        }
    }, [groupId, token, userId]);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            const groupData = await getGroupById(groupId);
            setGroup(groupData);

            const [membersData, tasksData, eventsData, subjectsData] = await Promise.all([
                getGroupMembers(groupId),
                getTasks(true, groupId),
                getEvents(true, groupId),
                getSubjects(),
            ]);

            setMembers(membersData || []);
            setTasks(tasksData || []);
            setEvents(eventsData || []);
            setSubjects(subjectsData || []);

            setNotes({});

            setStudySessions([
                {
                    id: 1,
                    title: 'Sesión de repaso para el grupo',
                    start: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                    zoomLink: 'https://zoom.us/j/123456789',
                    allDay: true,
                    groupId: parseInt(groupId)
                }
            ]);

            setError(null);
        } catch (err) {
            console.error('Error fetching group data:', err);
            setError('Error al cargar los datos del grupo. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinPassword) {
            showToast('Por favor, introduce la contraseña del grupo', 'error');
            return;
        }

        setLoading(true);
        try {
            await joinGroup(groupId, joinPassword);
            showToast('¡Te has unido al grupo correctamente!', 'success');
            setHasAccess(true);
            fetchGroupData();
            setShowJoinModal(false);
        } catch (error) {
            console.error('Error al unirse al grupo:', error);
            showToast('Contraseña incorrecta o no tienes permisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = React.useMemo(() => {
        return members.some(member =>
            member.userId === parseInt(userId) &&
            member.roleId === 1
        );
    }, [members, userId]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ ...toast, visible: false });
        }, 3000);
    };

    const [modernCalendarEvents, setModernCalendarEvents] = useState([]);
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);

    useEffect(() => {
        if (modernCalendarEvents.length > 0) {
            const filteredEvents = modernCalendarEvents.filter(event => {
                const eventDate = event.dueDate || event.startDateTime;
                if (!eventDate) return false;

                if (event.groupId === undefined || event.groupId !== parseInt(groupId)) {
                    return false;
                }

                const eventDateObj = new Date(eventDate);
                return eventDateObj.toDateString() === selectedCalendarDay.toDateString();
            });

            setDayEvents(filteredEvents);
        } else {
            setDayEvents([]);
        }
    }, [selectedCalendarDay, modernCalendarEvents, groupId]);

    const handleDaySelect = (date) => {
        setSelectedCalendarDay(date);
    };

    const handleAddForDate = (date) => {
        setSelectedDate(date.toISOString().split('T')[0]);
        setIsAddModalOpen(true);
    };

    const handleTaskDelete = async (taskId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Tarea',
            message: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteTask(taskId);
                    setTasks(tasks.filter(t => t.id !== taskId));
                    showToast('Tarea eliminada correctamente', 'success');
                } catch (err) {
                    console.error('Error deleting task:', err);
                    setError('Error al eliminar la tarea');
                }
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleEventDelete = async (eventId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Evento',
            message: '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await deleteEvent(eventId);
                    setEvents(events.filter(e => e.id !== eventId));
                    showToast('Evento eliminado correctamente', 'success');
                } catch (err) {
                    console.error('Error deleting event:', err);
                    setError('Error al eliminar el evento');
                }
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleSessionDelete = (sessionId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Sesión',
            message: '¿Estás seguro de que quieres eliminar esta sesión de estudio? Esta acción no se puede deshacer.',
            onConfirm: () => {
                setStudySessions(studySessions.filter(s => s.id !== sessionId));
                showToast('Sesión eliminada correctamente', 'success');
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleDeleteGroup = () => {
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Grupo',
            message: 'Esta acción eliminará permanentemente el grupo y todos sus datos. No se puede deshacer. ¿Estás seguro?',
            onConfirm: async () => {
                await deleteGroup(groupId);
                showToast('Grupo eliminado correctamente', 'success');
                navigate('/groups');
            },
            type: 'danger',
            confirmText: 'Eliminar Permanentemente'
        });
    };

    const handleKickMember = async (memberId) => {
        if (!isAdmin) return;

        setConfirmationModal({
            isOpen: true,
            title: 'Expulsar Miembro',
            message: '¿Estás seguro de que quieres expulsar a este miembro del grupo?',
            onConfirm: async () => {
                try {
                    await leaveGroup(groupId, memberId);
                    setMembers(members.filter((m) => m.userId !== memberId));
                    showToast('Miembro expulsado correctamente', 'success');
                } catch (error) {
                    console.error('Error kicking member:', error);
                    setError('Error al expulsar al miembro');
                }
            },
            type: 'warning',
            confirmText: 'Expulsar'
        });
    };

    const handleShareLink = () => {
        const inviteUrl = `${window.location.origin}/#/groups/join/${groupId}`;

        navigator.clipboard.writeText(inviteUrl)
            .then(() => {
                showToast('Enlace copiado al portapapeles', 'success');
            })
            .catch(err => {
                console.error('Error al copiar el enlace:', err);
                setShareLink(inviteUrl);
                setIsShareModalOpen(true);
            });
    };

    const handleAddTask = async (newTask) => {
        try {
            const taskToAdd = {
                ...newTask,
                groupId: parseInt(groupId)
            };
            const addedTask = await addTask(taskToAdd, true, groupId);
            setTasks([...tasks, addedTask]);
            setIsTaskModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedDate(null);
            showToast('Tarea añadida correctamente', 'success');
        } catch (error) {
            console.error('Error adding task:', error);
            setError('Error al añadir la tarea');
        }
    };

    const handleTaskUpdate = async (updatedTask) => {
        try {
            const updatedTaskResult = await updateTask(updatedTask.id, updatedTask, true, groupId);
            setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTaskResult : task)));
            setIsTaskModalOpen(false);
            setEditingTask(null);
            showToast('Tarea actualizada correctamente', 'success');
        } catch (error) {
            console.error('Error updating task:', error);
            setError('Error al actualizar la tarea');
        }
    };

    const handleAddEvent = async (newEvent) => {
        try {
            const eventToAdd = {
                ...newEvent,
                groupId: parseInt(groupId),
                userId: null
            };
            const addedEvent = await addEvent(eventToAdd, true);
            setEvents([...events, addedEvent]);
            setIsEventModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedDate(null);
            showToast('Evento añadido correctamente', 'success');
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Error al añadir el evento');
        }
    };

    const handleUpdateEvent = async (updatedEvent) => {
        try {
            const updatedEventResult = await updateEvent(updatedEvent.id, updatedEvent, true);
            setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEventResult : event)));
            setIsEventModalOpen(false);
            setEditingEvent(null);
            showToast('Evento actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Error al actualizar el evento');
        }
    };

    const handleAddSession = (newSession) => {
        const sessionToAdd = {
            id: Date.now(),
            ...newSession,
            allDay: !newSession.start.includes('T'),
            groupId: parseInt(groupId)
        };
        setStudySessions([...studySessions, sessionToAdd]);
        setIsSessionModalOpen(false);
        showToast('Sesión de estudio programada correctamente', 'success');
    };

    useEffect(() => {
        if (!hasAccess) return;

        const currentGroupId = parseInt(groupId);

        const updatedEvents = [
            ...tasks
                .filter(task => task.groupId === currentGroupId)
                .map((task) => ({
                    id: task.id.toString(),
                    title: task.title,
                    dueDate: task.dueDate,
                    type: 'task',
                    importance: task.importance,
                    status: task.status,
                    subject: task.subject || 'Sin asignatura',
                    groupId: task.groupId
                })),

            ...events
                .filter(event => event.groupId === currentGroupId)
                .map((event) => ({
                    id: event.id.toString(),
                    title: event.title,
                    startDateTime: event.startDateTime,
                    endDateTime: event.endDateTime,
                    type: 'event',
                    groupId: event.groupId
                })),

            ...studySessions
                .filter(session => session.groupId === currentGroupId)
                .map((session) => ({
                    id: session.id.toString(),
                    title: session.title,
                    dueDate: session.start,
                    type: 'session',
                    zoomLink: session.zoomLink,
                    groupId: session.groupId
                })),
        ];

        setModernCalendarEvents(updatedEvents);
    }, [tasks, events, studySessions, groupId, hasAccess]);

    const getMemberColor = (memberName) => {
        const colors = [
            'bg-primary', 'bg-accent', 'bg-task-finalizada',
            'bg-task-vencida', 'bg-primary-light', 'bg-task'
        ];

        if (!memberName) return colors[0];

        const hash = memberName.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    if (checkingAccess) {
        return (
            <div className="flex flex-col min-h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg text-gray-600">Verificando acceso al grupo...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col min-h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8 flex justify-center items-center">
                    <div className="bg-card-bg p-8 rounded-xl shadow-md max-w-md text-center">
                        <FaLock className="mx-auto text-4xl text-primary mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-4">Acceso Restringido</h2>
                        <p className="text-text-secondary mb-6">
                            No tienes acceso a este grupo. Debes ser miembro para ver su contenido.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                            >
                                Unirme al Grupo
                            </button>
                            <button
                                onClick={() => navigate('/groups')}
                                className="w-full bg-border text-text px-4 py-2 rounded-lg hover:bg-border/80 transition-colors"
                            >
                                Volver a Grupos
                            </button>
                        </div>
                    </div>
                </div>

                {showJoinModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-card-bg p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                            <h3 className="text-xl font-semibold mb-4 text-primary border-b pb-2">
                                Unirse a {group?.name || 'Grupo'}
                            </h3>
                            <p className="text-text-secondary mb-4">
                                Introduce la contraseña del grupo para unirte.
                            </p>
                            <div className="mb-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaLock className="text-text-secondary" />
                                    </div>
                                    <input
                                        type="password"
                                        value={joinPassword}
                                        onChange={(e) => setJoinPassword(e.target.value)}
                                        placeholder="Contraseña del grupo"
                                        className="w-full pl-10 p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    className="px-4 py-2 bg-border text-text rounded-lg hover:bg-border/80 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleJoinGroup}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            <span>Uniendo...</span>
                                        </div>
                                    ) : 'Unirme'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg text-text-secondary">Cargando datos del grupo...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !group) {
        return (
            <div className="flex flex-col min-h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8 flex flex-col justify-center items-center">
                    <div className="bg-task-vencida/10 text-task-vencida p-6 rounded-lg mb-6 max-w-md text-center">
                        <p className="text-lg mb-4">{error}</p>
                        <p className="text-sm mb-6">No se pudo cargar la información del grupo. Por favor, intenta de nuevo más tarde.</p>
                        <button
                            onClick={() => navigate('/groups')}
                            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-colors"
                        >
                            Volver a Grupos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                <AnimatePresence>
                    {toast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-task-finalizada text-task-finalizada' : 
                            toast.type === 'error' ? 'bg-task-vencida text-task-vencida' : 
                            'bg-primary-light text-primary'
                            }`}
                        >
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative z-10">
                    {error && (
                        <div className="bg-task-vencida text-task-vencida p-3 rounded mb-4 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <div className="bg-card-bg p-6 rounded-xl shadow-md mb-6 opacity-95">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl text-primary font-bold">{group?.name || 'Grupo'}</h1>
                                <p className="text-text-secondary mt-1">
                                    <span className="flex items-center">
                                        <FaUsers className="mr-2 text-primary" />
                                        {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                                    </span>
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleShareLink}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                >
                                    <FaShareAlt className="mr-2" /> Compartir
                                </button>
                                <Link
                                    to="/groups"
                                    className="bg-border text-text px-4 py-2 rounded-lg hover:bg-border/80 transition-colors"
                                >
                                    Volver
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex border-b-2 border-border overflow-x-auto hide-scrollbar">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'members'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                <FaUsers className="mr-1.5" /> {!isMobile && 'Miembros'}
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'tasks'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                <FaTasks className="mr-1.5" /> {!isMobile && 'Tareas'}
                            </button>
                            <button
                                onClick={() => setActiveTab('calendar')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'calendar'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                <FaCalendarAlt className="mr-1.5" /> {!isMobile && 'Calendario'}
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'files'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                <FaFile className="mr-1.5" /> {!isMobile && 'Archivos'}
                            </button>
                            <button
                                onClick={() => setActiveTab('sessions')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'sessions'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                <FaComments className="mr-1.5" /> {!isMobile && 'Sesiones'}
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'settings'
                                        ? 'text-primary border-b-2 border-primary -mb-0.5'
                                        : 'text-text-secondary hover:text-primary'
                                        }`}
                                >
                                    <FaCog className="mr-1.5" /> {!isMobile && 'Ajustes'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-card-bg p-6 rounded-xl shadow-md opacity-95 min-h-[60vh]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'members' && (
                                <motion.div
                                    key="members"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Miembros ({members.length})</h2>
                                    </div>

                                    {members.length === 0 ? (
                                        <div className="text-center py-10 bg-primary-light rounded-lg">
                                            <FaUsers className="mx-auto text-text-secondary text-4xl mb-4" />
                                            <p className="text-text mb-2">No hay miembros en este grupo.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {members.map((member) => (
                                                <div
                                                    key={member.userId}
                                                    className="bg-input-bg rounded-lg p-4 border border-border flex items-center relative"
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${getMemberColor(member.username)}`}>
                                                        {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-text">{member.username}</span>
                                                            {member.roleId === 1 && (
                                                                <span className="ml-2 text-yellow-500" title="Administrador">
                                                                    <FaCrown />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-text-secondary">{member.roleId === 1 ? 'Administrador' : 'Miembro'}</span>
                                                    </div>

                                                    {isAdmin && member.userId !== parseInt(userId) && (
                                                        <div className="relative ml-2">
                                                            <button
                                                                onClick={() => setMemberTooltip(memberTooltip === member.userId ? null : member.userId)}
                                                                className="text-text-secondary hover:text-text p-2 rounded-full hover:bg-border"
                                                            >
                                                                <FaEllipsisV size={16} />
                                                            </button>

                                                            {memberTooltip === member.userId && (
                                                                <div className="absolute right-0 mt-1 w-48 bg-card-bg rounded-md shadow-lg z-10 border border-border">
                                                                    <button
                                                                        onClick={() => {
                                                                            handleKickMember(member.userId);
                                                                            setMemberTooltip(null);
                                                                        }}
                                                                        className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-task-vencida/10 text-task-vencida"
                                                                    >
                                                                        <FaUserMinus className="mr-2" /> Expulsar del grupo
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'tasks' && (
                                <motion.div
                                    key="tasks"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Tareas</h2>
                                        <button
                                            onClick={() => {
                                                setEditingTask(null);
                                                setIsTaskModalOpen(true);
                                            }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                        >
                                            <FaPlus className="mr-2" /> Añadir Tarea
                                        </button>
                                    </div>

                                    {tasks.length === 0 ? (
                                        <div className="text-center py-10 bg-primary-light rounded-lg">
                                            <FaTasks className="mx-auto text-text-secondary text-4xl mb-4" />
                                            <p className="text-text mb-2">No hay tareas asignadas a este grupo.</p>
                                            <button
                                                onClick={() => {
                                                    setEditingTask(null);
                                                    setIsTaskModalOpen(true);
                                                }}
                                                className="mt-2 text-primary hover:text-accent"
                                            >
                                                Crear la primera tarea
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {tasks.map((task) => (
                                                <TaskCardGroup
                                                    key={task.id}
                                                    task={task}
                                                    onUpdate={(task) => {
                                                        setEditingTask(task);
                                                        setIsTaskModalOpen(true);
                                                    }}
                                                    onDelete={handleTaskDelete}
                                                    subjects={subjects.map((s) => s.title)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'calendar' && (
                                <motion.div
                                    key="calendar"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Calendario</h2>
                                    </div>

                                    {modernCalendarEvents.length === 0 ? (
                                        <div className="text-center py-10 bg-primary-light rounded-lg">
                                            <FaCalendarAlt className="mx-auto text-text-secondary text-4xl mb-4" />
                                            <p className="text-text mb-2">No hay eventos en el calendario.</p>
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="mt-2 text-primary hover:text-accent"
                                            >
                                                Añadir el primer evento
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-[60vh] md:h-[70vh]">
                                            <ModernCalendar
                                                layout='side'
                                                events={modernCalendarEvents}
                                                onAddEvent={(date) => {
                                                    setSelectedDate(date.toISOString().split('T')[0]);
                                                    setIsAddModalOpen(true);
                                                }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'files' && (
                                <motion.div
                                    key="files"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <FilesTab groupId={groupId} />
                                </motion.div>
                            )}
                            
                            {activeTab === 'sessions' && (
                                <motion.div
                                    key="sessions"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Sesiones de Estudio</h2>
                                        <button
                                            onClick={() => setIsSessionModalOpen(true)}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                        >
                                            <FaPlus className="mr-2" /> Programar Sesión
                                        </button>
                                    </div>

                                    {studySessions.length === 0 ? (
                                        <div className="text-center py-10 bg-primary-light rounded-lg">
                                            <FaVideo className="mx-auto text-text-secondary text-4xl mb-4" />
                                            <p className="text-text mb-2">No hay sesiones de estudio programadas.</p>
                                            <button
                                                onClick={() => setIsSessionModalOpen(true)}
                                                className="mt-2 text-primary hover:text-accent"
                                            >
                                                Programar la primera sesión
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {studySessions.map((session) => (
                                                <div key={session.id} className="bg-input-bg p-4 rounded-lg border border-border">
                                                    <div className="font-medium text-primary text-lg mb-1">{session.title}</div>
                                                    <div className="text-text-secondary flex items-center mb-2">
                                                        <FaCalendarAlt className="mr-2 text-text-secondary" />
                                                        {formatDateForDisplay(session.start)}
                                                    </div>
                                                    <a
                                                        href={session.zoomLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-primary hover:text-accent mb-3"
                                                    >
                                                        <FaVideo className="mr-2" />
                                                        Enlace de la sesión
                                                    </a>
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleSessionDelete(session.id)}
                                                            className="text-task-vencida hover:text-task-vencida/80 text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'settings' && isAdmin && (
                                <motion.div
                                    key="settings"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Ajustes del Grupo</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-input-bg p-6 rounded-lg border border-border">
                                        <h3 className="text-lg font-medium text-text mb-4">Información General</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-text">
                                                        Nombre del grupo
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={group.name}
                                                        onChange={(e) => setGroup({ ...group, name: e.target.value })}
                                                        className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-text">
                                                        Descripción del grupo
                                                    </label>
                                                    <textarea
                                                        value={group.description || ''}
                                                        onChange={(e) => setGroup({ ...group, description: e.target.value })}
                                                        className="w-full p-2 border border-border bg-input-bg text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                        rows="3"
                                                    />
                                                </div>
                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => {
                                                            showToast('Información actualizada correctamente', 'success');
                                                        }}
                                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                                    >
                                                        Guardar Cambios
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-input-bg p-6 rounded-lg border border-border">
                                            <h3 className="text-lg font-medium text-text mb-4">Zona de Peligro</h3>
                                            <p className="text-text-secondary mb-4">Estas acciones no se pueden deshacer. Ten cuidado.</p>
                                            <div className="flex flex-col space-y-3">
                                                <button
                                                    onClick={handleDeleteGroup}
                                                    className="bg-task-vencida text-white px-4 py-2 rounded-lg hover:bg-task-vencida/80 transition-colors flex items-center justify-center"
                                                >
                                                    <FaTimes className="mr-2" /> Eliminar Grupo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Modal para compartir enlace */}
                <Modal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    title="Compartir Grupo"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Comparte este enlace para que otros usuarios puedan unirse al grupo:
                        </p>
                        <div className="flex">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareLink);
                                    showToast('Enlace copiado al portapapeles', 'success');
                                    setIsShareModalOpen(false);
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-r hover:bg-accent"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </Modal>

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-card-bg p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-primary">
                                Añadir en {formatDateForDisplay(selectedDate)}
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="w-full bg-task-normal text-white px-4 py-2 rounded-lg hover:bg-task-normal/80 flex items-center justify-center"
                                >
                                    <FaTasks className="mr-2" /> Nueva Tarea
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsEventModalOpen(true);
                                    }}
                                    className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent flex items-center justify-center"
                                >
                                    <FaCalendarAlt className="mr-2" /> Nuevo Evento
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsSessionModalOpen(true);
                                    }}
                                    className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent flex items-center justify-center"
                                >
                                    <FaVideo className="mr-2" /> Nueva Sesión
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-full bg-border text-text px-4 py-2 rounded-lg hover:bg-border/80"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <TaskModalGroup
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setEditingTask(null);
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
                    }}
                    onSave={editingEvent ? handleUpdateEvent : handleAddEvent}
                    event={editingEvent}
                    defaultDate={selectedDate}
                />

                <SessionModal
                    isOpen={isSessionModalOpen}
                    onClose={() => setIsSessionModalOpen(false)}
                    onSave={handleAddSession}
                    defaultDate={selectedDate}
                />

                <Modal
                    isOpen={isEventDetailsOpen}
                    onClose={() => setIsEventDetailsOpen(false)}
                    title={selectedEvent?.type === 'task' ? 'Detalles de Tarea' :
                        selectedEvent?.type === 'session' ? 'Detalles de Sesión' : 'Detalles de Evento'}
                    size="md"
                >
                    {selectedEvent && (
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-primary text-lg">{selectedEvent.title}</h3>

                                <div className="mt-3 space-y-2">
                                    <div className="flex items-start">
                                        <div className="min-w-8 text-gray-400 mt-1">
                                            <FaCalendarAlt />
                                        </div>
                                        <div>
                                            <p className="text-gray-800">Fecha de inicio:</p>
                                            <p className="text-gray-600">{formatDateForDisplay(selectedEvent.start)}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.end && (
                                        <div className="flex items-start">
                                            <div className="min-w-8 text-gray-400 mt-1">
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <p className="text-gray-800">Fecha de fin:</p>
                                                <p className="text-gray-600">{formatDateForDisplay(selectedEvent.end)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.type === 'task' && (
                                        <>
                                            <div className="flex items-start">
                                                <div className="min-w-8 text-gray-400 mt-1">
                                                    <FaTasks />
                                                </div>
                                                <div>
                                                    <p className="text-gray-800">Estado:</p>
                                                    <p className="text-gray-600">{selectedEvent.status}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <div className="min-w-8 text-gray-400 mt-1">
                                                    <FaBook />
                                                </div>
                                                <div>
                                                    <p className="text-gray-800">Asignatura:</p>
                                                    <p className="text-gray-600">{selectedEvent.subject || 'No especificada'}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedEvent.type === 'session' && selectedEvent.zoomLink && (
                                        <div className="flex items-start">
                                            <div className="min-w-8 text-gray-400 mt-1">
                                                <FaLink />
                                            </div>
                                            <div>
                                                <p className="text-gray-800">Enlace de la sesión:</p>
                                                <a
                                                    href={selectedEvent.zoomLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-accent"
                                                >
                                                    {selectedEvent.zoomLink}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                {selectedEvent.type === 'task' && (
                                    <button
                                        onClick={() => {
                                            setEditingTask({
                                                id: selectedEvent.id,
                                                title: selectedEvent.title,
                                                startDateTime: selectedEvent.startDateTime,
                                                endDateTime: selectedEvent.endDateTime,
                                                notification: selectedEvent.notification,
                                            });
                                            setIsEventModalOpen(true);
                                            setIsEventDetailsOpen(false);
                                        }}
                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        Editar
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEventDetailsOpen(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText || 'Confirmar'}
            />

            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Compartir Grupo"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Comparte este enlace para que otros usuarios puedan unirse al grupo:
                    </p>
                    <div className="flex">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none"
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(shareLink);
                                showToast('Enlace copiado al portapapeles', 'success');
                            }}
                            className="bg-primary text-white px-4 py-2 rounded-r hover:bg-accent transition-colors"
                        >
                            Copiar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>

    );
};

export default GroupDetailsPage;
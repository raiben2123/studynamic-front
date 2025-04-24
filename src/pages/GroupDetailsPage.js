// src/pages/GroupDetailsPage.js - With Theme Support
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import ModernCalendar from '../components/ModernCalendar'; // Cambiado a ModernCalendar
import TaskModal from '../components/modals/TaskModal';
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
    FaUserCircle,
    FaFileUpload,
    FaEllipsisV,
    FaCrown,
    FaDownload,
    FaVideo,
    FaUserMinus,
    FaEye,
    FaLink
} from 'react-icons/fa';
import { formatDateForDisplay } from '../utils/dateUtils';

// API imports
import { getGroupById, getGroupMembers, leaveGroup } from '../api/groups';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getSubjects } from '../api/subjects';

const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { token, userId, user, userTheme } = useAuth(); // Added userTheme

    // Estado
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [notes, setNotes] = useState({});
    const [studySessions, setStudySessions] = useState([]);
    const [activeTab, setActiveTab] = useState('members');

    // Modal states
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [shareLink, setShareLink] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [memberTooltip, setMemberTooltip] = useState(null);

    // Notificación toast
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Responsive handler
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch data
    useEffect(() => {
        const fetchGroupData = async () => {
            setLoading(true);
            try {
                // Fetch group details
                const groupData = await getGroupById(groupId);
                setGroup(groupData);

                // Fetch members, tasks, events in parallel
                // Importante: usamos los endpoints específicos para el grupo
                const [membersData, tasksData, eventsData, subjectsData] = await Promise.all([
                    getGroupMembers(groupId),
                    getTasks(true, groupId), // Este ya usa el endpoint api/usertasks/group/{groupId}
                    getEvents(true, groupId), // Este ya usa el endpoint api/events/group/{groupId}
                    getSubjects(),
                ]);

                setMembers(membersData || []);
                setTasks(tasksData || []);
                setEvents(eventsData || []);
                setSubjects(subjectsData || []);

                // Initialize notes structure with default folders
                setNotes({
                    'Apuntes de clase': [],
                    'Ejercicios resueltos': [],
                    'Material complementario': []
                });

                // Initialize study sessions with sample data
                // Esto es temporal hasta que tengamos el endpoint real
                setStudySessions([
                    {
                        id: 1,
                        title: 'Sesión de repaso para el grupo',
                        start: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // En 3 días
                        zoomLink: 'https://zoom.us/j/123456789',
                        allDay: true,
                        groupId: parseInt(groupId) // Añadimos el groupId para filtrar
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

        if (token && userId && groupId) {
            fetchGroupData();
        }
    }, [groupId, token, userId]);

    // Check if current user is admin
    const isAdmin = members.find((m) => m.userId === parseInt(userId) && m.roleId === 1) !== undefined;

    // Funciones de Toast
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ ...toast, visible: false });
        }, 3000);
    };

    // Manejadores de eventos para el calendario
    const [modernCalendarEvents, setModernCalendarEvents] = useState([]);
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);
    // Filtrar eventos del día seleccionado
    useEffect(() => {
        if (modernCalendarEvents.length > 0) {
            const filteredEvents = modernCalendarEvents.filter(event => {
                const eventDate = event.dueDate || event.startDateTime;
                if (!eventDate) return false;

                // Verificar que pertenezca al grupo actual
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

    const handleKickMember = async (memberId) => {
        if (!isAdmin) return;

        if (window.confirm('¿Estás seguro de que quieres expulsar a este miembro?')) {
            try {
                // API call to remove member
                await leaveGroup(groupId, memberId);
                setMembers(members.filter((m) => m.userId !== memberId));
                showToast('Miembro expulsado correctamente', 'success');
            } catch (error) {
                console.error('Error kicking member:', error);
                setError('Error al expulsar al miembro');
            }
        }
    };

    const handleShareLink = () => {
        const link = `${window.location.origin}/groups/join/${groupId}?groupId=${groupId}`;
        setShareLink(link);
        setIsShareModalOpen(true);
    };

    const handleAddTask = async (newTask) => {
        try {
            const taskToAdd = {
                ...newTask,
                subjectId: newTask.subjectId,
                // Especificamos explícitamente que esta tarea pertenece al grupo
                groupId: parseInt(groupId)
            };
            // El segundo parámetro "true" indica que esta es una tarea de grupo
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
                // Especificamos explícitamente que este evento pertenece al grupo
                groupId: parseInt(groupId),
                // Establecemos userId a null para indicar que es un evento de grupo
                userId: null
            };
            // El segundo parámetro "true" indica que es un evento de grupo
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
        // For now, we'll just add it to local state since we don't have a backend API for sessions
        const sessionToAdd = {
            id: Date.now(),
            ...newSession,
            allDay: !newSession.start.includes('T'),
            groupId: parseInt(groupId) // Añadimos el groupId para asegurarnos de que se filtre correctamente
        };
        setStudySessions([...studySessions, sessionToAdd]);
        setIsSessionModalOpen(false);
        showToast('Sesión de estudio programada correctamente', 'success');
    };

    const handleAddFolder = () => {
        if (!newFolderName || notes[newFolderName]) {
            alert('El nombre de la carpeta ya existe o está vacío.');
            return;
        }
        setNotes({ ...notes, [newFolderName]: [] });
        setNewFolderName('');
        showToast('Carpeta creada correctamente', 'success');
    };

    const handleFileUpload = (folder, event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
            setNotes({
                ...notes,
                [folder]: [...notes[folder], { id: Date.now(), name: file.name, file, uploadDate: new Date().toISOString() }]
            });
            showToast('Archivo subido correctamente', 'success');
        } else {
            alert('Por favor, sube un archivo PDF o Word válido.');
        }
    };

    // Transformar eventos para el ModernCalendar
    useEffect(() => {
        // CORREGIDO: No usar groupId directamente dentro de useEffect 
        // ya que se está accediendo como parámetro en vez de como variable 
        // del componente
        const currentGroupId = parseInt(groupId);

        const updatedEvents = [
            // Filtrar tareas del grupo
            ...tasks
                .filter(task => task.groupId === currentGroupId || task.groupId === groupId)
                .map((task) => ({
                    id: task.id.toString(),
                    title: task.title,
                    dueDate: task.dueDate,
                    type: 'task',
                    importance: task.importance,
                    status: task.status,
                    subject: task.subject,
                    groupId: task.groupId
                })),

            // Filtrar eventos del grupo
            ...events
                .filter(event => event.groupId === currentGroupId || event.groupId === groupId)
                .map((event) => ({
                    id: event.id.toString(),
                    title: event.title,
                    startDateTime: event.startDateTime,
                    endDateTime: event.endDateTime,
                    type: 'event',
                    groupId: event.groupId
                })),

            // Filtrar sesiones del grupo
            ...studySessions
                .filter(session => session.groupId === currentGroupId || session.groupId === groupId)
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
    }, [tasks, events, studySessions, groupId]);

    // Obtener un color para el avatar del miembro basado en su nombre
    const getMemberColor = (memberName) => {
        const colors = [
            'bg-primary', 'bg-accent', 'bg-task-finalizada',
            'bg-task-vencida', 'bg-primary-light', 'bg-task'
        ];

        if (!memberName) return colors[0];

        // Calculate a hash value from the member name
        const hash = memberName.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
    };

    // Navegación con animación entre tabs
    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg text-gray-600">Cargando datos del grupo...</p>
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
                    <div className="bg-error/10 text-error p-6 rounded-lg mb-6 max-w-md text-center">
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
                }}
            >
                {/* Toast notification */}
                <AnimatePresence>
                    {toast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-task-finalizada-bg border-l-4 border-task-finalizada text-task-finalizada' :
                                toast.type === 'error' ? 'bg-error/10 border-l-4 border-error text-error' :
                                    'bg-primary-light border-l-4 border-primary text-primary'
                                }`}
                        >
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative z-10">
                    {error && (
                        <div className="bg-error/10 text-error p-3 rounded mb-4 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-md mb-6 opacity-95">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl text-primary font-bold">{group?.name || 'Grupo'}</h1>
                                <p className="text-gray-600 mt-1">
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
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Volver
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex border-b-2 border-gray-200 overflow-x-auto hide-scrollbar">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'members'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-gray-500 hover:text-primary'
                                    }`}
                            >
                                <FaUsers className="mr-1.5" /> {!isMobile && 'Miembros'}
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'tasks'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-gray-500 hover:text-primary'
                                    }`}
                            >
                                <FaTasks className="mr-1.5" /> {!isMobile && 'Tareas'}
                            </button>
                            <button
                                onClick={() => setActiveTab('calendar')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'calendar'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-gray-500 hover:text-primary'
                                    }`}
                            >
                                <FaCalendarAlt className="mr-1.5" /> {!isMobile && 'Calendario'}
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'notes'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-gray-500 hover:text-primary'
                                    }`}
                            >
                                <FaBook className="mr-1.5" /> {!isMobile && 'Apuntes'}
                            </button>
                            <button
                                onClick={() => setActiveTab('sessions')}
                                className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'sessions'
                                    ? 'text-primary border-b-2 border-primary -mb-0.5'
                                    : 'text-gray-500 hover:text-primary'
                                    }`}
                            >
                                <FaComments className="mr-1.5" /> {!isMobile && 'Sesiones'}
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-2 px-4 font-medium whitespace-nowrap flex items-center ${activeTab === 'settings'
                                        ? 'text-primary border-b-2 border-primary -mb-0.5'
                                        : 'text-gray-500 hover:text-primary'
                                        }`}
                                >
                                    <FaCog className="mr-1.5" /> {!isMobile && 'Ajustes'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md opacity-95 min-h-[60vh]">
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
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
                                            <p className="text-gray-600 mb-2">No hay miembros en este grupo.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {members.map((member) => (
                                                <div
                                                    key={member.userId}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center relative"
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${getMemberColor(member.username)}`}>
                                                        {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-800">{member.username}</span>
                                                            {member.roleId === 1 && (
                                                                <span className="ml-2 text-yellow-500" title="Administrador">
                                                                    <FaCrown />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500">{member.roleId === 1 ? 'Administrador' : 'Miembro'}</span>
                                                    </div>

                                                    {isAdmin && member.userId !== parseInt(userId) && (
                                                        <div className="relative ml-2">
                                                            <button
                                                                onClick={() => setMemberTooltip(memberTooltip === member.userId ? null : member.userId)}
                                                                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
                                                            >
                                                                <FaEllipsisV size={16} />
                                                            </button>

                                                            {memberTooltip === member.userId && (
                                                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                                    <button
                                                                        onClick={() => {
                                                                            handleKickMember(member.userId);
                                                                            setMemberTooltip(null);
                                                                        }}
                                                                        className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-error/10 text-error"
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
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <FaTasks className="mx-auto text-gray-400 text-4xl mb-4" />
                                            <p className="text-gray-600 mb-2">No hay tareas asignadas a este grupo.</p>
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
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onUpdate={(task) => {
                                                        setEditingTask(task);
                                                        setIsTaskModalOpen(true);
                                                    }}
                                                    onDelete={(taskId) => {
                                                        if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
                                                            deleteTask(taskId).then(() => {
                                                                setTasks(tasks.filter(t => t.id !== taskId));
                                                                showToast('Tarea eliminada correctamente', 'success');
                                                            }).catch(err => {
                                                                console.error('Error deleting task:', err);
                                                                setError('Error al eliminar la tarea');
                                                            });
                                                        }
                                                    }}
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
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                        >
                                            <FaPlus className="mr-2" /> Añadir
                                        </button>
                                    </div>

                                    {modernCalendarEvents.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                                            <p className="text-gray-600 mb-2">No hay eventos en el calendario.</p>
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="mt-2 text-primary hover:text-accent"
                                            >
                                                Añadir el primer evento
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-[60vh] flex flex-col md:flex-row gap-4">
                                            <div className="md:w-2/3">
                                                <ModernCalendar
                                                    events={modernCalendarEvents}
                                                    onDaySelect={handleDaySelect}
                                                />
                                            </div>
                                            <div className="md:w-1/3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-medium text-primary">
                                                        {selectedCalendarDay.toLocaleDateString('es-ES', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long'
                                                        }).charAt(0).toUpperCase() +
                                                            selectedCalendarDay.toLocaleDateString('es-ES', {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'long'
                                                            }).slice(1)}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleAddForDate(selectedCalendarDay)}
                                                        className="text-sm text-primary hover:text-accent"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>

                                                {dayEvents.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-gray-500 text-sm">No hay eventos programados</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                                                        {dayEvents.map(event => (
                                                            <div key={event.id}
                                                                className={`p-3 rounded-lg ${event.type === 'task' ? 'bg-task-normal-bg border-l-4 border-task' :
                                                                    event.type === 'session' ? 'bg-primary-light border-l-4 border-primary' :
                                                                        'bg-event-proximo-bg border-l-4 border-event'
                                                                    }`}
                                                            >
                                                                <div className="font-medium text-gray-800">{event.title}</div>
                                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                                    {event.type === 'task' && (
                                                                        <>
                                                                            <FaTasks className="mr-1" /> Tarea
                                                                            {event.subject && <span className="ml-2">• {event.subject}</span>}
                                                                        </>
                                                                    )}
                                                                    {event.type === 'event' && (
                                                                        <>
                                                                            <FaCalendarAlt className="mr-1" /> Evento
                                                                        </>
                                                                    )}
                                                                    {event.type === 'session' && (
                                                                        <>
                                                                            <FaVideo className="mr-1" /> Sesión
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {event.type === 'session' && event.zoomLink && (
                                                                    <a
                                                                        href={event.zoomLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-primary hover:text-accent mt-1 flex items-center"
                                                                    >
                                                                        <FaLink className="mr-1" /> Unirse
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div
                                    key="notes"
                                    variants={tabVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-primary">Apuntes</h2>
                                        <button
                                            onClick={() => {
                                                const folderName = prompt('Introduce el nombre de la nueva carpeta:');
                                                if (folderName && !notes[folderName]) {
                                                    setNotes({ ...notes, [folderName]: [] });
                                                    showToast('Carpeta creada correctamente', 'success');
                                                } else if (notes[folderName]) {
                                                    alert('Ya existe una carpeta con ese nombre.');
                                                }
                                            }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center"
                                        >
                                            <FaPlus className="mr-2" /> Nueva Carpeta
                                        </button>
                                    </div>

                                    {Object.keys(notes).length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <FaBook className="mx-auto text-gray-400 text-4xl mb-4" />
                                            <p className="text-gray-600 mb-2">No hay carpetas de apuntes.</p>
                                            <button
                                                onClick={() => {
                                                    const folderName = prompt('Introduce el nombre de la nueva carpeta:');
                                                    if (folderName) {
                                                        setNotes({ ...notes, [folderName]: [] });
                                                        showToast('Carpeta creada correctamente', 'success');
                                                    }
                                                }}
                                                className="mt-2 text-primary hover:text-accent"
                                            >
                                                Crear la primera carpeta
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.keys(notes).map((folder) => (
                                                <div key={folder} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="flex justify-between items-center bg-primary-light p-4 border-b">
                                                        <h3 className="font-medium text-primary flex items-center">
                                                            <FaBook className="mr-2 text-primary" />
                                                            {folder}
                                                        </h3>
                                                        <label className="flex items-center bg-primary text-white px-3 py-2 rounded-lg hover:bg-accent cursor-pointer text-sm">
                                                            <FaFileUpload className="mr-2" /> Subir Archivo
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={(e) => handleFileUpload(folder, e)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>

                                                    {notes[folder].length === 0 ? (
                                                        <div className="p-6 text-center text-gray-500">
                                                            No hay archivos en esta carpeta
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-100">
                                                            {notes[folder].map((note, index) => (
                                                                <div
                                                                    key={note.id}
                                                                    className="p-4 hover:bg-gray-50 flex items-center justify-between"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-800">{note.name}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            Subido {note.uploadDate ? new Date(note.uploadDate).toLocaleDateString() : 'Fecha desconocida'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() => alert(`Ver ${note.name}`)}
                                                                            className="p-2 text-primary hover:text-accent rounded-full hover:bg-primary-light"
                                                                            title="Ver"
                                                                        >
                                                                            <FaEye />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => alert(`Descargar ${note.name}`)}
                                                                            className="p-2 text-task-finalizada hover:text-task-finalizada rounded-full hover:bg-task-finalizada-bg"
                                                                            title="Descargar"
                                                                        >
                                                                            <FaDownload />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (window.confirm(`¿Estás seguro de eliminar "${note.name}"?`)) {
                                                                                    const updatedNotes = { ...notes };
                                                                                    updatedNotes[folder].splice(index, 1);
                                                                                    setNotes(updatedNotes);
                                                                                    showToast('Archivo eliminado correctamente', 'success');
                                                                                }
                                                                            }}
                                                                            className="p-2 text-error hover:text-error rounded-full hover:bg-error/10"
                                                                            title="Eliminar"
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <FaVideo className="mx-auto text-gray-400 text-4xl mb-4" />
                                            <p className="text-gray-600 mb-2">No hay sesiones de estudio programadas.</p>
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
                                                <div key={session.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="font-medium text-primary text-lg mb-1">{session.title}</div>
                                                    <div className="text-gray-600 flex items-center mb-2">
                                                        <FaCalendarAlt className="mr-2 text-gray-400" />
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
                                                            onClick={() => {
                                                                if (window.confirm('¿Estás seguro de eliminar esta sesión?')) {
                                                                    setStudySessions(studySessions.filter(s => s.id !== session.id));
                                                                    showToast('Sesión eliminada correctamente', 'success');
                                                                }
                                                            }}
                                                            className="text-error hover:text-error text-sm"
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
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-800 mb-4">Información General</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Nombre del grupo
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={group.name}
                                                        onChange={(e) => setGroup({ ...group, name: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Descripción del grupo
                                                    </label>
                                                    <textarea
                                                        value={group.description || ''}
                                                        onChange={(e) => setGroup({ ...group, description: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                        rows="3"
                                                    />
                                                </div>
                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => {
                                                            // En un caso real esto actualizaría la información del grupo
                                                            showToast('Información actualizada correctamente', 'success');
                                                        }}
                                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                                    >
                                                        Guardar Cambios
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-800 mb-4">Zona de Peligro</h3>
                                            <p className="text-gray-600 mb-4">Estas acciones no se pueden deshacer. Ten cuidado.</p>
                                            <div className="flex flex-col space-y-3">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Estás seguro? Esta acción eliminará el grupo y todos sus datos.')) {
                                                            // En un caso real esto eliminaría el grupo
                                                            showToast('Operación no implementada', 'error');
                                                        }
                                                    }}
                                                    className="bg-error text-white px-4 py-2 rounded-lg hover:bg-error/80 transition-colors flex items-center justify-center"
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

                {/* Modal de selección para calendario */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
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
                                    className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para añadir/editar tarea */}
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={editingTask ? handleTaskUpdate : handleAddTask}
                    subjects={subjects}
                    task={editingTask}
                />

                {/* Modal para añadir/editar evento */}
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

                {/* Modal para añadir sesión */}
                <SessionModal
                    isOpen={isSessionModalOpen}
                    onClose={() => setIsSessionModalOpen(false)}
                    onSave={handleAddSession}
                    defaultDate={selectedDate}
                />

                {/* Modal para detalles del evento */}
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
        </div>
    );
};

export default GroupDetailsPage;
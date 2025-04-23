// src/pages/GroupDetailsPage.js - Versión responsive
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import CalendarComponent from '../components/CalendarComponent';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SessionModal from '../components/modals/SessionModal';
import Modal from '../components/modals/Modal';
import { FaComments, FaTimes, FaShareAlt, FaUsers, FaTasks, FaCalendar, FaBook, FaCog, FaPlus } from 'react-icons/fa';
import { formatDateForDisplay } from '../utils/dateUtils';

// API imports
import { getGroupById, getGroupMembers, leaveGroup } from '../api/groups';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getSubjects } from '../api/subjects';

const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { token, userId, user } = useAuth();
    
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
                // Importante: usamos "true" y groupId para indicar que queremos datos del grupo, no personales
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
                
                // Initialize notes structure
                setNotes([]);
                
                // Initialize study sessions
                setStudySessions([]);
                
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

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr);
        setIsAddModalOpen(true);
    };

    const handleEventClick = (info) => {
        const eventType = info.event.extendedProps.type;
        
        const eventData = {
            id: parseInt(info.event.id),
            title: info.event.title,
            start: info.event.start,
            end: info.event.end || null,
            allDay: info.event.allDay,
            type: eventType,
            notification: info.event.extendedProps.notification || '',
        };

        if (eventType === 'task') {
            eventData.dueDate = info.event.startStr;
            eventData.importance = info.event.extendedProps.importance || 'Baja';
            eventData.status = info.event.extendedProps.status || 'Pendiente';
            eventData.subjectId = info.event.extendedProps.subjectId || null;
            eventData.subject = info.event.extendedProps.subject || '';
        } else if (eventType === 'event') {
            eventData.startDateTime = info.event.startStr;
            eventData.endDateTime = info.event.end ? info.event.endStr : '';
        }

        setSelectedEvent(eventData);
        setIsEventDetailsOpen(true);
    };

    const handleKickMember = async (memberId) => {
        if (!isAdmin) return;
        
        if (window.confirm('¿Estás seguro de que quieres expulsar a este miembro?')) {
            try {
                // API call to remove member
                await leaveGroup(groupId, memberId);
                setMembers(members.filter((m) => m.userId !== memberId));
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
            allDay: !newSession.start.includes('T')
        };
        setStudySessions([...studySessions, sessionToAdd]);
        setIsSessionModalOpen(false);
    };

    const handleAddFolder = () => {
        if (!newFolderName || notes[newFolderName]) {
            alert('El nombre de la carpeta ya existe o está vacío.');
            return;
        }
        setNotes({ ...notes, [newFolderName]: [] });
        setNewFolderName('');
    };

    const handleFileUpload = (folder, event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
            setNotes({
                ...notes,
                [folder]: [...notes[folder], { id: Date.now(), name: file.name, file }]
            });
        } else {
            alert('Por favor, sube un archivo PDF o Word válido.');
        }
    };

    // Events for calendar
    const calendarEvents = [
        ...tasks.map((task) => ({
            id: task.id.toString(),
            title: task.title,
            start: task.dueDate,
            allDay: true,
            color: 'var(--secondary-color)',
            extendedProps: {
                type: 'task',
                importance: task.importance,
                status: task.status,
                subjectId: task.subjectId,
                subject: task.subject,
                notification: task.notificationDate,
                groupId: task.groupId, // Identificamos que es una tarea de grupo
            },
        })),
        ...events.map((event) => ({
            id: event.id.toString(),
            title: event.title,
            start: event.startDateTime,
            end: event.endDateTime || null,
            allDay: false,
            color: 'var(--primary-color)',
            extendedProps: {
                type: 'event',
                notification: event.notification,
                groupId: event.groupId, // Identificamos que es un evento de grupo
            },
        })),
        ...studySessions.map((session) => ({
            id: session.id.toString(),
            title: session.title,
            start: session.start,
            allDay: true,
            color: 'var(--accent-color)',
            extendedProps: {
                type: 'session',
                zoomLink: session.zoomLink,
                groupId: parseInt(groupId), // Todas las sesiones de estudio son del grupo
            },
        })),
    ];

    if (loading) {
        return (
            <div className="main-container">
                <Sidebar />
                <div className="content-container flex justify-center items-center">
                    <p className="text-lg">Cargando datos del grupo...</p>
                </div>
            </div>
        );
    }

    if (error && !group) {
        return (
            <div className="main-container">
                <Sidebar />
                <div className="content-container flex flex-col justify-center items-center">
                    <p className="text-lg text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/groups')}
                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent"
                    >
                        Volver a Grupos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <Sidebar />
            <div
                className="content-container background-logo-container"
                style={{ backgroundImage: `url(${Logo})` }}
            >
                <div className="relative z-10">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h1 className="text-xl md:text-3xl text-primary">{group?.name || 'Grupo'}</h1>
                        <div className="group-action-buttons">
                            <button
                                onClick={handleShareLink}
                                className="bg-primary text-white px-3 md:px-4 py-1 md:py-2 rounded-full hover:bg-accent flex items-center text-sm md:text-base"
                            >
                                <FaShareAlt className="mr-1 md:mr-2" /> {isMobile ? '' : 'Compartir'}
                            </button>
                            <Link 
                                to="/groups" 
                                className="bg-primary text-white px-3 md:px-4 py-1 md:py-2 rounded-full hover:bg-accent text-sm md:text-base"
                            >
                                Volver
                            </Link>
                        </div>
                    </div>

                    <div className="tabs-container mb-4">
                        {['members', 'tasks', 'calendar', 'notes', 'sessions', ...(isAdmin ? ['settings'] : [])].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-button ${
                                    activeTab === tab 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                            >
                                {tab === 'members' ? (
                                    <span className="flex items-center">
                                        <FaUsers className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Miembros'}
                                    </span>
                                ) : tab === 'tasks' ? (
                                    <span className="flex items-center">
                                        <FaTasks className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Tareas'}
                                    </span>
                                ) : tab === 'calendar' ? (
                                    <span className="flex items-center">
                                        <FaCalendar className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Calendario'}
                                    </span>
                                ) : tab === 'notes' ? (
                                    <span className="flex items-center">
                                        <FaBook className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Apuntes'}
                                    </span>
                                ) : tab === 'sessions' ? (
                                    <span className="flex items-center">
                                        <FaComments className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Sesiones'}
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FaCog className={`${isMobile ? '' : 'mr-1'}`} />
                                        {isMobile ? '' : 'Ajustes'}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="card h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] overflow-y-auto">
                        {activeTab === 'members' && (
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold mb-3 text-primary">Miembros ({members.length})</h2>
                                <div className="max-h-[65vh] overflow-y-auto">
                                    {members.length === 0 ? (
                                        <p className="text-gray-600">No hay miembros en este grupo.</p>
                                    ) : (
                                        members.map((member) => (
                                            <div 
                                                key={member.userId} 
                                                className="flex justify-between items-center text-sm text-gray-600 mb-2 p-2 hover:bg-gray-100 rounded"
                                            >
                                                <span>{member.username} {member.roleId === 1 ? '(Admin)' : ''}</span>
                                                {isAdmin && member.userId !== parseInt(userId) && (
                                                    <button
                                                        onClick={() => handleKickMember(member.userId)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        aria-label="Expulsar miembro"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-lg md:text-xl font-semibold text-primary">Tareas</h2>
                                    <button
                                        onClick={() => {
                                            setEditingTask(null);
                                            setIsTaskModalOpen(true);
                                        }}
                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm flex items-center"
                                    >
                                        <FaPlus className="mr-1" /> {isMobile ? '' : 'Añadir Tarea'}
                                    </button>
                                </div>
                                <div className="max-h-[65vh] overflow-y-auto mb-4">
                                    {tasks.length === 0 ? (
                                        <p className="text-gray-600">No hay tareas.</p>
                                    ) : (
                                        tasks.map((task) => (
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
                                                        }).catch(err => {
                                                            console.error('Error deleting task:', err);
                                                            setError('Error al eliminar la tarea');
                                                        });
                                                    }
                                                }}
                                                subjects={subjects.map((s) => s.title)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'calendar' && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-lg md:text-xl font-semibold text-primary">Calendario</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm flex items-center"
                                    >
                                        <FaPlus className="mr-1" /> {isMobile ? '' : 'Añadir'}
                                    </button>
                                </div>
                                <CalendarComponent
                                    events={calendarEvents}
                                    onDateClick={handleDateClick}
                                    onEventClick={handleEventClick}
                                    height={isMobile ? "50vh" : "60vh"}
                                    showSubjectSchedules={false}
                                />
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-lg md:text-xl font-semibold text-primary">Apuntes</h2>
                                    <button
                                        onClick={handleAddFolder}
                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm flex items-center"
                                    >
                                        <FaPlus className="mr-1" /> {isMobile ? '' : 'Nueva Carpeta'}
                                    </button>
                                </div>
                                <div className="resources-container">
                                    {Object.keys(notes).length === 0 ? (
                                        <p className="text-gray-600">No hay carpetas de apuntes.</p>
                                    ) : (
                                        Object.keys(notes).map((folder) => (
                                            <div key={folder} className="resource-folder">
                                                <div className="resource-folder-header">
                                                    <h3 className="text-base md:text-lg font-medium text-primary">{folder}</h3>
                                                    <label className="bg-primary text-white px-2 py-1 rounded-full hover:bg-accent cursor-pointer text-xs flex items-center">
                                                        <FaPlus className="mr-1" /> {isMobile ? '' : 'Subir'}
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={(e) => handleFileUpload(folder, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <div className="resource-files-container">
                                                    {notes[folder].length === 0 ? (
                                                        <p className="text-sm text-gray-600">No hay apuntes en esta carpeta.</p>
                                                    ) : (
                                                        notes[folder].map((note) => (
                                                            <div key={note.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-lg mb-1">
                                                                <span className="text-sm truncate max-w-[200px] md:max-w-full">{note.name}</span>
                                                                <button
                                                                    onClick={() => alert(`Simulando apertura de ${note.name}`)}
                                                                    className="text-primary hover:underline text-xs"
                                                                >
                                                                    Ver
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="Nombre de la carpeta"
                                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleAddFolder}
                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-lg md:text-xl font-semibold text-primary">Sesiones de Estudio</h2>
                                    <button
                                        onClick={() => setIsSessionModalOpen(true)}
                                        className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent text-sm flex items-center"
                                    >
                                        <FaPlus className="mr-1" /> {isMobile ? '' : 'Añadir Sesión'}
                                    </button>
                                </div>
                                <div className="max-h-[65vh] overflow-y-auto mb-4">
                                    {studySessions.length === 0 ? (
                                        <p className="text-gray-600">No hay sesiones.</p>
                                    ) : (
                                        studySessions.map((session) => (
                                            <div key={session.id} className="text-sm text-gray-600 mb-2 p-3 bg-gray-100 rounded-lg">
                                                <p className="font-medium text-primary">{session.title}</p>
                                                <p className="text-xs md:text-sm">Fecha: {formatDateForDisplay(session.start)}</p>
                                                <a 
                                                    href={session.zoomLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-primary hover:underline text-xs md:text-sm inline-block mt-1"
                                                >
                                                    Unirse a Zoom
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && isAdmin && (
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold mb-3 text-primary">Ajustes</h2>
                                <p className="text-gray-600 mb-4">Configuración del grupo como administrador.</p>
                                <div className="space-y-4">
                                    {/* Aquí irían más ajustes del grupo */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-primary">Peligro</h3>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                                                    // Handle delete group
                                                    alert('Esta función no está implementada aún.');
                                                }
                                            }}
                                            className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 text-sm"
                                        >
                                            Eliminar Grupo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Espaciador para dispositivos móviles */}
                <div className="footer-spacer"></div>
                
                {/* Modal para compartir enlace */}
                <Modal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    title="Compartir Grupo"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
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
                                    alert('Enlace copiado al portapapeles');
                                }}
                                className="bg-primary text-white px-3 py-2 rounded-r"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Modal de selección para calendario */}
                {isAddModalOpen && (
                    <div className="selection-modal">
                        <div className="selection-modal-content">
                            <h3 className="text-lg font-semibold mb-3">Añadir en {formatDateForDisplay(selectedDate)}</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="w-full bg-orange-400 text-white px-3 py-2 rounded-lg hover:bg-orange-500"
                                >
                                    Nueva Tarea
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsEventModalOpen(true);
                                    }}
                                    className="w-full bg-primary text-white px-3 py-2 rounded-lg hover:bg-accent"
                                >
                                    Nuevo Evento
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsSessionModalOpen(true);
                                    }}
                                    className="w-full bg-accent text-white px-3 py-2 rounded-lg hover:bg-opacity-80"
                                >
                                    Nueva Sesión
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-full bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
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
                        <div className="space-y-2">
                            <p><strong className="text-primary">Título:</strong> {selectedEvent.title}</p>
                            <p><strong className="text-primary">Fecha de inicio:</strong> {formatDateForDisplay(selectedEvent.start)}</p>
                            {selectedEvent.end && (
                                <p><strong className="text-primary">Fecha de fin:</strong> {formatDateForDisplay(selectedEvent.end)}</p>
                            )}
                            <p><strong className="text-primary">Todo el día:</strong> {selectedEvent.allDay ? 'Sí' : 'No'}</p>
                            {selectedEvent.type === 'task' && (
                                <>
                                    <p><strong className="text-primary">Estado:</strong> {selectedEvent.status}</p>
                                    <p><strong className="text-primary">Importancia:</strong> {selectedEvent.importance}</p>
                                    <p><strong className="text-primary">Asignatura:</strong> {selectedEvent.subject}</p>
                                </>
                            )}
                            {selectedEvent.type === 'session' && selectedEvent.zoomLink && (
                                <p>
                                    <strong className="text-primary">Enlace Zoom:</strong> 
                                    <a href={selectedEvent.zoomLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                        {selectedEvent.zoomLink}
                                    </a>
                                </p>
                            )}
                            
                            <div className="flex justify-end space-x-2 mt-3">
                                {selectedEvent.type === 'task' && (
                                    <button
                                        onClick={() => {
                                            setEditingTask({
                                                id: selectedEvent.id,
                                                title: selectedEvent.title,
                                                dueDate: selectedEvent.dueDate,
                                                importance: selectedEvent.importance,
                                                status: selectedEvent.status,
                                                subjectId: selectedEvent.subjectId,
                                                subject: selectedEvent.subject,
                                            });
                                            setIsTaskModalOpen(true);
                                            setIsEventDetailsOpen(false);
                                        }}
                                        className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-accent text-sm"
                                    >
                                        Editar
                                    </button>
                                )}
                                {selectedEvent.type === 'event' && (
                                    <button
                                        onClick={() => {
                                            setEditingEvent({
                                                id: selectedEvent.id,
                                                title: selectedEvent.title,
                                                startDateTime: selectedEvent.startDateTime,
                                                endDateTime: selectedEvent.endDateTime,
                                                notification: selectedEvent.notification,
                                            });
                                            setIsEventModalOpen(true);
                                            setIsEventDetailsOpen(false);
                                        }}
                                        className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-accent text-sm"
                                    >
                                        Editar
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEventDetailsOpen(false)}
                                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
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
// src/pages/Calendar.js - Versión responsiva corregida
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../api/events';
import { getSubjectsByUser } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import CalendarComponent from '../components/CalendarComponent';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SubjectModal from '../components/modals/SubjectModal';
import Modal from '../components/modals/Modal';
import { formatDateForDisplay, formatDateTimeForDisplay, extractDateFromIso } from '../utils/dateUtils';
import { FaFilter, FaPlus, FaCog } from 'react-icons/fa';

const CalendarPage = () => {
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSubjectSchedules, setShowSubjectSchedules] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { token, userId } = useAuth();
    
    // Detección de dispositivo móvil
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Manejar cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, eventsData, subjectsData] = await Promise.all([
                    getTasks(),
                    getEvents(),
                    getSubjectsByUser(),
                ]);
                
                // Ordenar las tareas por fecha
                const sortedTasks = [...tasksData].sort((a, b) => {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                
                // Ordenar los eventos por fecha
                const sortedEvents = [...eventsData].sort((a, b) => {
                    return new Date(a.startDateTime) - new Date(b.startDateTime);
                });
                
                setTasks(sortedTasks);
                setEvents(sortedEvents);
                setSubjects(subjectsData || []);
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

    const handleDateClick = (info) => {
        console.log('Fecha clicada:', info.dateStr);
        setSelectedDate(info.dateStr);
        setIsAddModalOpen(true);
    };

    const handleEventClick = (info) => {
        const eventType = info.event.extendedProps?.type;
        
        // Si es un evento de horario de asignatura, mostrar diálogo diferente
        if (eventType === 'subject-schedule') {
            const subjectId = info.event.extendedProps.subjectId;
            const scheduleId = info.event.extendedProps.scheduleId;
            const subject = subjects.find(s => s.id === subjectId);
            
            if (subject) {
                const schedule = subject.schedules?.find(s => s.id === scheduleId);
                if (schedule) {
                    setSelectedEvent({
                        title: subject.title,
                        type: 'subject-schedule',
                        start: info.event.start,
                        end: info.event.end,
                        subject: subject,
                        schedule: schedule,
                        weekType: info.event.extendedProps.weekType
                    });
                    setIsEventDetailsOpen(true);
                    return;
                }
            }
        }
        
        console.log('Evento clicado:', info.event);
        const eventData = {
            id: parseInt(info.event.id),
            title: info.event.title,
            start: info.event.start,
            end: info.event.end || null,
            allDay: info.event.allDay,
            type: eventType || (info.event.extendedProps?.status ? 'task' : 'event'),
            notification: info.event.extendedProps?.notification || '',
        };

        if (eventData.type === 'task') {
            eventData.dueDate = extractDateFromIso(info.event.startStr);
            eventData.importance = info.event.extendedProps?.importance || 'Baja';
            eventData.status = info.event.extendedProps?.status || 'Pendiente';
            eventData.subjectId = info.event.extendedProps?.subjectId || null;
            eventData.subject = info.event.extendedProps?.subject || '';
        } else if (eventData.type === 'event') {
            eventData.startDateTime = info.event.startStr;
            eventData.endDateTime = info.event.end ? info.event.endStr : '';
            eventData.description = info.event.extendedProps?.description || '';
        }

        setSelectedEvent(eventData);
        setIsEventDetailsOpen(true);
    };

    const handleAddTask = async (newTask) => {
        setLoading(true);
        try {
            const taskToAdd = {
                ...newTask,
                dueDate: newTask.dueDate || selectedDate,
                subjectId: newTask.subjectId || null,
            };
            const addedTask = await addTask(taskToAdd);
            
            // Añadir la nueva tarea y reordenar
            const updatedTasks = [...tasks, addedTask].sort((a, b) => {
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            
            setTasks(updatedTasks);
            setIsTaskModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedDate(null);
            setError(null);
        } catch (error) {
            console.error('Error adding task:', error);
            setError(error.message || 'Error al añadir la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (updatedTask) => {
        setLoading(true);
        try {
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);
            
            // Actualizar la tarea y reordenar
            const updatedTasks = tasks
                .map((task) => (task.id === updatedTask.id ? updatedTaskFromBackend : task))
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                
            setTasks(updatedTasks);
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setIsEventDetailsOpen(false);
            setSelectedEvent(null);
            setError(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setError(error.message || 'Error al actualizar la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (newEvent) => {
        setLoading(true);
        try {
            const eventToAdd = {
                ...newEvent,
                startDateTime: newEvent.startDateTime || `${selectedDate}T00:00:00`,
                endDateTime: newEvent.endDateTime || null,
                notification: newEvent.notification || null,
            };
            const addedEvent = await addEvent(eventToAdd);
            
            // Añadir el nuevo evento y reordenar
            const updatedEvents = [...events, addedEvent].sort((a, b) => {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            });
            
            setEvents(updatedEvents);
            setIsEventModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedDate(null);
            setError(null);
        } catch (error) {
            console.error('Error adding event:', error);
            setError(error.message || 'Error al añadir el evento');
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEvent = async (updatedEvent) => {
        setLoading(true);
        try {
            const updatedEventFromBackend = await updateEvent(updatedEvent.id, updatedEvent);
            
            // Actualizar el evento y reordenar
            const updatedEvents = events
                .map((event) => (event.id === updatedEvent.id ? updatedEventFromBackend : event))
                .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
                
            setEvents(updatedEvents);
            setIsEventModalOpen(false);
            setEditingEvent(null);
            setIsEventDetailsOpen(false);
            setSelectedEvent(null);
            setError(null);
        } catch (error) {
            console.error('Error updating event:', error);
            setError(error.message || 'Error al actualizar el evento');
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsSubjectModalOpen(true);
    };

    const handleSaveSubject = async (subjectName, schedules) => {
        try {
            setLoading(true);
            const refreshedSubjects = await getSubjectsByUser();
            setSubjects(refreshedSubjects || []);
            
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
        } catch (error) {
            console.error('Error al guardar asignatura:', error);
            setError(error.message || 'Error al guardar asignatura');
        } finally {
            setLoading(false);
        }
    };

    const calendarEvents = [
        ...tasks.map((t) => {
            // Buscar subjectId si task tiene subject como string
            const subjectId = t.subjectId || (t.subject ? subjects.find(s => s.title === t.subject)?.id : null);
            return {
                id: t.id.toString(),
                title: t.title,
                start: t.dueDate,
                allDay: true,
                color: '#ff9f43',
                extendedProps: {
                    type: 'task',
                    importance: t.importance,
                    status: t.status,
                    subjectId: subjectId,
                    subject: t.subject || subjects.find(s => s.id === subjectId)?.title || '',
                    notification: t.notificationDate,
                },
            };
        }),
        ...events.map((event) => ({
            id: event.id.toString(),
            title: event.title,
            start: event.startDateTime,
            end: event.endDateTime || null,
            allDay: false,
            color: '#467BAA',
            extendedProps: {
                type: 'event',
                description: event.description,
                notification: event.notification,
            },
        })),
    ];

    const getWeekTypeName = (weekType) => {
        const weekTypes = ['Todas las semanas', 'Semanas pares', 'Semanas impares'];
        return weekTypes[weekType] || 'Desconocido';
    };

    const formatTimeSpan = (timeSpan) => {
        if (!timeSpan) return '';
        
        if (typeof timeSpan === 'string' && timeSpan.includes(':')) {
            return timeSpan;
        }
        
        if (typeof timeSpan === 'object' && 'hours' in timeSpan) {
            const hours = String(timeSpan.hours || 0).padStart(2, '0');
            const minutes = String(timeSpan.minutes || 0).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        return '';
    };

    const getDayName = (dayOfWeek) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayOfWeek] || 'Desconocido';
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (isMobile) {
            return hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
        }
        
        if (hours === 0) {
            return `${mins} minutos`;
        } else if (mins === 0) {
            return hours === 1 ? `${hours} hora` : `${hours} horas`;
        } else {
            return `${hours}h ${mins}min`;
        }
    };

    return (
        <div className="main-container">
            <Sidebar />
            <div
                className="content-container background-logo-container calendar-page-container ml-0"
                style={{
                    backgroundImage: `url(${Logo})`,
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
                    
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h1 className="text-xl md:text-3xl text-primary">Calendario</h1>
                        
                        <div className="flex flex-wrap gap-2">
                            {!isMobile && (
                                <div className="flex items-center mr-2">
                                    <input 
                                        type="checkbox" 
                                        id="showSchedules" 
                                        checked={showSubjectSchedules} 
                                        onChange={() => setShowSubjectSchedules(!showSubjectSchedules)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="showSchedules" className="text-sm text-gray-700">
                                        Mostrar horarios
                                    </label>
                                </div>
                            )}
                            
                            {isMobile ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsSettingsOpen(true)}
                                        className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-accent"
                                        aria-label="Ajustes"
                                    >
                                        <FaCog />
                                    </button>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-accent"
                                        aria-label="Añadir"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsSubjectModalOpen(true)}
                                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent"
                                    >
                                        + Añadir Asignatura
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent"
                                    >
                                        + Añadir Evento
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md md:p-6 opacity-95">
                        <CalendarComponent
                            events={calendarEvents}
                            subjects={subjects}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                            height={isMobile ? "auto" : "70vh"}
                            showSubjectSchedules={showSubjectSchedules}
                        />
                    </div>
                </div>
                
                {/* Espaciador para dispositivos móviles */}
                <div className="footer-spacer"></div>
            </div>

            {/* Dialogo de ajustes para móvil */}
            {isSettingsOpen && (
                <Modal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    title="Ajustes de Calendario"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="mobileShowSchedules" 
                                checked={showSubjectSchedules} 
                                onChange={() => setShowSubjectSchedules(!showSubjectSchedules)}
                                className="mr-2"
                            />
                            <label htmlFor="mobileShowSchedules" className="text-sm text-gray-700">
                                Mostrar horarios de clases
                            </label>
                        </div>
                        
                        <button
                            onClick={() => {
                                setIsSubjectModalOpen(true);
                                setIsSettingsOpen(false);
                            }}
                            className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent"
                        >
                            Gestionar Asignaturas
                        </button>
                    </div>
                </Modal>
            )}

            {/* Modal de selección */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Añadir en {formatDateForDisplay(selectedDate)}</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsTaskModalOpen(true);
                                }}
                                className="w-full bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
                            >
                                Nueva Tarea
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEventModalOpen(true);
                                }}
                                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent"
                            >
                                Nuevo Evento
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
                    setError(null);
                }}
                onSave={editingTask ? handleUpdateTask : handleAddTask}
                subjects={subjects}
                task={editingTask}
                defaultDate={selectedDate}
            />

            {/* Modal para añadir/editar evento */}
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                    setError(null);
                }}
                onSave={editingEvent ? handleUpdateEvent : handleAddEvent}
                event={editingEvent}
                defaultDate={selectedDate}
            />

            {/* Modal para añadir/editar asignatura */}
            <SubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => {
                    setIsSubjectModalOpen(false);
                    setEditingSubject(null);
                    setError(null);
                }}
                onSave={handleSaveSubject}
                subject={editingSubject}
            />

            {/* Modal para detalles del evento/tarea */}
            {isEventDetailsOpen && selectedEvent && (
                <Modal
                    isOpen={isEventDetailsOpen}
                    onClose={() => setIsEventDetailsOpen(false)}
                    title={
                        selectedEvent.type === 'task' 
                            ? 'Detalles de la Tarea' 
                            : selectedEvent.type === 'subject-schedule'
                            ? 'Detalles del Horario'
                            : 'Detalles del Evento'
                    }
                    size="md"
                >
                    <div className="space-y-2">
                        <p><strong className="text-primary">Título:</strong> {selectedEvent.title}</p>
                        
                        {selectedEvent.type === 'subject-schedule' ? (
                            // Detalles específicos para horarios de asignaturas
                            <>
                                <p><strong className="text-primary">Día:</strong> {getDayName(selectedEvent.schedule?.dayOfWeek)}</p>
                                <p><strong className="text-primary">Hora:</strong> {formatTimeSpan(selectedEvent.schedule?.startTime)}</p>
                                <p><strong className="text-primary">Duración:</strong> {formatDuration(selectedEvent.schedule?.durationMinutes)}</p>
                                <p><strong className="text-primary">Recurrencia:</strong> {getWeekTypeName(selectedEvent.weekType)}</p>
                            </>
                        ) : (
                            // Detalles para eventos normales y tareas
                            <>
                                <p><strong className="text-primary">Fecha de inicio:</strong> {formatDateTimeForDisplay(selectedEvent.start)}</p>
                                {selectedEvent.end && (
                                    <p><strong className="text-primary">Fecha de fin:</strong> {formatDateTimeForDisplay(selectedEvent.end)}</p>
                                )}
                                {selectedEvent.allDay !== undefined && (
                                    <p><strong className="text-primary">Todo el día:</strong> {selectedEvent.allDay ? 'Sí' : 'No'}</p>
                                )}
                                {selectedEvent.notification && (
                                    <p><strong className="text-primary">Notificación:</strong> {formatDateTimeForDisplay(selectedEvent.notification)}</p>
                                )}
                                {selectedEvent.type === 'task' && (
                                    <>
                                        <p>
                                            <strong className="text-primary">Asignatura:</strong>{' '}
                                            {selectedEvent.subjectId
                                                ? subjects.find(s => s.id === selectedEvent.subjectId)?.title || 'Sin asignatura'
                                                : selectedEvent.subject || 'Sin asignatura'}
                                        </p>
                                        <p><strong className="text-primary">Importancia:</strong> {selectedEvent.importance}</p>
                                        <p><strong className="text-primary">Estado:</strong> {selectedEvent.status}</p>
                                    </>
                                )}
                                {selectedEvent.type === 'event' && selectedEvent.description && (
                                    <p><strong className="text-primary">Descripción:</strong> {selectedEvent.description}</p>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                        {selectedEvent.type !== 'subject-schedule' && (
                            <button
                                onClick={() => {
                                    if (selectedEvent.type === 'task') {
                                        setEditingTask({
                                            id: selectedEvent.id,
                                            title: selectedEvent.title,
                                            dueDate: selectedEvent.dueDate,
                                            importance: selectedEvent.importance,
                                            status: selectedEvent.status,
                                            subjectId: selectedEvent.subjectId || (selectedEvent.subject ? subjects.find(s => s.title === selectedEvent.subject)?.id : null),
                                            notificationDate: selectedEvent.notification,
                                            subject: selectedEvent.subject || '',
                                        });
                                        setIsTaskModalOpen(true);
                                    } else {
                                        setEditingEvent({
                                            id: selectedEvent.id,
                                            title: selectedEvent.title,
                                            startDateTime: selectedEvent.startDateTime,
                                            endDateTime: selectedEvent.endDateTime,
                                            description: selectedEvent.description,
                                            notification: selectedEvent.notification,
                                        });
                                        setIsEventModalOpen(true);
                                    }
                                    setIsEventDetailsOpen(false);
                                }}
                                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-accent text-sm"
                            >
                                Editar
                            </button>
                        )}
                        
                        {selectedEvent.type === 'subject-schedule' && (
                            <button
                                onClick={() => {
                                    handleEditSubject(selectedEvent.subject);
                                    setIsEventDetailsOpen(false);
                                }}
                                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-accent text-sm"
                            >
                                Editar Asignatura
                            </button>
                        )}
                        
                        <button
                            onClick={() => setIsEventDetailsOpen(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CalendarPage;
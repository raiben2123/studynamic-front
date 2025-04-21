// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask } from '../api/tasks';
import { getEvents, addEvent, updateEvent } from '../api/events';
import { getSubjects } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import CalendarComponent from '../components/CalendarComponent';
import TaskModalCalendar from '../components/modals/TaskModalCalendar';
import EventModal from '../components/modals/EventModal';
import { formatDateForDisplay, formatDateTimeForDisplay, extractDateFromIso } from '../utils/dateUtils';

const CalendarPage = () => {
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, userId } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, eventsData, subjectsData] = await Promise.all([
                    getTasks(),
                    getEvents(),
                    getSubjects(),
                ]);
                console.log('CalendarPage - Tasks cargados:', tasksData);
                console.log('CalendarPage - Subjects cargados:', subjectsData);
                
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
                console.error('CalendarPage - Error fetching data:', error);
                setError('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        if (token && userId) fetchData();
    }, [token, userId]);

    const handleDateClick = (info) => {
        console.log('CalendarPage - Fecha clicada:', info.dateStr);
        setSelectedDate(info.dateStr);
        setIsAddModalOpen(true);
    };

    const handleEventClick = (info) => {
        console.log('CalendarPage - Evento clicado:', info.event);
        console.log('CalendarPage - ExtendedProps:', info.event.extendedProps);
        const eventType = info.event.extendedProps.type;
        
        // Normalizar las fechas
        const startDate = info.event.start ? extractDateFromIso(info.event.startStr) : '';
        const endDate = info.event.end ? extractDateFromIso(info.event.endStr) : '';
        
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
            eventData.dueDate = startDate;
            eventData.importance = info.event.extendedProps.importance || 'Baja';
            eventData.status = info.event.extendedProps.status || 'Pendiente';
            // Manejar subjectId o subject
            eventData.subjectId = info.event.extendedProps.subjectId || null;
            eventData.subject = info.event.extendedProps.subject || ''; // Respaldo si hay subject como string
        } else if (eventType === 'event') {
            eventData.startDateTime = info.event.startStr;
            eventData.endDateTime = info.event.end ? info.event.endStr : '';
        }

        console.log('CalendarPage - SelectedEvent:', eventData);
        setSelectedEvent(eventData);
        setIsEventDetailsOpen(true);
    };

    const handleAddTask = async (newTask) => {
        setLoading(true);
        try {
            console.log('CalendarPage - Añadiendo tarea:', newTask);
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
            console.error('CalendarPage - Error adding task:', error);
            setError(error.message || 'Error al añadir la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (updatedTask) => {
        setLoading(true);
        try {
            console.log('CalendarPage - Actualizando tarea:', updatedTask);
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
            console.error('CalendarPage - Error updating task:', error);
            setError(error.message || 'Error al actualizar la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (newEvent) => {
        setLoading(true);
        try {
            console.log('CalendarPage - Añadiendo evento:', newEvent);
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
            console.error('CalendarPage - Error adding event:', error);
            setError(error.message || 'Error al añadir el evento');
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEvent = async (updatedEvent) => {
        setLoading(true);
        try {
            console.log('CalendarPage - Actualizando evento:', updatedEvent);
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
            console.error('CalendarPage - Error updating event:', error);
            setError(error.message || 'Error al actualizar el evento');
            setIsEventModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const calendarEvents = [
        ...tasks.map((task) => {
            // Buscar subjectId si task tiene subject como string
            const subjectId = task.subjectId || (task.subject ? subjects.find(s => s.title === task.subject)?.id : null);
            return {
                id: task.id.toString(),
                title: task.title,
                start: task.dueDate,
                allDay: true,
                color: '#ff9f43',
                extendedProps: {
                    type: 'task',
                    importance: task.importance,
                    status: task.status,
                    subjectId: subjectId,
                    subject: task.subject || subjects.find(s => s.id === subjectId)?.title || '', // Respaldo
                    notification: task.notificationDate,
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
                notification: event.notification,
            },
        })),
    ];

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
                    <h1 className="text-2xl mb-4 md:text-3xl md:mb-6">Calendario</h1>
                    <div className="bg-white p-4 rounded-xl shadow-md md:p-6 opacity-95">
                        <CalendarComponent
                            events={calendarEvents}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                            height="70vh"
                        />
                    </div>
                </div>
            </div>

            {/* Modal de selección */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Añadir en {formatDateForDisplay(selectedDate)}</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    console.log('CalendarPage - Abriendo TaskModalCalendar');
                                    setIsAddModalOpen(false);
                                    setIsTaskModalOpen(true);
                                }}
                                className="w-full bg-[#ff9f43] text-white px-4 py-2 rounded-full hover:bg-[#ffbf63]"
                            >
                                Nueva Tarea
                            </button>
                            <button
                                onClick={() => {
                                    console.log('CalendarPage - Abriendo EventModal');
                                    setIsAddModalOpen(false);
                                    setIsEventModalOpen(true);
                                }}
                                className="w-full bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                            >
                                Nuevo Evento
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para añadir/editar tarea */}
            <TaskModalCalendar
                isOpen={isTaskModalOpen}
                onClose={() => {
                    console.log('CalendarPage - Cerrando TaskModalCalendar');
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
                    console.log('CalendarPage - Cerrando EventModal');
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                    setError(null);
                }}
                onSave={editingEvent ? handleUpdateEvent : handleAddEvent}
                event={editingEvent}
                defaultDate={selectedDate}
            />

            {/* Modal para detalles del evento/tarea */}
            {isEventDetailsOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedEvent.type === 'task' ? 'Detalles de la Tarea' : 'Detalles del Evento'}
                        </h3>
                        <div className="space-y-2">
                            <p><strong>Título:</strong> {selectedEvent.title}</p>
                            <p><strong>Fecha de inicio:</strong> {formatDateTimeForDisplay(selectedEvent.start)}</p>
                            {selectedEvent.end && (
                                <p><strong>Fecha de fin:</strong> {formatDateTimeForDisplay(selectedEvent.end)}</p>
                            )}
                            <p><strong>Todo el día:</strong> {selectedEvent.allDay ? 'Sí' : 'No'}</p>
                            {selectedEvent.notification && (
                                <p><strong>Notificación:</strong> {formatDateTimeForDisplay(selectedEvent.notification)}</p>
                            )}
                            {selectedEvent.type === 'task' && (
                                <>
                                    <p>
                                        <strong>Asignatura:</strong>{' '}
                                        {selectedEvent.subjectId
                                            ? subjects.find(s => s.id === selectedEvent.subjectId)?.title || 'Sin asignatura'
                                            : selectedEvent.subject || 'Sin asignatura'}
                                    </p>
                                    <p><strong>Importancia:</strong> {selectedEvent.importance}</p>
                                    <p><strong>Estado:</strong> {selectedEvent.status}</p>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => {
                                    console.log('CalendarPage - Editando:', selectedEvent);
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
                                            notification: selectedEvent.notification,
                                        });
                                        setIsEventModalOpen(true);
                                    }
                                    setIsEventDetailsOpen(false);
                                    setSelectedEvent(null);
                                }}
                                className="px-4 py-2 bg-[#467BAA] text-white rounded-full hover:bg-[#5aa0f2]"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => setIsEventDetailsOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
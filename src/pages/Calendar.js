import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasks';
import { getEvents } from '../api/events';
import { getSubjectsByUser } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import ModernCalendar from '../components/ModernCalendar';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import { FaCalendarAlt, FaChartBar, FaPlus, FaBook } from 'react-icons/fa';
import Logo from '../assets/Logo_opacidad33.png';
import { addTask, updateTask } from '../api/tasks';
import { addEvent, updateEvent } from '../api/events';

const CalendarPage = () => {
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, userId } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [combinedCalendarItems, setCombinedCalendarItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, eventsData, subjectsData] = await Promise.all([
                    getTasks(),
                    getEvents(),
                    getSubjectsByUser()
                ]);

                setTasks(tasksData);
                setEvents(eventsData);
                setSubjects(subjectsData);
                setError(null);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setError('Error al cargar datos. Por favor, inténtalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        if (token && userId) fetchData();
    }, [token, userId]);

    const handleAddTask = async (newTask) => {
        try {
            const taskToAdd = {
                ...newTask,
                subject: newTask.subjectId ?
                    subjects.find(s => s.id === parseInt(newTask.subjectId))?.title || 'Sin asignatura' :
                    'Sin asignatura'
            };

            const addedTask = await addTask(taskToAdd);

            const processedTask = {
                ...addedTask,
                subject: addedTask.subject || (
                    addedTask.subjectId ?
                        subjects.find(s => s.id === parseInt(addedTask.subjectId))?.title || 'Sin asignatura' :
                        'Sin asignatura'
                ),
                type: 'task'
            };

            setTasks([...tasks, processedTask]);
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
            const taskToUpdate = {
                ...updatedTask,
                subject: updatedTask.subjectId ?
                    subjects.find(s => s.id === parseInt(updatedTask.subjectId))?.title || 'Sin asignatura' :
                    'Sin asignatura'
            };

            const updatedTaskResult = await updateTask(updatedTask.id, taskToUpdate);

            const processedTask = {
                ...updatedTaskResult,
                subject: updatedTaskResult.subject || (
                    updatedTaskResult.subjectId ?
                        subjects.find(s => s.id === parseInt(updatedTaskResult.subjectId))?.title || 'Sin asignatura' :
                        'Sin asignatura'
                ),
                type: 'task'
            };

            setTasks(tasks.map((task) => (task.id === updatedTask.id ? processedTask : task)));
            setIsTaskModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setError('Error al actualizar la tarea');
        }
    };

    const handleAddEvent = async (newEvent) => {
        try {
            const addedEvent = await addEvent(newEvent);
            setEvents([...events, { ...addedEvent, type: 'event' }]);
            setIsEventModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedDate(null);
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Error al añadir el evento');
        }
    };

    const handleEventUpdate = async (updatedEvent) => {
        try {
            const updatedEventResult = await updateEvent(updatedEvent.id, updatedEvent);
            setEvents(events.map((event) => (event.id === updatedEvent.id ? { ...updatedEventResult, type: 'event' } : event)));
            setIsEventModalOpen(false);
            setEditingEvent(null);
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Error al actualizar el evento');
        }
    };

    useEffect(() => {
        const scheduleEvents = [];

        subjects.forEach(subject => {
            if (subject.schedules && subject.schedules.length > 0) {
                subject.schedules.forEach(schedule => {
                    try {
                        const dayOfWeek = schedule.dayOfWeek;

                        const today = new Date();
                        const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7;

                        for (let i = 0; i < 4; i++) {
                            const nextDate = new Date(today);
                            nextDate.setDate(today.getDate() + daysUntilNext + (i * 7));

                            const weekNumber = Math.ceil((nextDate.getDate() - nextDate.getDay()) / 7);
                            if (
                                (schedule.weekType === 1 && weekNumber % 2 !== 0) ||
                                (schedule.weekType === 2 && weekNumber % 2 === 0) 
                            ) {
                                continue;
                            }

                            let startTime;
                            if (typeof schedule.startTime === 'string') {
                                if (schedule.startTime.length === 8 && schedule.startTime.split(':').length === 3) {
                                    startTime = schedule.startTime.substring(0, 5);
                                } else if (schedule.startTime.includes(':')) {
                                    startTime = schedule.startTime;
                                } else {
                                    startTime = '00:00';
                                }
                            } else if (typeof schedule.startTime === 'object' && schedule.startTime !== null) {
                                startTime = `${String(schedule.startTime.hours || 0).padStart(2, '0')}:${String(schedule.startTime.minutes || 0).padStart(2, '0')}`;
                            } else {
                                startTime = '00:00';
                            }

                            const [hours, minutes] = startTime.split(':').map(Number);
                            const durationHours = Math.floor(schedule.durationMinutes / 60);
                            const durationMinutes = schedule.durationMinutes % 60;

                            let endHours = hours + durationHours;
                            let endMinutes = minutes + durationMinutes;

                            if (endMinutes >= 60) {
                                endHours += 1;
                                endMinutes -= 60;
                            }

                            endHours = endHours % 24;

                            const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

                            const year = nextDate.getFullYear();
                            const month = String(nextDate.getMonth() + 1).padStart(2, '0');
                            const day = String(nextDate.getDate()).padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;

                            const startDateTime = `${dateString}T${startTime}:00`;
                            const endDateTime = `${dateString}T${endTime}:00`;

                            scheduleEvents.push({
                                id: `schedule-${subject.id}-${schedule.id}-${i}`,
                                title: subject.title,
                                startDateTime: startDateTime,
                                endDateTime: endDateTime,
                                type: 'schedule',
                                color: '#467BAA',
                                subjectId: subject.id,
                                scheduleId: schedule.id
                            });
                        }
                    } catch (error) {
                        console.error("Error al procesar horario de asignatura:", error);
                    }
                });
            }
        });

        const calendarItems = [
            ...tasks.map(task => ({
                ...task,
                type: 'task'
            })),
            ...events.map(event => ({
                ...event,
                type: 'event'
            })),
            ...scheduleEvents
        ];

        setCombinedCalendarItems(calendarItems);
    }, [tasks, events, subjects]);

    const handleAddFromCalendar = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setSelectedDate(`${year}-${month}-${day}`);
            setIsAddModalOpen(true);
        }
    };

    const pendingTasks = tasks.filter(task => task.status !== 'Finalizada').length;
    const upcomingEvents = events.length;
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
    const busyDays = new Set();

    combinedCalendarItems.forEach(item => {
        const date = item.dueDate || item.startDateTime;
        if (date) {
            try {
                const day = new Date(date).toISOString().split('T')[0];
                busyDays.add(day);
            } catch (error) {
                console.warn(`Fecha inválida encontrada: ${date}`, error);
            }
        }
    });

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

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-3/4 bg-card-bg rounded-xl shadow-md md:p-0 opacity-95 border border-border">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p className="text-text-secondary">Cargando calendario...</p>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <ModernCalendar
                                        layout='bottom'
                                        events={combinedCalendarItems}
                                        onAddEvent={handleAddFromCalendar}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/4 space-y-4">
                            <div className="bg-card-bg p-5 rounded-xl shadow-md opacity-95 border border-border">
                                <h3 className="text-lg font-medium text-primary mb-4 flex items-center">
                                    <FaChartBar className="mr-2" /> Resumen
                                </h3>

                                <div className="space-y-3">
                                    <div className="bg-input-bg p-3 rounded-lg">
                                        <div className="text-sm text-text-secondary">Tareas pendientes</div>
                                        <div className="text-2xl font-bold text-primary">{pendingTasks}</div>
                                    </div>

                                    <div className="bg-input-bg p-3 rounded-lg">
                                        <div className="text-sm text-text-secondary">Eventos próximos</div>
                                        <div className="text-2xl font-bold text-primary">{upcomingEvents}</div>
                                    </div>

                                    <div className="bg-input-bg p-3 rounded-lg">
                                        <div className="text-sm text-text-secondary">Asignaturas</div>
                                        <div className="text-2xl font-bold text-primary">{subjects.length}</div>
                                    </div>

                                    <div className="bg-input-bg p-3 rounded-lg">
                                        <div className="text-sm text-text-secondary">Días ocupados en {currentMonth}</div>
                                        <div className="text-2xl font-bold text-primary">{busyDays.size}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                                    >
                                        <FaPlus className="mr-2" /> Añadir evento o tarea
                                    </button>
                                </div>
                            </div>

                            <div className="bg-card-bg p-5 rounded-xl shadow-md opacity-95 border border-border">
                                <h3 className="text-lg font-medium text-primary mb-4 flex items-center">
                                    <FaBook className="mr-2" /> Mis Asignaturas
                                </h3>

                                {subjects.length > 0 ? (
                                    <div className="space-y-2">
                                        {subjects.slice(0, 5).map((subject) => (
                                            <div key={subject.id} className="bg-input-bg p-3 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-text">{subject.title}</div>
                                                    <div className="text-xs text-text-secondary">
                                                        {subject.schedules?.length || 0} {subject.schedules?.length === 1 ? 'sesión' : 'sesiones'} programadas
                                                    </div>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full bg-primary`}></div>
                                            </div>
                                        ))}
                                        {subjects.length > 5 && (
                                            <div className="text-center mt-2">
                                                <span className="text-xs text-primary">
                                                    +{subjects.length - 5} asignaturas más
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-text-secondary text-sm">No tienes asignaturas registradas</p>
                                )}
                            </div>

                            <div className="bg-card-bg p-5 rounded-xl shadow-md opacity-95 border border-border">
                                <h3 className="text-lg font-medium text-primary mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2" /> Próximos
                                </h3>

                                {combinedCalendarItems.length > 0 ? (
                                    combinedCalendarItems
                                        .filter(item => {
                                            const dateStr = item.dueDate || item.startDateTime;
                                            if (!dateStr) return false;

                                            try {
                                                const date = new Date(dateStr);
                                                return !isNaN(date.getTime());
                                            } catch {
                                                return false;
                                            }
                                        })
                                        .sort((a, b) => {
                                            const dateA = new Date(a.dueDate || a.startDateTime);
                                            const dateB = new Date(b.dueDate || b.startDateTime);
                                            return dateA - dateB;
                                        })
                                        .slice(0, 3)
                                        .map((item, index) => {
                                            let dateString;
                                            try {
                                                const date = new Date(item.dueDate || item.startDateTime);
                                                dateString = date.toLocaleDateString('es-ES');
                                            } catch {
                                                dateString = "Fecha desconocida";
                                            }

                                            return (
                                                <div
                                                    key={`${item.id || index}`}
                                                    className={`mb-3 border-l-4 pl-3 py-1 ${item.type === 'task' ? 'border-task' :
                                                            item.type === 'schedule' ? 'border-primary' : 'border-event'
                                                        }`}
                                                >
                                                    <div className="font-medium text-text text-sm">{item.title}</div>
                                                    <div className="text-xs text-text-secondary">
                                                        {dateString}
                                                        {item.type === 'schedule' && ' (Clase)'}
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="text-text-secondary text-sm">No hay eventos próximos</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card-bg p-6 rounded-xl shadow-lg w-full max-w-md mx-4 border border-border">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                            Añadir en {selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES') : 'el calendario'}
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsTaskModalOpen(true);
                                }}
                                className="w-full bg-task-normal text-white px-4 py-2 rounded-lg hover:bg-task-normal/80 flex items-center justify-center"
                            >
                                <FaPlus className="mr-2" /> Nueva Tarea
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEventModalOpen(true);
                                }}
                                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent flex items-center justify-center"
                            >
                                <FaPlus className="mr-2" /> Nuevo Evento
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-full bg-input-bg text-text px-4 py-2 rounded-lg hover:bg-border"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={editingTask ? handleTaskUpdate : handleAddTask}
                subjects={subjects}
                task={editingTask || (selectedDate ? { dueDate: selectedDate } : null)}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                }}
                onSave={editingEvent ? handleEventUpdate : handleAddEvent}
                event={editingEvent}
                defaultDate={selectedDate}
            />
        </div>
    );
};

export default CalendarPage;
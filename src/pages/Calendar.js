// src/pages/Calendar.js - Actualizado con ModernCalendar mejorado
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasks';
import { getEvents } from '../api/events';
import Sidebar from '../components/Sidebar';
import ModernCalendar from '../components/ModernCalendar';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import { FaCalendarAlt, FaChartBar, FaPlus } from 'react-icons/fa';
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

    // Estados para modales
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
                const [tasksData, eventsData] = await Promise.all([
                    getTasks(),
                    getEvents()
                ]);

                setTasks(tasksData);
                setEvents(eventsData);
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

    // Actualizar handleAddTask para manejar correctamente las asignaturas
    const handleAddTask = async (newTask) => {
        try {
            // Preparar la tarea con la información correcta de asignatura
            const taskToAdd = {
                ...newTask,
                // Buscamos el título de la asignatura si hay un subjectId
                subject: newTask.subjectId ?
                    subjects.find(s => s.id === parseInt(newTask.subjectId))?.title || 'Sin asignatura' :
                    'Sin asignatura'
            };

            const addedTask = await addTask(taskToAdd);

            // Asegurarnos de que la tarea añadida tenga un subject
            const processedTask = {
                ...addedTask,
                subject: addedTask.subject || (
                    addedTask.subjectId ?
                        subjects.find(s => s.id === parseInt(addedTask.subjectId))?.title || 'Sin asignatura' :
                        'Sin asignatura'
                ),
                type: 'task'  // Añadir el tipo para el calendario
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

    // Actualizar handleTaskUpdate para manejar correctamente las asignaturas
    const handleTaskUpdate = async (updatedTask) => {
        try {
            // Preparar la tarea con la información correcta de asignatura
            const taskToUpdate = {
                ...updatedTask,
                // Buscamos el título de la asignatura si hay un subjectId
                subject: updatedTask.subjectId ?
                    subjects.find(s => s.id === parseInt(updatedTask.subjectId))?.title || 'Sin asignatura' :
                    'Sin asignatura'
            };

            const updatedTaskResult = await updateTask(updatedTask.id, taskToUpdate);

            // Asegurarnos de que la tarea actualizada tenga un subject
            const processedTask = {
                ...updatedTaskResult,
                subject: updatedTaskResult.subject || (
                    updatedTaskResult.subjectId ?
                        subjects.find(s => s.id === parseInt(updatedTaskResult.subjectId))?.title || 'Sin asignatura' :
                        'Sin asignatura'
                ),
                type: 'task'  // Añadir el tipo para el calendario
            };

            setTasks(tasks.map((task) => (task.id === updatedTask.id ? processedTask : task)));
            setIsTaskModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setError('Error al actualizar la tarea');
        }
    };

    // Funciones para manejar eventos
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

    // Combinar tareas y eventos para usar en el calendario
    useEffect(() => {
        const calendarItems = [
            ...tasks.map(task => ({
                ...task,
                type: 'task'
            })),
            ...events.map(event => ({
                ...event,
                type: 'event'
            }))
        ];

        setCombinedCalendarItems(calendarItems);
    }, [tasks, events]);

    // Función para manejar el botón de añadir desde el calendario
    const handleAddFromCalendar = (date) => {
        // Convertir la fecha a formato ISO string YYYY-MM-DD
        setSelectedDate(date.toISOString().split('T')[0]);
        setIsAddModalOpen(true);
    };

    // Estadísticas para el panel lateral
    const pendingTasks = tasks.filter(task => task.status !== 'Finalizada').length;
    const upcomingEvents = events.length;
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
    const busyDays = new Set();

    // Encontrar días ocupados
    combinedCalendarItems.forEach(item => {
        const date = item.dueDate || item.startDateTime;
        if (date) {
            const day = new Date(date).toISOString().split('T')[0];
            busyDays.add(day);
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
                }}
            >
                <div className="relative z-10">
                    {error && (
                        <div className="bg-error text-error p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4">Cargando...</div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Panel principal con calendario grande - AUMENTADO DE ALTURA */}
                        <div className="lg:w-3/4 bg-white rounded-xl shadow-md md:p-0 opacity-95">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p className="text-gray-500">Cargando calendario...</p>
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

                        {/* Panel lateral con estadísticas */}
                        <div className="lg:w-1/4 space-y-4">
                            <div className="bg-white p-5 rounded-xl shadow-md opacity-95">
                                <h3 className="text-lg font-medium text-primary mb-4 flex items-center">
                                    <FaChartBar className="mr-2" /> Resumen
                                </h3>

                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Tareas pendientes</div>
                                        <div className="text-2xl font-bold text-primary">{pendingTasks}</div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Eventos próximos</div>
                                        <div className="text-2xl font-bold text-primary">{upcomingEvents}</div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Días ocupados en {currentMonth}</div>
                                        <div className="text-2xl font-bold text-primary">{busyDays.size}</div>
                                    </div>
                                </div>

                                {/* Botón de añadir evento/tarea */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                                    >
                                        <FaPlus className="mr-2" /> Añadir evento o tarea
                                    </button>
                                </div>
                            </div>

                            {/* Recordatorios recientes */}
                            <div className="bg-white p-5 rounded-xl shadow-md opacity-95">
                                <h3 className="text-lg font-medium text-primary mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2" /> Próximos
                                </h3>

                                {combinedCalendarItems.length > 0 ? (
                                    combinedCalendarItems
                                        .sort((a, b) => {
                                            const dateA = new Date(a.dueDate || a.startDateTime);
                                            const dateB = new Date(b.dueDate || b.startDateTime);
                                            return dateA - dateB;
                                        })
                                        .slice(0, 3)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className={`mb-3 border-l-4 pl-3 py-1 ${item.type === 'task' ? 'border-task' : 'border-event'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(item.dueDate || item.startDateTime).toLocaleDateString('es-ES')}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No hay eventos próximos</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para seleccionar tipo de evento a añadir */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
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
                task={editingTask || (selectedDate ? { dueDate: selectedDate } : null)}
            />

            {/* Modal para añadir/editar evento */}
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
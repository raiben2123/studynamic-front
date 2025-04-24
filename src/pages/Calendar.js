// src/pages/Calendar.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasks';
import { getEvents } from '../api/events';
import Sidebar from '../components/Sidebar';
import ModernCalendar from '../components/ModernCalendar';
import { FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import Logo from '../assets/Logo_opacidad33.png'; // Importa la imagen de fondo

const CalendarPage = () => {
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, userId } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener tareas y eventos para el calendario
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

        if (token && userId) {
            fetchData();
        }
    }, [token, userId]);

    // Combinar tareas y eventos para mostrar en el calendario
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

    // Estadísticas para el panel lateral
    const pendingTasks = tasks.filter(task => task.status !== 'Finalizada').length;
    const upcomingEvents = events.length;
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
    const busyDays = new Set();

    // Encontrar días ocupados
    calendarItems.forEach(item => {
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
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4">Cargando...</div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Panel principal con calendario grande */}
                        <div className="lg:w-3/4 bg-white rounded-xl shadow-md md:p-0 opacity-95">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p className="text-gray-500">Cargando calendario...</p>
                                </div>
                            ) : (
                                <div className="w-full">
                                    {/* El calendario ahora ocupará más espacio horizontal */}
                                    <ModernCalendar events={calendarItems} />
                                </div>
                            )}
                        </div>

                        {/* Panel lateral con estadísticas - Similar al dashboard */}
                        <div className="lg:w-1/4 space-y-4">
                            <div className="bg-white p-5 rounded-xl shadow-md opacity-95">
                                <h3 className="text-lg font-medium text-violet-700 mb-4 flex items-center">
                                    <FaChartBar className="mr-2" /> Resumen
                                </h3>

                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Tareas pendientes</div>
                                        <div className="text-2xl font-bold text-violet-600">{pendingTasks}</div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Eventos próximos</div>
                                        <div className="text-2xl font-bold text-violet-600">{upcomingEvents}</div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Días ocupados en {currentMonth}</div>
                                        <div className="text-2xl font-bold text-violet-600">{busyDays.size}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recordatorios recientes */}
                            <div className="bg-white p-5 rounded-xl shadow-md opacity-95">
                                <h3 className="text-lg font-medium text-violet-700 mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2" /> Próximos
                                </h3>

                                {calendarItems.length > 0 ? (
                                    calendarItems.slice(0, 3).map((item, index) => (
                                        <div key={index} className="mb-3 border-l-4 pl-3 py-1"
                                            style={{ borderColor: item.type === 'task' ? '#e11d48' : '#8b5cf6' }}>
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
        </div>
    );
};

export default CalendarPage;
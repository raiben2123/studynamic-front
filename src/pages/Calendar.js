// src/pages/CalendarPage.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import CalendarComponent from '../components/CalendarComponent';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SessionModal from '../components/modals/SessionModal'; // Nuevo import

const initialPersonalData = {
    tasks: [
        {
            id: 1,
            title: 'Tarea de Matemáticas',
            start: '2025-03-24',
            status: 'Pendiente',
            importance: 'No Urgente',
            subject: 'Matemáticas',
            notificationDate: '',
            allDay: true,
        },
    ],
    events: [
        {
            id: 2,
            title: 'Reunión de Estudio - Matemáticas',
            start: '2025-03-23T10:00:00',
            end: '2025-03-23T11:30:00',
            notificationDate: '',
            allDay: false,
        },
        {
            id: 3,
            title: 'Examen de Física',
            start: '2025-03-25',
            end: '2025-03-25',
            notificationDate: '2025-03-24T09:00',
            allDay: true,
        },
    ],
    studySessions: [
        {
            id: 4,
            title: 'Sesión de Programación',
            start: '2025-03-26',
            zoomLink: 'https://zoom.us/j/123456789',
            notificationDate: '',
            allDay: true,
        },
    ],
};

const subjects = ['Matemáticas', 'Física', 'Programación', 'Química', 'Literatura'];

const CalendarPage = () => {
    const [personalData, setPersonalData] = useState(initialPersonalData);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleDateClick = (info) => {
        console.log('Fecha clicada:', info.dateStr);
        setSelectedDate(info.dateStr);
        setIsAddModalOpen(true);
    };

    const handleEventClick = (info) => {
        setSelectedEvent({
            title: info.event.title,
            start: info.event.start,
            end: info.event.end || null,
            allDay: info.event.allDay,
            notificationDate: info.event.extendedProps?.notificationDate || '',
            zoomLink: info.event.extendedProps?.zoomLink || '', // Para sesiones
        });
        setIsEventDetailsOpen(true);
    };

    const handleAddTask = (newTask) => {
        setPersonalData({
            ...personalData,
            tasks: [...personalData.tasks, { id: Date.now(), ...newTask, allDay: true }],
        });
        setIsTaskModalOpen(false);
    };

    const handleAddEvent = (newEvent) => {
        setPersonalData({
            ...personalData,
            events: [
                ...personalData.events,
                { id: Date.now(), ...newEvent, allDay: !newEvent.start.includes('T') },
            ],
        });
        setIsEventModalOpen(false);
    };

    const handleAddSession = (newSession) => {
        setPersonalData({
            ...personalData,
            studySessions: [
                ...personalData.studySessions,
                { id: Date.now(), ...newSession, allDay: !newSession.start.includes('T') },
            ],
        });
        setIsSessionModalOpen(false);
    };

    const calendarEvents = [
        ...personalData.tasks.map((t) => ({ ...t, color: '#ff9f43' })),
        ...personalData.events.map((e) => ({ ...e, color: e.allDay ? '#f5a623' : '#467BAA' })),
        ...personalData.studySessions.map((s) => ({ ...s, color: '#28a745' })),
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
                        <h3 className="text-lg font-semibold mb-4">Añadir en {selectedDate}</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsTaskModalOpen(true);
                                }}
                                className="w-full bg-[#ff9f43] text-white px-4 py-2 rounded-full hover:bg-[#ffbf63]"
                            >
                                Nueva Tarea
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEventModalOpen(true);
                                }}
                                className="w-full bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                            >
                                Nuevo Evento
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsSessionModalOpen(true);
                                }}
                                className="w-full bg-[#28a745] text-white px-4 py-2 rounded-full hover:bg-[#38c75a]"
                            >
                                Nueva Sesión
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

            {/* Modal para añadir tarea */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleAddTask}
                subjects={subjects}
                defaultDate={selectedDate}
            />

            {/* Modal para añadir evento */}
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleAddEvent}
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
            {isEventDetailsOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Detalles del Evento</h3>
                        <div className="space-y-2">
                            <p><strong>Título:</strong> {selectedEvent.title}</p>
                            <p><strong>Fecha de inicio:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
                            {selectedEvent.end && (
                                <p><strong>Fecha de fin:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
                            )}
                            <p><strong>Todo el día:</strong> {selectedEvent.allDay ? 'Sí' : 'No'}</p>
                            {selectedEvent.notificationDate && (
                                <p><strong>Notificación:</strong> {new Date(selectedEvent.notificationDate).toLocaleString()}</p>
                            )}
                            {selectedEvent.zoomLink && (
                                <p><strong>Enlace Zoom:</strong> <a href={selectedEvent.zoomLink} target="_blank" rel="noopener noreferrer">{selectedEvent.zoomLink}</a></p>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
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
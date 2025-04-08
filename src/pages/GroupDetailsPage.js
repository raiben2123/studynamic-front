// src/pages/GroupDetailsPage.js
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo.png';
import TaskCard from '../components/dashboard/TaskCard';
import CalendarComponent from '../components/CalendarComponent';
import TaskModal from '../components/modals/TaskModal';
import EventModal from '../components/modals/EventModal';
import SessionModal from '../components/modals/SessionModal';
import { FaComments, FaTimes, FaShareAlt } from 'react-icons/fa';

const initialGroups = [
    {
        id: 1,
        name: 'Grupo de Matemáticas',
        password: 'math123',
        members: [
            { id: 1, name: 'Usuario 1', role: 'admin' },
            { id: 2, name: 'Tú', role: 'user' },
        ],
        tasks: [
            { id: 1, title: 'Resolver ejercicios', start: '2025-03-25', allDay: true, status: 'Pendiente', markObtained: '', markMax: '', importance: 'No Urgente', subject: 'Matemáticas' },
        ],
        events: [{ id: 1, title: 'Examen Final', start: '2025-03-26', allDay: true }],
        notes: { 'Carpeta 1': [{ id: 1, name: 'Fórmulas.pdf', file: null }] },
        studySessions: [{ id: 1, title: 'Repaso capítulo 5', start: '2025-03-24', allDay: true, zoomLink: 'https://zoom.us/j/123' }],
        messages: [{ id: 1, user: 'Usuario 1', content: '¿Alguien tiene los apuntes?', timestamp: '2025-03-23 10:00' }],
    },
    {
        id: 2,
        name: 'Grupo de Física',
        password: 'phys456',
        members: [{ id: 3, name: 'Tú', role: 'admin' }],
        tasks: [
            { id: 2, title: 'Preparar presentación', start: '2025-03-27', allDay: true, status: 'En Progreso', markObtained: '', markMax: '', importance: 'Urgente', subject: 'Física' },
        ],
        events: [],
        notes: {},
        studySessions: [],
        messages: [],
    },
];

const subjects = ['Matemáticas', 'Física', 'Programación', 'Química', 'Literatura'];

const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const [groups, setGroups] = useState(initialGroups);
    const [activeTab, setActiveTab] = useState('members');
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false); // Para mostrar detalles
    const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado
    const [selectedDate, setSelectedDate] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');

    const group = groups.find((g) => g.id === parseInt(groupId));
    const isAdmin = group?.members.find((m) => m.name === 'Tú')?.role === 'admin';

    if (!group) return <div>Grupo no encontrado</div>;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSendMessage = () => {
        if (!newMessage) return;
        const updatedGroup = {
            ...group,
            messages: [...group.messages, { id: Date.now(), user: 'Tú', content: newMessage, timestamp: new Date().toISOString() }],
        };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleKickMember = (memberId) => {
        if (window.confirm('¿Estás seguro de que quieres expulsar a este miembro?')) {
            const updatedGroup = {
                ...group,
                members: group.members.filter((m) => m.id !== memberId),
            };
            setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        }
    };

    const handleShareLink = () => {
        const shareLink = `${window.location.origin}/groups/join/${group.id}?password=${group.password}`;
        navigator.clipboard.writeText(shareLink);
        alert('Enlace copiado al portapapeles: ' + shareLink);
    };

    const handleTaskUpdate = (updatedTask) => {
        const updatedGroup = { ...group, tasks: group.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
    };

    const handleAddTask = (newTask) => {
        const updatedGroup = {
            ...group,
            tasks: [...group.tasks, { id: Date.now(), ...newTask, allDay: true }],
        };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        setIsTaskModalOpen(false);
    };

    const handleAddEvent = (newEvent) => {
        const updatedGroup = {
            ...group,
            events: [...group.events, { id: Date.now(), ...newEvent, allDay: !newEvent.start.includes('T') }],
        };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        setIsEventModalOpen(false);
    };

    const handleAddSession = (newSession) => {
        const updatedGroup = {
            ...group,
            studySessions: [...group.studySessions, { id: Date.now(), ...newSession, allDay: !newSession.start.includes('T') }],
        };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        setIsSessionModalOpen(false);
    };

    const handleAddFolder = () => {
        if (!newFolderName || group.notes[newFolderName]) {
            alert('El nombre de la carpeta ya existe o está vacío.');
            return;
        }
        const updatedGroup = { ...group, notes: { ...group.notes, [newFolderName]: [] } };
        setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        setNewFolderName('');
    };

    const handleFileUpload = (folder, event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
            const updatedGroup = {
                ...group,
                notes: { ...group.notes, [folder]: [...group.notes[folder], { id: Date.now(), name: file.name, file }] },
            };
            setGroups(groups.map((g) => (g.id === group.id ? updatedGroup : g)));
        } else {
            alert('Por favor, sube un archivo PDF o Word válido.');
        }
    };

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr);
        setIsAddModalOpen(true);
    };

    const handleEventClick = (info) => {
        setSelectedEvent({
            title: info.event.title,
            start: info.event.start,
            end: info.event.end || null,
            allDay: info.event.allDay,
            zoomLink: info.event.extendedProps?.zoomLink || '', // Para sesiones
            status: info.event.extendedProps?.status || '', // Para tareas
            importance: info.event.extendedProps?.importance || '', // Para tareas
            subject: info.event.extendedProps?.subject || '', // Para tareas
            markObtained: info.event.extendedProps?.markObtained || '', // Para tareas
            markMax: info.event.extendedProps?.markMax || '', // Para tareas
        });
        setIsEventDetailsOpen(true);
    };

    const calendarEvents = [
        ...group.tasks.map((t) => ({
            title: t.title,
            start: t.start,
            allDay: true,
            color: '#ff9f43',
            extendedProps: { status: t.status, importance: t.importance, subject: t.subject, markObtained: t.markObtained, markMax: t.markMax },
        })),
        ...group.events.map((e) => ({ title: e.title, start: e.start, allDay: e.allDay, color: e.allDay ? '#f5a623' : '#467BAA' })),
        ...group.studySessions.map((s) => ({ title: s.title, start: s.start, allDay: true, color: '#28a745', extendedProps: { zoomLink: s.zoomLink } })),
    ];

    return (
        <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div
                className="flex-1 bg-[#e6f0fa] p-4 md:p-8 flex flex-col md:flex-row relative"
                style={{
                    backgroundImage: `url(${Logo})`,
                    backgroundSize: '50%',
                    backgroundPosition: 'center right',
                    backgroundRepeat: 'no-repeat',
                    opacity: 1,
                }}
            >
                <div className="flex-1 relative z-10 md:pr-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl">{group.name}</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleShareLink}
                                className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2] flex items-center"
                            >
                                <FaShareAlt className="mr-2" /> Compartir
                            </button>
                            <Link to="/groups" className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]">
                                Volver a Grupos
                            </Link>
                        </div>
                    </div>

                    <div className="flex space-x-4 mb-6 overflow-x-auto">
                        {['members', 'tasks', 'calendar', 'notes', 'sessions', ...(isAdmin ? ['settings'] : [])].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-[#467BAA] text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                {tab === 'members' ? 'Miembros' : tab === 'tasks' ? 'Tareas' : tab === 'calendar' ? 'Calendario' : tab === 'notes' ? 'Apuntes' : tab === 'sessions' ? 'Sesiones' : 'Ajustes'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-md md:p-6 h-[calc(100vh-200px)] overflow-y-auto">
                        {activeTab === 'members' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Miembros ({group.members.length})</h2>
                                <div className="max-h-[50vh] overflow-y-auto">
                                    {group.members.map((member) => (
                                        <div key={member.id} className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                            <span>{member.name} {member.role === 'admin' ? '(Admin)' : ''}</span>
                                            {isAdmin && member.name !== 'Tú' && (
                                                <button
                                                    onClick={() => handleKickMember(member.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Tareas</h2>
                                    <button
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                    >
                                        + Añadir Tarea
                                    </button>
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto mb-4">
                                    {group.tasks.length === 0 ? (
                                        <p>No hay tareas.</p>
                                    ) : (
                                        group.tasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={{ ...task, dueDate: task.start }}
                                                onUpdate={handleTaskUpdate}
                                                subjects={subjects}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'calendar' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Calendario</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                    >
                                        + Añadir
                                    </button>
                                </div>
                                <CalendarComponent
                                    events={calendarEvents}
                                    onDateClick={handleDateClick}
                                    onEventClick={handleEventClick}
                                    height="70vh"
                                />
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Apuntes</h2>
                                    <button
                                        onClick={handleAddFolder}
                                        className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                    >
                                        + Nueva Carpeta
                                    </button>
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto">
                                    {Object.keys(group.notes).length === 0 ? (
                                        <p>No hay carpetas de apuntes.</p>
                                    ) : (
                                        Object.keys(group.notes).map((folder) => (
                                            <div key={folder} className="mb-4">
                                                <h3 className="text-lg font-medium mb-2">{folder}</h3>
                                                <label className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2] cursor-pointer">
                                                    + Subir Apunte
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => handleFileUpload(folder, e)}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <div className="mt-2">
                                                    {group.notes[folder].map((note) => (
                                                        <p key={note.id} className="text-sm text-gray-600">{note.name}</p>
                                                    ))}
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
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                    />
                                    <button
                                        onClick={handleAddFolder}
                                        className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                    >
                                        + Crear
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Sesiones de Estudio</h2>
                                    <button
                                        onClick={() => setIsSessionModalOpen(true)}
                                        className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                    >
                                        + Añadir Sesión
                                    </button>
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto mb-4">
                                    {group.studySessions.length === 0 ? (
                                        <p>No hay sesiones.</p>
                                    ) : (
                                        group.studySessions.map((session) => (
                                            <div key={session.id} className="text-sm text-gray-600 mb-2">
                                                <p>{session.title} - {formatDate(session.start)}</p>
                                                <a href={session.zoomLink} target="_blank" className="text-[#467BAA] hover:underline">
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
                                <h2 className="text-xl font-semibold mb-4">Ajustes</h2>
                                {/* Aquí irían los ajustes existentes */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat fijo a la derecha (escritorio) */}
                <div className="hidden md:block w-1/3 bg-white p-4 rounded-xl shadow-md md:p-6 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Chat</h2>
                    <div className="flex-1 max-h-[calc(100vh-250px)] overflow-y-auto mb-4">
                        {group.messages.length === 0 ? (
                            <p className="text-gray-600">No hay mensajes.</p>
                        ) : (
                            group.messages.map((msg) => (
                                <div key={msg.id} className={`flex mb-2 ${msg.user === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-2 rounded-lg ${msg.user === 'Tú' ? 'bg-[#467BAA] text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p className="text-sm font-medium">{msg.user}</p>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-xs text-gray-400">{formatDate(msg.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex space-x-2 mt-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 p-2 border border-gray-300 rounded"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                        >
                            Enviar
                        </button>
                    </div>
                </div>

                {/* Chat desplegable en móvil */}
                {isChatOpen && (
                    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
                        <div className="bg-white w-full max-w-md h-[70vh] p-4 rounded-t-xl flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Chat</h2>
                                <button onClick={() => setIsChatOpen(false)} className="text-gray-600 hover:text-gray-800">
                                    <FaTimes size={24} />
                                </button>
                            </div>
                            <div className="flex-1 max-h-[calc(70vh-120px)] overflow-y-auto mb-4">
                                {group.messages.length === 0 ? (
                                    <p className="text-gray-600">No hay mensajes.</p>
                                ) : (
                                    group.messages.map((msg) => (
                                        <div key={msg.id} className={`flex mb-2 ${msg.user === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-2 rounded-lg ${msg.user === 'Tú' ? 'bg-[#467BAA] text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                <p className="text-sm font-medium">{msg.user}</p>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-xs text-gray-400">{formatDate(msg.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex space-x-2 mt-auto">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[#467BAA] text-white px-3 py-1 rounded-full hover:bg-[#5aa0f2]"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón circular para chat en móvil */}
                <div className="md:hidden fixed bottom-4 right-4 z-20">
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="bg-[#467BAA] text-white p-4 rounded-full shadow-lg hover:bg-[#5aa0f2]"
                    >
                        <FaComments size={24} />
                    </button>
                </div>

                {/* Modal para añadir tarea */}
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleAddTask}
                    subjects={subjects}
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
                />

                {/* Modal de selección para calendario */}
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

                {/* Modal para detalles del evento */}
                {isEventDetailsOpen && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                            <div className="space-y-2">
                                <p><strong>Título:</strong> {selectedEvent.title}</p>
                                <p><strong>Fecha de inicio:</strong> {formatDate(selectedEvent.start)}</p>
                                {selectedEvent.end && (
                                    <p><strong>Fecha de fin:</strong> {formatDate(selectedEvent.end)}</p>
                                )}
                                <p><strong>Todo el día:</strong> {selectedEvent.allDay ? 'Sí' : 'No'}</p>
                                {selectedEvent.status && (
                                    <p><strong>Estado:</strong> {selectedEvent.status}</p>
                                )}
                                {selectedEvent.importance && (
                                    <p><strong>Importancia:</strong> {selectedEvent.importance}</p>
                                )}
                                {selectedEvent.subject && (
                                    <p><strong>Asignatura:</strong> {selectedEvent.subject}</p>
                                )}
                                {(selectedEvent.markObtained || selectedEvent.markMax) && (
                                    <p><strong>Nota:</strong> {selectedEvent.markObtained || 'N/A'} / {selectedEvent.markMax || 'N/A'}</p>
                                )}
                                {selectedEvent.zoomLink && (
                                    <p><strong>Enlace Zoom:</strong> <a href={selectedEvent.zoomLink} target="_blank" rel="noopener noreferrer" className="text-[#467BAA] hover:underline">{selectedEvent.zoomLink}</a></p>
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
        </div>
    );
};

export default GroupDetailsPage;
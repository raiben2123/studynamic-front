// src/pages/CalendarPage.js
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';

const events = [
    {
        title: 'Reunión de Estudio - Matemáticas',
        start: '2025-03-23T10:00:00',
        end: '2025-03-23T11:30:00',
        allDay: false,
    },
    {
        title: 'Examen de Física',
        start: '2025-03-25',
        end: '2025-03-25',
        allDay: true,
    },
    {
        title: 'Clase de Programación',
        start: '2025-03-24T09:00:00',
        end: '2025-03-24T10:30:00',
        allDay: false,
    },
    {
        title: 'Feriado - Día de Descanso',
        start: '2025-03-26',
        end: '2025-03-26',
        allDay: true,
    },
    {
        title: 'Taller de Escritura',
        start: '2025-04-02T14:00:00',
        end: '2025-04-02T15:30:00',
        allDay: false,
    },
    {
        title: 'Día de Estudio en Grupo',
        start: '2025-02-28',
        end: '2025-02-28',
        allDay: true,
    },
];

const CalendarPage = () => {
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
                        <div className="overflow-hidden" style={{ height: '70vh' }}>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                events={events}
                                locale="es"
                                firstDay={1}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                                }}
                                buttonText={{
                                    today: 'Hoy',
                                    month: 'Mes',
                                    week: 'Semana',
                                    day: 'Día',
                                    list: 'Lista',
                                }}
                                eventBackgroundColor={(event) => (event.allDay ? '#f5a623' : '#467BAA')}
                                eventBorderColor={(event) => (event.allDay ? '#f5a623' : '#467BAA')}
                                eventTextColor="white"
                                eventDisplay="block"
                                eventTimeFormat={{
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    meridiem: false,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
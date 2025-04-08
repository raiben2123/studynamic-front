// src/components/CalendarComponent.js
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

const CalendarComponent = ({ events, onDateClick, onEventClick, height = '70vh' }) => {
    return (
        <div className="w-full overflow-hidden" style={{ height }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                locale={esLocale}
                firstDay={1}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Lista',
                }}
                eventDisplay="block"
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: false,
                }}
                dateClick={onDateClick}
                eventClick={onEventClick} // Añadimos el manejador de clics en eventos
            />
        </div>
    );
};

export default CalendarComponent;
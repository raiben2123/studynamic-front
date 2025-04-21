// src/components/CalendarComponent.js
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

const CalendarComponent = ({ events, onDateClick, onEventClick, height = '70vh' }) => {
    const calendarWrapperStyles = {
        '--fc-button-bg-color': 'var(--primary-color)',
        '--fc-button-border-color': 'var(--primary-color)',
        '--fc-button-hover-bg-color': 'var(--accent-color)',
        '--fc-button-hover-border-color': 'var(--accent-color)',
        '--fc-button-active-bg-color': 'var(--accent-color)',
        '--fc-button-active-border-color': 'var(--accent-color)',
        '--fc-today-bg-color': 'rgba(var(--primary-color-rgb), 0.1)',
        '--fc-event-bg-color': 'var(--primary-color)',
        '--fc-event-border-color': 'var(--primary-color)',
        '--fc-event-text-color': '#fff',
        '--fc-list-event-hover-bg-color': 'rgba(var(--primary-color-rgb), 0.1)',
    };

    return (
        <div className="w-full overflow-hidden" style={{ height, ...calendarWrapperStyles }}>
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
                eventClick={onEventClick}
            />
        </div>
    );
};

export default CalendarComponent;
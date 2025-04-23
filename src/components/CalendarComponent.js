// src/components/CalendarComponent.js
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import PropTypes from 'prop-types';

const CalendarComponent = ({ 
    events, 
    subjects, 
    onDateClick, 
    onEventClick, 
    height = '70vh',
    showSubjectSchedules = true 
}) => {
    const [allEvents, setAllEvents] = useState([]);
    const [initialView, setInitialView] = useState('timeGridWeek');
    const calendarRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Responsive view handling
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Set appropriate view based on screen size
        if (windowWidth < 768) {
            setInitialView('listWeek');
        } else {
            setInitialView('timeGridWeek');
        }
    }, [windowWidth]);

    // Generar eventos recurrentes basados en los horarios de las asignaturas
    useEffect(() => {
        const currentDate = new Date();
        // Establecer fechas para mostrar 3 meses de horarios (de clases)
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 14); // 2 semanas atrás
        
        const endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 3); // 3 meses adelante
        
        const subjectEvents = [];
        
        // Solo procesar horarios si showSubjectSchedules está activo
        if (showSubjectSchedules && subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                // Comprobar si la asignatura tiene horarios
                const schedules = subject.schedules || [];
                
                schedules.forEach(schedule => {
                    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
                    const dayOfWeek = schedule.dayOfWeek;
                    
                    // Obtener la hora de inicio
                    let startHour = 8; // Valor predeterminado
                    let startMinute = 0;
                    
                    if (typeof schedule.startTime === 'string' && schedule.startTime.includes(':')) {
                        const [hour, minute] = schedule.startTime.split(':').map(Number);
                        startHour = hour;
                        startMinute = minute;
                    } else if (schedule.startTime && typeof schedule.startTime === 'object') {
                        startHour = schedule.startTime.hours || 8;
                        startMinute = schedule.startTime.minutes || 0;
                    }
                    
                    // Calcular la duración en milisegundos
                    const durationMs = (schedule.durationMinutes || 60) * 60 * 1000;
                    
                    // Tipo de semana (0 = todas, 1 = pares, 2 = impares)
                    const weekType = schedule.weekType || 0;
                    
                    // Generar eventos recurrentes
                    let currentDate = new Date(startDate);
                    
                    // Ajustar al primer día que corresponda al dayOfWeek
                    while (currentDate.getDay() !== dayOfWeek) {
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    
                    // Generar eventos hasta la fecha de fin
                    while (currentDate <= endDate) {
                        // Verificar si esta semana corresponde al tipo de semana
                        const weekNumber = Math.ceil((currentDate.getDate() - currentDate.getDay()) / 7);
                        const isEvenWeek = weekNumber % 2 === 0;
                        
                        let shouldInclude = false;
                        
                        if (weekType === 0) { // Todas las semanas
                            shouldInclude = true;
                        } else if (weekType === 1 && isEvenWeek) { // Semanas pares
                            shouldInclude = true;
                        } else if (weekType === 2 && !isEvenWeek) { // Semanas impares
                            shouldInclude = true;
                        }
                        
                        if (shouldInclude) {
                            // Crear fecha de inicio
                            const eventStart = new Date(currentDate);
                            eventStart.setHours(startHour, startMinute, 0);
                            
                            // Crear fecha de fin (añadiendo la duración)
                            const eventEnd = new Date(eventStart.getTime() + durationMs);
                            
                            // Agregar evento
                            subjectEvents.push({
                                id: `subject-${subject.id}-schedule-${schedule.id}-${currentDate.toISOString()}`,
                                title: subject.title,
                                start: eventStart.toISOString(),
                                end: eventEnd.toISOString(),
                                allDay: false,
                                editable: false,
                                backgroundColor: '#4285F4', // Color para eventos de asignaturas
                                borderColor: '#4285F4',
                                textColor: 'white',
                                classNames: ['subject-schedule-event'],
                                extendedProps: {
                                    type: 'subject-schedule',
                                    subjectId: subject.id,
                                    scheduleId: schedule.id,
                                    isRecurring: true,
                                    weekType: schedule.weekType
                                }
                            });
                        }
                        
                        // Avanzar 7 días (siguiente semana)
                        currentDate.setDate(currentDate.getDate() + 7);
                    }
                });
            });
        }
        
        // Combinar eventos regulares con eventos de asignaturas
        const combinedEvents = [...events, ...subjectEvents];
        setAllEvents(combinedEvents);
    }, [events, subjects, showSubjectSchedules]);

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
        '--fc-button-text-color': '#fff',
        '--fc-toolbar-title-font-size': windowWidth < 768 ? '1.25em' : '1.75em', // Smaller title on mobile
    };

    // Responsive header configuration
    const headerToolbar = windowWidth < 768 
        ? {
            left: 'prev,next',
            center: 'title',
            right: 'listWeek,timeGridDay',
        }
        : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        };

    const handleViewDidMount = () => {
        // Apply specific styles for mobile view
        if (windowWidth < 768) {
            // Make sure table cells are not too small on mobile
            const eventElements = document.querySelectorAll('.fc-event');
            eventElements.forEach(el => {
                el.style.fontSize = '0.85em';
                el.style.padding = '2px 4px';
            });
        }
    };

    return (
        <div 
            className="w-full overflow-hidden rounded-lg calendar-container" 
            style={{ height, ...calendarWrapperStyles }}
        >
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={initialView}
                events={allEvents}
                headerToolbar={headerToolbar}
                locale={esLocale}
                firstDay={1} // Semana comienza en lunes
                buttonText={{
                    today: windowWidth < 768 ? 'Hoy' : 'Hoy',
                    month: windowWidth < 768 ? 'Mes' : 'Mes',
                    week: windowWidth < 768 ? 'Sem' : 'Semana',
                    day: windowWidth < 768 ? 'Día' : 'Día',
                    list: windowWidth < 768 ? 'Lista' : 'Lista',
                }}
                slotMinTime="07:00:00" // Hora mínima mostrada
                slotMaxTime="22:00:00" // Hora máxima mostrada
                allDaySlot={true} // Mostrar slot de "Todo el día"
                eventDisplay="block"
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: false,
                }}
                dateClick={onDateClick}
                eventClick={onEventClick}
                viewDidMount={handleViewDidMount}
                eventClassNames={(arg) => {
                    // Aplicar clases especiales según el tipo de evento
                    const eventType = arg.event.extendedProps?.type;
                    if (eventType === 'subject-schedule') {
                        return ['subject-schedule-event'];
                    }
                    return [];
                }}
                // Responsive settings
                height="auto"
                contentHeight={windowWidth < 768 ? "auto" : height}
                stickyHeaderDates={true}
                stickyFooterScrollbar={true}
            />
        </div>
    );
};

CalendarComponent.propTypes = {
    events: PropTypes.array.isRequired,
    subjects: PropTypes.array,
    onDateClick: PropTypes.func,
    onEventClick: PropTypes.func,
    height: PropTypes.string,
    showSubjectSchedules: PropTypes.bool
};

export default CalendarComponent;
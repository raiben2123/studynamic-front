// src/components/CalendarComponent.js
import React, { useEffect, useState } from 'react';
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
    };

    return (
        <div className="w-full overflow-hidden" style={{ height, ...calendarWrapperStyles }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="timeGridWeek" // Cambiar vista predeterminada a semana
                events={allEvents}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                locale={esLocale}
                firstDay={1} // Semana comienza en lunes
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Lista',
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
                eventClassNames={(arg) => {
                    // Aplicar clases especiales según el tipo de evento
                    const eventType = arg.event.extendedProps?.type;
                    if (eventType === 'subject-schedule') {
                        return ['subject-schedule-event'];
                    }
                    return [];
                }}
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
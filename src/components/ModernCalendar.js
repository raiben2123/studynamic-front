import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameMonth, isSameDay, isToday, parseISO, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaPlus, FaTasks, FaCalendarAlt, FaVideo, FaLink } from 'react-icons/fa';

const ModernCalendar = ({ events = [], onAddEvent, layout = 'bottom' }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showEventsList, setShowEventsList] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            setIsMobile(newIsMobile);
            if (!newIsMobile && showEventsList) {
                setShowEventsList(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showEventsList]);

    useEffect(() => {
        const filtered = events.filter((event) => {
            const eventDate =
                typeof event.dueDate === 'string'
                    ? parseISO(event.dueDate)
                    : typeof event.startDateTime === 'string'
                        ? parseISO(event.startDateTime)
                        : null;
            return eventDate && isSameDay(eventDate, selectedDay);
        });
        setDayEvents(filtered);
    }, [selectedDay, events]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDay(new Date());
    };

    const dayHasEvents = (day) => {
        return events.some((event) => {
            const eventDate =
                typeof event.dueDate === 'string'
                    ? parseISO(event.dueDate)
                    : typeof event.startDateTime === 'string'
                        ? parseISO(event.startDateTime)
                        : null;
            return eventDate && isSameDay(eventDate, day);
        });
    };
    
    const getWeekDays = () => ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    const adjustDayOfWeek = (day) => {
        const jsDay = getDay(day);
        return jsDay === 0 ? 6 : jsDay - 1;
    };

    const getCalendarDays = () => {
        const firstDayOfMonth = startOfMonth(currentDate);
        const firstDayOfCalendar = addDays(firstDayOfMonth, -adjustDayOfWeek(firstDayOfMonth));
        
        const calendarDays = [];
        for (let i = 0; i < 42; i++) {
            calendarDays.push(addDays(firstDayOfCalendar, i));
        }
        
        const weeks = [];
        for (let i = 0; i < 6; i++) {
            weeks.push(calendarDays.slice(i * 7, (i + 1) * 7));
        }
        
        return weeks;
    };

    const renderDay = (day) => {
        const dayNumber = day.getDate();
        const hasEvents = dayHasEvents(day);
        const isSelected = isSameDay(day, selectedDay);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isTodayDate = isToday(day);

        let dayClass = 'relative h-12 md:h-16 w-full flex items-center justify-center rounded-full text-lg ';
        if (!isCurrentMonth) dayClass += 'text-text-secondary/50 ';
        else dayClass += 'text-text ';
        if (isTodayDate) dayClass += 'font-bold ';
        if (isSelected) {
            dayClass += isTodayDate ? 'bg-primary text-white ' : 'border-2 border-primary text-primary ';
        } else {
            dayClass += 'hover:bg-input-bg ';
        }

        const handleDayClick = () => {
            setSelectedDay(day);
            if (isMobile) {
                setShowEventsList(true);
            }
        };

        return (
            <button key={day.toString()} onClick={handleDayClick} className={dayClass}>
                {dayNumber}
                {hasEvents && !isSelected && (
                    <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                )}
            </button>
        );
    };

    const renderDayEvents = () => {
        if (dayEvents.length === 0) {
            return (
                <div className="text-center py-6">
                    <p className="text-text-secondary text-center mb-3">No hay eventos para este día</p>
                    {onAddEvent && (
                        <button
                            onClick={() => onAddEvent(selectedDay)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                        >
                            <span className="flex items-center justify-center">
                                <FaPlus className="mr-2" /> Añadir evento
                            </span>
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto p-2">
                {dayEvents.map((event, index) => {
                    const isTask = event.type === 'task' || event.status !== undefined;
                    const isSession = event.type === 'schedule';
                    const time = event.dueDate || event.startDateTime;
                    
                    return (
                        <div
                            key={`${event.id || index}-${index}`}
                            className={`bg-card-bg p-3 rounded-lg border-l-4 ${
                                isTask ? 'border-task' : 
                                isSession ? 'border-primary' : 
                                'border-event'
                            } shadow-sm`}
                        >
                            <h4 className="font-medium text-text">{event.title}</h4>
                            {time && (
                                <p className="text-text-secondary text-sm">
                                    {formatTime(time)}
                                </p>
                            )}
                            <div className="text-xs text-text-secondary mt-1 flex items-center">
                                {isTask && (
                                    <>
                                        <FaTasks className="mr-1" /> Tarea
                                        {event.subject && <span className="ml-2">• {event.subject}</span>}
                                    </>
                                )}
                                {isSession && (
                                    <>
                                        <FaVideo className="mr-1" /> Sesión
                                    </>
                                )}
                                {!isTask && !isSession && (
                                    <>
                                        <FaCalendarAlt className="mr-1" /> Evento
                                    </>
                                )}
                            </div>
                            {isSession && event.zoomLink && (
                                <a
                                    href={event.zoomLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-accent mt-2 flex items-center"
                                >
                                    <FaLink className="mr-1" /> Unirse
                                </a>
                            )}
                        </div>
                    );
                })}
                
                {onAddEvent && (
                    <div className="text-center pt-2">
                        <button
                            onClick={() => onAddEvent(selectedDay)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                        >
                            <span className="flex items-center justify-center">
                                <FaPlus className="mr-1" /> Añadir otro evento
                            </span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            return format(parseISO(dateString), 'HH:mm');
        } catch (error) {
            console.error('Error formateando hora:', error);
            return '';
        }
    };

    if (isMobile) {
        return (
            <div className="bg-card-bg rounded-xl shadow-sm overflow-hidden h-full flex flex-col border border-border">
                {showEventsList ? (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-border">
                            <button 
                                onClick={() => setShowEventsList(false)} 
                                className="flex items-center text-primary"
                            >
                                <FaChevronLeft className="mr-2" /> Volver
                            </button>
                            <h3 className="font-medium text-text">
                                {format(selectedDay, 'EEEE, d MMMM', { locale: es })
                                    .charAt(0)
                                    .toUpperCase() +
                                    format(selectedDay, 'EEEE, d MMMM', { locale: es }).slice(1)}
                            </h3>
                            <div></div>
                        </div>
                        
                        <div className="flex-1 bg-input-bg overflow-y-auto">
                            {renderDayEvents()}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-border">
                            <h2 className="text-xl font-medium text-text">Agenda</h2>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 text-sm text-text-secondary hover:bg-input-bg rounded-md transition"
                            >
                                Hoy
                            </button>
                            <button className="p-2 rounded-full hover:bg-input-bg">
                                <FaCalendarDay className="text-primary" size={20} />
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-4">
                            <h3 className="text-lg font-medium text-text">
                                {format(currentDate, 'MMMM', { locale: es }).charAt(0).toUpperCase() +
                                    format(currentDate, 'MMMM', { locale: es }).slice(1)}
                            </h3>
                            <div className="flex space-x-2">
                                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-input-bg">
                                    <FaChevronLeft className="text-text-secondary" />
                                </button>
                                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-input-bg">
                                    <FaChevronRight className="text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 px-3 pb-2">
                            {getWeekDays().map((day, index) => (
                                <div key={day} className="text-center py-2 text-text-secondary font-medium">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="px-3 pb-4">
                            {getCalendarDays().map((week, weekIndex) => (
                                <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
                                    {week.map(day => renderDay(day))}
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-border bg-input-bg flex justify-center">
                            <button
                                onClick={() => setShowEventsList(true)}
                                className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center"
                            >
                                Ver eventos ({dayEvents.length}) para {format(selectedDay, 'dd/MM', { locale: es })}
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div
            className={`bg-card-bg rounded-xl shadow-sm overflow-hidden h-full border border-border ${layout === 'side' ? 'flex flex-col md:flex-row' : 'flex flex-col'
                }`}
        >
            <div className={layout === 'side' ? 'md:w-2/3' : ''}>
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-2xl font-medium text-text">Agenda</h2>
                    <button
                        onClick={goToToday}
                        className="px-4 py-1 text-text-secondary hover:bg-input-bg rounded-md transition"
                    >
                        Hoy
                    </button>
                    <button className="p-2 rounded-full hover:bg-input-bg">
                        <FaCalendarDay className="text-primary" size={22} />
                    </button>
                </div>

                <div className="flex justify-between items-center p-4">
                    <h3 className="text-xl font-medium text-text">
                        {format(currentDate, 'MMMM', { locale: es }).charAt(0).toUpperCase() +
                            format(currentDate, 'MMMM', { locale: es }).slice(1)}
                    </h3>
                    <div className="flex space-x-2">
                        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-input-bg">
                            <FaChevronLeft className="text-text-secondary" />
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-input-bg">
                            <FaChevronRight className="text-text-secondary" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 px-3 pb-2">
                    {getWeekDays().map((day, index) => (
                        <div key={day} className="text-center py-3 text-text-secondary font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="px-3 pb-6">
                    {getCalendarDays().map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
                            {week.map(day => renderDay(day))}
                        </div>
                    ))}
                </div>
            </div>

            <div className={`${layout === 'side' ? 'md:w-1/3 md:border-t-0 md:border-l' : 'border-t'} 
                            bg-input-bg p-4 overflow-auto border-border`}>
                <h3 className="text-lg font-medium text-text mb-4">
                    {format(selectedDay, 'EEEE, d MMMM', { locale: es })
                        .charAt(0)
                        .toUpperCase() +
                        format(selectedDay, 'EEEE, d MMMM', { locale: es }).slice(1)}
                </h3>

                {renderDayEvents()}
            </div>
        </div>
    );
};

export default ModernCalendar;
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';
import EventPanel from './EventPanel';

const ModernCalendar = ({ events = [], onAddEvent, layout = 'bottom' }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);

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

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Esta función ahora devuelve correctamente los días en orden de lunes a domingo
    const getWeekDays = () => ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    // Esta función ajusta el índice para que coincida con el día correcto
    const adjustDayOfWeek = (day) => {
        // En JavaScript, getDay() devuelve 0 para domingo, 1 para lunes...
        // Necesitamos convertirlo a nuestro formato donde 0 es lunes, 1 es martes...
        const jsDay = getDay(day); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        return jsDay === 0 ? 6 : jsDay - 1; // Convertir a 0 = lunes, ..., 6 = domingo
    };

    // Función para obtener los días organizados por semanas, comenzando el lunes
    const getCalendarDays = () => {
        const firstDayOfMonth = startOfMonth(currentDate);
        const firstDayOfCalendar = addDays(firstDayOfMonth, -adjustDayOfWeek(firstDayOfMonth));
        
        // Crear un array de 42 días (6 semanas) a partir del primer día del calendario
        const calendarDays = [];
        for (let i = 0; i < 42; i++) {
            calendarDays.push(addDays(firstDayOfCalendar, i));
        }
        
        // Organizamos los días en semanas
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

        let dayClass = 'relative h-16 w-full flex items-center justify-center rounded-full text-lg ';
        if (!isCurrentMonth) dayClass += 'text-gray-400 ';
        else dayClass += 'text-gray-800 ';
        if (isTodayDate) dayClass += 'font-bold ';
        if (isSelected) {
            dayClass += isTodayDate ? 'bg-primary text-white ' : 'border-2 border-primary text-primary ';
        } else {
            dayClass += 'hover:bg-gray-200 ';
        }

        return (
            <button key={day.toString()} onClick={() => setSelectedDay(day)} className={dayClass}>
                {dayNumber}
                {hasEvents && !isSelected && (
                    <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                )}
            </button>
        );
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-sm overflow-hidden h-full ${layout === 'side' ? 'flex flex-col md:flex-row' : ''
                }`}
        >
            <div className={layout === 'side' ? 'md:w-2/3' : ''}>
                {/* Header del calendario */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-medium text-gray-800">Agenda</h2>
                    <button
                        onClick={goToToday}
                        className="px-4 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition"
                    >
                        Hoy
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <FaCalendarDay className="text-primary" size={22} />
                    </button>
                </div>

                {/* Navegación del mes */}
                <div className="flex justify-between items-center p-4">
                    <h3 className="text-xl font-medium text-gray-800">
                        {format(currentDate, 'MMMM', { locale: es }).charAt(0).toUpperCase() +
                            format(currentDate, 'MMMM', { locale: es }).slice(1)}
                    </h3>
                    <div className="flex space-x-2">
                        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
                            <FaChevronLeft className="text-gray-600" />
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                            <FaChevronRight className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 px-3 pb-2">
                    {getWeekDays().map((day, index) => (
                        <div key={day} className="text-center py-3 text-gray-500 font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Días del mes organizados por semanas */}
                <div className="px-3 pb-6">
                    {getCalendarDays().map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
                            {week.map(day => renderDay(day))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel de eventos */}
            <EventPanel
                selectedDay={selectedDay}
                events={dayEvents}
                position={layout}
                onAddEvent={layout === 'side' ? onAddEvent : undefined}
            />
        </div>
    );
};

export default ModernCalendar;
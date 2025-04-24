// src/components/ModernCalendar.js
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';

const ModernCalendar = ({ events = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);

    // Filtrar eventos del día seleccionado
    useEffect(() => {
        const filtered = events.filter((event) => {
            const eventDate = typeof event.dueDate === 'string' ? parseISO(event.dueDate) :
                typeof event.startDateTime === 'string' ? parseISO(event.startDateTime) : null;
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

    // Obtener días del mes actual
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Determinar el inicio de la semana (lunes)
    const getWeekDays = () => {
        return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    };

    // Verificar si un día tiene eventos
    const dayHasEvents = (day) => {
        return events.some((event) => {
            const eventDate = typeof event.dueDate === 'string' ? parseISO(event.dueDate) :
                typeof event.startDateTime === 'string' ? parseISO(event.startDateTime) : null;
            return eventDate && isSameDay(eventDate, day);
        });
    };

    // Renderizar día del mes
    const renderDay = (day) => {
        const dayNumber = day.getDate();
        const hasEvents = dayHasEvents(day);
        const isSelected = isSameDay(day, selectedDay);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isTodayDate = isToday(day);

        // Ajuste para mayor tamaño
        let dayClass = "relative h-16 w-full flex items-center justify-center rounded-full text-lg ";

        // Base styling
        if (!isCurrentMonth) {
            dayClass += "text-gray-400 ";
        } else {
            dayClass += "text-gray-800 ";
        }

        // Today styling
        if (isTodayDate) {
            dayClass += "font-bold ";
        }

        // Selected day styling
        if (isSelected) {
            if (isTodayDate) {
                dayClass += "bg-rose-600 text-white ";
            } else {
                dayClass += "border-2 border-rose-600 text-rose-600 ";
            }
        } else {
            dayClass += "hover:bg-gray-200 ";
        }

        return (
            <button
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className={dayClass}
            >
                {dayNumber}
                {hasEvents && !isSelected && (
                    <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                )}
            </button>
        );
    };

    // Renderizar eventos del día
    const renderDayEvents = () => {
        if (dayEvents.length === 0) {
            return <p className="text-gray-500 text-center py-4">No hay eventos para este día</p>;
        }

        return (
            <div className="space-y-3">
                {dayEvents.map((event) => {
                    const isTask = event.status !== undefined;
                    const time = event.dueDate || event.startDateTime;

                    return (
                        <div
                            key={event.id}
                            className={`bg-white p-4 rounded-lg border-l-4 ${isTask ? 'border-rose-500' : 'border-violet-500'} shadow-sm`}
                        >
                            <h4 className="font-medium text-gray-800">{event.title}</h4>
                            <p className="text-gray-600 text-sm">
                                A las {format(parseISO(time), 'HH:mm')}
                            </p>
                            <p className={`${isTask ? 'text-rose-500' : 'text-violet-500'} text-xs mt-1`}>
                                {isTask ? 'Tarea' : 'Evento'}
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
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
                    <FaCalendarDay className="text-rose-500" size={22} />
                </button>
            </div>

            {/* Navegación del mes */}
            <div className="flex justify-between items-center p-4">
                <h3 className="text-xl font-medium text-gray-800">
                    {format(currentDate, 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(currentDate, 'MMMM', { locale: es }).slice(1)}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <FaChevronLeft className="text-gray-600" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <FaChevronRight className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Días de la semana - aumentado el tamaño */}
            <div className="grid grid-cols-7 gap-2 px-3 pb-2">
                {getWeekDays().map((day) => (
                    <div key={day} className="text-center py-3 text-gray-500 font-medium">
                        {day}
                    </div>
                ))}
            </div>

            {/* Días del mes - aumentado el tamaño */}
            <div className="grid grid-cols-7 gap-2 px-3 pb-6">
                {monthDays.map((day) => renderDay(day))}
            </div>

            {/* Lista de eventos del día seleccionado */}
            <div className="bg-gray-50 p-4 border-t">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {format(selectedDay, "EEEE, d MMMM", { locale: es }).charAt(0).toUpperCase() + format(selectedDay, "EEEE, d MMMM", { locale: es }).slice(1)}
                </h3>
                {renderDayEvents()}
            </div>
        </div>
    );
};

export default ModernCalendar;
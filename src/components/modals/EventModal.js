// src/components/modals/EventModal.js
import React, { useState } from 'react';

const EventModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [notificationDate, setNotificationDate] = useState(''); // Nuevo campo

    const handleSave = () => {
        onSave({ title, date, notificationDate }); // Añadimos la fecha de notificación
        setTitle('');
        setDate('');
        setNotificationDate(''); // Reseteamos el campo
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Añadir Evento</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="datetime-local" // Campo para fecha y hora
                        value={notificationDate}
                        onChange={(e) => setNotificationDate(e.target.value)}
                        placeholder="Fecha de notificación (opcional)"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[#467BAA] text-white rounded hover:bg-[#5aa0f2]"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
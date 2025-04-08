// src/components/modals/SessionModal.js
import React, { useState } from 'react';

const SessionModal = ({ isOpen, onClose, onSave, defaultDate }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(defaultDate || ''); // Fecha por defecto desde el calendario
    const [zoomLink, setZoomLink] = useState(''); // Opcional
    const [notificationDate, setNotificationDate] = useState(''); // Opcional

    const handleSave = () => {
        if (!title || !start) {
            alert('Por favor, completa el título y la fecha de inicio.');
            return;
        }
        onSave({
            title,
            start,
            zoomLink: zoomLink || `https://zoom.us/j/${Date.now()}`, // Generamos un enlace por defecto si no se proporciona
            notificationDate,
        });
        setTitle('');
        setStart('');
        setZoomLink('');
        setNotificationDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Añadir Sesión de Estudio</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la sesión"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        placeholder="Enlace de Zoom (opcional)"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="datetime-local"
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
                        className="px-4 py-2 bg-[#28a745] text-white rounded hover:bg-[#38c75a]"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionModal;
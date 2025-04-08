// src/components/modals/TaskModal.js
import React, { useState } from 'react';

const TaskModal = ({ isOpen, onClose, onSave, subjects }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('Pendiente');
    const [markObtained, setMarkObtained] = useState('');
    const [markMax, setMarkMax] = useState('');
    const [importance, setImportance] = useState('No Urgente');
    const [subject, setSubject] = useState(subjects[0] || '');
    const [notificationDate, setNotificationDate] = useState(''); // Nuevo campo

    const handleSave = () => {
        if (markObtained && markMax && Number(markObtained) > Number(markMax)) {
            alert('La nota obtenida no puede ser mayor que la nota máxima.');
            return;
        }
        onSave({
            title,
            dueDate,
            status,
            markObtained,
            markMax,
            importance,
            subject,
            notificationDate, // Añadimos la fecha de notificación
        });
        setTitle('');
        setDueDate('');
        setStatus('Pendiente');
        setMarkObtained('');
        setMarkMax('');
        setImportance('No Urgente');
        setSubject(subjects[0] || '');
        setNotificationDate(''); // Reseteamos el campo
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Añadir Tarea</h2>
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
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="Completada">Completada</option>
                    </select>
                    <input
                        type="number"
                        value={markObtained}
                        onChange={(e) => setMarkObtained(e.target.value)}
                        placeholder="Nota obtenida"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="number"
                        value={markMax}
                        onChange={(e) => setMarkMax(e.target.value)}
                        placeholder="Nota máxima"
                        className="w-full p-2 border rounded"
                    />
                    <select
                        value={importance}
                        onChange={(e) => setImportance(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="No Urgente">No Urgente</option>
                        <option value="Media">Media</option>
                        <option value="Urgente">Urgente</option>
                    </select>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {subjects.map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
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

export default TaskModal;
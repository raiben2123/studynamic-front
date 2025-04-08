// src/components/modals/SubjectModal.js
import React, { useState } from 'react';

const SubjectModal = ({ isOpen, onClose, onSave }) => {
    const [subjectName, setSubjectName] = useState('');

    const handleSave = () => {
        if (!subjectName.trim()) {
            alert('Por favor, introduce un nombre para la asignatura.');
            return;
        }
        onSave(subjectName);
        setSubjectName(''); // Reseteamos el campo
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Añadir Asignatura</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="Nombre de la asignatura"
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

export default SubjectModal;
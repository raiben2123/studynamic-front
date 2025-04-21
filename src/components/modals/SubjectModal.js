// src/components/modals/SubjectModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SubjectModal = ({ isOpen, onClose, onSave, subject }) => {
    const [subjectName, setSubjectName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (subject) {
            setSubjectName(subject.title);
        } else {
            setSubjectName('');
        }
        setError('');
    }, [subject]);

    const handleSave = () => {
        if (!subjectName.trim()) {
            setError('Por favor, introduce un nombre para la asignatura.');
            return;
        }
        setError('');
        onSave(subjectName);
        setSubjectName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-primary">
                    {subject ? 'Editar Asignatura' : 'Añadir Asignatura'}
                </h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={subjectName}
                        onChange={(e) => {
                            setSubjectName(e.target.value);
                            setError('');
                        }}
                        placeholder="Nombre de la asignatura"
                        className={`w-full p-2 border rounded ${
                            error ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
                    >
                        {subject ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

SubjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subject: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    }),
};

export default SubjectModal;
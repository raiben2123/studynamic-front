// src/pages/ResourcesPage.js
import React, { useState, useEffect } from 'react';
import { getSubjectsByUser } from '../api/subjects';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';

const ResourcesPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [resources, setResources] = useState({}); // { subject: { folderName: [{ name, file }] } }
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
    const [newFolderName, setNewFolderName] = useState(''); // Nombre de la nueva carpeta
    const [currentSubject, setCurrentSubject] = useState(''); // Asignatura seleccionada para la carpeta
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, userId } = useAuth();

    // Load subjects from API
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByUser();
                setSubjects(subjectsData || []);
                
                // Initialize resources structure with actual subjects
                const initialResources = {};
                subjectsData.forEach(subject => {
                    initialResources[subject.id] = {};
                });
                
                setResources(initialResources);
                setError(null);
            } catch (err) {
                console.error('Error fetching subjects:', err);
                setError('Error al cargar las asignaturas');
            } finally {
                setLoading(false);
            }
        };
        
        if (token && userId) {
            fetchSubjects();
        }
    }, [token, userId]);

    const handleFileUpload = (subjectId, folder, event) => {
        const file = event.target.files[0];
        if (
            file &&
            (file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        ) {
            // Update resources for this specific subject and folder
            setResources(prevResources => {
                const updatedResources = { ...prevResources };
                if (!updatedResources[subjectId]) {
                    updatedResources[subjectId] = {};
                }
                if (!updatedResources[subjectId][folder]) {
                    updatedResources[subjectId][folder] = [];
                }
                
                updatedResources[subjectId][folder] = [
                    ...updatedResources[subjectId][folder],
                    { name: file.name, file }
                ];
                
                return updatedResources;
            });
        } else {
            alert('Por favor, sube un archivo PDF o Word válido.');
        }
    };

    const openModal = (subjectId) => {
        setCurrentSubject(subjectId);
        setNewFolderName('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewFolderName('');
        setCurrentSubject('');
    };

    const handleAddFolder = () => {
        const folderName = newFolderName.trim();
        if (!folderName) {
            alert('Por favor, ingresa un nombre para la carpeta.');
            return;
        }
        
        // Check if the folder already exists for this subject
        if (resources[currentSubject] && resources[currentSubject][folderName]) {
            alert('Ya existe una carpeta con ese nombre para esta asignatura.');
            return;
        }
        
        // Update resources for this specific subject
        setResources(prevResources => {
            const updatedResources = { ...prevResources };
            if (!updatedResources[currentSubject]) {
                updatedResources[currentSubject] = {};
            }
            updatedResources[currentSubject][folderName] = [];
            return updatedResources;
        });
        
        closeModal();
    };

    return (
        <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div
                className="flex-1 bg-background p-4 pb-20 md:p-8 md:pb-8"
                style={{
                    backgroundImage: `url(${Logo})`,
                    backgroundSize: '50%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 1,
                    position: 'relative',
                }}
            >
                <div className="relative z-10">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl text-primary">Apuntes y Recursos</h1>
                    </div>

                    {/* Contenedor con scroll para las asignaturas y carpetas */}
                    {loading ? (
                        <div className="bg-white p-4 rounded-xl shadow-md md:p-6 opacity-95 flex justify-center">
                            <p className="text-gray-600">Cargando asignaturas...</p>
                        </div>
                    ) : (
                        <div className="max-h-[70vh] overflow-y-auto space-y-6 opacity-95">
                            {subjects.length === 0 ? (
                                <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                    <p className="text-gray-600">No tienes asignaturas registradas. Añade asignaturas en el dashboard.</p>
                                </div>
                            ) : (
                                subjects.map((subject) => (
                                    <div key={subject.id} className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-semibold text-primary">{subject.title}</h2>
                                            <button
                                                onClick={() => openModal(subject.id)}
                                                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent"
                                            >
                                                + Nueva Carpeta
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {resources[subject.id] && Object.keys(resources[subject.id]).length > 0 ? (
                                                Object.keys(resources[subject.id]).map((folder) => (
                                                    <div key={folder} className="border-t pt-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-lg font-medium text-primary">{folder}</h3>
                                                            <label className="bg-primary text-white px-3 py-1 rounded-full hover:bg-accent cursor-pointer">
                                                                + Subir Apunte
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx"
                                                                    onChange={(e) => handleFileUpload(subject.id, folder, e)}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="max-h-[30vh] overflow-y-auto">
                                                            {resources[subject.id][folder].length > 0 ? (
                                                                <ul className="space-y-2">
                                                                    {resources[subject.id][folder].map((resource, index) => (
                                                                        <li
                                                                            key={index}
                                                                            className="flex justify-between items-center p-2 bg-gray-100 rounded-lg"
                                                                        >
                                                                            <span className="text-sm">{resource.name}</span>
                                                                            <button
                                                                                onClick={() => alert(`Simulando apertura de ${resource.name}`)}
                                                                                className="text-primary hover:underline"
                                                                            >
                                                                                Ver
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-gray-600">No hay apuntes en esta carpeta.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600">No hay carpetas creadas para {subject.title}.</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear carpeta */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                            Nueva Carpeta en {subjects.find(s => s.id === currentSubject)?.title || ''}
                        </h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddFolder}
                                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-accent"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesPage;
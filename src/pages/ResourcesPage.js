// src/pages/ResourcesPage.js - Versión modernizada
import React, { useState, useEffect } from 'react';
import { getSubjectsByUser } from '../api/subjects';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import { FaBook, FaFolderPlus, FaPlus, FaDownload, FaEye, FaTrash, FaSearch } from 'react-icons/fa';

const ResourcesPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [resources, setResources] = useState({}); // { subject: { folderName: [{ name, file }] } }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [currentSubject, setCurrentSubject] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
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
                    initialResources[subject.id] = {
                        'Apuntes': [],
                        'Exámenes': [],
                        'Trabajos': []
                    };
                });

                setResources(initialResources);
                if (subjectsData.length > 0) {
                    setSelectedSubject(subjectsData[0].id);
                }
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
                    {
                        name: file.name,
                        file,
                        date: new Date().toISOString(),
                        size: (file.size / 1024).toFixed(2) + ' KB'
                    }
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

    const handleDeleteResource = (subjectId, folder, resourceIndex) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
            setResources(prevResources => {
                const updatedResources = { ...prevResources };
                updatedResources[subjectId][folder].splice(resourceIndex, 1);
                return updatedResources;
            });
        }
    };

    // Filtrar recursos por término de búsqueda
    const filterResources = () => {
        if (!searchTerm || !selectedSubject || !resources[selectedSubject]) return resources[selectedSubject] || {};

        const filteredResources = {};

        Object.keys(resources[selectedSubject]).forEach(folder => {
            const filteredFiles = resources[selectedSubject][folder].filter(
                resource => resource.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredFiles.length > 0) {
                filteredResources[folder] = filteredFiles;
            }
        });

        return filteredResources;
    };

    const filteredSubjectResources = filterResources();

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
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

                    {/* Header con título y búsqueda */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 opacity-95">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <h1 className="text-2xl md:text-3xl text-violet-700 font-bold flex items-center">
                                <FaBook className="mr-2" /> Recursos y Apuntes
                            </h1>

                            <div className="relative w-full md:w-64 mt-3 md:mt-0">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar recursos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        {subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto hide-scrollbar">
                                {subjects.map((subject) => (
                                    <button
                                        key={subject.id}
                                        onClick={() => setSelectedSubject(subject.id)}
                                        className={`px-4 py-2 rounded-full text-sm ${selectedSubject === subject.id
                                                ? 'bg-violet-500 text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            }`}
                                    >
                                        {subject.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-white p-6 rounded-xl shadow-md flex justify-center items-center opacity-95">
                            <p className="text-gray-500">Cargando recursos...</p>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl shadow-md text-center opacity-95">
                            <p className="text-gray-600 mb-4">No tienes asignaturas registradas. Añade asignaturas en el dashboard.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md opacity-95">
                            {/* Mostrar contenido de la asignatura seleccionada */}
                            {selectedSubject && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {subjects.find(s => s.id === selectedSubject)?.title}
                                        </h2>
                                        <button
                                            onClick={() => openModal(selectedSubject)}
                                            className="flex items-center text-violet-500 hover:text-violet-700"
                                        >
                                            <FaFolderPlus className="mr-1" />
                                            <span>Nueva Carpeta</span>
                                        </button>
                                    </div>

                                    {/* Mostrar carpetas y recursos */}
                                    {Object.keys(filteredSubjectResources).length === 0 ? (
                                        searchTerm ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No se encontraron recursos para "{searchTerm}"</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No hay carpetas creadas para esta asignatura</p>
                                                <button
                                                    onClick={() => openModal(selectedSubject)}
                                                    className="mt-2 text-violet-500 hover:text-violet-700"
                                                >
                                                    Crear carpeta
                                                </button>
                                                    <button
                                                        onClick={() => openModal(selectedSubject)}
                                                        className="mt-2 text-violet-500 hover:text-violet-700"
                                                    >
                                                        Crear carpeta
                                                    </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.keys(filteredSubjectResources).map((folder) => (
                                                <div key={folder} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="flex justify-between items-center bg-gray-50 p-3 border-b">
                                                        <h3 className="font-medium text-violet-700 flex items-center">
                                                            <FaBook className="mr-2 text-violet-500" />
                                                            {folder}
                                                        </h3>
                                                        <label className="flex items-center bg-violet-500 text-white px-3 py-1 rounded-full hover:bg-violet-600 cursor-pointer text-sm">
                                                            <FaPlus className="mr-1" /> Subir
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={(e) => handleFileUpload(selectedSubject, folder, e)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>

                                                    {filteredSubjectResources[folder].length === 0 ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            No hay recursos en esta carpeta
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-100">
                                                            {filteredSubjectResources[folder].map((resource, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex justify-between items-center p-3 hover:bg-gray-50"
                                                                >
                                                                    <div className="flex-1 pr-4">
                                                                        <div className="font-medium text-gray-800">{resource.name}</div>
                                                                        <div className="flex text-xs text-gray-500 mt-1">
                                                                            <span className="mr-4">
                                                                                {resource.date ? formatDate(resource.date) : 'Sin fecha'}
                                                                            </span>
                                                                            <span>{resource.size || '--'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() => alert(`Ver ${resource.name}`)}
                                                                            className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                                                                            title="Ver"
                                                                        >
                                                                            <FaEye />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => alert(`Descargar ${resource.name}`)}
                                                                            className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50"
                                                                            title="Descargar"
                                                                        >
                                                                            <FaDownload />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteResource(selectedSubject, folder, index)}
                                                                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                                            title="Eliminar"
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear carpeta */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-violet-700">
                            Nueva Carpeta en {subjects.find(s => s.id === currentSubject)?.title || ''}
                        </h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddFolder}
                                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
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
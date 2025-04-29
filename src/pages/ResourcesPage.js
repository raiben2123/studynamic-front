import React, { useState, useEffect } from 'react';
import { getSubjectsByUser } from '../api/subjects';
import { uploadFile, downloadFile, getFilesBySubject, deleteFile } from '../api/files';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import { FaBook, FaFolderPlus, FaPlus, FaDownload, FaEye, FaTrash, FaSearch } from 'react-icons/fa';

const ResourcesPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [resources, setResources] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [currentSubject, setCurrentSubject] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const { token, userId } = useAuth();

    useEffect(() => {
        const fetchSubjectsAndResources = async () => {
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByUser(token);
                setSubjects(subjectsData || []);

                // Inicializar estructura de recursos
                const initialResources = {};
                for (const subject of subjectsData) {
                    try {
                        const files = await getFilesBySubject(subject.id, token);
                        console.log(`Files for subject ${subject.id}:`, files);
                        initialResources[subject.id] = {
                            Apuntes: files
                                .filter(file => file.resourceType === 'Apuntes' || file.resourceType == null)
                                .map(file => ({
                                    id: file.id,
                                    name: file.fileName,
                                    url: file.fileUrl,
                                    date: file.uploadDate,
                                    size: (file.fileSize / 1024).toFixed(2) + ' KB',
                                    type: 'Apuntes'
                                })),
                            Exámenes: files
                                .filter(file => file.resourceType === 'Exámenes')
                                .map(file => ({
                                    id: file.id,
                                    name: file.fileName,
                                    url: file.fileUrl,
                                    date: file.uploadDate,
                                    size: (file.fileSize / 1024).toFixed(2) + ' KB',
                                    type: 'Exámenes'
                                })),
                            Trabajos: files
                                .filter(file => file.resourceType === 'Trabajos')
                                .map(file => ({
                                    id: file.id,
                                    name: file.fileName,
                                    url: file.fileUrl,
                                    date: file.uploadDate,
                                    size: (file.fileSize / 1024).toFixed(2) + ' KB',
                                    type: 'Trabajos'
                                }))
                        };
                    } catch (err) {
                        console.error(`Error fetching files for subject ${subject.id}:`, err);
                        initialResources[subject.id] = {
                            Apuntes: [],
                            Exámenes: [],
                            Trabajos: []
                        };
                    }
                }

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
            fetchSubjectsAndResources();
        }
    }, [token, userId]);

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileDelete = async (subjectId, folder, fileId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            return;
        }

        try {
            await deleteFile(fileId, token);
            setResources(prevResources => {
                const updatedResources = { ...prevResources };
                if (updatedResources[subjectId] && updatedResources[subjectId][folder]) {
                    updatedResources[subjectId][folder] = updatedResources[subjectId][folder].filter(
                        file => file.id !== fileId
                    );
                }
                return updatedResources;
            });
            showNotification('Archivo eliminado con éxito', 'success');
        } catch (err) {
            console.error('Error en handleFileDelete:', err.message);
            showNotification(`Error al eliminar el archivo: ${err.message}`, 'error');
        }
    };

    const handleFileUpload = async (subjectId, folder, event) => {
        const file = event.target.files[0];
        if (
            file &&
            (file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        ) {
            try {
                const validFileTypes = ['Apuntes', 'Exámenes', 'Trabajos'];
                if (!validFileTypes.includes(folder)) {
                    throw new Error(`Tipo de archivo inválido: ${folder}`);
                }

                console.log('Subiendo archivo:', { fileName: file.name, fileType: folder, subjectId });

                const uploadedFile = await uploadFile(file, folder, userId, subjectId, null, null, token);
                setResources(prevResources => {
                    const updatedResources = { ...prevResources };
                    if (!updatedResources[subjectId]) {
                        updatedResources[subjectId] = { Apuntes: [], Exámenes: [], Trabajos: [] };
                    }
                    updatedResources[subjectId][folder].push({
                        id: uploadedFile.id,
                        name: uploadedFile.fileName,
                        url: uploadedFile.fileUrl,
                        date: uploadedFile.uploadDate,
                        size: (uploadedFile.fileSize / 1024).toFixed(2) + ' KB',
                        type: uploadedFile.resourceType
                    });
                    return updatedResources;
                });
                showNotification(`Archivo ${file.name} subido con éxito`, 'success');
            } catch (err) {
                console.error('Error en handleFileUpload:', err.message);
                showNotification(`Error al subir el archivo: ${err.message}`, 'error');
            }
        } else {
            showNotification('Por favor, sube un archivo PDF o Word válido.', 'error');
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const response = await downloadFile(fileId, token);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showNotification(`Descargando ${fileName}`, 'success');
        } catch (err) {
            showNotification('Error al descargar el archivo.', 'error');
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
            showNotification('Por favor, ingresa un nombre para la carpeta.', 'error');
            return;
        }

        if (resources[currentSubject] && resources[currentSubject][folderName]) {
            showNotification('Ya existe una carpeta con ese nombre para esta asignatura.', 'error');
            return;
        }

        setResources(prevResources => {
            const updatedResources = { ...prevResources };
            if (!updatedResources[currentSubject]) {
                updatedResources[currentSubject] = {};
            }
            updatedResources[currentSubject][folderName] = [];
            return updatedResources;
        });

        showNotification(`Carpeta ${folderName} creada con éxito`, 'success');
        closeModal();
    };

    const handleDeleteResource = (subjectId, folder, resourceIndex) => {
        setResources(prevResources => {
            const updatedResources = { ...prevResources };
            updatedResources[subjectId][folder].splice(resourceIndex, 1);
            return updatedResources;
        });
        showNotification('Recurso eliminado con éxito', 'success');
    };

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
                    {notification && (
                        <div
                            className={`fixed top-4 right-4 p-3 rounded-lg shadow-md transition-opacity duration-300 ${notification.type === 'success' ? 'bg-task-finalizada-bg text-task-finalizada' : 'bg-error/10 text-error'}`}
                        >
                            {notification.message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-error/10 text-error p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* Header con título y búsqueda */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center">
                                <FaBook className="mr-2" /> Apuntes
                            </h1>
                            <div className="relative w-full md:w-64 mt-3 md:mt-0">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaSearch className="text-primary" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar recursos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>
                        {subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto hide-scrollbar">
                                {subjects.map(subject => (
                                    <button
                                        key={subject.id}
                                        onClick={() => setSelectedSubject(subject.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubject === subject.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-primary-light'
                                            }`}
                                    >
                                        {subject.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-white p-6 rounded-xl shadow-md flex justify-center items-center">
                            <p className="text-primary font-medium">Cargando recursos...</p>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <p className="text-gray-600 mb-4">No tienes asignaturas registradas. Añade asignaturas en el dashboard.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                            {selectedSubject && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {subjects.find(s => s.id === selectedSubject)?.title}
                                        </h2>
                                        {/* <button
                                            onClick={() => openModal(selectedSubject)}
                                            className="flex items-center text-primary hover:text-accent font-medium"
                                        >
                                            <FaFolderPlus className="mr-1" />
                                            <span>Nueva Carpeta</span>
                                        </button> */}
                                    </div>
                                    {Object.keys(filteredSubjectResources).length === 0 ? (
                                        searchTerm ? (
                                            <div className="text-center py-8 bg-primary-light rounded-lg">
                                                <p className="text-gray-500">No se encontraron recursos para "{searchTerm}"</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-primary-light rounded-lg">
                                                <p className="text-gray-500">No hay carpetas creadas para esta asignatura</p>
                                                <button
                                                    onClick={() => openModal(selectedSubject)}
                                                    className="mt-2 text-primary hover:text-accent font-medium"
                                                >
                                                    Crear carpeta
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.keys(filteredSubjectResources).map(folder => (
                                                <div key={folder} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="flex justify-between items-center bg-primary-light p-3 border-b">
                                                        <h3 className="font-medium text-primary flex items-center">
                                                            <FaBook className="mr-2 text-primary" />
                                                            {folder}
                                                        </h3>
                                                        <label className="flex items-center bg-primary text-white px-3 py-1 rounded-full hover:bg-accent cursor-pointer text-sm">
                                                            <FaPlus className="mr-1" /> Subir
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={e => handleFileUpload(selectedSubject, folder, e)}
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
                                                                    className="flex flex-col sm:flex-row belo-justify-between items-start sm:items-center p-3 hover:bg-primary-light/50"
                                                                >
                                                                    <div className="flex-1 pr-4">
                                                                        <div className="font-medium text-gray-800">{resource.name}</div>
                                                                        <div className="flex flex-col sm:flex-row text-xs text-gray-500 mt-1">
                                                                            <span className="mr-4">
                                                                                {resource.date ? formatDate(resource.date) : 'Sin fecha'}
                                                                            </span>
                                                                            <span>{resource.size || '--'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex space-x-2 mt-2 sm:mt-0">
                                                                        <button
                                                                            onClick={() => window.open(resource.url, '_blank')}
                                                                            className="p-2 text-accent hover:text-accent/80 rounded-full hover:bg-accent/10"
                                                                            title="Ver"
                                                                        >
                                                                            <FaEye />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDownloadFile(resource.id, resource.name)}
                                                                            className="p-2 text-task-finalizada hover:text-task-finalizada/80 rounded-full hover:bg-task-finalizada-bg"
                                                                            title="Descargar"
                                                                        >
                                                                            <FaDownload />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleFileDelete(selectedSubject, folder, resource.id)}
                                                                            className="p-2 text-error hover:text-error/80 rounded-full hover:bg-error/10"
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                            Nueva Carpeta en {subjects.find(s => s.id === currentSubject)?.title || ''}
                        </h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddFolder}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
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
// src/components/modals/TaskModal.js - Actualizado para usar variables de tema
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { extractDateFromIso } from '../../utils/dateUtils';
import Modal from './Modal';
import FileUpload from '../files/FileUpload';
import FilesList from '../files/FilesList';
import { getFilesByTask } from '../../api/files';

const TaskModal = ({ isOpen, onClose, onSave, subjects, task }) => {
    const [formData, setFormData] = useState({
        id: '',
        subjectId: '',
        title: '',
        dueDate: '',
        importance: 'Baja',
        status: 'Pendiente',
        markObtained: '',
        markMax: '',
        notificationDate: '',
    });
    const [errors, setErrors] = useState({});
    const isMobile = window.innerWidth < 768;
    
    // Estado para los archivos adjuntos
    const [files, setFiles] = useState([]);
    const [fileLoading, setFileLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('taskDetails'); // 'taskDetails' o 'files'

    // Esta función reinicia el formulario
    const resetForm = () => {
        setFormData({
            id: '',
            subjectId: '',
            title: '',
            dueDate: '',
            importance: 'Baja',
            status: 'Pendiente',
            markObtained: '',
            markMax: '',
            notificationDate: '',
        });
        setErrors({});
        setActiveTab('taskDetails'); // Restablecer a la pestaña de detalles
    };

    // Efecto que se ejecuta cuando cambia task o isOpen
    useEffect(() => {
        if (isOpen) {
            if (task) {
                // Normalizamos las fechas para asegurarnos de que estén en formato YYYY-MM-DD
                const normalizedDueDate = extractDateFromIso(task.dueDate);
                const normalizedNotificationDate = extractDateFromIso(task.notificationDate);
                
                // Si la tarea tiene subject pero no subjectId, buscamos el subjectId
                let subjectId = task.subjectId;
                if (!subjectId && task.subject) {
                    const foundSubject = subjects.find(s => s.title === task.subject);
                    if (foundSubject) {
                        subjectId = foundSubject.id;
                    }
                }
                
                setFormData({
                    id: task.id || '',
                    subjectId: subjectId ? subjectId.toString() : '',
                    title: task.title || '',
                    dueDate: normalizedDueDate,
                    importance: task.importance || 'Baja',
                    status: task.status || 'Pendiente',
                    markObtained: task.markObtained || '',
                    markMax: task.markMax || '',
                    notificationDate: normalizedNotificationDate,
                });
                
                // Cargar archivos asociados a la tarea si tenemos un ID
                if (task.id) {
                    loadTaskFiles(task.id);
                }
            } else {
                // Si no hay tarea, reiniciamos el formulario
                resetForm();
                setFiles([]);
            }
        }
    }, [task, subjects, isOpen]);
    
    // Función para cargar archivos de la tarea
    const loadTaskFiles = async (taskId) => {
        setFileLoading(true);
        try {
            const taskFiles = await getFilesByTask(taskId);
            setFiles(taskFiles || []);
        } catch (error) {
            console.error('Error fetching task files:', error);
        } finally {
            setFileLoading(false);
        }
    };

    // Función para manejar el cierre del modal
    const handleClose = () => {
        // Reiniciamos el formulario explícitamente al cerrar
        resetForm();
        onClose();
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.subjectId) {
            newErrors.subjectId = 'La asignatura es obligatoria';
        } else if (isNaN(parseInt(formData.subjectId))) {
            newErrors.subjectId = 'La asignatura seleccionada no es válida';
        }
        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'La fecha de entrega es obligatoria';
        }
        if (
            formData.markObtained &&
            formData.markMax &&
            Number(formData.markObtained) > Number(formData.markMax)
        ) {
            newErrors.marks = 'La nota obtenida no puede ser mayor que la nota máxima';
        }
        
        // Validamos que la fecha de notificación no sea posterior a la fecha de entrega
        if (formData.notificationDate && formData.dueDate && 
            new Date(formData.notificationDate) > new Date(formData.dueDate)) {
            newErrors.notificationDate = 'La notificación no puede ser posterior a la fecha de entrega';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        // Añadir subject al formData para que tenga tanto ID como nombre
        const subjectTitle = subjects.find((s) => s.id === parseInt(formData.subjectId))?.title || '';
        
        // Preparar los datos antes de enviarlos
        const taskData = {
            ...formData,
            subject: subjectTitle  // Aseguramos que la tarea tenga el nombre de la asignatura
        };
        
        onSave(taskData);
        // No reseteamos el formulario aquí porque onSave puede fallar,
        // y en ese caso queremos mantener los datos para corregirlos
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };
    
    // Función para manejar archivos subidos exitosamente
    const handleFileUploaded = (file) => {
        setFiles([...files, file]);
    };
    
    // Función para manejar la actualización de la lista de archivos
    const handleRefreshFiles = () => {
        if (formData.id) {
            loadTaskFiles(formData.id);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} // Usamos handleClose en lugar de onClose
            title={task ? 'Editar Tarea' : 'Nueva Tarea'}
            size={isMobile ? 'md' : 'lg'}
        >
            {/* Pestañas para navegar entre Detalles y Archivos */}
            <div className="flex border-b border-border mb-4">
                <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'taskDetails' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text hover:border-border'}`}
                    onClick={() => setActiveTab('taskDetails')}
                >
                    Detalles de la tarea
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'files' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text hover:border-border'}`}
                    onClick={() => setActiveTab('files')}
                    disabled={!task || !task.id} // Solo habilitado si es una tarea existente
                >
                    Archivos adjuntos
                    {files.length > 0 && (
                        <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                            {files.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Contenido de la pestaña de detalles */}
            {activeTab === 'taskDetails' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">Asignatura *</label>
                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.subjectId ? 'border-error' : 'border-border'}`}
                            required
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.title}
                                </option>
                            ))}
                        </select>
                        {errors.subjectId && (
                            <p className="text-error text-xs mt-1">{errors.subjectId}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.title ? 'border-error' : 'border-border'}`}
                            required
                        />
                        {errors.title && (
                            <p className="text-error text-xs mt-1">{errors.title}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text">Fecha de Entrega *</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.dueDate ? 'border-error' : 'border-border'}`}
                            required
                        />
                        {errors.dueDate && (
                            <p className="text-error text-xs mt-1">{errors.dueDate}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text">Importancia</label>
                            <select
                                name="importance"
                                value={formData.importance}
                                onChange={handleChange}
                                className="w-full p-2 border bg-input-bg text-text border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text">Estado</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border bg-input-bg text-text border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En curso">En curso</option>
                                <option value="Finalizada">Finalizada</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text">Nota Obtenida</label>
                            <input
                                type="number"
                                name="markObtained"
                                value={formData.markObtained}
                                onChange={handleChange}
                                className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.marks ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text">Nota Máxima</label>
                            <input
                                type="number"
                                name="markMax"
                                value={formData.markMax}
                                onChange={handleChange}
                                className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.marks ? 'border-error' : 'border-border'}`}
                            />
                        </div>
                    </div>
                    {errors.marks && (
                        <p className="text-error text-xs mt-1">{errors.marks}</p>
                    )}
                    {/* <div>
                        <label className="block text-sm font-medium mb-1 text-text">Notificación</label>
                        <input
                            type="date"
                            name="notificationDate"
                            value={formData.notificationDate}
                            onChange={handleChange}
                            className={`w-full p-2 bg-input-bg text-text border rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.notificationDate ? 'border-error' : 'border-border'}`}
                        />
                        {errors.notificationDate && (
                            <p className="text-error text-xs mt-1">{errors.notificationDate}</p>
                        )}
                    </div> */}
                    <div className="flex justify-end space-x-2 pt-3">
                        <button
                            type="button"
                            onClick={handleClose} // Usamos handleClose también aquí
                            className="px-3 py-2 bg-input-bg text-text rounded-lg hover:bg-border transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
                        >
                            {task ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            )}

            {/* Contenido de la pestaña de archivos */}
            {activeTab === 'files' && task && task.id && (
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-text mb-2">
                            Archivos adjuntos a la tarea
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Puedes adjuntar documentos PDF, Word, Excel, PowerPoint y texto plano a esta tarea.
                        </p>
                    </div>

                    <div className="mb-6">
                        <FileUpload
                            fileType="TaskAttachment"
                            taskId={task.id}
                            onUploadSuccess={handleFileUploaded}
                            buttonText="Adjuntar archivo"
                        />
                    </div>

                    {fileLoading ? (
                        <div className="text-center py-4">
                            <svg className="animate-spin h-5 w-5 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-text-secondary">Cargando archivos...</p>
                        </div>
                    ) : (
                        <FilesList
                            files={files}
                            onRefresh={handleRefreshFiles}
                        />
                    )}

                    <div className="flex justify-end space-x-2 pt-3 mt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setActiveTab('taskDetails')}
                            className="px-3 py-2 bg-input-bg text-text rounded-lg hover:bg-border transition"
                        >
                            Volver a detalles
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

TaskModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
        })
    ).isRequired,
    task: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        dueDate: PropTypes.string,
        importance: PropTypes.string,
        status: PropTypes.string,
        markObtained: PropTypes.string,
        markMax: PropTypes.string,
        notificationDate: PropTypes.string,
        subject: PropTypes.string,
        subjectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
};

export default TaskModal;
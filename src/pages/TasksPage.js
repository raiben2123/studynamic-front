import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjectsByUser, addSubject } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import TaskModal from '../components/modals/TaskModal';
import SubjectModal from '../components/modals/SubjectModal';
import ConfirmationModal from '../components/modals/ConfirmationModal'; // Importar el modal de confirmación
import { FaFilter, FaTasks, FaCheckCircle, FaPlus, FaChartBar } from 'react-icons/fa';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('all'); // 'all', 'pending', 'completed'
    const { token, userId } = useAuth();

    // Estado para el modal de confirmación
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, subjectsData] = await Promise.all([getTasks(), getSubjectsByUser()]);

                const processedTasks = tasksData.map(task => {
                    if (task.subjectId && (!task.subject || task.subject === '')) {
                        const subject = subjectsData.find(s => s.id === task.subjectId);
                        return {
                            ...task,
                            subject: subject ? subject.title : 'Sin asignatura'
                        };
                    }
                    return task;
                });

                // Ordenamos las tareas por fecha
                const sortedTasks = [...tasksData].sort((a, b) => {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

                setTasks(sortedTasks);
                setSubjects(subjectsData);
                setError(null);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        if (token && userId) fetchData();
    }, [token, userId]);

    const handleAddTask = async (newTask) => {
        setLoading(true);
        try {
            // Asegurarnos que la tarea tenga un nombre de asignatura
            let taskToAdd = { ...newTask };

            // Si la tarea tiene subjectId pero no subject, asignar el nombre
            if (taskToAdd.subjectId && (!taskToAdd.subject || taskToAdd.subject === '')) {
                const subject = subjects.find(s => s.id === parseInt(taskToAdd.subjectId));
                if (subject) {
                    taskToAdd.subject = subject.title;
                }
            }

            const addedTask = await addTask(taskToAdd);

            // Asegurarnos que la tarea devuelta tenga el nombre de la asignatura
            let processedTask = { ...addedTask };

            // Si la tarea devuelta no tiene un nombre de asignatura pero tiene ID, buscar el nombre
            if (!processedTask.subject && processedTask.subjectId) {
                const subject = subjects.find(s => s.id === parseInt(processedTask.subjectId));
                if (subject) {
                    processedTask.subject = subject.title;
                }
            }

            // Añadimos la nueva tarea al estado y reordenamos
            const updatedTasks = [...tasks, processedTask].sort((a, b) => {
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            setTasks(updatedTasks);
            setIsTaskModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Error adding task:', error);
            setError(error.message || 'Error al añadir la tarea');
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskUpdate = async (updatedTask) => {
        setLoading(true);
        try {
            // Asegurarnos que la tarea tenga un nombre de asignatura
            let taskToUpdate = { ...updatedTask };

            // Si la tarea tiene subjectId pero no subject, asignar el nombre
            if (taskToUpdate.subjectId && (!taskToUpdate.subject || taskToUpdate.subject === '')) {
                const subject = subjects.find(s => s.id === parseInt(taskToUpdate.subjectId));
                if (subject) {
                    taskToUpdate.subject = subject.title;
                }
            }

            const updatedTaskFromBackend = await updateTask(updatedTask.id, taskToUpdate);

            // Asegurarnos que la tarea devuelta tenga el nombre de la asignatura
            let processedTask = { ...updatedTaskFromBackend };

            // Si la tarea devuelta no tiene un nombre de asignatura pero tiene ID, buscar el nombre
            if (!processedTask.subject && processedTask.subjectId) {
                const subject = subjects.find(s => s.id === parseInt(processedTask.subjectId));
                if (subject) {
                    processedTask.subject = subject.title;
                }
            }

            // Actualizamos la tarea en el estado y reordenamos
            const updatedTasks = tasks
                .map((task) => (task.id === updatedTask.id ? processedTask : task))
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            setTasks(updatedTasks);
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setError(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setError(error.message || 'Error al actualizar la tarea');
            setEditingTask(updatedTask);
            setIsTaskModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskDelete = (taskId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Eliminar Tarea',
            message: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await deleteTask(taskId);
                    setTasks(tasks.filter(t => t.id !== taskId));
                    setError(null);
                    // Podríamos añadir una notificación de éxito aquí
                } catch (err) {
                    console.error('Error deleting task:', err);
                    setError('Error al eliminar la tarea');
                } finally {
                    setLoading(false);
                }
            },
            type: 'danger',
            confirmText: 'Eliminar'
        });
    };

    const handleAddSubject = async (subjectName) => {
        setLoading(true);
        try {
            const newSubject = await addSubject({ title: subjectName });
            setSubjects([...subjects, newSubject]);
            setIsSubjectModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Error adding subject:', error);
            setError(error.message || 'Error al añadir la asignatura');
            setIsSubjectModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Cerrar el modal de confirmación
    const closeConfirmationModal = () => {
        setConfirmationModal({
            ...confirmationModal,
            isOpen: false
        });
    };

    // Filtrar tareas por asignatura y estado
    const filteredTasks = tasks.filter((task) => {
        const matchesSubject = selectedSubject ? task.subject === selectedSubject : true;

        if (view === 'pending') {
            return matchesSubject && task.status !== 'Finalizada';
        } else if (view === 'completed') {
            return matchesSubject && task.status === 'Finalizada';
        }

        return matchesSubject;
    });

    // Separar tareas pendientes y completadas para la vista
    const pendingTasks = filteredTasks.filter((task) => task.status !== 'Finalizada');
    const completedTasks = filteredTasks.filter((task) => task.status === 'Finalizada');

    // Estadísticas para el panel superior
    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(task => task.status === 'Finalizada').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

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
                        <div className="bg-error/10 text-error p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4 text-primary font-medium">
                            Cargando...
                        </div>
                    )}

                    {/* Panel superior con estadísticas */}
                    <div className="bg-card-bg p-4 md:p-6 rounded-xl shadow-md mb-6 opacity-95 border border-border">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center">
                                <FaTasks className="mr-2" /> Mis Tareas
                            </h1>
                            <div className="flex mt-3 md:mt-0 gap-2">
                                <button
                                    onClick={() => setIsSubjectModalOpen(true)}
                                    className="bg-primary text-white px-3 py-2 rounded-full hover:bg-accent flex items-center gap-1"
                                >
                                    <FaPlus /> Asignatura
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-3 py-2 rounded-full hover:bg-accent flex items-center gap-1"
                                >
                                    <FaPlus /> Nueva Tarea
                                </button>
                            </div>
                        </div>

                        {/* Estadísticas en tarjetas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-primary-light p-3 rounded-lg border border-primary/20">
                                <div className="text-sm text-text-secondary">Total de tareas</div>
                                <div className="text-lg font-bold text-primary">{totalTasks}</div>
                            </div>
                            <div className="bg-task-finalizada-bg p-3 rounded-lg border border-task-finalizada/20">
                                <div className="text-sm text-text-secondary">Completadas</div>
                                <div className="text-lg font-bold text-task-finalizada">{completedTasksCount}</div>
                            </div>
                            <div className="bg-task-vencida-bg p-3 rounded-lg border border-task-vencida/20">
                                <div className="text-sm text-text-secondary">Pendientes</div>
                                <div className="text-lg font-bold text-task-vencida">{totalTasks - completedTasksCount}</div>
                            </div>
                            <div className="bg-primary-light p-3 rounded-lg border border-primary/20">
                                <div className="text-sm text-text-secondary">Tasa de completado</div>
                                <div className="text-lg font-bold text-primary">{completionRate}%</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setView('all')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${view === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-input-bg text-text hover:bg-primary-light'
                                        }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setView('pending')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${view === 'pending'
                                        ? 'bg-task-vencida text-white'
                                        : 'bg-input-bg text-text hover:bg-task-vencida-bg'
                                        }`}
                                >
                                    Pendientes
                                </button>
                                <button
                                    onClick={() => setView('completed')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${view === 'completed'
                                        ? 'bg-task-finalizada text-white'
                                        : 'bg-input-bg text-text hover:bg-task-finalizada-bg'
                                        }`}
                                >
                                    Completadas
                                </button>
                            </div>

                            {/* Filtro de asignaturas */}
                            <div className="relative w-full md:w-auto">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaFilter className="text-primary" />
                                </div>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2 text-sm bg-input-bg text-text border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                >
                                    <option value="">Todas las asignaturas</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.title}>
                                            {subject.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de tareas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Vista pendientes */}
                        {(view === 'all' || view === 'pending') && (
                            <div className="bg-card-bg p-4 md:p-6 rounded-xl shadow-md opacity-95 border border-border">
                                <div className="flex items-center mb-4">
                                    <FaTasks className="text-task-vencida mr-2" />
                                    <h2 className="text-xl font-semibold text-text">
                                        Tareas Pendientes
                                        <span className="ml-2 text-xs text-text-secondary">({pendingTasks.length})</span>
                                    </h2>
                                </div>

                                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                    {pendingTasks.length === 0 ? (
                                        <div className="text-center py-8 bg-input-bg rounded-lg">
                                            <p className="text-text-secondary">No hay tareas pendientes</p>
                                            <button
                                                onClick={() => {
                                                    setEditingTask(null);
                                                    setIsTaskModalOpen(true);
                                                }}
                                                className="mt-2 text-primary hover:text-accent font-medium"
                                            >
                                                Añadir una tarea
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onUpdate={handleEditTask}
                                                    onDelete={handleTaskDelete}
                                                    subjects={subjects.map((s) => s.title)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Vista completadas */}
                        {(view === 'all' || view === 'completed') && (
                            <div className="bg-card-bg p-4 md:p-6 rounded-xl shadow-md opacity-95 border border-border">
                                <div className="flex items-center mb-4">
                                    <FaCheckCircle className="text-task-finalizada mr-2" />
                                    <h2 className="text-xl font-semibold text-text">
                                        Tareas Completadas
                                        <span className="ml-2 text-xs text-text-secondary">({completedTasks.length})</span>
                                    </h2>
                                </div>

                                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                    {completedTasks.length === 0 ? (
                                        <div className="text-center py-8 bg-input-bg rounded-lg">
                                            <p className="text-text-secondary">No hay tareas completadas</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {completedTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onUpdate={handleEditTask}
                                                    onDelete={handleTaskDelete}
                                                    subjects={subjects.map((s) => s.title)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Gráfico resumen (visible en todas las pantallas) */}
                        {view === 'all' && subjects.length > 0 && (
                            <div className="md:col-span-2 bg-card-bg p-4 md:p-6 rounded-xl shadow-md mt-4 opacity-95 border border-border">
                                <div className="flex items-center mb-4">
                                    <FaChartBar className="text-primary mr-2" />
                                    <h2 className="text-xl font-semibold text-text">Resumen por Asignatura</h2>
                                </div>

                                <div className="space-y-4">
                                    {subjects.map(subject => {
                                        const subjectTasks = tasks.filter(task => task.subject === subject.title);
                                        const completed = subjectTasks.filter(task => task.status === 'Finalizada').length;
                                        const total = subjectTasks.length;
                                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                                        return (
                                            <div key={subject.id} className="bg-primary-light p-3 rounded-lg">
                                                <div className="font-medium text-primary">{subject.title}</div>
                                                <div className="flex justify-between text-sm text-text-secondary mt-1">
                                                    <span>{completed}/{total} completadas</span>
                                                    <span>{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-input-bg rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                    setError(null);
                }}
                onSave={editingTask ? handleTaskUpdate : handleAddTask}
                subjects={subjects}
                task={editingTask}
            />
            <SubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => {
                    setIsSubjectModalOpen(false);
                    setError(null);
                }}
                onSave={handleAddSubject}
            />

            {/* Modal de Confirmación para eliminaciones */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText || 'Confirmar'}
            />
        </div>
    );
};

export default TasksPage;
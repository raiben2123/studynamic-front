// src/pages/TasksPage.js - Versión modernizada
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjectsByUser, addSubject } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import TaskModal from '../components/modals/TaskModal';
import SubjectModal from '../components/modals/SubjectModal';
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, subjectsData] = await Promise.all([getTasks(), getSubjectsByUser()]);

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
            const addedTask = await addTask(newTask);

            // Añadimos la nueva tarea al estado y reordenamos
            const updatedTasks = [...tasks, addedTask].sort((a, b) => {
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
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);

            // Actualizamos la tarea en el estado y reordenamos
            const updatedTasks = tasks
                .map((task) => (task.id === updatedTask.id ? updatedTaskFromBackend : task))
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

    const handleTaskDelete = async (taskId) => {
        setLoading(true);
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter((task) => task.id !== taskId));
            setError(null);
        } catch (error) {
            console.error('Error deleting task:', error);
            setError(error.message || 'Error al eliminar la tarea');
        } finally {
            setLoading(false);
        }
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
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="text-center mb-4">Cargando...</div>
                    )}

                    {/* Panel superior con estadísticas */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 opacity-95">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <h1 className="text-2xl md:text-3xl text-violet-700 font-bold flex items-center">
                                <FaTasks className="mr-2" /> Mis Tareas
                            </h1>
                            <div className="flex mt-3 md:mt-0">
                                <button
                                    onClick={() => setIsSubjectModalOpen(true)}
                                    className="bg-violet-500 text-white px-3 py-2 rounded-full hover:bg-violet-600 mr-2"
                                >
                                    + Asignatura
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="bg-violet-500 text-white px-3 py-2 rounded-full hover:bg-violet-600"
                                >
                                    + Nueva Tarea
                                </button>
                            </div>
                        </div>

                        {/* Estadísticas en tarjetas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                                <div className="text-sm text-gray-600">Total de tareas</div>
                                <div className="text-lg font-bold text-violet-700">{totalTasks}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <div className="text-sm text-gray-600">Completadas</div>
                                <div className="text-lg font-bold text-green-600">{completedTasksCount}</div>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                <div className="text-sm text-gray-600">Pendientes</div>
                                <div className="text-lg font-bold text-rose-600">{totalTasks - completedTasksCount}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="text-sm text-gray-600">Tasa de completado</div>
                                <div className="text-lg font-bold text-blue-600">{completionRate}%</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex flex-wrap gap-2 mb-3 md:mb-0">
                                <button
                                    onClick={() => setView('all')}
                                    className={`px-3 py-1 rounded-full text-sm ${view === 'all'
                                            ? 'bg-violet-500 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setView('pending')}
                                    className={`px-3 py-1 rounded-full text-sm ${view === 'pending'
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    Pendientes
                                </button>
                                <button
                                    onClick={() => setView('completed')}
                                    className={`px-3 py-1 rounded-full text-sm ${view === 'completed'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    Completadas
                                </button>
                            </div>

                            {/* Filtro de asignaturas */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaFilter className="text-gray-400" />
                                </div>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="block pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vista pendientes */}
                        {(view === 'all' || view === 'pending') && (
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md opacity-95">
                                <div className="flex items-center mb-4">
                                    <FaTasks className="text-rose-500 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Tareas Pendientes
                                        <span className="ml-2 text-xs text-gray-500">({pendingTasks.length})</span>
                                    </h2>
                                </div>

                                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                    {pendingTasks.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No hay tareas pendientes</p>
                                            <button
                                                onClick={() => {
                                                    setEditingTask(null);
                                                    setIsTaskModalOpen(true);
                                                }}
                                                className="mt-2 text-violet-500 hover:text-violet-700"
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
                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md opacity-95">
                                <div className="flex items-center mb-4">
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Tareas Completadas
                                        <span className="ml-2 text-xs text-gray-500">({completedTasks.length})</span>
                                    </h2>
                                </div>

                                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                    {completedTasks.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No hay tareas completadas</p>
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

                        {/* Gráfico resumen (opcional - en vista de escritorio) */}
                        {view === 'all' && window.innerWidth >= 768 && subjects.length > 0 && (
                            <div className="md:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-md mt-6 opacity-95">
                                <div className="flex items-center mb-4">
                                    <FaChartBar className="text-violet-500 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">Resumen por Asignatura</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {subjects.map(subject => {
                                        const subjectTasks = tasks.filter(task => task.subject === subject.title);
                                        const completed = subjectTasks.filter(task => task.status === 'Finalizada').length;
                                        const total = subjectTasks.length;
                                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                                        return (
                                            <div key={subject.id} className="bg-gray-50 p-3 rounded-lg">
                                                <div className="font-medium text-violet-700">{subject.title}</div>
                                                <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                    <span>{completed}/{total} completadas</span>
                                                    <span>{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-violet-500 h-2 rounded-full"
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
        </div>
    );
};

export default TasksPage;
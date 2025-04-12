// src/pages/TasksPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, addTask, updateTask, deleteTask } from '../api/tasks';
import { getSubjects, addSubject } from '../api/subjects';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import TaskModal from '../components/modals/TaskModal';
import SubjectModal from '../components/modals/SubjectModal';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, userId } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksData, subjectsData] = await Promise.all([getTasks(), getSubjects()]);
                setTasks(tasksData);
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
            setTasks([...tasks, addedTask]);
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
            console.log('Enviando a updateTask:', updatedTask);
            const updatedTaskFromBackend = await updateTask(updatedTask.id, updatedTask);
            setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTaskFromBackend : task)));
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

    const filteredTasks = selectedSubject
        ? tasks.filter((task) => task.subject === selectedSubject)
        : tasks;

    const pendingTasks = filteredTasks
        .filter((task) => task.status !== 'Completada')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const completedTasks = filteredTasks
        .filter((task) => task.status === 'Completada')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const handleSubjectFilter = (subject) => {
        setSelectedSubject(selectedSubject === subject ? '' : subject);
    };

    return (
        <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div
                className="flex-1 bg-[#e6f0fa] p-4 pb-20 md:p-8 md:pb-8"
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl">Tareas</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setIsSubjectModalOpen(true);
                                }}
                                className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                disabled={loading}
                            >
                                + Añadir Asignatura
                            </button>
                            <button
                                onClick={() => {
                                    setEditingTask(null);
                                    setIsTaskModalOpen(true);
                                }}
                                className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                                disabled={loading}
                            >
                                + Añadir Tarea
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Filtrar por asignatura:</h3>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                                <button
                                    key={subject.id}
                                    onClick={() => handleSubjectFilter(subject.title)}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        selectedSubject === subject.title
                                            ? 'bg-[#467BAA] text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    {subject.title}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedSubject('')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    selectedSubject === ''
                                        ? 'bg-[#467BAA] text-white'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    Todas
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                <h2 className="text-xl font-semibold mb-4">Tareas Activas</h2>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {pendingTasks.length === 0 ? (
                                        <p>No hay tareas activas{selectedSubject ? ` para ${selectedSubject}` : ''}.</p>
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
                            <div className="bg-white p-4 rounded-xl shadow-md md:p-6">
                                <h2 className="text-xl font-semibold mb-4">Tareas Completadas</h2>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {completedTasks.length === 0 ? (
                                        <p>No hay tareas completadas{selectedSubject ? ` para ${selectedSubject}` : ''}.</p>
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
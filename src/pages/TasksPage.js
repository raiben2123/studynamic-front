// src/pages/TasksPage.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Logo from '../assets/Logo_opacidad33.png';
import TaskCard from '../components/dashboard/TaskCard';
import TaskModal from '../components/modals/TaskModal'; // Importamos TaskModal

const initialSubjects = [
    'Matemáticas',
    'Física',
    'Programación',
    'Química',
    'Literatura',
];

const initialTasks = [
    { id: 1, title: 'Completar proyecto de Matemáticas', dueDate: '2025-03-25', status: 'Pendiente', markObtained: '', markMax: '', importance: 'No Urgente', subject: 'Matemáticas', notificationDate: '' },
    { id: 2, title: 'Preparar presentación de Física', dueDate: '2025-03-27', status: 'En Progreso', markObtained: '85', markMax: '100', importance: 'Urgente', subject: 'Física', notificationDate: '' },
    { id: 3, title: 'Leer capítulo 5 de Programación', dueDate: '2025-03-24', status: 'Pendiente', markObtained: '', markMax: '', importance: 'No Urgente', subject: 'Programación', notificationDate: '' },
    { id: 4, title: 'Revisar notas de Química', dueDate: '2025-03-26', status: 'Completada', markObtained: '90', markMax: '100', importance: 'No Urgente', subject: 'Química', notificationDate: '' },
    { id: 5, title: 'Entregar tarea de Literatura', dueDate: '2025-03-28', status: 'En Progreso', markObtained: '70', markMax: '80', importance: 'Media', subject: 'Literatura', notificationDate: '' },
];

const TasksPage = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [subjects] = useState(initialSubjects);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const handleTaskUpdate = (updatedTask) => {
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    };

    const handleTaskDelete = (taskId) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    };

    const handleAddTask = (newTask) => {
        setTasks([...tasks, { ...newTask, id: Date.now() }]);
        setIsTaskModalOpen(false);
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl">Tareas</h1>
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="bg-[#467BAA] text-white px-4 py-2 rounded-full hover:bg-[#5aa0f2]"
                        >
                            + Añadir Tarea
                        </button>
                    </div>

                    {/* Sección de filtros por asignatura */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Filtrar por asignatura:</h3>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                                <button
                                    key={subject}
                                    onClick={() => handleSubjectFilter(subject)}
                                    className={`px-3 py-1 rounded-full text-sm ${selectedSubject === subject
                                            ? 'bg-[#467BAA] text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {subject}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedSubject('')}
                                className={`px-3 py-1 rounded-full text-sm ${selectedSubject === '' ? 'bg-[#467BAA] text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
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
                                                onUpdate={handleTaskUpdate}
                                                onDelete={handleTaskDelete} // Pasamos la función de eliminación
                                                subjects={subjects}
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
                                                onUpdate={handleTaskUpdate}
                                                onDelete={handleTaskDelete} // Pasamos la función de eliminación
                                                subjects={subjects}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para añadir tarea */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleAddTask}
                subjects={subjects}
            />
        </div>
    );
};

export default TasksPage;
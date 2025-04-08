// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TasksPage from './pages/TasksPage';
import ResourcesPage from './pages/ResourcesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar key={Date.now()} />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="/settings" element={<div>Configuración (en desarrollo)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
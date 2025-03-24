// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar key={Date.now()} />} />
        <Route path="/tasks" element={<div>Tareas (en desarrollo)</div>} />
        <Route path="/resources" element={<div>Recursos (en desarrollo)</div>} />
        <Route path="/groups" element={<div>Grupos (en desarrollo)</div>} />
        <Route path="/settings" element={<div>Configuración (en desarrollo)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
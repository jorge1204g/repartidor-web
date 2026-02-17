import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage'; // Nuevo componente
import HistoryPage from './pages/HistoryPage'; // Nuevo componente
import MessagesPage from './pages/MessagesPage'; // Nuevo componente
import ProfilePage from './pages/ProfilePage'; // Nuevo componente

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/inicio" element={<Dashboard />} />
      <Route path="/pedidos" element={<OrdersPage />} />
      <Route path="/historial" element={<HistoryPage />} />
      <Route path="/mensajes" element={<MessagesPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/inicio" />} />
    </Routes>
  );
}

export default App;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import MessagesPage from './pages/MessagesPage';
import { MessageProvider } from './contexts/MessageContext';
import GlobalNotificationHandler from './components/GlobalNotificationHandler';

function App() {
  return (
    <MessageProvider>
      <GlobalNotificationHandler />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/inicio" element={<Dashboard />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/mensajes" element={<MessagesPage />} />
        <Route path="*" element={<Navigate to="/inicio" />} />
      </Routes>
    </MessageProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import CreateOrderPage from './pages/CreateOrderPage';
import SetupPage from './pages/SetupPage';
import ManageOrdersPage from './pages/ManageOrdersPage';
import UploadMenuPage from './pages/UploadMenuPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cocina" element={<KitchenPage />} />
          <Route path="/crear-pedido" element={<CreateOrderPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/gestionar-pedidos" element={<ManageOrdersPage />} />
          <Route path="/historial-pedidos" element={<ManageOrdersPage />} />
          <Route path="/cargar-menu" element={<UploadMenuPage />} />
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
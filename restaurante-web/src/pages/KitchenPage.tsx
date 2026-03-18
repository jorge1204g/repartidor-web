import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaz para representar un pedido en la cocina
interface KitchenOrder {
  id: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    specialRequests?: string;
  }>;
  status: 'ordered' | 'preparing' | 'ready';
  timestamp: string;
  estimatedTime?: number; // minutos estimados
}

const KitchenPage: React.FC = () => {
  const navigate = useNavigate();
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('preparing');

  // Datos de ejemplo - en una aplicación real, estos vendrían de una API
  useEffect(() => {
    // Simular carga de datos
    const mockKitchenOrders: KitchenOrder[] = [
      {
        id: 'ORD-001',
        tableNumber: 'Mesa 5',
        items: [
          { name: 'Pizza Margherita', quantity: 1, specialRequests: 'Sin queso extra' },
          { name: 'Agua Mineral', quantity: 2 }
        ],
        status: 'ordered',
        timestamp: '10:30 AM',
        estimatedTime: 15
      },
      {
        id: 'ORD-002',
        tableNumber: 'Mesa 3',
        items: [
          { name: 'Hamburguesa Clásica', quantity: 2 },
          { name: 'Papas Fritas', quantity: 1 }
        ],
        status: 'preparing',
        timestamp: '10:45 AM',
        estimatedTime: 10
      },
      {
        id: 'ORD-003',
        tableNumber: 'Para Llevar',
        items: [
          { name: 'Ensalada César', quantity: 1 },
          { name: 'Refresco', quantity: 1 }
        ],
        status: 'ready',
        timestamp: '11:00 AM'
      }
    ];
    
    setKitchenOrders(mockKitchenOrders);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: KitchenOrder['status']) => {
    setKitchenOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ordered': return '#ffc107';
      case 'preparing': return '#007bff';
      case 'ready': return '#28a745';
      default: return '#000';
    }
  };

  const filteredOrders = kitchenOrders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'preparing') return order.status === 'ordered' || order.status === 'preparing';
    if (activeTab === 'ready') return order.status === 'ready';
    return true;
  });

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Panel de Cocina</h1>
        <button className="btn btn-danger" onClick={() => navigate('/inicio')}>
          Volver al Inicio
        </button>
      </header>

      {/* Navegación */}
      <nav className="navbar">
        <ul>
          <li><a href="/inicio">Inicio</a></li>
          <li><a href="/pedidos">Pedidos</a></li>
          <li><a href="/crear-pedido">Crear Pedido</a></li>
          <li><a href="/menu">Menú</a></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Órdenes de Cocina</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('all')}
              >
                Todos
              </button>
              <button 
                className={`btn ${activeTab === 'preparing' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('preparing')}
              >
                En Preparación
              </button>
              <button 
                className={`btn ${activeTab === 'ready' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('ready')}
              >
                Listos
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{order.id}</h3>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
                    }}>
                      {order.status === 'ordered' && 'Nuevo'}
                      {order.status === 'preparing' && 'Preparando'}
                      {order.status === 'ready' && 'Listo'}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Mesa:</strong> {order.tableNumber}
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Hora:</strong> {order.timestamp}
                    {order.estimatedTime && <span> • Tiempo estimado: {order.estimatedTime} min</span>}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Artículos:</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0' }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={{ 
                          padding: '0.25rem 0', 
                          borderBottom: '1px solid #eee' 
                        }}>
                          <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span> {item.name}
                          {item.specialRequests && (
                            <div style={{ 
                              fontSize: '0.85rem', 
                              fontStyle: 'italic', 
                              color: '#6c757d',
                              marginLeft: '1rem'
                            }}>
                              Nota: {item.specialRequests}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {order.status === 'ordered' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Iniciar Preparación
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button 
                        className="btn btn-warning"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Marcar como Listo
                      </button>
                    )}
                    
                    {order.status === 'ready' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          alert(`Pedido ${order.id} marcado como entregado`);
                          // En una app real, aquí se cambiaría el estado del pedido en el sistema
                        }}
                      >
                        Entregado
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                <p>No hay pedidos {activeTab === 'all' ? '' : activeTab === 'preparing' ? 'en preparación' : 'listos'} en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KitchenPage;
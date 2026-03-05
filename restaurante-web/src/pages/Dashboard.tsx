import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderCreationService from '../services/OrderCreationService';
import { OrderStatus } from '../types/Order';
import { database, ref, onValue } from '../services/Firebase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('Cargando...');


  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Obtener información del restaurante
    const restaurantId = AuthService.getRestaurantId();
    if (restaurantId) {
      const restaurantRef = ref(database, `restaurants/${restaurantId}`);
      onValue(restaurantRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRestaurantName(data.name || 'Restaurante sin nombre');
        }
      });
    }
  }, []);

  useEffect(() => {
    // Suscribirse a los pedidos en tiempo real
    const restaurantId = AuthService.getRestaurantId();
    if (restaurantId) {
      const ordersRef = ref(database, `orders`);
      const unsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const orders: any[] = [];
          Object.keys(data).forEach((orderId) => {
            const order = data[orderId];
            if (order.restaurantId === restaurantId) {
              // Mostrar solo pedidos que no están entregados o cancelados
              if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED) {
                orders.push({
                  ...order,
                  id: orderId
                });
              }
            }
          });
          // Ordenar por fecha de creación (más recientes primero)
          orders.sort((a, b) => b.createdAt - a.createdAt);
          setActiveOrders(orders);
        } else {
          setActiveOrders([]);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    // Lógica de cierre de sesión
    await AuthService.logout();
    navigate('/login');
  };

  // Obtener información del restaurante
  const restaurantId = AuthService.getRestaurantId();

  const getStatusText = (status: OrderStatus): string => {
    switch(status) {
      case OrderStatus.PENDING: return 'Pendiente';
      case OrderStatus.ASSIGNED: return 'Asignado';
      case OrderStatus.MANUAL_ASSIGNED: return 'Asignado Manualmente';
      case OrderStatus.ACCEPTED: return 'Aceptado';
      case OrderStatus.ON_THE_WAY_TO_STORE: return 'En camino al restaurante';
      case OrderStatus.ARRIVED_AT_STORE: return 'Llegó al restaurante';
      case OrderStatus.PICKING_UP_ORDER: return 'Recogiendo pedido';
      case OrderStatus.ON_THE_WAY_TO_CUSTOMER: return 'En camino al cliente';
      case OrderStatus.DELIVERED: return 'Entregado';
      case OrderStatus.CANCELLED: return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch(status) {
      case OrderStatus.PENDING: return 'badge-pending'; // Amarillo
      case OrderStatus.ASSIGNED: return 'badge-assigned'; // Azul
      case OrderStatus.MANUAL_ASSIGNED: return 'badge-assigned'; // Azul
      case OrderStatus.ACCEPTED: return 'badge-accepted'; // Verde
      case OrderStatus.ON_THE_WAY_TO_STORE: return 'badge-assigned'; // Azul
      case OrderStatus.ARRIVED_AT_STORE: return 'badge-assigned'; // Azul oscuro
      case OrderStatus.PICKING_UP_ORDER: return 'badge-assigned'; // Violeta
      case OrderStatus.ON_THE_WAY_TO_CUSTOMER: return 'badge-pending'; // Naranja
      case OrderStatus.DELIVERED: return 'badge-delivered'; // Verde
      case OrderStatus.CANCELLED: return 'badge-cancelled'; // Rojo
      default: return 'badge-assigned';
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div>
          <h1>🍽️ Panel de Control</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
            Gestiona tus pedidos en tiempo real
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ 
            padding: '8px 16px', 
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px', 
            fontSize: '0.875rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)'
          }}>
            🏪 {restaurantName}
          </div>
          <div style={{ 
            padding: '8px 16px', 
            background: 'var(--primary-gradient)',
            borderRadius: '12px', 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: 'white',
            boxShadow: 'var(--glow-primary)'
          }}>
            ID: {restaurantId}
          </div>
          <button 
            className="btn btn-danger" 
            onClick={handleLogout}
            style={{ marginLeft: '8px' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Navegación */}
      <nav className="navbar">
        <ul>
          <li><a href="/inicio" className="active">🏠 Inicio</a></li>
          <li><a href="/crear-pedido">➕ Crear Pedido</a></li>
          <li><a href="/historial-pedidos">📜 Historial</a></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        {/* Welcome Card */}
        <div className="card" style={{
          background: 'var(--primary-gradient)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>👋 ¡Bienvenido al Panel de Control!</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
              Desde aquí puedes gestionar todos tus pedidos de forma rápida y eficiente
            </p>
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }} />
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              marginBottom: '0.5rem',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {activeOrders.length}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pedidos Activos
            </div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              marginBottom: '0.5rem',
              background: 'var(--success-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {activeOrders.filter(o => o.status === OrderStatus.ACCEPTED).length}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              En Progreso
            </div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              marginBottom: '0.5rem',
              background: 'var(--warning-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {activeOrders.filter(o => o.status === OrderStatus.PENDING).length}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pendientes
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={{ marginTop: '2rem' }}>
          <h3>⚡ Acciones Rápidas</h3>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap', 
            marginTop: '1rem' 
          }}>
            <button 
              className="btn btn-info" 
              onClick={() => navigate('/crear-pedido')}
              style={{ flex: '1', minWidth: '200px' }}
            >
              ➕ Crear Nuevo Pedido
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/historial-pedidos')}
              style={{ flex: '1', minWidth: '200px' }}
            >
              📜 Ver Historial Completo
            </button>
          </div>
        </div>

        {/* Pedidos en Curso */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem',
              background: 'var(--secondary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              📦 Pedidos en Curso
            </h3>
            <div style={{ 
              padding: '0.5rem 1rem',
              background: 'var(--bg-glass)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {activeOrders.length} {activeOrders.length === 1 ? 'pedido' : 'pedidos'}
            </div>
          </div>
          
          {activeOrders.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center',
              padding: '3rem 2rem'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                opacity: 0.5
              }}>
                🎉
              </div>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1.125rem',
                fontWeight: '500'
              }}>
                ¡No hay pedidos en curso en este momento!
              </p>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                color: 'var(--text-muted)',
                fontSize: '0.9375rem'
              }}>
                Aprovecha para preparar todo para los próximos pedidos
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>🕐 Fecha/Hora</th>
                    <th>👤 Cliente</th>
                    <th>📞 Contacto</th>
                    <th>💰 Total</th>
                    <th>🚴 Repartidor</th>
                    <th>📊 Estado</th>
                    <th>⚙️ Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '500' }}>{order.orderDateTime || formatDate(order.createdAt)}</td>
                      <td>{order.customer.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{order.customer.phone}</td>
                      <td style={{ 
                        fontWeight: '700',
                        background: 'var(--success-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.125rem'
                      }}>
                        ${order.subtotal.toFixed(2)}
                      </td>
                      <td>
                        {order.assignedToDeliveryName ? (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: 'var(--success-color)',
                            fontWeight: '600'
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>✅</span>
                            {order.assignedToDeliveryName}
                          </div>
                        ) : order.candidateDeliveryIds && order.candidateDeliveryIds.length > 0 ? (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: 'var(--warning-color)',
                            fontWeight: '600'
                          }}>
                            <span style={{ fontSize: '1.25rem', animation: 'pulse 2s infinite' }}>⏳</span>
                            Esperando ({order.candidateDeliveryIds.length})
                          </div>
                        ) : (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: 'var(--danger-color)',
                            fontWeight: '600'
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>❌</span>
                            Sin asignar
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            className="btn btn-info"
                            onClick={() => {
                              const detalles = `📋 DETALLES DEL PEDIDO\n\n` +
                                `ID: ${order.id}\n` +
                                `Fecha/Hora: ${order.orderDateTime || formatDate(order.createdAt)}\n` +
                                `Cliente: ${order.customer.name}\n` +
                                `Dirección: ${order.customer.address}\n` +
                                `Teléfono: ${order.customer.phone}\n` +
                                `Referencias: ${order.deliveryReferences || 'N/A'}\n\n` +
                                `💰 SUBTOTAL: $${order.subtotal.toFixed(2)}\n` +
                                `🚚 ENVÍO: $${order.deliveryCost.toFixed(2)}\n` +
                                `💵 TOTAL: $${order.total.toFixed(2)}\n\n` +
                                `⏰ TIEMPO ESTIMADO: ${order.deliveryTimeEstimate || 'N/A'}\n` +
                                `🎫 CÓDIGO CONFIRMACIÓN: ${order.customerCode || 'N/A'}\n\n` +
                                `📦 ESTADO: ${getStatusText(order.status)}\n` +
                                `👤 REPARTIDOR: ${order.assignedToDeliveryName || 'No asignado'}\n\n` +
                                `💳 MÉTODO DE PAGO: ${order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}\n` +
                                `📝 SOLICITUDES ESPECIALES: ${order.specialRequests || 'Ninguna'}`;
                              alert(detalles);
                            }}
                            title="Ver detalles del pedido"
                            style={{ minWidth: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            👁️ Ver
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => alert(`Código de Confirmación: ${order.customerCode || 'N/A'}`)}
                            title="Ver código de confirmación"
                            style={{ minWidth: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            🎫 Código
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={async () => {
                              if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
                                return;
                              }
                              try {
                                const result = await OrderCreationService.deleteOrder(order.id);
                                if (result.success) {
                                  alert('Pedido eliminado exitosamente');
                                } else {
                                  throw new Error(result.message);
                                }
                              } catch (err: any) {
                                alert(err.message || 'Error al eliminar el pedido');
                              }
                            }}
                            title="Eliminar pedido"
                            style={{ minWidth: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;





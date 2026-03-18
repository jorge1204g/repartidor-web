import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderCreationService from '../services/OrderCreationService';
import { OrderStatus } from '../types/Order';
import { database, ref, onValue } from '../services/Firebase';

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    productId: string;
  }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryTimeEstimate: string;
  specialRequests: string;
  status: OrderStatus;
  whoPaysDelivery: string;
  assignedToDeliveryId: string;
  assignedToDeliveryName: string;
  candidateDeliveryIds: string[];
  createdAt: number;
  deliveredAt: number | null;
  pickupLocationUrl: string;
  deliveryAddress: string;
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  customerUrl: string;
  deliveryReferences: string;
  customerCode: string;
  confirmationCode?: string; // Código de confirmación para la entrega
  paymentMethod?: string; // Método de pago
  orderDateTime?: string; // Fecha y hora de creación del pedido
  deliveredDateTime?: string; // Fecha y hora de entrega del pedido
}

const ManageOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const restaurantId = AuthService.getRestaurantId();
        if (!restaurantId) {
          throw new Error('No se encontró el ID del restaurante');
        }

        const restaurantOrders = await OrderCreationService.getRestaurantOrders(restaurantId);
        // Filtrar solo pedidos entregados
        const deliveredOrders = restaurantOrders.filter(order => order.status === OrderStatus.DELIVERED);
        setOrders(deliveredOrders);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los pedidos');
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Suscribirse a actualizaciones en tiempo real de los pedidos
    const restaurantId = AuthService.getRestaurantId();
    if (restaurantId) {
      const ordersRef = ref(database, `orders`);
      const unsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const updatedOrders: Order[] = [];
          Object.keys(data).forEach((orderId) => {
            const order = data[orderId];
            if (order.restaurantId === restaurantId && order.status === OrderStatus.DELIVERED) {
              updatedOrders.push({
                ...order,
                id: orderId
              });
            }
          });
          setOrders(updatedOrders);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      const result = await OrderCreationService.deleteOrder(orderId);

      if (result.success) {
        // Actualizar la lista de pedidos
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        alert('Pedido eliminado exitosamente');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el pedido');
      setTimeout(() => setError(''), 3000); // Limpiar error después de 3 segundos
    } finally {
      setDeletingOrderId(null);
    }
  };

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
      case OrderStatus.PENDING: return '#ffc107'; // Amarillo
      case OrderStatus.ASSIGNED: return '#17a2b8'; // Azul claro
      case OrderStatus.MANUAL_ASSIGNED: return '#17a2b8'; // Azul claro
      case OrderStatus.ACCEPTED: return '#28a745'; // Verde
      case OrderStatus.ON_THE_WAY_TO_STORE: return '#007bff'; // Azul
      case OrderStatus.ARRIVED_AT_STORE: return '#6610f2'; // Morado
      case OrderStatus.PICKING_UP_ORDER: return '#6f42c1'; // Violeta
      case OrderStatus.ON_THE_WAY_TO_CUSTOMER: return '#fd7e14'; // Naranja
      case OrderStatus.DELIVERED: return '#28a745'; // Verde
      case OrderStatus.CANCELLED: return '#dc3545'; // Rojo
      default: return '#007bff';
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navegación */}
      <nav className="navbar">
        <ul>
          <li><a href="/inicio">Inicio</a></li>
          <li><a href="/pedidos">Pedidos</a></li>
          <li><a href="/crear-pedido">Crear Pedido</a></li>
          <li><a href="/historial-pedidos" style={{ backgroundColor: '#555' }}>Historial Pedidos</a></li>
          <li><a href="/menu">Menú</a></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Historial de Pedidos Entregados</h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No hay pedidos registrados para este restaurante.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Seguimiento</th>
                    <th>Fecha/Hora Pedido</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Total Pedido</th>
                    <th>Repartidor</th>
                    <th>Status</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.orderDateTime || formatDate(order.createdAt)}</td>
                      <td>{order.customer.name}</td>
                      <td>{order.customer.phone}</td>
                      <td>${order.subtotal.toFixed(2)}</td>
                      <td>
                        {order.assignedToDeliveryName ? (
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                            {order.assignedToDeliveryName}
                          </span>
                        ) : order.candidateDeliveryIds && order.candidateDeliveryIds.length > 0 ? (
                          <span style={{ color: '#ffc107' }}>
                            Esperando aceptación ({order.candidateDeliveryIds.length} notificados)
                          </span>
                        ) : (
                          <span style={{ color: '#dc3545' }}>
                            No asignado
                          </span>
                        )}
                      </td>
                      <td>
                        <span 
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0.25rem', 
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            const detalles = `📋 DETALLES DEL PEDIDO\n\n` +
                              `ID: ${order.id}\n` +
                              `Fecha/Hora Pedido: ${order.orderDateTime || formatDate(order.createdAt)}\n` +
                              `Fecha/Hora Entrega: ${order.deliveredDateTime || (order.deliveredAt ? formatDate(order.deliveredAt) : 'No entregado')}\n` +
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
                          style={{ marginRight: '0.5rem', backgroundColor: '#17a2b8' }}
                        >
                          📋 Ver Detalles
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => alert(`Código de Confirmación: ${order.customerCode || 'N/A'}`)}
                          title="Ver código de confirmación"
                          style={{ marginRight: '0.5rem' }}
                        >
                          🎫 Código
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          title="Eliminar pedido"
                        >
                          {deletingOrderId === order.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
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

export default ManageOrdersPage;
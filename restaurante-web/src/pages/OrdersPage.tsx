import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService';
import AuthService from '../services/AuthService';
import { OrderStatus } from '../types/Order';

// Interfaz específica para la vista de pedidos en el restaurante
interface RestaurantOrder {
  id: string;
  orderId: string;
  restaurantName: string;
  dateTime: string;
  paymentMethod: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  pickupLocationUrl: string;
  deliveryAddress: string;
  customerUrl: string;
  deliveryReferences: string;
  customerCode: string;
  confirmationCode?: string; // Código de confirmación para la entrega
  status: OrderStatus;
  assignedToDeliveryId: string;
  assignedToDeliveryName: string;
  candidateDeliveryIds: string[];
  createdAt: number;
  deliveredAt: number | null;
  // Campos adicionales para la vista del restaurante
  tableNumber: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  specialRequests?: string;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<RestaurantOrder[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>(OrderStatus.PENDING);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Obtener el ID del restaurante desde el servicio de autenticación
  const restaurantId = AuthService.getRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Suscribirse a las actualizaciones en tiempo real
        unsubscribe = OrderService.observeRestaurantOrders(restaurantId, (updatedOrders: any[]) => {
          if (isMounted) {
            // Convertir los pedidos para que coincidan con RestaurantOrder
            const convertedOrders: RestaurantOrder[] = updatedOrders.map((order: any) => ({
              id: order.id,
              orderId: order.orderId || order.id,
              restaurantName: order.restaurantName || 'Restaurante Desconocido',
              dateTime: order.dateTime || new Date(order.createdAt || Date.now()).toISOString(),
              paymentMethod: order.paymentMethod || 'Desconocido',
              customer: {
                name: order.customer?.name || order.customerName || 'Cliente',
                phone: order.customer?.phone || order.customerPhone || '',
                address: order.deliveryAddress || order.customer?.address || '',
                location: {
                  latitude: order.customer?.location?.latitude || 0,
                  longitude: order.customer?.location?.longitude || 0
                }
              },
              items: order.items && Array.isArray(order.items) ? order.items.map((item: any) => ({
                name: item.name || item.productName || '',
                quantity: item.quantity || item.qty || 0,
                price: item.unitPrice || item.price || 0
              })) : [],
              subtotal: order.subtotal || 0,
              deliveryCost: order.deliveryCost || 0,
              total: order.total || 0,
              customerLocation: {
                latitude: order.customerLocation?.latitude || 0,
                longitude: order.customerLocation?.longitude || 0
              },
              pickupLocationUrl: order.pickupLocationUrl || '',
              deliveryAddress: order.deliveryAddress || order.customer?.address || '',
              customerUrl: order.customerUrl || '',
              deliveryReferences: order.deliveryReferences || '',
              customerCode: order.customerCode || '',
              confirmationCode: order.confirmationCode || '',
              status: order.status || OrderStatus.PENDING,
              assignedToDeliveryId: order.assignedToDeliveryId || '',
              assignedToDeliveryName: order.assignedToDeliveryName || '',
              candidateDeliveryIds: Array.isArray(order.candidateDeliveryIds) ? order.candidateDeliveryIds : [],
              createdAt: order.createdAt || Date.now(),
              deliveredAt: order.deliveredAt || null,
              // Campos adicionales para la vista del restaurante
              tableNumber: order.deliveryAddress || 'Para Llevar',
              timestamp: new Date(order.createdAt).toLocaleString(),
              customerName: order.customer?.name || order.customerName || 'Cliente',
              customerPhone: order.customer?.phone || order.customerPhone || '',
              specialRequests: 'Especiales'
            }));
            setOrders(convertedOrders);
            // Aplicar filtro inicial
            if (filter === 'all') {
              setFilteredOrders(convertedOrders);
            } else {
              setFilteredOrders(convertedOrders.filter(order => order.status === filter));
            }
          }
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar los pedidos');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe(); // Cancelar la suscripción
      }
    };
  }, [restaurantId, navigate]);

  // Filtrar pedidos según el estado seleccionado
  useEffect(() => {
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  }, [filter, orders]);

  // Función para actualizar el estado del pedido (no utilizada actualmente)
  // const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
  //   try {
  //     const result = await OrderService.updateOrderStatus(orderId, newStatus);
  //     if (!result.success) {
  //       throw new Error(result.message);
  //     }
  //     // El estado se actualizará automáticamente a través de la suscripción
  //   } catch (error: any) {
  //     setError(error.message || 'Error al actualizar el estado del pedido');
  //     setTimeout(() => setError(''), 3000); // Limpiar error después de 3 segundos
  //   }
  // };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return '#ffc107';
      case OrderStatus.ASSIGNED: 
      case OrderStatus.MANUAL_ASSIGNED: 
      case OrderStatus.ACCEPTED: return '#007bff';
      case OrderStatus.DELIVERED: return '#28a745';
      case OrderStatus.CANCELLED: return '#dc3545';
      default: return '#007bff'; // Para estados de enrutamiento
    }
  };

  const getStatusText = (status: OrderStatus) => {
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
      default: return String(status);
    }
  };

  if (!restaurantId) {
    return null; // O un componente de carga mientras verifica autenticación
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Gestión de Pedidos</h1>
        <button className="btn btn-danger" onClick={() => navigate('/inicio')}>
          Volver al Inicio
        </button>
      </header>

      {/* Navegación */}
      <nav className="navbar">
        <ul>
          <li><a href="/inicio">Inicio</a></li>
          <li><a href="/pedidos" style={{ backgroundColor: '#555' }}>Pedidos</a></li>
          <li><a href="/crear-pedido">Crear Pedido</a></li>
          <li><a href="/menu">Menú</a></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Pedidos</h2>
            <div>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="all">Todos los pedidos</option>
                <option value={OrderStatus.PENDING}>Pendientes</option>
                <option value={OrderStatus.ACCEPTED}>Aceptados</option>
                <option value={OrderStatus.ON_THE_WAY_TO_STORE}>En camino al restaurante</option>
                <option value={OrderStatus.ARRIVED_AT_STORE}>Llegó al restaurante</option>
                <option value={OrderStatus.PICKING_UP_ORDER}>Recogiendo pedido</option>
                <option value={OrderStatus.ON_THE_WAY_TO_CUSTOMER}>En camino al cliente</option>
                <option value={OrderStatus.DELIVERED}>Entregados</option>
                <option value={OrderStatus.CANCELLED}>Cancelados</option>
              </select>
            </div>
          </div>

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

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando pedidos...
            </div>
          )}

          {!loading && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Seguimiento</th>
                    <th>Restaurante</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Total Pedido</th>
                    <th>Fecha/Hora</th>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Repartidor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.restaurantName}</td>
                        <td>{order.customer?.name || order.customerName}</td>
                        <td>{order.customer?.phone || order.customerPhone}</td>
                        <td>${(order.subtotal || (order.total - order.deliveryCost)).toFixed(2)}</td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>
                          {order.confirmationCode ? (
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '0.25rem', 
                              backgroundColor: '#6f42c1',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}>
                              {order.confirmationCode}
                            </span>
                          ) : (
                            <span style={{ color: '#999' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <span 
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '0.25rem', 
                              backgroundColor: getStatusColor(order.status),
                              color: 'white'
                            }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td>
                          {order.assignedToDeliveryName || 'No asignado'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center' }}>
                        No hay pedidos {filter === 'all' ? '' : getStatusText(filter)} en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
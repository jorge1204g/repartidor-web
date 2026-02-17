import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderService from '../services/OrderService';
import { Order, OrderStatus } from '../types/Order';
import { DeliveryPerson } from '../types/DeliveryPerson';

const OrdersPage: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Variable para controlar si el componente está montado
    let isMounted = true;

    const initOrdersPage = async () => {
      try {
        // Obtener el ID de repartidor
        const deliveryId = AuthService.getDeliveryId();
        if (!deliveryId) {
          throw new Error('No se encontró el ID de repartidor');
        }

        // Verificar si la cuenta sigue siendo válida
        const isValid = await AuthService.isAccountValid(deliveryId);
        if (!isValid && isMounted) {
          console.log('Cuenta no válida, cerrando sesión automáticamente');
          await AuthService.logout();
          navigate('/login');
          return;
        }

        // Obtener datos del repartidor
        const authResponse = await AuthService.loginWithId(deliveryId);
        if (authResponse.success && authResponse.deliveryPerson) {
          setDeliveryPerson(authResponse.deliveryPerson);
        }

        // Obtener órdenes iniciales
        const initialOrders = await OrderService.getAssignedOrders(deliveryId);
        setOrders(initialOrders);

        // Suscribirse a actualizaciones en tiempo real
        const unsubscribe = OrderService.observeOrders(deliveryId, (updatedOrders) => {
          setOrders(updatedOrders);
        });

        // Iniciar verificación periódica de validez de cuenta
        const accountValidationInterval = setInterval(async () => {
          if (!isMounted) return;
          
          const isValid = await AuthService.isAccountValid(deliveryId);
          if (!isValid && isMounted) {
            console.log('Cuenta no válida, cerrando sesión automáticamente');
            await AuthService.logout();
            navigate('/login');
          }
        }, 30000); // Verificar cada 30 segundos

        // Cleanup function
        return () => {
          unsubscribe();
          clearInterval(accountValidationInterval);
        };
      } catch (err: any) {
        setError(err.message || 'Error al cargar los pedidos');
        console.error('Error initializing orders page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initOrdersPage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Traducir estado del pedido
  const translateOrderStatus = (status: OrderStatus): string => {
    switch (status) {
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Encabezado */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/inicio')}
            style={{
              padding: '8px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              minWidth: '36px'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#333' }}>
              Pedidos Activos
            </h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              {deliveryPerson ? `Bienvenido, ${deliveryPerson.name}` : 'Cargando...'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/perfil')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Perfil
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      {/* Lista de pedidos activos */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px' }}>
          {orders.filter(order => order.status !== OrderStatus.DELIVERED).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No tienes pedidos activos
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.filter(order => order.status !== OrderStatus.DELIVERED).map(order => (
                <div key={order.id} style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                      Pedido #{order.orderId || order.id}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: order.status === OrderStatus.DELIVERED ? '#e8f5e9' : 
                                     order.status === OrderStatus.PENDING ? '#fff3e0' :
                                     '#e3f2fd',
                      color: order.status === OrderStatus.DELIVERED ? '#2e7d32' : 
                             order.status === OrderStatus.PENDING ? '#ef6c00' :
                             '#1565c0'
                    }}>
                      {translateOrderStatus(order.status)}
                    </span>
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Restaurante:</strong> {order.restaurantName}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Ganancia:</strong> ${order.deliveryCost.toFixed(2)}</p>
                  
                  {/* Mostrar productos */}
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#333' }}>Productos:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {order.items.map((item, index) => (
                        <li key={index} style={{ fontSize: '13px', color: '#333' }}>
                          {item.name} x{item.quantity} (${(item.price * item.quantity).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Mostrar información de contacto y dirección solo después de aceptar el pedido */}
                  {order.status !== OrderStatus.MANUAL_ASSIGNED || order.assignedToDeliveryId ? (
                    <>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Cliente:</strong> {order.customer.name}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Teléfono:</strong> {order.customer.phone}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Dirección:</strong> {order.deliveryAddress}</p>
                      
                      {/* Botones adicionales después de aceptar el pedido */}
                      {(order.status !== OrderStatus.MANUAL_ASSIGNED || order.assignedToDeliveryId) && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            📞 Llamar al Cliente
                          </button>
                          
                          {order.customerUrl && order.customerUrl.trim() !== '' && (
                            <button
                              onClick={() => window.open(order.customerUrl, '_blank')}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              📍 Ubicación del Cliente
                            </button>
                          )}
                          
                          {order.pickupLocationUrl && order.pickupLocationUrl.trim() !== '' && (
                            <button
                              onClick={() => window.open(order.pickupLocationUrl, '_blank')}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#FF9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              🏪 Dirección del Restaurante
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ 
                      margin: '8px 0', 
                      fontSize: '13px', 
                      color: '#f44336',
                      fontStyle: 'italic'
                    }}>
                      Toca "Aceptar Pedido" para ver información de contacto y dirección
                    </p>
                  )}
                  
                  <div style={{ marginTop: '12px' }}>
                    {order.status === OrderStatus.MANUAL_ASSIGNED && !order.assignedToDeliveryId && (
                      <button
                        onClick={async () => {
                          if (!deliveryPerson) return;
                          const result = await OrderService.acceptOrder(order.id, deliveryPerson.id, deliveryPerson.name);
                          if (result.success) {
                            alert('Pedido aceptado exitosamente');
                          } else {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        Aceptar Pedido
                      </button>
                    )}
                    
                    {order.status === OrderStatus.MANUAL_ASSIGNED && order.assignedToDeliveryId === deliveryPerson?.id && (
                      <button
                        onClick={async () => {
                          const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE);
                          if (!result.success) {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        1. En camino al restaurante
                      </button>
                    )}
                    
                    {order.status === OrderStatus.ACCEPTED && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE);
                            if (!result.success) {
                              setError(result.message);
                            }
                          }}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          1. En camino al restaurante
                        </button>
                        <button
                          onClick={() => alert(`Detalles del Pedido:
Restaurante: ${order.restaurantName}
Cliente: ${order.customer.name}
Teléfono: ${order.customer.phone}
Dirección: ${order.deliveryAddress}
Ganancia: $${order.deliveryCost.toFixed(2)}`)}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          Ver Detalles del Pedido
                        </button>
                      </div>
                    )}
                    
                    {order.status === OrderStatus.ON_THE_WAY_TO_STORE && (
                      <button
                        onClick={async () => {
                          const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ARRIVED_AT_STORE);
                          if (!result.success) {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        2. Llegué al restaurante
                      </button>
                    )}
                    
                    {order.status === OrderStatus.ARRIVED_AT_STORE && (
                      <button
                        onClick={async () => {
                          const result = await OrderService.updateOrderStatus(order.id, OrderStatus.PICKING_UP_ORDER);
                          if (!result.success) {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        3. Repartidor con alimentos en mochila
                      </button>
                    )}
                    
                    {order.status === OrderStatus.PICKING_UP_ORDER && (
                      <button
                        onClick={async () => {
                          const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_CUSTOMER);
                          if (!result.success) {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        4. En camino al cliente
                      </button>
                    )}
                    
                    {order.status === OrderStatus.ON_THE_WAY_TO_CUSTOMER && (
                      <button
                        onClick={async () => {
                          const result = await OrderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);
                          if (!result.success) {
                            setError(result.message);
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        5. Pedido entregado
                      </button>
                    )}
                    
                    {order.status === OrderStatus.DELIVERED && (
                      <div style={{
                        padding: '10px 16px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        border: '1px solid #c8e6c9',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        Pedido entregado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
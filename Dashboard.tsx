import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderService from '../services/OrderService';
import PresenceService from '../services/PresenceService';
import { Order, OrderStatus } from '../types/Order';
import { DeliveryPerson } from '../types/DeliveryPerson';

const Dashboard: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showCodeDialog, setShowCodeDialog] = useState<boolean>(false);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ganancias calculadas
  const [dailyEarnings, setDailyEarnings] = useState<number>(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [dailyOrdersCount, setDailyOrdersCount] = useState<number>(0);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Variable para controlar si el componente está montado
    let isMounted = true;

    const initDashboard = async () => {
      try {
        // Obtener el ID de repartidor
        const deliveryId = AuthService.getDeliveryId();
        if (!deliveryId) {
          throw new Error('No se encontró el ID de repartidor');
        }

        // Obtener datos del repartidor
        const authResponse = await AuthService.loginWithId(deliveryId);
        if (authResponse.success && authResponse.deliveryPerson) {
          setDeliveryPerson(authResponse.deliveryPerson);
          setIsOnline(authResponse.deliveryPerson.isOnline);
          
          // Actualizar estado de presencia
          await PresenceService.updatePresence(deliveryId, authResponse.deliveryPerson.isOnline, true);
        }

        // Obtener órdenes iniciales
        const initialOrders = await OrderService.getAssignedOrders(deliveryId);
        setOrders(initialOrders);
        
        // Calcular ganancias
        calculateEarnings(initialOrders);
        
        // Suscribirse a actualizaciones en tiempo real
        const unsubscribe = OrderService.observeOrders(deliveryId, (updatedOrders) => {
          setOrders(updatedOrders);
          calculateEarnings(updatedOrders);
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

        // Retornar función de limpieza
        return () => {
          unsubscribe();
          clearInterval(accountValidationInterval);
        };
      } catch (err: any) {
        setError(err.message || 'Error al cargar el dashboard');
        console.error('Error initializing dashboard:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initDashboard();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Calcular ganancias
  const calculateEarnings = (orders: Order[]) => {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    let dailyCount = 0;
    
    orders.forEach(order => {
      if (order.status === OrderStatus.DELIVERED) {
        const orderDate = new Date(order.deliveredAt || order.createdAt);
        
        // Ganancias diarias
        if (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        ) {
          daily += order.deliveryCost;
          dailyCount++;
        }
        
        // Ganancias semanales
        if (
          getWeekNumber(orderDate) === currentWeek &&
          orderDate.getFullYear() === currentYear
        ) {
          weekly += order.deliveryCost;
        }
        
        // Ganancias mensuales
        if (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        ) {
          monthly += order.deliveryCost;
        }
      }
    });
    
    setDailyEarnings(daily);
    setWeeklyEarnings(weekly);
    setMonthlyEarnings(monthly);
    setDailyOrdersCount(dailyCount);
  };
  
  // Helper para obtener el número de semana
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Manejar cambio de estado en línea
  const handleOnlineToggle = async () => {
    if (!deliveryPerson) return;
    
    const newOnlineStatus = !isOnline;
    setIsOnline(newOnlineStatus);
    
    try {
      await PresenceService.updatePresence(deliveryPerson.id, newOnlineStatus, true);
      
      // Actualizar el estado local del repartidor
      setDeliveryPerson(prev => prev ? { ...prev, isOnline: newOnlineStatus } : null);
    } catch (err: any) {
      console.error('Error updating online status:', err);
      setIsOnline(!newOnlineStatus); // Revertir el cambio si falla
    }
  };

  // Manejar aceptar pedido
  const handleAcceptOrder = async (order: Order) => {
    if (!deliveryPerson) return;
    
    try {
      const result = await OrderService.acceptOrder(order.id, deliveryPerson.id, deliveryPerson.name);
      if (result.success) {
        // Actualizar localmente inmediatamente para mejorar la experiencia de usuario
        const updatedOrders = orders.map(ord => {
          if (ord.id === order.id) {
            return {
              ...ord,
              assignedToDeliveryId: deliveryPerson!.id,
              assignedToDeliveryName: deliveryPerson!.name,
              status: OrderStatus.ACCEPTED
            };
          }
          return ord;
        });
        setOrders(updatedOrders);
        calculateEarnings(updatedOrders);
        
        // Luego, esperar un poco para refrescar desde Firebase y asegurar la sincronización
        setTimeout(async () => {
          try {
            const refreshedOrders = await OrderService.getAssignedOrders(deliveryPerson!.id);
            setOrders(refreshedOrders);
            calculateEarnings(refreshedOrders);
          } catch (syncErr) {
            console.error('Error al sincronizar pedidos después de aceptar:', syncErr);
          }
        }, 500); // Pequeño delay para permitir la propagación en Firebase
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al aceptar el pedido');
    }
  };

  // Manejar actualizar estado del pedido
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const result = await OrderService.updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado del pedido');
    }
  };

  // Manejar entrega con código
  const handleDeliveredWithCode = (orderId: string) => {
    setCurrentOrderId(orderId);
    setEnteredCode('');
    setCodeError('');
    setShowCodeDialog(true);
  };

  // Confirmar entrega con código
  const confirmDelivery = () => {
    const order = orders.find(o => o.id === currentOrderId);
    if (order && enteredCode === order.customerCode) {
      handleUpdateOrderStatus(currentOrderId, OrderStatus.DELIVERED);
      setShowCodeDialog(false);
      setEnteredCode(''); // Limpiar el código después de confirmar
      setCodeError('');
    } else {
      setCodeError('Código incorrecto. Inténtelo de nuevo.');
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

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
        <div style={{ fontSize: '18px', color: '#666' }}>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      paddingBottom: '80px'  /* Espacio para la barra de navegación inferior */
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
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#333' }}>
            ¡Hola, {deliveryPerson?.name || 'Repartidor'}!
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              ID: {deliveryPerson?.id || 'N/A'}
            </span>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#4CAF50' : '#FF9800',
              boxShadow: isOnline ? '0 0 8px #4CAF50' : '0 0 8px #FF9800'
            }}></div>
            <span style={{ fontSize: '14px', color: isOnline ? '#4CAF50' : '#FF9800' }}>
              {isOnline ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>En línea</span>
            <div 
              onClick={handleOnlineToggle}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                backgroundColor: isOnline ? '#4CAF50' : '#ccc',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '2px',
                left: isOnline ? '26px' : '2px',
                transition: 'left 0.3s ease',
              }}></div>
            </div>
          </label>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Ganancias */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Hoy</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>${dailyEarnings.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{dailyOrdersCount} pedidos</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Esta semana</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>${weeklyEarnings.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>ganados</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Este mes</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>${monthlyEarnings.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>ganados</div>
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

      {/* Pestañas para pedidos activos e historial */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'active' ? '#f0f0f0' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'active' ? '2px solid #4CAF50' : 'none',
              fontWeight: activeTab === 'active' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'active' ? '#4CAF50' : '#666'
            }}
          >
            Pedidos Activos ({orders.filter(o => o.status !== OrderStatus.DELIVERED).length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'history' ? '#f0f0f0' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #2196F3' : 'none',
              fontWeight: activeTab === 'history' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'history' ? '#2196F3' : '#666'
            }}
          >
            Historial ({orders.filter(o => o.status === OrderStatus.DELIVERED).length})
          </button>
        </div>
        
        <div style={{ padding: '16px' }}>
          {activeTab === 'active' ? (
            // Mostrar solo pedidos activos (no entregados)
            orders.filter(order => order.status !== OrderStatus.DELIVERED).length === 0 ? (
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
                            
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.customer.phone);
                                alert('Número de teléfono copiado al portapapeles');
                              }}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#9C27B0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              📋 Copiar Número de Teléfono
                            </button>
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
                          onClick={() => handleAcceptOrder(order)}
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
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}
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
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}
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
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ARRIVED_AT_STORE)}
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
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.PICKING_UP_ORDER)}
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
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_CUSTOMER)}
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
                          onClick={() => handleDeliveredWithCode(order.id)}
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
            )
          ) : (
            // Mostrar historial de pedidos (entregados)
            orders.filter(order => order.status === OrderStatus.DELIVERED).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No tienes pedidos en el historial
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.filter(order => order.status === OrderStatus.DELIVERED).map(order => (
                  <div key={order.id} style={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                        Pedido #{order.orderId || order.id}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32'
                      }}>
                        {translateOrderStatus(order.status)}
                      </span>
                    </div>
                    
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Restaurante:</strong> {order.restaurantName}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Cliente:</strong> {order.customer.name}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Ganancia:</strong> ${order.deliveryCost.toFixed(2)}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}><strong>Fecha:</strong> {new Date(order.deliveredAt || order.createdAt).toLocaleString()}</p>
                    
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
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Diálogo para ingresar código */}
      {showCodeDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '300px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Código de Confirmación</h3>
            <p style={{ margin: '0 0 16px 0', color: '#666' }}>
              Por favor ingrese el código del cliente para confirmar la entrega:
            </p>
            
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => {
                // Permitir solo números y máximo 4 dígitos
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 4) {
                  setEnteredCode(value);
                  if (codeError) setCodeError(''); // Limpiar error cuando se escribe
                }
              }}
              maxLength={4}
              placeholder="Ingrese 4 dígitos"
              style={{
                width: '100%',
                padding: '12px',
                border: codeError ? '1px solid #f44336' : '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '12px',
                fontSize: '16px'
              }}
              autoFocus
            />
            
            {codeError && (
              <div style={{
                color: '#f44336',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {codeError}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCodeDialog(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelivery}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navegación inferior */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        zIndex: 100
      }}>
        <button
          onClick={() => navigate('/inicio')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/inicio' || location.pathname === '/dashboard' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>🏠</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Inicio</span>
        </button>
        <button
          onClick={() => navigate('/pedidos')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/pedidos' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>📋</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Pedidos</span>
        </button>
        <button
          onClick={() => navigate('/historial')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/historial' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>📊</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Historial</span>
        </button>
        <button
          onClick={() => navigate('/mensajes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/mensajes' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Mensajes</span>
        </button>
        <button
          onClick={() => navigate('/perfil')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/perfil' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>👤</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
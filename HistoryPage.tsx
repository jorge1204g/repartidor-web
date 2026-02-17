import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderService from '../services/OrderService';
import { Order, OrderStatus } from '../types/Order';
import { DeliveryPerson } from '../types/DeliveryPerson';

const HistoryPage: React.FC = () => {
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

    const initHistoryPage = async () => {
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
        setError(err.message || 'Error al cargar el historial');
        console.error('Error initializing history page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initHistoryPage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Calcular ganancias
  const calculateEarnings = (orders: Order[]): { daily: number; weekly: number; monthly: number; dailyCount: number } => {
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
    
    return { daily, weekly, monthly, dailyCount };
  };

  // Helper para obtener el número de semana
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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
        <div style={{ fontSize: '18px', color: '#666' }}>Cargando historial...</div>
      </div>
    );
  }

  const { daily, weekly, monthly, dailyCount } = calculateEarnings(orders);

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
              Historial de Pedidos
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
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>${daily.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{dailyCount} pedidos</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Esta semana</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>${weekly.toFixed(2)}</div>
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
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>${monthly.toFixed(2)}</div>
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

      {/* Lista de pedidos entregados (historial) */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px' }}>
          {orders.filter(order => order.status === OrderStatus.DELIVERED).length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
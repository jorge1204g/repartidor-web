import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderService from '../services/OrderService';
import PresenceService from '../services/PresenceService';
import { Order, OrderStatus } from '../types/Order';
import { DeliveryPerson } from '../types/DeliveryPerson';
import { useMessage } from '../contexts/MessageContext';
import ChatPreviewWidget from '../components/ChatPreviewWidget';
import AudioNotificationService from '../utils/AudioNotificationService';

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);


const Dashboard: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showCodeDialog, setShowCodeDialog] = useState<boolean>(false);
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
  
  // Referencia para rastrear el conteo anterior de pedidos (usando ref para evitar problemas de cierre)
  const previousOrderCountRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Mensajes no leídos
  const { unreadCount } = useMessage();
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // Función para habilitar audio manualmente
  const handleEnableAudio = async () => {
    await AudioNotificationService.enableAudio();
    setIsAudioEnabled(true);
    
    // Probar sonido
    playNotificationSound();
    console.log('✅ [AUDIO] Audio habilitado manualmente por el usuario');
  };

  // Función para reproducir sonido de notificación (beep repetido)
  const playNotificationSound = () => {
    try {
      // Crear AudioContext si no existe
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Reproducir 3 beeps consecutivos
      let beepCount = 0;
      const maxBeeps = 3;
      
      const playBeep = () => {
        if (beepCount >= maxBeeps) return;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Configurar tono (frecuencia alta para alerta)
        oscillator.frequency.value = 880; // A5
        oscillator.type = 'sine';
        
        // Configurar volumen
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        // Reproducir beep de 0.5 segundos
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        
        beepCount++;
        
        // Siguiente beep después de 0.7 segundos
        setTimeout(playBeep, 700);
      };
      
      playBeep();
      
      console.log('🔔 [SONIDO] Reproduciendo notificación de pedido nuevo');
    } catch (error) {
      console.error('❌ Error al reproducir sonido:', error);
    }
  };

  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Habilitar audio con la primera interacción del usuario
    const enableAudioOnFirstInteraction = () => {
      console.log('🔊 [AUDIO] Intentando habilitar audio con interacción del usuario');
      AudioNotificationService.enableAudio();
      
      // Remover listeners después de habilitar
      document.removeEventListener('click', enableAudioOnFirstInteraction);
      document.removeEventListener('keydown', enableAudioOnFirstInteraction);
    };
    
    document.addEventListener('click', enableAudioOnFirstInteraction);
    document.addEventListener('keydown', enableAudioOnFirstInteraction);

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
          
          // Detectar si llegó un pedido nuevo
          const activeOrders = updatedOrders.filter(o => o.status !== OrderStatus.DELIVERED);
          if (activeOrders.length > previousOrderCountRef.current && previousOrderCountRef.current !== 0) {
            console.log('🔔 [PEDIDO NUEVO] Pedido recibido! Total de pedidos:', activeOrders.length);
            playNotificationSound();
          }
          previousOrderCountRef.current = activeOrders.length;
        });
        
        // Escuchar eventos de nuevos pedidos desde OrderService
        const handleNewOrderEvent = (event: CustomEvent<{ count: number }>) => {
          console.log('🔔 [EVENTO] Nuevo pedido detectado desde OrderService:', event.detail.count);
          playNotificationSound();
        };
        
        window.addEventListener('new-order-detected', handleNewOrderEvent as EventListener);

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
          window.removeEventListener('new-order-detected', handleNewOrderEvent as EventListener);
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
      case OrderStatus.MANUAL_ASSIGNED: return 'Pedido creado por el restaurante';
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
    <div className="dashboard-container">
      {/* BOTÓN PARA HABILITAR SONIDO - Solo se muestra si no está habilitado */}
      {!isAudioEnabled && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            <div>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#856404'
              }}>
                🔊 Habilitar notificación de sonido
              </p>
              <p style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.8rem',
                color: '#856404'
              }}>
                Haz click para activar las alertas de pedidos nuevos
              </p>
            </div>
          </div>
          <button
            onClick={handleEnableAudio}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: '#ffc107',
              color: '#856404',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            ✅ Habilitar Sonido
          </button>
        </div>
      )}
      
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <h1>
            👋 ¡Hola, {deliveryPerson?.name || 'Repartidor'}!
          </h1>
          <div className="status-badge" style={{ marginTop: '0.5rem' }}>
            <span>ID: {deliveryPerson?.id || 'N/A'}</span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--success-color)' : 'var(--warning-color)',
              boxShadow: isOnline ? '0 0 8px var(--success-color)' : '0 0 8px var(--warning-color)'
            }}></div>
            <span className={isOnline ? 'status-online' : 'status-offline'}>
              {isOnline ? '● Disponible' : '● No disponible'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.875rem', color: '#FFF', fontWeight: '600' }}>En línea</span>
            <div 
              onClick={handleOnlineToggle}
              className={`toggle-switch ${isOnline ? 'toggle-on' : 'toggle-off'}`}
            >
              <div className={`toggle-knob ${isOnline ? 'on' : ''}`}></div>
            </div>
          </label>
          <button 
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            🚪 Salir
          </button>
        </div>
      </div>

      {/* Widget de Vista Previa de Chats con Clientes */}
      <ChatPreviewWidget />

      {/* Ganancias */}
      <div className="earnings-grid">
        <div className="earning-card">
          <div className="earning-label">📅 Hoy</div>
          <div className="earning-value">${dailyEarnings.toFixed(2)}</div>
          <div className="earning-sublabel">{dailyOrdersCount} pedidos</div>
        </div>
        <div className="earning-card">
          <div className="earning-label">📊 Esta Semana</div>
          <div className="earning-value" style={{ color: 'var(--info-color)' }}>${weeklyEarnings.toFixed(2)}</div>
          <div className="earning-sublabel">ganados</div>
        </div>
        <div className="earning-card">
          <div className="earning-label">📈 Este Mes</div>
          <div className="earning-value" style={{ color: 'var(--warning-color)' }}>${monthlyEarnings.toFixed(2)}</div>
          <div className="earning-sublabel">ganados</div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={{
          background: 'var(--danger-gradient)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9375rem',
          fontWeight: '500',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          {error}
        </div>
      )}

      {/* Pestañas para pedidos activos e historial */}
      {(() => {
        console.log('🚀 [DASHBOARD] Versión del código: 2.0 - Dirección del Cliente ACTUALIZADA');
        return null;
      })()}
      <div className="tab-container">
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveTab('active')}
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          >
            📦 Pedidos Activos ({orders.filter(o => o.status !== OrderStatus.DELIVERED).length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          >
            📜 Historial ({orders.filter(o => o.status === OrderStatus.DELIVERED).length})
          </button>
        </div>
        
        <div style={{ padding: '16px' }}>
          {activeTab === 'active' ? (
            // Mostrar solo pedidos activos (no entregados)
            orders.filter(order => order.status !== OrderStatus.DELIVERED).length === 0 ? (
              <div className="card" style={{ 
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'var(--bg-glass)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🎉</div>
                <p style={{ 
                  margin: 0, 
                  color: '#FFF',
                  fontSize: '1.125rem',
                  fontWeight: '500'
                }}>
                  ¡No tienes pedidos activos!
                </p>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  color: 'var(--text-muted)',
                  fontSize: '0.9375rem'
                }}>
                  Aprovecha para descansar mientras llegan nuevos pedidos
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(order => order.status !== OrderStatus.DELIVERED).map(order => (
                  <div key={order.id} className="order-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ 
                        margin: '0', 
                        fontSize: '1.125rem',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        <span style={{ color: '#f093fb' }}>[#4.0]</span> 📦 Pedido #{order.orderId || order.id}
                      </h3>
                      <span className={`order-status-badge ${
                        order.status === OrderStatus.DELIVERED ? 'badge-delivered' : 
                        order.status === OrderStatus.PENDING ? 'badge-pending' :
                        'badge-assigned'
                      }`} style={{
                        background: order.orderType === 'MANUAL' 
                          ? 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' // Naranja para MANUAL
                          : 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', // Morado para RESTAURANT
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        <span style={{ color: '#FFF', opacity: 0.9, marginRight: '4px' }}>[#4.5]</span> 
                        {(() => {
                          // Verificar si es viaje en moto por serviceType o por contenido del item
                          const isMotorcycle = order.serviceType === 'MOTORCYCLE_TAXI' || 
                            (order.items && order.items.length > 0 && order.items[0].name && 
                             (order.items[0].name.includes('Motocicleta') || order.items[0].name.includes('Taxi')));
                          
                          // Verificar si es pedido de gasolina/combustible
                          const isGasoline = order.items && order.items.length > 0 && order.items[0].name && 
                            (order.items[0].name.includes('Combustible') || 
                             order.items[0].name.includes('Gasolina') ||
                             order.items[0].name.includes('Magna') ||
                             order.items[0].name.includes('Premium') ||
                             order.items[0].name.includes('Diesel'));
                          
                          // Verificar si es pedido de papelería/artículos
                          const isStationery = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Artículos');
                          
                          // Verificar si es pedido de medicamentos
                          const isMedicine = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Medicamentos');
                          
                          // Verificar si es pedido de cervezas y cigarros
                          const isBeerAndCigarettes = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Cervezas');
                          
                          // Verificar si es pedido de garrafones de agua
                          const isWaterJugs = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Garrafones');
                          
                          // Verificar si es pedido de gas LP
                          const isGasLP = order.items && order.items.length > 0 && order.items[0].name && 
                            (order.items[0].name.includes('Tanque') || 
                             order.items[0].name.includes('Gas LP') ||
                             order.items[0].name.includes('Gas'));
                          
                          // Verificar si es pago de servicios
                          const isServicePayment = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Tipo de pago');
                          
                          // Verificar si es favor o regalos
                          const isFavorOrGift = order.items && order.items.length > 0 && order.items[0].name && 
                            order.items[0].name.includes('Tipo de favor');
                          
                          if (isMotorcycle) return '🏍️ Viaje en moto';
                          if (isGasoline) return '⛽ Pedido de Gasolina';
                          if (isStationery) return '📝 Pedido de Papelería';
                          if (isMedicine) return '💊 Pedido de Medicamentos';
                          if (isBeerAndCigarettes) return '🍺 Pedido de Cerveza y Cigarros';
                          if (isWaterJugs) return '💧 Pedido de Garrafón de Agua';
                          if (isGasLP) return '🔥 Pedido de Gas LP';
                          if (isServicePayment) return '💳 Pago de Servicios';
                          if (isFavorOrGift) return '🎁 Favor o Regalos';
                          
                          // Diferenciar entre pedidos creados por admin vs pedidos del cliente
                          if (order.orderType === 'MANUAL') {
                            // Si el restaurante es "Pedido del cliente", es un pedido creado por el cliente
                            if (order.restaurantName === 'Pedido del cliente') {
                              return '🍔 Favor de comida';
                            }
                            // De lo contrario, es un pedido creado manualmente por el administrador
                            return '👨‍💼 Creado por Administrador';
                          }
                          
                          if (order.orderType === 'RESTAURANT') return '🍔 Favor de comida';
                          return translateOrderStatus(order.status);
                        })()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                      <div style={{ color: '#FFF', fontSize: '0.9375rem' }}>
                        <strong style={{ color: '#f093fb' }}>[#4.1] 🏪 Restaurante:</strong><br/>
                        {order.restaurantName}
                      </div>
                      <div style={{ color: '#FFF', fontSize: '0.9375rem' }}>
                        <strong style={{ color: '#f093fb' }}>[#4.2] 💰 Ganancia:</strong><br/>
                        <span style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700',
                          background: 'var(--success-gradient)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          ${(() => {
                            // DEBUG: Mostrar valores reales
                            console.log('💰 Pedido:', order.orderId, '| deliveryCost:', order.deliveryCost, '| total:', order.total, '| subtotal:', order.subtotal);
                            return order.deliveryCost.toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mostrar productos o descripción del servicio */}
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#f093fb' }}>[#4.3] {order.serviceType === 'MOTORCYCLE_TAXI' ? '🏍️ Servicio de Motocicleta:' : 'Productos:'}</strong>
                      {order.serviceType === 'MOTORCYCLE_TAXI' ? (
                        // Para servicios de motocicleta, mostrar la ruta
                        <div style={{ fontSize: '13px', color: '#FFF', marginTop: '4px', padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                          {order.items && order.items.length > 0 ? (
                            <>
                              {order.items[0].name}
                              {order.distance && <span style={{ marginLeft: '8px', color: '#9CA3AF' }}>({order.distance} km)</span>}
                            </>
                          ) : (
                            'Servicio de transporte en motocicleta'
                          )}
                        </div>
                      ) : (
                        // Para pedidos normales de restaurante, mostrar lista de productos
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {order.items.map((item, index) => (
                            <li key={index} style={{ fontSize: '13px', color: '#FFF' }}>
                              {item.name} x{item.quantity} (${(item.price * item.quantity).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {/* DEBUG: Ver serviceType en consola */}
                    {(() => {
                      console.log('🔍 Pedido:', order.orderId, '| serviceType:', order.serviceType, '| status:', order.status);
                      return null;
                    })()}
                    
                    {/* Mostrar información específica para MOTOCICLETA antes de aceptar */}
                    {order.serviceType === 'MOTORCYCLE_TAXI' && (order.status === OrderStatus.MANUAL_ASSIGNED || order.status === OrderStatus.PENDING) && !order.assignedToDeliveryId ? (
                      <>
                        {/* Información básica para Motocicleta - ANTES DE ACEPTAR */}
                        <div style={{ marginBottom: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                          <div style={{ color: '#bfdbfe', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>🏍️ SERVICIO DE MOTOCICLETA - Pasajero</div>
                          
                          {/* Punto de Partida */}
                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#FFF', fontWeight: '600' }}>
                              <span style={{ color: '#60a5fa', marginRight: '4px' }}>🏁</span> 
                              DESTINO:
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#e5e7eb' }}>
                              {order.deliveryAddress || 'Por definir'}
                            </p>
                          </div>
                          
                          {/* Botón Llamar al Cliente - Gradiente Azul */}
                          <button
                            onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
                            }}
                            style={{
                              width: '100%',
                              padding: '14px 20px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              fontSize: '15px',
                              fontWeight: '600',
                              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                              transition: 'all 0.3s ease',
                              marginTop: '8px'
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>📞</span>
                            <span>Llamar al Cliente</span>
                          </button>
                          
                          {/* Botón Copiar Teléfono */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.customer.phone);
                              alert('✅ Número copiado: ' + order.customer.phone);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(147, 51, 234, 0.3)';
                            }}
                            style={{
                              width: '100%',
                              padding: '14px 20px',
                              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              fontSize: '15px',
                              fontWeight: '600',
                              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.3)',
                              transition: 'all 0.3s ease',
                              marginTop: '8px'
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>📋</span>
                            <span>Copiar Número de Teléfono</span>
                          </button>
                        </div>
                      </>
                    ) : order.status !== OrderStatus.MANUAL_ASSIGNED || order.assignedToDeliveryId ? (
                      <>
                    <div style={{ marginBottom: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ color: '#a8edea', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>📌 ELEMENTO #1 - INFORMACIÓN BÁSICA</div>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong style={{ color: '#f093fb' }}>[#1.1]</strong> Restaurante: {order.restaurantName}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong style={{ color: '#f093fb' }}>[#1.2]</strong> Cliente: {order.customer.name}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong style={{ color: '#f093fb' }}>[#1.3]</strong> Teléfono: {order.customer.phone}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong style={{ color: '#f093fb' }}>[#1.4]</strong> Dirección: {order.deliveryAddress}</p>
                    </div>
                        
                        {/* Botones adicionales después de aceptar el pedido */}
                        {(order.status !== OrderStatus.MANUAL_ASSIGNED || order.assignedToDeliveryId) && (
                          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Botón Llamar al Cliente - Gradiente Azul */}
                            <button
                              onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(33, 150, 243, 0.3)';
                              }}
                              style={{
                                padding: '14px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#2.1</span>
                              <span style={{ fontSize: '18px' }}>📞</span>
                              <span>Llamar al Cliente</span>
                            </button>
                            
                            {/* Botón Ubicación del Cliente - Gradiente Verde */}
                            {order.customerUrl && order.customerUrl.trim() !== '' && (
                              <button
                                onClick={() => {
                             const googleMapsUrl = `https://www.google.com/maps?q=${order.customerLocation?.latitude || 0},${order.customerLocation?.longitude || 0}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(76, 175, 80, 0.3)';
                                }}
                                style={{
                                  padding: '14px 20px',
                                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '16px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '10px',
                                  fontSize: '15px',
                                  fontWeight: '600',
                                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                                  transition: 'all 0.3s ease',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#2.2</span>
                                <span style={{ fontSize: '18px' }}>📍</span>
                                <span>Ubicación del Cliente</span>
                              </button>
                            )}
                            
                            {/* Botón Dirección del Cliente - Gradiente Naranja */}
                            <button
                              onClick={() => {
                                console.log('📍 [BOTÓN] Click en Dirección del Cliente');
                                const address = encodeURIComponent(order.customer.address || '');
                                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 152, 0, 0.3)';
                              }}
                              style={{
                                padding: '14px 20px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#2.3</span>
                              <span style={{ fontSize: '18px' }}>📍</span>
                              <span>Dirección del Cliente</span>
                            </button>
                            
                            {/* Botón Copiar Teléfono - Gradiente Violeta */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.customer.phone);
                                // Mostrar notificación más elegante
                                const notification = document.createElement('div');
                                notification.style.cssText = `
                                  position: fixed;
                                  top: 20px;
                                  right: 20px;
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white;
                                  padding: 16px 24px;
                                  border-radius: 12px;
                                  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
                                  z-index: 10000;
                                  animation: slideIn 0.3s ease;
                                  font-weight: 600;
                                `;
                                notification.innerHTML = '✅ ¡Teléfono copiado!';
                                document.body.appendChild(notification);
                                setTimeout(() => {
                                  notification.style.animation = 'slideOut 0.3s ease';
                                  setTimeout(() => notification.remove(), 300);
                                }, 2000);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(156, 39, 176, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(156, 39, 176, 0.3)';
                              }}
                              style={{
                                padding: '14px 20px',
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                color: '#333',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                boxShadow: '0 4px 14px rgba(156, 39, 176, 0.3)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#2.4</span>
                              <span style={{ fontSize: '18px' }}>📋</span>
                              <span>Copiar Número de Teléfono</span>
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
                        <span style={{ color: '#f093fb', fontWeight: '600' }}>[#4.4]</span> Toca "Aceptar Pedido" para ver información de contacto y dirección
                      </p>
                    )}
                    
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Botón Aceptar Pedido - Gradiente Verde */}
                      {order.status === OrderStatus.MANUAL_ASSIGNED && !order.assignedToDeliveryId && (
                        <button
                          onClick={() => handleAcceptOrder(order)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(76, 175, 80, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#3.1</span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Aceptar Pedido</span>
                          </span>
                        </button>
                      )}
                      
                      {/* Botones específicos para PEDIDOS DE MOTOCICLETA (servicio de pasajeros) */}
                      {order.serviceType === 'MOTORCYCLE_TAXI' && order.status === OrderStatus.MANUAL_ASSIGNED && !order.assignedToDeliveryId && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                          <p style={{ margin: '0 0 12px 0', color: '#1e40af', fontWeight: 'bold', fontSize: '14px' }}>
                            🏍️ SERVICIO DE MOTOCICLETA - Pasajero
                          </p>
                          <button
                            onClick={() => handleAcceptOrder(order)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
                            }}
                            style={{
                              padding: '16px 24px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              width: '100%',
                              fontSize: '16px',
                              fontWeight: '700',
                              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#3.1-MOTO</span>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>🏍️</span>
                              <span>Aceptar Viaje de Motocicleta</span>
                            </span>
                          </button>
                        </div>
                      )}
                      
                      {/* Botón En camino - Texto dinámico según tipo de servicio */}
                      {order.status === OrderStatus.MANUAL_ASSIGNED && order.assignedToDeliveryId === deliveryPerson?.id && (
                        <button
                          onClick={async () => {
                            // Detectar si es MOTOCICLETA: por serviceType O porque viene de la app móvil
                            const isMotorcycle = order.serviceType === 'MOTORCYCLE_TAXI' || 
                                               order.distance !== undefined; // Los pedidos de moto tienen distancia calculada
                            
                            // Pequeño delay para evitar saturar Firebase y la app Android
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            // Determinar siguiente estado según tipo de servicio
                            let nextStatus;
                            if (isMotorcycle) {
                              nextStatus = OrderStatus.ON_THE_WAY_TO_PICKUP;
                            } else if (order.serviceType === 'GASOLINE') {
                              nextStatus = OrderStatus.ON_THE_WAY_TO_STORE;
                            } else {
                              nextStatus = OrderStatus.ON_THE_WAY_TO_STORE;
                            }
                            handleUpdateOrderStatus(order.id, nextStatus);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 152, 0, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {(() => {
                              const isMoto = order.serviceType === 'MOTORCYCLE_TAXI' || order.distance !== undefined;
                              return isMoto ? '#3.2-MOTO' : order.serviceType === 'GASOLINE' ? '#3.2-GAS' : '#3.2';
                            })()}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {(() => {
                                const isMoto = order.serviceType === 'MOTORCYCLE_TAXI' || order.distance !== undefined;
                                return isMoto ? '🏍️' : order.serviceType === 'GASOLINE' ? '⛽' : '🛵';
                              })()}
                            </span>
                            <span>
                              {(() => {
                                const isMoto = order.serviceType === 'MOTORCYCLE_TAXI' || order.distance !== undefined;
                                return isMoto ? '1. En camino por ti' : 
                                       order.serviceType === 'GASOLINE' ? '1. En camino a la gasolinera' : 
                                       '1. En camino al restaurante';
                              })()}
                            </span>
                          </span>
                        </button>
                      )}
                      
                      {/* Botón Ver Detalles del Pedido - FIJO EN TODOS LOS ESTADOS */}
                      {(order.status === OrderStatus.ACCEPTED || 
                        order.status === OrderStatus.ON_THE_WAY_TO_STORE || 
                        order.status === OrderStatus.ARRIVED_AT_STORE || 
                        order.status === OrderStatus.PICKING_UP_ORDER || 
                        order.status === OrderStatus.ON_THE_WAY_TO_CUSTOMER) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Botón En camino al restaurante (solo si está ACCEPTED) */}
                          {order.status === OrderStatus.ACCEPTED && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 152, 0, 0.3)';
                            }}
                            style={{
                              padding: '16px 24px',
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              width: '100%',
                              fontSize: '16px',
                              fontWeight: '700',
                              boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>🛵</span>
                              <span>1. En camino al restaurante</span>
                            </span>
                          </button>
                          )}
                          
                          {/* Botón Ver Detalles - Gradiente Azul */}
                          <button
                            onClick={() => {
                              // Crear modal más elegante para detalles
                              const modal = document.createElement('div');
                              modal.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0,0,0,0.7);
                                backdrop-filter: blur(5px);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                z-index: 10000;
                                animation: fadeIn 0.3s ease;
                              `;
                              
                              modal.innerHTML = `
                                <div style="
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  padding: 32px;
                                  border-radius: 24px;
                                  max-width: 90%;
                                  max-height: 90%;
                                  overflow-y: auto;
                                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                                  animation: slideUp 0.3s ease;
                                ">
                                  <h3 style="margin: 0 0 24px 0; color: white; font-size: 24px; text-align: center;">
                                    📋 Detalles del Pedido
                                  </h3>
                                  
                                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 16px; margin-bottom: 16px;">
                                    <h4 style="margin: 0 0 12px 0; color: #a8edea; font-size: 16px;">👤 Información del Cliente</h4>
                                    <p style="margin: 8px 0; color: white; line-height: 1.6;"><strong>Nombre:</strong> ${order.customer.name}</p>
                                    <p style="margin: 8px 0; color: white; line-height: 1.6;"><strong>Teléfono:</strong> ${order.customer.phone}</p>
                                    <p style="margin: 8px 0; color: white; line-height: 1.6;"><strong>Dirección:</strong> ${order.deliveryAddress}</p>
                                    ${order.deliveryReferences ? `<p style="margin: 8px 0; color: #fed6e3; line-height: 1.6;"><strong>Referencias:</strong> ${order.deliveryReferences}</p>` : ''}
                                  </div>
                                  
                                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 16px; margin-bottom: 16px;">
                                    <h4 style="margin: 0 0 12px 0; color: #f093fb; font-size: 16px;">🛒 Productos</h4>
                                    <ul style="margin: 8px 0; padding-left: 20px; color: white; line-height: 1.8;">
                                      ${order.items.map(item => `<li>${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})</li>`).join('')}
                                    </ul>
                                  </div>
                                  
                                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 16px;">
                                    <h4 style="margin: 0 0 12px 0; color: #38ef7d; font-size: 16px;">💰 Información Financiera</h4>
                                    <p style="margin: 8px 0; color: white; line-height: 1.6;"><strong>Restaurante:</strong> $${order.subtotal.toFixed(2)}</p>
                                    <p style="margin: 8px 0; color: white; line-height: 1.6;"><strong>Entrega:</strong> $${order.deliveryCost.toFixed(2)}</p>
                                    <p style="margin: 8px 0; color: #38ef7d; line-height: 1.6; font-size: 18px; font-weight: bold;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
                                  </div>
                                  
                                  <div style="margin-top: 24px; text-align: center;">
                                    <button onclick="const modal = this.closest(&quot;div[style*='max-width']&quot;); if (modal && modal.parentElement) { modal.parentElement.remove(); }" style="
                                      padding: 14px 32px;
                                      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                                      color: white;
                                      border: none;
                                      border-radius: 12px;
                                      cursor: pointer;
                                      font-size: 16px;
                                      font-weight: 600;
                                      box-shadow: 0 4px 14px rgba(56, 239, 125, 0.3);
                                    ">Cerrar</button>
                                  </div>
                                </div>
                              `;
                              
                              document.body.appendChild(modal);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(33, 150, 243, 0.3)';
                            }}
                            style={{
                              padding: '16px 24px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              width: '100%',
                              fontSize: '16px',
                              fontWeight: '700',
                              boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>#3.3</span>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>📋</span>
                              <span>Ver Detalles del Pedido</span>
                            </span>
                          </button>
                        </div>
                      )}
                      
                      {/* Botón 2: Llegué - Texto dinámico según tipo de servicio - Gradiente Azul */}
                      {(order.status === OrderStatus.ON_THE_WAY_TO_STORE || order.status === OrderStatus.ON_THE_WAY_TO_PICKUP) && (
                        <button
                          onClick={async () => {
                            let nextStatus;
                            if (order.serviceType === 'MOTORCYCLE_TAXI') {
                              nextStatus = OrderStatus.ARRIVED_AT_PICKUP;
                            } else if (order.serviceType === 'GASOLINE') {
                              nextStatus = OrderStatus.ARRIVED_AT_STORE;
                            } else {
                              nextStatus = OrderStatus.ARRIVED_AT_STORE;
                            }
                            
                            // Pequeño delay para evitar saturar Firebase y la app Android
                            await new Promise(resolve => setTimeout(resolve, 300));
                            handleUpdateOrderStatus(order.id, nextStatus);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(33, 150, 243, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {order.serviceType === 'MOTORCYCLE_TAXI' ? '#3.4-MOTO' : order.serviceType === 'GASOLINE' ? '#3.4-GAS' : '#3.4'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '🎯' : order.serviceType === 'GASOLINE' ? '⛽' : '🏪'}
                            </span>
                            <span>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '2. Repartidor llegó' : 
                               order.serviceType === 'GASOLINE' ? '2. Llegué a la gasolinera' : 
                               '2. Llegué al restaurante'}
                            </span>
                          </span>
                        </button>
                      )}
                      
                      {/* Botón 3: Recogiendo pedido - Texto dinámico según servicio - Gradiente Violeta */}
                      {order.status === OrderStatus.ARRIVED_AT_STORE && order.serviceType !== 'MOTORCYCLE_TAXI' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.PICKING_UP_ORDER)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(156, 39, 176, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(156, 39, 176, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(156, 39, 176, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {order.serviceType === 'GASOLINE' ? '#3.5-GAS' : '#3.5'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {order.serviceType === 'GASOLINE' ? '⛽' : '🎒'}
                            </span>
                            <span>
                              {order.serviceType === 'GASOLINE' ? '3. Repartidor con tu gasolina' : '3. Repartidor con alimentos en mochila'}
                            </span>
                          </span>
                        </button>
                      )}
                      
                      {/* Botón 4: En camino - Texto dinámico según servicio - Gradiente Cian */}
                      {(order.status === OrderStatus.PICKING_UP_ORDER || order.status === OrderStatus.ARRIVED_AT_PICKUP) && (
                        <button
                          onClick={async () => {
                            // Pequeño delay para evitar saturar Firebase y la app Android
                            await new Promise(resolve => setTimeout(resolve, 300));
                            handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_DESTINATION);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 198, 255, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 198, 255, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(0, 198, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {order.serviceType === 'MOTORCYCLE_TAXI' ? '#3.6-MOTO' : order.serviceType === 'GASOLINE' ? '#3.6-GAS' : '#3.6'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '🛣️' : order.serviceType === 'GASOLINE' ? '⛽' : '🚴'}
                            </span>
                            <span>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '3. En camino al destino' : 
                               order.serviceType === 'GASOLINE' ? '4. En camino a tu domicilio' : 
                               '4. En camino al cliente'}
                            </span>
                          </span>
                        </button>
                      )}
                      
                      {/* Botón 5: Entrega/Finalización - Dinámico según servicio - Gradiente Rojo */}
                      {order.status === OrderStatus.ON_THE_WAY_TO_DESTINATION && (
                        <button
                          onClick={async () => {
                            // Detectar si es MOTOCICLETA: por serviceType O por usar estados específicos
                            const isMotorcycle = order.serviceType === 'MOTORCYCLE_TAXI' || 
                                                 order.status === OrderStatus.ON_THE_WAY_TO_DESTINATION;
                            
                            console.log('🔍 [DEBUG] serviceType:', order.serviceType);
                            console.log('🔍 [DEBUG] status:', order.status);
                            console.log('🔍 [DEBUG] ¿Es MOTOCICLETA?:', isMotorcycle);
                            
                            // Pequeño delay para evitar saturar Firebase y la app Android
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            // Para MOTOCICLETA: finalizar directamente sin código
                            if (isMotorcycle) {
                              console.log('✅ [MOTO] Finalizando SIN código');
                              handleUpdateOrderStatus(order.id, OrderStatus.DELIVERED);
                            } else {
                              // Para otros servicios: pedir código
                              console.log('⚠️ [OTRO] Pidiendo código de confirmación');
                              handleDeliveredWithCode(order.id);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(244, 67, 54, 0.3)';
                          }}
                          style={{
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: '0 4px 14px rgba(244, 67, 54, 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {order.serviceType === 'MOTORCYCLE_TAXI' ? '#3.7-MOTO' : order.serviceType === 'GASOLINE' ? '#3.7-GAS' : '#3.7'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '🎯' : order.serviceType === 'GASOLINE' ? '⛽' : '✅'}
                            </span>
                            <span>
                              {order.serviceType === 'MOTORCYCLE_TAXI' ? '4. Finalizar viaje' : 
                               order.serviceType === 'GASOLINE' ? '5. Gasolina entregada' : 
                               '5. Pedido entregado'}
                            </span>
                          </span>
                        </button>
                      )}
                      
                      {/* Estado final: Pedido entregado - Badge elegante */}
                      {order.status === OrderStatus.DELIVERED && (
                        <div style={{
                          padding: '18px 24px',
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          color: 'white',
                          borderRadius: '16px',
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: '16px',
                          boxShadow: '0 4px 14px rgba(56, 239, 125, 0.3)',
                          animation: 'slideUp 0.3s ease'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>🎉</span>
                            <span>¡Pedido Entregado Exitosamente!</span>
                          </span>
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
                    
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong>Restaurante:</strong> {order.restaurantName}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong>Cliente:</strong> {order.customer.name}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong>Ganancia:</strong> ${order.deliveryCost.toFixed(2)}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#FFF' }}><strong>Fecha:</strong> {new Date(order.deliveredAt || order.createdAt).toLocaleString()}</p>
                    
                    {/* Mostrar productos */}
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#FFF' }}>Productos:</strong>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {order.items.map((item, index) => (
                          <li key={index} style={{ fontSize: '13px', color: '#FFF' }}>
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
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              zIndex: 101
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/chat-clientes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/chat-clientes' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬👤</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Chat Clientes</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

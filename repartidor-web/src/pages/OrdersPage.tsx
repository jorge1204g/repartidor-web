import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import OrderService from '../services/OrderService';
import { Order, OrderStatus } from '../types/Order';
import { DeliveryPerson } from '../types/DeliveryPerson';
import { useMessage } from '../contexts/MessageContext';

const OrdersPage: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  
  // Mensajes no leídos
  const { unreadCount } = useMessage();

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

      {/* Lista de pedidos activos - NUEVO DISEÑO */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px' }}>
          {orders.filter(order => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No tienes pedidos activos
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.filter(order => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED).map(order => (
                <div key={order.id} style={{
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  {/* Encabezado del Pedido - Con Colores por Tipo */}
                  <div style={{
                    background: order.orderType === 'RESTAURANT' 
                      ? 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)'
                      : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                    padding: '20px 24px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                        Pedido #{order.orderId || order.id}
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>
                        🏪 {order.restaurantName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Badge del estado con nuevo diseño */}
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backgroundColor: 'white',
                        color: order.status === OrderStatus.DELIVERED ? '#2e7d32' : 
                               order.status === OrderStatus.PENDING ? '#ef6c00' :
                               '#1565c0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        {translateOrderStatus(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cuerpo del Pedido */}
                  <div style={{ padding: '24px' }}>
                    {/* Información Financiera - Destacada */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#FFF', fontWeight: '600' }}>
                          💰 GANANCIA
                        </p>
                        <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                          ${order.deliveryCost.toFixed(2)}
                        </p>
                      </div>
                      
                      <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#FFF', fontWeight: '600' }}>
                          📦 MONTO RESTAURANTE
                        </p>
                        <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                          ${order.subtotal.toFixed(2)}
                        </p>
                      </div>
                      
                      <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#FFF', fontWeight: '600' }}>
                          💵 MÉTODO DE PAGO
                        </p>
                        <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#FFF' }}>
                          {order.paymentMethod === 'cash' ? '🪙 Efectivo' : '💳 Transferencia'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Productos */}
                    {order.items && order.items.length > 0 && (
                      <div style={{
                        backgroundColor: '#fff3e0',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFF', fontWeight: 'bold' }}>
                          🛒 PRODUCTOS DEL PEDIDO
                        </h4>
                        <ul style={{ margin: '0', paddingLeft: '20px' }}>
                          {order.items.map((item, index) => (
                            <li key={index} style={{ 
                              fontSize: '14px', 
                              color: '#FFF',
                              marginBottom: '6px',
                              paddingBottom: '6px',
                              borderBottom: '1px dashed #ffb74d'
                            }}>
                              <strong>{item.name}</strong> x{item.quantity} - 
                              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Dirección del Cliente */}
                    <div style={{
                      backgroundColor: '#e3f2fd',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFF', fontWeight: 'bold' }}>
                        📍 DIRECCIÓN DE ENTREGA
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#FFF' }}>
                        <strong>Dirección:</strong> {order.deliveryAddress}
                      </p>
                      {order.deliveryReferences && (
                        <p style={{ margin: '0', fontSize: '13px', color: '#FFF', fontStyle: 'italic' }}>
                          📝 Referencias: {order.deliveryReferences}
                        </p>
                      )}
                    </div>
                    
                    {/* Coordenadas del Cliente - NUEVO APARTADO */}
                    {(order.customerLocation?.latitude && order.customerLocation?.longitude) ? (
                      <div style={{
                        backgroundColor: '#fff3e0',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFF', fontWeight: 'bold' }}>
                          🗺️ COORDENADAS DEL CLIENTE
                        </h4>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <p style={{ margin: '0', fontSize: '13px', color: '#666', fontWeight: '600' }}>
                              Latitud: <span style={{ color: '#FF9800', fontSize: '16px' }}>{order.customerLocation.latitude.toFixed(6)}</span>
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666', fontWeight: '600' }}>
                              Longitud: <span style={{ color: '#FF9800', fontSize: '16px' }}>{order.customerLocation.longitude.toFixed(6)}</span>
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${order.customerLocation.latitude},${order.customerLocation.longitude}`;
                              window.open(mapsUrl, '_blank');
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                            }}
                          >
                            🗺️ Abrir en Google Maps
                          </button>
                          
                          <p style={{
                            margin: '0',
                            fontSize: '11px',
                            color: '#FFF',
                            opacity: 0.8,
                            textAlign: 'center',
                            fontStyle: 'italic'
                          }}>
                            Toca el botón para ver la ubicación exacta en Maps
                          </p>
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Información de Contacto - Mostrar siempre para PENDING y MANUAL_ASSIGNED con asignación */}
                    {order.status === OrderStatus.PENDING || order.status === OrderStatus.ACCEPTED || (order.status === OrderStatus.MANUAL_ASSIGNED && order.assignedToDeliveryId) ? (
                      <div style={{
                        backgroundColor: '#e8f5e9',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFF', fontWeight: 'bold' }}>
                          👤 INFORMACIÓN DEL CLIENTE
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#FFF' }}>
                          <strong>Nombre:</strong> {order.customer.name}
                        </p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#FFF' }}>
                          <strong>Teléfono:</strong> {order.customer.phone}
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#ffebee',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '2px dashed #f44336',
                        textAlign: 'center'
                      }}>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '14px', 
                          color: '#c62828',
                          fontWeight: '600'
                        }}>
                          🔒 Toca "Aceptar Pedido" para ver información de contacto y dirección
                        </p>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div style={{ marginTop: '20px' }}>
                      {/* Botón para aceptar pedidos PENDING o MANUAL_ASSIGNED sin asignar */}
                      {(order.status === OrderStatus.PENDING || order.status === OrderStatus.MANUAL_ASSIGNED) && !order.assignedToDeliveryId && (
                        <button
                          onClick={async () => {
                            if (!deliveryPerson) return;
                            const confirmacion = window.confirm('¿Estás seguro de que quieres aceptar este pedido?');
                            if (!confirmacion) return;
                            
                            const result = await OrderService.acceptOrder(order.id, deliveryPerson.id, deliveryPerson.name);
                            if (result.success) {
                              alert('✅ Pedido aceptado exitosamente');
                            } else {
                              setError(result.message);
                            }
                          }}
                          style={{
                            padding: '14px 24px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                          }}
                        >
                          ✅ Aceptar Pedido
                        </button>
                      )}
                      
                      {/* Botón para rechazar/cancelar asignación (solo si está asignado a este repartidor) */}
                      {order.assignedToDeliveryId === deliveryPerson?.id && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                        <button
                          onClick={async () => {
                            if (!window.confirm('¿Seguro que quieres cancelar este pedido?')) return;
                            const result = await OrderService.updateOrderStatus(order.id, OrderStatus.CANCELLED);
                            if (!result.success) {
                              setError(result.message);
                            }
                          }}
                          style={{
                            padding: '14px 24px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginTop: '12px'
                          }}
                        >
                          ❌ Cancelar Pedido
                        </button>
                      )}
                      
                      {/* Más botones de acciones según el estado */}
                      {order.status === OrderStatus.MANUAL_ASSIGNED && order.assignedToDeliveryId === deliveryPerson?.id && (
                        <button
                          onClick={async () => {
                            const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE);
                            if (!result.success) {
                              setError(result.message);
                            }
                          }}
                          style={{
                            padding: '14px 24px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          1. En camino al restaurante
                        </button>
                      )}
                      
                      {order.status === OrderStatus.ACCEPTED && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button
                            onClick={async () => {
                              const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE);
                              if (!result.success) {
                                setError(result.message);
                              }
                            }}
                            style={{
                              padding: '14px 24px',
                              backgroundColor: '#FF9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              width: '100%',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            1. En camino al restaurante
                          </button>
                          <button
                            onClick={() => {
                              // Crear un diálogo modal más completo para mostrar todos los detalles del pedido
                              const modal = document.createElement('div');
                              modal.style.position = 'fixed';
                              modal.style.top = '0';
                              modal.style.left = '0';
                              modal.style.width = '100%';
                              modal.style.height = '100%';
                              modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                              modal.style.display = 'flex';
                              modal.style.justifyContent = 'center';
                              modal.style.alignItems = 'center';
                              modal.style.zIndex = '1000';
                              
                              modal.innerHTML = `
                                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 90%; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                  <h3 style="margin-top: 0; color: #333;">Detalles del Pedido</h3>
                                  
                                  <h4 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Datos del Cliente</h4>
                                  <p><strong>Nombre del Cliente:</strong> ${order.customer.name}</p>
                                  <p><strong>Dirección del Cliente:</strong> ${order.deliveryAddress}</p>
                                  <p><strong>Teléfono del Cliente:</strong> ${order.customer.phone}</p>
                                  ${order.deliveryReferences ? `<p><strong>Referencias del Domicilio:</strong> ${order.deliveryReferences}</p>` : ''}
                                  
                                  <h4 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">🗺️ Coordenadas GPS</h4>
                                  <p><strong>Latitud:</strong> ${order.customerLocation?.latitude?.toFixed(6) || 'N/A'}</p>
                                  <p><strong>Longitud:</strong> ${order.customerLocation?.longitude?.toFixed(6) || 'N/A'}</p>
                                  <p style="margin-top: 8px;">
                                    <a href="https://www.google.com/maps/search/?api=1&query=${order.customerLocation?.latitude || ''},${order.customerLocation?.longitude || ''}" 
                                       target="_blank" 
                                       style="color: #2196F3; text-decoration: none; font-weight: bold;">
                                       🗺️ Abrir en Google Maps →
                                    </a>
                                  </p>
                                  
                                  <h4 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Productos del Pedido</h4>
                                  <ul>
                                    ${order.items.map(item => `<li>${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})</li>`).join('')}
                                  </ul>
                                  
                                  <h4 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalles Financieros</h4>
                                  <p><strong>Monto en Restaurante:</strong> $${order.subtotal.toFixed(2)}</p>
                                  <p><strong>Tarifa de Entrega:</strong> $${order.deliveryCost.toFixed(2)}</p>
                                  <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                                  
                                  <h4 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalles Adicionales</h4>
                                  <p><strong>Método de Pago:</strong> ${order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}</p>
                                  
                                  <div style="margin-top: 20px; text-align: center; display: flex; gap: 10px; justify-content: center;">
                                   <button onclick="const modal = this.closest(&quot;div[style*='position: fixed']&quot;); if (modal) { document.body.removeChild(modal); window.location.href = '/inicio'; }" style="
                                     padding: 10px 20px;
                                     background-color: #4CAF50;
                                  color: white;
                                     border: none;
                                     border-radius: 4px;
                                     cursor: pointer;
                                     font-weight: bold;
                                   ">🏠 Inicio</button>
                                   
                                   <button onclick="const modal = this.closest(&quot;div[style*='position: fixed']&quot;); if (modal) { document.body.removeChild(modal); }" style="
                                     padding: 10px 20px;
                                     background-color: #f44336;
                                  color: white;
                                     border: none;
                                     border-radius: 4px;
                                     cursor: pointer;
                                   ">Cerrar</button>
                                 </div>
                                 
                                 <div style="margin-top: 15px; text-align: center;">
                                   <a href="/chat-cliente?clientId=${order.customer.id || ''}&clientName=${encodeURIComponent(order.customer.name)}&orderId=${order.orderCode}" 
                                      style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                     💬 Chatear con el cliente
                                   </a>
                                 </div>
                                 
                                </div>
                              `;
                              
                              // Agregar evento para cerrar el modal al hacer clic fuera
                              modal.onclick = function(event) {
                                if (event.target === modal) {
                                  document.body.removeChild(modal);
                                }
                              };
                              
                              document.body.appendChild(modal);
                            }}
                            style={{
                              padding: '14px 24px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              width: '100%',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            📋 Ver Detalles Completos
                          </button>
                        </div>
                      )}
                      
                      {/* Resto de botones de estados */}
                      {order.status === OrderStatus.ON_THE_WAY_TO_STORE && (
                        <button
                          onClick={async () => {
                            const result = await OrderService.updateOrderStatus(order.id, OrderStatus.ARRIVED_AT_STORE);
                            if (!result.success) {
                              setError(result.message);
                            }
                          }}
                          style={{
                            padding: '14px 24px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
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
                            padding: '14px 24px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
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
                            padding: '14px 24px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
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
                            padding: '14px 24px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          5. Pedido entregado
                        </button>
                      )}
                      
                      {order.status === OrderStatus.DELIVERED && (
                        <div style={{
                          padding: '14px 24px',
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          border: '1px solid #c8e6c9',
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          ✅ Pedido entregado
                        </div>
                      )}
                    </div>
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

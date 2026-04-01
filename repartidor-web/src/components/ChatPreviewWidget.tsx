import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import AudioNotificationService from '../utils/AudioNotificationService';

import OrderService from '../services/OrderService';
import { Order, OrderStatus } from '../types/Order';

interface ChatPreview {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  orderId: string;
  orderCode: string;
  isActive: boolean; // true si el pedido está en curso
}

const ChatPreviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<ChatPreview[]>([]);
  const [activeOrderIds, setActiveOrderIds] = useState<Set<string>>(new Set());
  const [totalUnread, setTotalUnread] = useState(0);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (!deliveryId) return;

    // Escuchar pedidos activos del repartidor
    const unsubscribeOrders = OrderService.listenToAcceptedOrders(deliveryId, (orders) => {
      const activeIds = new Set<string>();
      console.log('\n📦 PEDIDOS ACTIVOS RECIBIDOS:', orders.length);
      orders.forEach(order => {
        console.log('  - Pedido ID:', order.id, '| Status:', order.status);
        // Solo pedidos NO entregados y NO cancelados
        if (order.status !== OrderStatus.DELIVERED && 
            order.status !== OrderStatus.CANCELLED) {
          activeIds.add(order.id);
        }
      });
      setActiveOrderIds(activeIds);
      console.log('✅ TOTAL DE PEDIDOS ACTIVOS PARA FILTRAR MENSAJES:', activeIds.size);
    });

    return () => {
      unsubscribeOrders();
    };
  }, []);

  useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (!deliveryId) return;

    // Escuchar mensajes en tiempo real
    const unsubscribe = MessageService.observeLastMessages(deliveryId, (messages) => {
      console.log('\n🔍 MENSAJES RECIBIDOS EN EL WIDGET:', messages.length);
      console.log('MENSAJES:', JSON.stringify(messages, null, 2));
      
      if (messages.length === 0) {
        console.log('⚠️ NO HAY MENSAJES EN LA BASE DE DATOS');
      }
      
      // Filtrar conversaciones (incluir admin y clientes)
      const clientPreviews: ChatPreview[] = [];
      const conversationMap = new Map<string, ChatPreview>();

      for (const msg of messages) {
        console.log('\n--- PROCESANDO MENSAJE ---');
        console.log('Mensaje ID:', msg.id);
        console.log('Sender:', msg.senderId, '->', msg.senderName);
        console.log('Receiver:', msg.receiverId, '->', msg.receiverName);
        console.log('Order ID del mensaje:', msg.orderId);
        console.log('¿Es para este repartidor?', msg.receiverId === deliveryId);
        console.log('¿Está leído?', msg.isRead);
        
        // INCLUIR mensajes del administrador SIN FILTRAR POR PEDIDO
        const isAdminMessage = msg.senderId === 'admin' || msg.senderId.startsWith('admin');
        
        const otherId = msg.senderId === deliveryId ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === deliveryId ? msg.receiverName : msg.senderName;
        const orderId = msg.orderId || '';
          
        // Verificar si este mensaje es de un pedido ACTIVO (solo para clientes, no admin)
        let shouldInclude = false;
        
        if (isAdminMessage) {
          // Mensajes del admin SIEMPRE se muestran
          shouldInclude = true;
          console.log('✅ MENSAJE DEL ADMIN - Se incluye siempre');
        } else {
          // Mensajes de clientes - VERIFICAR SI TIENE ORDER ID
          const orderId = msg.orderId || '';
          
          if (!orderId || orderId.trim() === '') {
            // Si NO tiene orderId, mostrarlo de todas formas (pedido antiguo o sistema legacy)
            shouldInclude = true;
            console.log('✅ MENSAJE DE CLIENTE SIN ORDER ID - Se incluye (compatibilidad)');
          } else {
            // Si tiene orderId, verificar si está activo
            const isActive = activeOrderIds.has(orderId);
            console.log('¿Pedido activo?', isActive);
            console.log('Active Order IDs:', Array.from(activeOrderIds));
            
            if (isActive) {
              shouldInclude = true;
              console.log('✅ MENSAJE DE CLIENTE - Pedido activo, se incluye');
            } else {
              console.log('⚠️ SALTA este mensaje porque es de cliente pero NO es de pedido activo');
              continue; // Saltar mensajes de clientes con pedidos finalizados
            }
          }
        }
          
        if (!conversationMap.has(otherId)) {
            conversationMap.set(otherId, {
              clientId: otherId,
              clientName: otherName,
              orderId,
              orderCode: orderId,
              lastMessage: msg.message,
              lastMessageTime: msg.timestamp,
              unreadCount: msg.receiverId === deliveryId && !msg.isRead ? 1 : 0,
              isActive: shouldInclude
            });
          } else {
            const existing = conversationMap.get(otherId)!;
            if (msg.timestamp > existing.lastMessageTime) {
              conversationMap.set(otherId, {
                ...existing,
                orderId,
                orderCode: orderId,
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                unreadCount: existing.unreadCount + (msg.receiverId === deliveryId && !msg.isRead ? 1 : 0),
                isActive: shouldInclude
              });
            }
          }
      }

      const previewArray = Array.from(conversationMap.values());
      previewArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      
      // Solo mostrar los 3 más recientes
      setPreviews(previewArray.slice(0, 3));
      
      // Calcular total de no leídos
      const total = previewArray.reduce((sum, p) => sum + p.unreadCount, 0);
      setTotalUnread(total);

      // Notificación sonora si hay mensajes nuevos
      if (total > lastCount && lastCount > 0) {
        AudioNotificationService.playMessageReceivedSound();
      }
      setLastCount(total);
    });

    return () => {
      // Cleanup
    };
  }, [navigate]);

  // No ocultar el widget cuando no hay previews - siempre mostrar
  if (false) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      marginBottom: '1.5rem',
      border: totalUnread > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💬 Mensajes Recientes
          {totalUnread > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {totalUnread}
            </span>
          )}
        </h3>
        <button
          onClick={() => navigate('/chat-clientes')}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Ver todos →
        </button>
      </div>

      {previews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💬</div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '500' }}>
            No hay mensajes recientes
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>
            Cuando tengas chats con clientes, aparecerán aquí
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {previews.map((preview, index) => (
          <button
            key={index}
            onClick={() => navigate(`/chat-cliente?clientId=${preview.clientId}&clientName=${encodeURIComponent(preview.clientName)}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem',
              backgroundColor: preview.unreadCount > 0 ? '#f0fdf4' : '#f9fafb',
              border: preview.unreadCount > 0 ? '1px solid #10b981' : '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: preview.unreadCount > 0 ? '#10b981' : '#9ca3af',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {preview.clientName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <span style={{ 
                  fontWeight: preview.unreadCount > 0 ? 'bold' : 'normal',
                  color: '#1f2937',
                  fontSize: '0.9375rem'
                }}>
                  {preview.clientName}
                </span>
                <span style={{ 
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  flexShrink: 0
                }}>
                  {formatTime(preview.lastMessageTime)}
                </span>
              </div>
              <p style={{ 
                fontSize: '0.875rem',
                color: preview.unreadCount > 0 ? '#059669' : '#6b7280',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {preview.lastMessage}
              </p>
            </div>

            {/* Indicador de no leído */}
            {preview.unreadCount > 0 && (
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                flexShrink: 0
              }} />
            )}
          </button>
        ))}
        </div>
      )}

      {/* Botón Ver Todos */}
      <button
        onClick={() => navigate('/chat-clientes')}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
      >
        Ver todos los chats →
      </button>
    </div>
  );
};

export default ChatPreviewWidget;

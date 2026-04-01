import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import { DeliveryPerson } from '../types/DeliveryPerson';
import AudioNotificationService from '../utils/AudioNotificationService';

interface ChatConversation {
  clientId: string;
  clientName: string;
  orderId: string;
  orderCode: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const initClientList = async () => {
      try {
        const deliveryId = AuthService.getDeliveryId();
        if (!deliveryId) {
          throw new Error('No se encontró el ID de repartidor');
        }

        // Obtener datos del repartidor
        const authResponse = await AuthService.loginWithId(deliveryId);
        if (authResponse.success && authResponse.deliveryPerson) {
          setDeliveryPerson(authResponse.deliveryPerson);
        }

        // Escuchar mensajes en tiempo real
        const unsubscribe = MessageService.observeLastMessages(deliveryId, async (messages) => {
          const conversationMap = new Map<string, ChatConversation>();

          for (const msg of messages) {
            // Solo mostrar conversaciones con clientes (no con admin)
            if (msg.senderId !== 'admin' && !msg.senderId.startsWith('admin')) {
              const clientId = msg.senderId === deliveryId ? msg.receiverId : msg.senderId;
              const clientName = msg.senderId === deliveryId ? msg.receiverName : msg.senderName;
              
              // Buscar si hay un pedido asociado
              const orderId = msg.orderId || '';
              
              // Verificar si ya existe esta conversación
              if (!conversationMap.has(clientId)) {
                conversationMap.set(clientId, {
                  clientId,
                  clientName,
                  orderId,
                  orderCode: orderId,
                  lastMessage: msg.message,
                  lastMessageTime: msg.timestamp,
                  unreadCount: 0
                });
              } else {
                // Actualizar con el mensaje más reciente
                const existing = conversationMap.get(clientId)!;
                if (msg.timestamp > existing.lastMessageTime) {
                  conversationMap.set(clientId, {
                    ...existing,
                    lastMessage: msg.message,
                    lastMessageTime: msg.timestamp,
                    unreadCount: existing.unreadCount + (msg.receiverId === deliveryId && !msg.isRead ? 1 : 0)
                  });
                }
              }
            }
          }

          // Convertir map a array y ordenar por fecha
          const convArray = Array.from(conversationMap.values());
          convArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
          
          // Detectar si hay mensajes nuevos para notificación sonora
          const totalMessages = convArray.reduce((sum, conv) => sum + conv.unreadCount, 0);
          if (totalMessages > lastMessageCount && lastMessageCount > 0) {
            // Hay mensajes nuevos - reproducir sonido
            AudioNotificationService.playMessageReceivedSound();
          }
          setLastMessageCount(totalMessages);
          
          setConversations(convArray);
          setLoading(false);
        });

        return () => {
          // Cleanup si es necesario
        };
      } catch (err: any) {
        console.error('Error cargando lista de clientes:', err);
        setLoading(false);
      }
    };

    initClientList();
  }, [navigate]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = MessageService.searchConversationsByClientName(
        conversations,
        searchTerm
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

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

  const handleArchiveConversation = async (e: React.MouseEvent, clientId: string, orderId: string) => {
    e.stopPropagation();
    
    if (confirm('¿Archivar esta conversación? Los pedidos finalizados se ocultarán.')) {
      const deliveryId = AuthService.getDeliveryId();
      if (deliveryId) {
        await MessageService.archiveConversation(deliveryId, clientId, orderId);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Cargando chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Regresar
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              💬 Chats con Clientes
            </h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {filteredConversations.length} {filteredConversations.length === 1 ? 'cliente' : 'clientes'}
            </p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Lista de conversaciones */}
      <div style={{ padding: '1rem' }}>
        {filteredConversations.length === 0 ? (
          searchTerm ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No se encontraron resultados
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                Intenta con otro nombre o número de pedido
              </p>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No hay conversaciones
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                Cuando chatees con un cliente, aparecerá aquí
              </p>
            </div>
          )
        ) : (
          filteredConversations.map((conv, index) => (
            <div
              key={conv.clientId}
              onClick={() => {
                navigate(`/chat-cliente?clientId=${conv.clientId}&clientName=${encodeURIComponent(conv.clientName)}&orderId=${conv.orderCode}`);
              }}
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              {/* Avatar del cliente */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {conv.clientName.charAt(0).toUpperCase()}
              </div>

              {/* Información de la conversación */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {conv.clientName}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {conv.lastMessage}
                </p>
                
                {conv.orderCode && (
                  <p style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    📦 Pedido: {conv.orderCode}
                  </p>
                )}
              </div>

              {/* Contador de mensajes no leídos */}
              {conv.unreadCount > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.25rem'
                  }}>
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                  
                  {/* Botón archivar */}
                  <button
                    onClick={(e) => handleArchiveConversation(e, conv.clientId, conv.orderCode)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      padding: '0.25rem',
                      opacity: 0.7
                    }}
                    title="Archivar conversación"
                  >
                    🗄️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientListPage;

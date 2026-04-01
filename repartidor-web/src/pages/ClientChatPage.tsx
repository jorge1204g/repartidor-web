import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import { DeliveryPerson } from '../types/DeliveryPerson';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  messageType: string;
  orderId?: string;
  imageUrl?: string;
}

const ClientChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [sendingImage, setSendingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Obtener datos del repartidor actual
    const deliveryId = AuthService.getDeliveryId();
    
    if (deliveryId) {
      AuthService.loginWithId(deliveryId).then(response => {
        if (response.success && response.deliveryPerson) {
          setDeliveryPerson(response.deliveryPerson);
        }
      });
    }

    // Obtener datos del cliente desde los parámetros
    const params = new URLSearchParams(location.search);
    const cId = params.get('clientId');
    const cName = params.get('clientName');
    const orderCode = params.get('orderId');

    if (cId && cName) {
      setClientId(cId);
      setClientName(cName);
    }

    if (orderCode) {
      setOrderId(orderCode);
    }
  }, [navigate, location]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    const deliveryId = AuthService.getDeliveryId();
    
    if (deliveryId && clientId) {
      const unsubscribe = MessageService.observeMessagesBetweenUsers(
        deliveryId,
        clientId,
        async (receivedMessages) => {
          // Transformar los mensajes para que tengan el formato esperado por la UI
          const transformedMessages = receivedMessages.map(msg => ({
            ...msg,
            sender: msg.senderId === clientId ? clientName : (deliveryPerson?.name || 'Tú'),
            isOwn: msg.senderId === deliveryId
          }));
          setMessages(transformedMessages as ChatMessage[]);
          
          // Marcar TODOS los mensajes como leídos cuando abre el chat
          await MessageService.markMessagesAsRead(clientId, deliveryId!);
          
          // Scroll al final cuando llegan nuevos mensajes
          setTimeout(() => scrollToBottom(), 100);
        }
      );

      return () => {
        // Cleanup si es necesario
      };
    }
  }, [deliveryPerson, clientId, clientName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !deliveryPerson || !clientId) return;

    setLoading(true);

    try {
      await MessageService.sendMessage(
        deliveryPerson.id,
        deliveryPerson.name,
        clientId,
        clientName,
        newMessage.trim(),
        'TEXT',
        orderId
      );
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    setSendingImage(true);

    // Convertir imagen a Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result as string;
      
      MessageService.sendImage(
        deliveryPerson!.id,
        deliveryPerson!.name,
        clientId,
        clientName,
        imageBase64,
        orderId
      )
      .then(() => {
        console.log('✅ Imagen enviada correctamente');
        scrollToBottom();
      })
      .catch((error) => {
        console.error('Error enviando imagen:', error);
        alert('Error al enviar la imagen. Intenta de nuevo.');
      })
      .finally(() => {
        setSendingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!deliveryPerson || !clientId) {
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
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            💬 Chat con Cliente
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            👤 {clientName}
          </p>
          {orderId && (
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              📦 Pedido: {orderId}
            </p>
          )}
        </div>
      </header>

      {/* Área de mensajes */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p>Aún no hay mensajes</p>
            <p style={{ fontSize: '0.875rem' }}>Comienza la conversación con el cliente</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId === deliveryPerson.id;
            
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-in'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  backgroundColor: isOwn ? '#10b981' : '#e5e7eb',
                  color: isOwn ? 'white' : '#1f2937',
                  position: 'relative'
                }}>
                  {!isOwn && (
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      color: '#6b7280'
                    }}>
                      {msg.senderName || msg.sender}
                    </p>
                  )}
                  
                  {/* Renderizar imagen si es tipo IMAGE */}
                  {msg.messageType === 'IMAGE' && msg.imageUrl ? (
                    <div>
                      <img 
                        src={msg.imageUrl.startsWith('data:image') ? msg.imageUrl : `data:image/jpeg;base64,${msg.imageUrl}`} 
                        alt="Imagen enviada" 
                        style={{
                          maxWidth: '100%',
                          borderRadius: '0.5rem',
                          marginTop: '0.5rem'
                        }}
                        onError={(e) => {
                          console.error('❌ Error al cargar imagen:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen cargada correctamente');
                        }}
                      />
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.4', marginTop: '0.5rem' }}>
                        {msg.message}
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {msg.message}
                    </p>
                  )}
                  <p style={{
                    fontSize: '0.7rem',
                    marginTop: '0.25rem',
                    opacity: 0.7,
                    textAlign: 'right'
                  }}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form
        onSubmit={handleSendMessage}
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}
      >
        {/* Input hidden para seleccionar archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {/* Botón para adjuntar imagen */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sendingImage}
          title="Adjuntar imagen"
          style={{
            backgroundColor: sendingImage ? '#9ca3af' : '#059669',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '2rem',
            cursor: sendingImage ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '45px'
          }}
        >
          {sendingImage ? '⏳' : '📷'}
        </button>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading || sendingImage}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '2rem',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          style={{
            backgroundColor: loading || !newMessage.trim() ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            fontWeight: 'bold',
            cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '⏳' : '📤'}
        </button>
      </form>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ClientChatPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import { DeliveryPerson } from '../types/DeliveryPerson';

const MessagesPage: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Variable para controlar si el componente está montado
    let isMounted = true;

    const initMessagesPage = async () => {
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

        // Suscribirse a mensajes entre el repartidor y el administrador
        const unsubscribe = MessageService.observeMessagesBetweenUsers(deliveryId, 'admin', (receivedMessages) => {
          // Transformar los mensajes para que tengan el formato esperado por la UI
          const transformedMessages = receivedMessages.map(msg => ({
            ...msg,
            sender: msg.senderId === 'admin' ? 'Administrador' : msg.senderName,
            isOwn: msg.senderId === deliveryId
          }));
          setMessages(transformedMessages);
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
          if (unsubscribe) {
            unsubscribe();
          }
          clearInterval(accountValidationInterval);
        };
      } catch (err: any) {
        setError(err.message || 'Error al cargar los mensajes');
        console.error('Error initializing messages page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initMessagesPage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const scrollToBottom = () => {
    // Usar setTimeout para asegurar que el DOM se haya actualizado antes de hacer scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Por favor ingresa un mensaje');
      return;
    }

    try {
      const deliveryId = AuthService.getDeliveryId();
      if (!deliveryId) {
        throw new Error('No se encontró el ID de repartidor');
      }

      if (!deliveryPerson) {
        throw new Error('No se encontraron los datos del repartidor');
      }

      // Enviar el mensaje usando el servicio real
      const result = await MessageService.sendMessage(
        deliveryId,
        deliveryPerson.name,
        'admin',
        'Administrador',
        newMessage,
        'TEXT'
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      // Limpiar el campo de texto
      setNewMessage('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el mensaje');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
        <div style={{ fontSize: '18px', color: '#666' }}>Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
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
              Mensajes con Administrador
            </h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              {deliveryPerson ? `Conectado como: ${deliveryPerson.name}` : 'Cargando...'}
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

      {/* Contenedor de mensajes */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px'
      }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #eee',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Chat con Administrador
        </div>
        
        {/* Lista de mensajes */}
        <div style={{ 
          flex: 1, 
          padding: '16px', 
          overflowY: 'auto',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              No hay mensajes aún. ¡Envía el primero!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  style={{
                    alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.isOwn ? '#2196F3' : '#f0f0f0',
                    color: message.isOwn ? 'white' : '#333',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '14px' }}>{message.message}</div>
                  <div style={{ 
                    fontSize: '10px', 
                    opacity: 0.7, 
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Formulario para enviar mensaje */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            rows={2}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '14px',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              padding: '12px 16px',
              backgroundColor: newMessage.trim() ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              alignSelf: 'flex-end'
            }}
          >
            Enviar Mensaje
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
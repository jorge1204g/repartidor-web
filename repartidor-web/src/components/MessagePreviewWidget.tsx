import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageService from '../services/MessageService';

interface MessagePreview {
  id: string;
  senderName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

const MessagePreviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<MessagePreview[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    const deliveryId = localStorage.getItem('deliveryId');
    
    if (!deliveryId) return;

    // Escuchar últimos mensajes
    const unsubscribe = MessageService.observeLastMessages(deliveryId, (messages) => {
      // Filtrar solo mensajes no leídos de clientes
      const unreadFromClients = messages
        .filter(msg => 
          msg.receiverId === deliveryId && 
          !msg.isRead && 
          msg.senderId !== 'admin'
        )
        .slice(0, 3) // Mostrar solo los 3 más recientes
        
      setPreviews(unreadFromClients.map(msg => ({
        id: msg.id,
        senderName: msg.senderName,
        message: msg.message,
        timestamp: msg.timestamp,
        isRead: false
      })));
      
      setHasNewMessages(unreadFromClients.length > 0);
    });

    return () => {
      // Cleanup
    };
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = diff / (1000 * 60);
    
    if (minutes < 60) {
      return `Hace ${Math.floor(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `Hace ${hours}h`;
    }
  };

  if (!hasNewMessages || previews.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid #10b981'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔔 <span>Mensajes Nuevos</span>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {previews.map(preview => (
          <div
            key={preview.id}
            onClick={() => navigate('/chat-clientes')}
            style={{
              backgroundColor: '#f0fdf4',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dcfce7';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem'
            }}>
              <span style={{
                fontWeight: '600',
                color: '#166534',
                fontSize: '0.875rem'
              }}>
                👤 {preview.senderName}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#86efac'
              }}>
                {formatTime(preview.timestamp)}
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#15803d',
              lineHeight: '1.4'
            }}>
              {preview.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagePreviewWidget;

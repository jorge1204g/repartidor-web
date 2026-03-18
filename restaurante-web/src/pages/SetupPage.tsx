import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TestSetupService from '../services/TestSetupService';

const SetupPage: React.FC = () => {
  const [setupType, setSetupType] = useState<'delivery' | 'restaurant'>('delivery');
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;

      if (setupType === 'delivery') {
        result = await TestSetupService.createTestDeliveryPerson(id, name, phone);
      } else {
        result = await TestSetupService.createTestRestaurant(id, name, phone, address);
      }

      if (result.success) {
        setMessageType('success');
        setMessage(result.message);
        setTimeout(() => {
          navigate('/inicio');
        }, 2000);
      } else {
        setMessageType('error');
        setMessage(result.message);
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al crear el registro de prueba');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>
            Configuración de Datos de Prueba
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Crea registros de prueba para repartidores o restaurantes
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Tipo de Registro
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                checked={setupType === 'delivery'}
                onChange={() => setSetupType('delivery')}
                style={{ marginRight: '8px' }}
              />
              Repartidor
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                checked={setupType === 'restaurant'}
                onChange={() => setSetupType('restaurant')}
                style={{ marginRight: '8px' }}
              />
              Restaurante
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="id" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ID
            </label>
            <input
              type="text"
              id="id"
              placeholder="ID único (ej: repartidor123)"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nombre
            </label>
            <input
              type="text"
              id="name"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Número de teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {setupType === 'restaurant' && (
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="address" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Dirección
              </label>
              <input
                type="text"
                id="address"
                placeholder="Dirección del restaurante"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          )}

          {message && (
            <div style={{
              backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
              color: messageType === 'success' ? '#155724' : '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? 'Creando...' : `Crear ${setupType === 'delivery' ? 'Repartidor' : 'Restaurante'} de Prueba`}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/inicio')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
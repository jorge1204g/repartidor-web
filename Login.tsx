import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Login: React.FC = () => {
  const [deliveryId, setDeliveryId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar que el ID no esté vacío
    if (!deliveryId.trim()) {
      setError('Por favor ingrese su ID de repartidor');
      setLoading(false);
      return;
    }

    try {
      // Realizar la autenticación con Firebase
      const result = await AuthService.loginWithId(deliveryId);
      
      if (result.success) {
        // Redirigir al dashboard usando el hook de navegación
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Error al iniciar sesión. Verifique su ID de repartidor.');
      console.error('Login error:', err);
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
        maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>
            Iniciar Sesión - Repartidor
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Contacta con el administrador para obtener tu ID de repartidor
          </p>
        </div>
        
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
        
        <form onSubmit={handleLogin} style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              id="deliveryId"
              placeholder="ID de Repartidor"
              value={deliveryId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryId(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
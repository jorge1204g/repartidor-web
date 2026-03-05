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
      background: 'var(--bg-primary)',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(102, 126, 234, 0.3) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(118, 75, 162, 0.3) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.2) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        backgroundColor: 'var(--bg-card)',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-xl), var(--glow-primary)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: '450px',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))'
          }}>
            🚴
          </div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '-0.025em',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Acceso Repartidor
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: '0.9375rem', 
            color: 'var(--text-muted)'
          }}>
            Ingresa tu ID para comenzar
          </p>
        </div>
        
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
        
        <form onSubmit={handleLogin} style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="deliveryId" 
              style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '0.9375rem',
                letterSpacing: '0.025em'
              }}
            >
              🆔 ID de Repartidor
            </label>
            <input
              type="text"
              id="deliveryId"
              placeholder="ej: repartidor1"
              value={deliveryId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryId(e.target.value)}
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'var(--bg-secondary)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.boxShadow = 'var(--glow-primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.0625rem',
              fontWeight: '600',
              letterSpacing: '0.025em',
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Iniciando sesión...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                🔐 Iniciar Sesión
              </span>
            )}
          </button>
        </form>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        textAlign: 'center', 
        padding: '1rem',
        background: 'var(--bg-glass)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-muted)',
          margin: 0
        }}>
          💡 Contacta al administrador para obtener tu ID
        </p>
      </div>
    </div>
  );
};

export default Login;
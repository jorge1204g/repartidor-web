import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Login: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<string>('restaurante1');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Autenticar con el servicio real
      const result = await AuthService.loginWithId(restaurantId);
      
      if (result.success) {
        // Redirigir al dashboard
        navigate('/inicio');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
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
        width: '100%', 
        maxWidth: '450px', 
        padding: '3rem 2.5rem',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-xl), var(--glow-primary)',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))'
          }}>
            🍽️
          </div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '0.5rem',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            Acceso Restaurante
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Ingresa tu ID para continuar
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="restaurantId" 
              style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '0.9375rem',
                letterSpacing: '0.025em'
              }}
            >
              🏪 ID del Restaurante
            </label>
            <input
              type="text"
              id="restaurantId"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="ej: restaurante1"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'var(--bg-secondary)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              disabled={loading}
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
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.0625rem',
              fontWeight: '600',
              letterSpacing: '0.025em',
              marginTop: '0.5rem'
            }}
            disabled={loading}
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
            💡 ID predeterminado: <code style={{ 
              background: 'var(--bg-secondary)',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              color: 'var(--info-color)',
              fontWeight: '600',
              fontSize: '0.8125rem'
            }}>restaurante1</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
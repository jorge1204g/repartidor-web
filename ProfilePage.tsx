import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import PresenceService from '../services/PresenceService';
import { DeliveryPerson } from '../types/DeliveryPerson';

const ProfilePage: React.FC = () => {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay sesión activa
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Variable para controlar si el componente está montado
    let isMounted = true;

    const initProfilePage = async () => {
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
          setIsOnline(authResponse.deliveryPerson.isOnline);
          
          // Cargar datos para edición
          setEditedData({
            name: authResponse.deliveryPerson.name,
            phone: authResponse.deliveryPerson.phone,
            email: authResponse.deliveryPerson.email
          });
        }

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
          clearInterval(accountValidationInterval);
        };
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
        console.error('Error initializing profile page:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initProfilePage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Manejar cambio de estado en línea
  const handleOnlineToggle = async () => {
    if (!deliveryPerson) return;
    
    const newOnlineStatus = !isOnline;
    setIsOnline(newOnlineStatus);
    
    try {
      await PresenceService.updatePresence(deliveryPerson.id, newOnlineStatus, true);
      
      // Actualizar el estado local del repartidor
      setDeliveryPerson(prev => prev ? { ...prev, isOnline: newOnlineStatus } : null);
    } catch (err: any) {
      console.error('Error updating online status:', err);
      setIsOnline(!newOnlineStatus); // Revertir el cambio si falla
    }
  };

  // Manejar guardar cambios
  const handleSaveChanges = async () => {
    if (!deliveryPerson) return;
    
    try {
      // Aquí iría la lógica para actualizar los datos del perfil en Firebase
      // Por ahora, simplemente actualizamos localmente
      setDeliveryPerson(prev => prev ? { 
        ...prev, 
        name: editedData.name,
        phone: editedData.phone,
        email: editedData.email
      } : null);
      
      setIsEditing(false);
      setError('Perfil actualizado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    }
  };

  // Manejar cancelar edición
  const handleCancelEdit = () => {
    if (deliveryPerson) {
      setEditedData({
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        email: deliveryPerson.email
      });
    }
    setIsEditing(false);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
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
        <div style={{ fontSize: '18px', color: '#666' }}>Cargando perfil...</div>
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
              Mi Perfil
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                ID: {deliveryPerson?.id || 'N/A'}
              </span>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#4CAF50' : '#FF9800',
                boxShadow: isOnline ? '0 0 8px #4CAF50' : '0 0 8px #FF9800'
              }}></div>
              <span style={{ fontSize: '14px', color: isOnline ? '#4CAF50' : '#FF9800' }}>
                {isOnline ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>En línea</span>
            <div 
              onClick={handleOnlineToggle}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                backgroundColor: isOnline ? '#4CAF50' : '#ccc',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '2px',
                left: isOnline ? '26px' : '2px',
                transition: 'left 0.3s ease',
              }}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={{
          backgroundColor: deliveryPerson ? (error.includes('exitosamente') ? '#e8f5e9' : '#ffebee') : '#ffebee',
          color: deliveryPerson ? (error.includes('exitosamente') ? '#2e7d32' : '#c62828') : '#c62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: deliveryPerson ? (error.includes('exitosamente') ? '1px solid #c8e6c9' : '1px solid #ffcdd2') : '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      {/* Información del perfil */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', fontSize: '18px', color: '#333' }}>Información Personal</h2>
            <button
              onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: isEditing ? '#f44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontWeight: 'bold' }}>Nombre</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontWeight: 'bold' }}>Teléfono</label>
                <input
                  type="text"
                  value={editedData.phone}
                  onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontWeight: 'bold' }}>Email</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveChanges}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    flex: 1
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#666', fontWeight: 'bold' }}>Nombre</label>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>{deliveryPerson?.name || 'N/A'}</p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#666', fontWeight: 'bold' }}>Teléfono</label>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>{deliveryPerson?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#666', fontWeight: 'bold' }}>Email</label>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>{deliveryPerson?.email || 'N/A'}</p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#666', fontWeight: 'bold' }}>Fecha de Registro</label>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                  {deliveryPerson?.registrationDate ? new Date(deliveryPerson.registrationDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#666', fontWeight: 'bold' }}>Estado</label>
                <p style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                  {deliveryPerson?.isApproved ? 'Aprobado' : 'No aprobado'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Opciones adicionales */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px',
        padding: '20px'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>Opciones</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
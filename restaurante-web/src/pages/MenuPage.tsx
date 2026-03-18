import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuService from '../services/MenuService';
import AuthService from '../services/AuthService';

// Interfaz para representar un producto del menú
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  restaurantId: string;
}

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories] = useState<string[]>(['Entrantes', 'Platos Fuertes', 'Postres', 'Bebidas']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Obtener el ID del restaurante desde el servicio de autenticación
  const restaurantId = AuthService.getRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const loadMenuItems = async () => {
      try {
        setLoading(true);
        
        // Suscribirse a las actualizaciones en tiempo real
        unsubscribe = MenuService.observeMenuItems(restaurantId, (updatedItems) => {
          if (isMounted) {
            setMenuItems(updatedItems);
          }
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos del menú');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMenuItems();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe(); // Cancelar la suscripción
      }
    };
  }, [restaurantId, navigate]);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const toggleAvailability = async (itemId: string) => {
    if (!restaurantId) return;
    
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;
      
      const result = await MenuService.updateMenuItem(restaurantId, itemId, {
        available: !item.available
      });
      
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Error al actualizar disponibilidad del producto');
      setTimeout(() => setError(''), 3000); // Limpiar error después de 3 segundos
    }
  };

  if (!restaurantId) {
    return null; // O un componente de carga mientras verifica autenticación
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Menú del Restaurante</h1>
        <button className="btn btn-danger" onClick={() => navigate('/inicio')}>
          Volver al Inicio
        </button>
      </header>

      {/* Navegación */}
      <nav className="navbar">
        <ul>
          <li><a href="/inicio">Inicio</a></li>
          <li><a href="/pedidos">Pedidos</a></li>
          <li><a href="/crear-pedido">Crear Pedido</a></li>
          <li><a href="/menu" style={{ backgroundColor: '#555' }}>Menú</a></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Productos del Menú</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Funcionalidad para agregar nuevo producto
                  alert('Funcionalidad para agregar nuevo producto aún no implementada');
                }}
              >
                + Agregar Producto
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando productos del menú...
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredItems.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1rem', position: 'relative' }}>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  )}
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{item.name}</h3>
                      <span style={{ fontWeight: 'bold', color: '#28a745' }}>${item.price.toFixed(2)}</span>
                    </div>
                    
                    <p style={{ color: '#6c757d', margin: '0.5rem 0' }}>{item.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        backgroundColor: item.available ? '#d4edda' : '#f8d7da',
                        color: item.available ? '#155724' : '#721c24'
                      }}>
                        {item.available ? 'Disponible' : 'No disponible'}
                      </span>
                      
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        backgroundColor: '#e2e3e5',
                        color: '#383d41'
                      }}>
                        {item.category}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button 
                        className={`btn ${item.available ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleAvailability(item.id)}
                      >
                        {item.available ? 'Marcar como No Disponible' : 'Marcar como Disponible'}
                      </button>
                      
                      <button 
                        className="btn btn-info"
                        onClick={() => {
                          // Funcionalidad para editar producto
                          alert(`Editar producto: ${item.name}`);
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MenuPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database } from '../services/Firebase';
import AuthService from '../services/AuthService';
import ImageModal from '../components/ImageModal';

const UploadMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [menuPreviews, setMenuPreviews] = useState<string[]>([]);
  const [uploadDate, setUploadDate] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    // Verificar autenticación usando AuthService
    if (!AuthService.isAuthenticated()) {
      console.log('No hay sesión activa, redirigiendo a login');
      navigate('/login');
      return;
    }

    // Obtener ID del restaurante desde localStorage
    const id = AuthService.getRestaurantId();
    console.log('Restaurant ID obtenido:', id);
    
    if (id) {
      setRestaurantId(id);
      loadExistingMenu(id);
    } else {
      setError('No se pudo obtener el ID del restaurante');
    }
    setIsLoading(false);
  }, [navigate]);

  const loadExistingMenu = (id: string) => {
    const menuRef = ref(database, `restaurant_menus/${id}`);
    get(menuRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.menuImages && Array.isArray(data.menuImages)) {
          setMenuPreviews(data.menuImages);
          setUploadDate(data.uploadDate ? new Date(data.uploadDate).toLocaleString('es-ES') : 'Fecha no disponible');
        } else if (data.menuImage) {
          // Soporte para formato antiguo (una sola imagen)
          setMenuPreviews([data.menuImage]);
          setUploadDate(data.uploadDate ? new Date(data.uploadDate).toLocaleString('es-ES') : 'Fecha no disponible');
        }
      }
    }).catch((error) => {
      console.error('Error loading menu:', error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      
      Array.from(files).forEach((file) => {
        newFiles.push(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            // Todas las previews están listas
            setMenuImages(prev => [...prev, ...newFiles]);
            setMenuPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async () => {
    if (menuImages.length === 0 || !restaurantId) {
      alert('Por favor selecciona al menos una imagen del menú');
      return;
    }

    setIsUploading(true);

    try {
      // Convert all images to base64
      const base64Promises = menuImages.map((image) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const base64Images = await Promise.all(base64Promises);
      
      const menuRef = ref(database, `restaurant_menus/${restaurantId}`);
      
      await set(menuRef, {
        menuImages: base64Images,
        uploadDate: Date.now(),
        restaurantId: restaurantId,
        imageCount: base64Images.length
      });

      setUploadDate(new Date().toLocaleString('es-ES'));
      setIsUploading(false);
      alert(`✅ ${base64Images.length} imagen(es) del menú cargada(s) exitosamente`);
    } catch (error) {
      console.error('Error uploading menu:', error);
      setIsUploading(false);
      alert('Error al cargar el menú. Por favor intenta de nuevo.');
    }
  };

  const handleRemoveImage = async (index: number) => {
    // Actualizar Firebase primero
    if (restaurantId) {
      try {
        const newPreviews = menuPreviews.filter((_, i) => i !== index);
        
        const menuRef = ref(database, `restaurant_menus/${restaurantId}`);
        
        if (newPreviews.length === 0) {
          // Si no hay más imágenes, eliminar todo el nodo
          await set(menuRef, null);
        } else {
          // Actualizar con las imágenes restantes
          await set(menuRef, {
            menuImages: newPreviews,
            uploadDate: Date.now(),
            restaurantId: restaurantId,
            imageCount: newPreviews.length
          });
        }
        
        // Actualizar el estado local después de guardar en Firebase
        setMenuPreviews(newPreviews);
        setMenuImages(prev => prev.filter((_, i) => i !== index));
        setUploadDate(new Date().toLocaleString('es-ES'));
      } catch (error) {
        console.error('Error removing image:', error);
        alert('Error al eliminar la imagen. Por favor intenta de nuevo.');
      }
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `menu-imagen-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'var(--font-family)'
      }}>
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '0.5rem', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#900', marginBottom: '1rem' }}>⚠️ Error</h2>
          <p style={{ color: '#600' }}>{error}</p>
          <button
            onClick={() => navigate('/inicio')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#900',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'var(--font-family)'
      }}>
        <p>No se pudo identificar el restaurante. Por favor inicia sesión nuevamente.</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          📋 Cargar Menú del Restaurante
        </h1>
        <button
          onClick={() => navigate('/inicio')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Información de fecha de actualización */}
      {uploadDate && (
        <div style={{
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <p style={{ 
            color: '#1e40af', 
            fontWeight: '600',
            margin: 0
          }}>
            🕒 Última actualización: {uploadDate}
          </p>
        </div>
      )}

      {/* Área de carga de imagen */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Seleccionar Imagen del Menú
        </h2>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            width: '100%'
          }}
        />

        {menuPreviews.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Vista previa:
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {menuPreviews.map((preview, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <img
                    src={preview}
                    alt={`Vista previa del menú ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      maxWidth: '300px',
                      maxHeight: '400px',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      💧 Remover imagen {index + 1}
                    </button>
                    <button
                      onClick={() => handleDownloadImage(preview, index)}
                      style={{
                        backgroundColor: '#78716c',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      📥 Descargar imagen {index + 1}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={menuImages.length === 0 || isUploading}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: isUploading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            transition: 'background-color 0.2s'
          }}
        >
          {isUploading ? '⏳ Subiendo menú...' : '📤 Cargar Menú'}
        </button>
      </div>

      {/* Instrucciones */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        border: '1px solid #fcd34d'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#92400e'
        }}>
          ℹ️ Instrucciones:
        </h3>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '1.5rem',
          color: '#78350f',
          lineHeight: '1.6'
        }}>
          <li>Selecciona una imagen clara de tu menú desde la galería</li>
          <li>La imagen se guardará automáticamente en el sistema</li>
          <li>El administrador podrá ver el menú actualizado</li>
          <li>La fecha de actualización se muestra arriba</li>
          <li>Puedes actualizar el menú cuantas veces necesites</li>
        </ul>
      </div>
    </div>
  );

  {/* Modal para ver imagen en pantalla completa */}
  {selectedImageIndex !== null && (
    <ImageModal
      images={menuPreviews}
      currentIndex={selectedImageIndex}
      onClose={() => setSelectedImageIndex(null)}
      onNext={() => setSelectedImageIndex(prev => {
        if (prev === null || prev >= menuPreviews.length - 1) return prev;
        return prev + 1;
      })}
      onPrevious={() => setSelectedImageIndex(prev => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      })}
      onDownload={() => {
        if (selectedImageIndex !== null) {
          handleDownloadImage(menuPreviews[selectedImageIndex], selectedImageIndex);
        }
      }}
    />
  )}
};

export default UploadMenuPage;

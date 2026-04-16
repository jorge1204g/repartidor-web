import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, push } from 'firebase/database';
import { database } from '../services/Firebase';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  
  // Form data
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  
  // Map
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Cargar Google Maps
  useEffect(() => {
    if (mapsUrl && !mapLoaded) {
      loadGoogleMaps();
    }
  }, [mapsUrl]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current) return;

    try {
      // Extraer coordenadas del URL de Google Maps
      const coords = extractCoordinatesFromMapsUrl(mapsUrl);
      
      if (coords) {
        const mapOptions = {
          center: { lat: coords.lat, lng: coords.lng },
          zoom: 16,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
          ]
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
          position: { lat: coords.lat, lng: coords.lng },
          map: map,
          title: businessName || 'Ubicación del restaurante',
          animation: window.google.maps.Animation.DROP
        });
        markerRef.current = marker;

        setLocation({
          latitude: coords.lat,
          longitude: coords.lng,
          address: address
        });

        setMapLoaded(true);
      }
    } catch (err) {
      console.error('Error al cargar mapa:', err);
      setError('Error al cargar el mapa. Verifica el URL de Google Maps.');
    }
  };

  const extractCoordinatesFromMapsUrl = (url: string): { lat: number; lng: number } | null => {
    try {
      // Buscar coordenadas en el URL
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2])
        };
      }

      // Buscar en parámetros query
      const urlObj = new URL(url);
      const lat = urlObj.searchParams.get('q');
      if (lat && lat.includes(',')) {
        const [latitude, longitude] = lat.split(',').map(Number);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          return { lat: latitude, lng: longitude };
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const validateStep1 = () => {
    if (!businessName.trim()) {
      setError('Por favor ingresa el nombre de tu negocio');
      return false;
    }
    if (!phone.trim()) {
      setError('Por favor ingresa el teléfono');
      return false;
    }
    if (!address.trim()) {
      setError('Por favor ingresa la dirección');
      return false;
    }
    if (!mapsUrl.trim()) {
      setError('Por favor ingresa el URL de Google Maps');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!email.trim()) {
      setError('Por favor ingresa el correo electrónico');
      return false;
    }
    if (!businessType.trim()) {
      setError('Por favor indica a qué se dedica tu negocio');
      return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Crear ID único para el restaurante
      const newRestaurantRef = push(ref(database, 'restaurants'));
      const newRestaurantId = newRestaurantRef.key || '';

      const restaurantData = {
        id: newRestaurantId,
        businessName: businessName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        mapsUrl: mapsUrl.trim(),
        email: email.trim(),
        businessType: businessType.trim(),
        notes: notes.trim(),
        location: location,
        isApproved: true, // Aprobado automáticamente
        isActive: true,
        registrationDate: new Date().toISOString(),
        createdAt: Date.now()
      };

      // Guardar en Firebase
      await set(newRestaurantRef, restaurantData);

      setRestaurantId(newRestaurantId);
      setSuccess(true);
      
      console.log('✅ Restaurante registrado:', newRestaurantId);
    } catch (err: any) {
      console.error('Error al registrar restaurante:', err);
      setError('Error al registrar. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>
            ¡Registro Exitoso!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Tu restaurante ha sido registrado correctamente. Tu ID de acceso es:
          </p>
          <div style={{
            background: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '1.5rem',
            border: '2px dashed #667eea'
          }}>
            {restaurantId}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            ⚠️ <strong>IMPORTANTE:</strong> Guarda este ID. Lo necesitarás para iniciar sesión.
            Tu cuenta será revisada y aprobada por un administrador.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Ir al Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
          <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
            Registro de Restaurante
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            ¿Eres restaurante y no cuentas con repartidor? ¡Regístrate aquí!
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: step >= 1 ? '#667eea' : '#9ca3af' }}>
              Paso 1: Información Básica
            </span>
            <span style={{ fontSize: '0.75rem', color: step >= 2 ? '#667eea' : '#9ca3af' }}>
              Paso 2: Detalles Adicionales
            </span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
            <div style={{
              height: '100%',
              width: step === 1 ? '50%' : '100%',
              background: '#667eea',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Nombre de tu negocio o restaurante *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Restaurante El Sabor"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Teléfono *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 5551234567"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Dirección de tu negocio *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, Número, Colonia, Ciudad"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                URL de Google Maps *
              </label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                💡 Abre Google Maps, busca tu ubicación y copia el URL
              </p>
            </div>

            {/* Mapa */}
            {mapsUrl && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  📍 Vista previa de ubicación
                </label>
                <div
                  ref={mapRef}
                  style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    border: '1px solid #d1d5db'
                  }}
                />
                {mapLoaded && (
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>
                    ✅ Ubicación confirmada
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                marginTop: '1rem'
              }}
            >
              {loading ? 'Procesando...' : 'Siguiente →'}
            </button>
          </div>
        )}

        {/* Step 2: Additional Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Email o correo electrónico *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="restaurante@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                ¿A qué se dedica tu negocio? *
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Ej: Hamburguesas, Gorditas, Tacos, Pizza..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre tu negocio..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ← Atrás
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  background: loading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Registrando...' : '✓ Confirmar Registro'}
              </button>
            </div>
          </div>
        )}

        {/* Back to Login */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline'
            }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

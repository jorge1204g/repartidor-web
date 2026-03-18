import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
// import MenuService from '../services/MenuService';
import OrderCreationService from '../services/OrderCreationService';
import { OrderStatus } from '../types/Order';

// interface MenuItem {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   available: boolean;
//   imageUrl?: string;
//   restaurantId: string;
// }

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const restaurantId = AuthService.getRestaurantId();
  
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryReferences, setDeliveryReferences] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [customerMapUrl, setCustomerMapUrl] = useState<string>(''); // URL de Google Maps
  // No se utilizan productos seleccionados ya que se elimina la funcionalidad
  // const [selectedProducts, setSelectedProducts] = useState<Array<{item: MenuItem, quantity: number}>>([]);
  // const [availableProducts, setAvailableProducts] = useState<MenuItem[]>([]);
  const [manualSubtotal, setManualSubtotal] = useState<number>(0); // Se mantiene en 0 pero se mostrará vacío en el input
  const [deliveryFee, setDeliveryFee] = useState<number>(35);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash'); // 'cash' para efectivo, 'transfer' para transferencia
  const [whoPaysDelivery, setWhoPaysDelivery] = useState<string>('restaurant'); // 'restaurant' o 'customer'
  // const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const deliveryFees = [35, 40, 45, 50, 60, 70, 80];

  const simulateOrder = () => {
    const randomNames = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
    const randomAddresses = ['Calle Principal 123', 'Av. Central 456', 'Calle 5 #789', 'Carrera 10 #23-45', 'Blvd. Los Ángeles 678'];
    const randomPhones = ['5551234567', '5559876543', '5551122334', '5554455667', '5557788990'];
    const randomReferences = ['Casa blanca con puerta verde', 'Edificio frente al parque', 'Casa esquinera color azul', 'Detrás del supermercado', 'Conjunto residencial Torre A'];
    const randomTimes = ['30-45 minutos', '45-60 minutos', '25-35 minutos', '40-50 minutos', '35-45 minutos'];
    const randomSubtotals = [150, 200, 250, 300, 350, 400, 450, 500];
    const randomDeliveryFees = [35, 40, 45, 50, 60];
    const randomRequests = ['', 'Sin cebolla', 'Salsa extra', 'Bien cocido', 'Empacar por separado', 'Llamar al llegar'];
    
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    const newConfirmationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    setCustomerName(randomNames[randomIndex]);
    setCustomerAddress(randomAddresses[randomIndex]);
    setCustomerPhone(randomPhones[randomIndex]);
    setDeliveryReferences(randomReferences[randomIndex]);
    setDeliveryTime(randomTimes[randomIndex]);
    setManualSubtotal(randomSubtotals[randomIndex]);
    setDeliveryFee(randomDeliveryFees[Math.floor(Math.random() * randomDeliveryFees.length)]);
    setSpecialRequests(randomRequests[Math.floor(Math.random() * randomRequests.length)]);
    setPaymentMethod(Math.random() > 0.5 ? 'cash' : 'transfer');
    setWhoPaysDelivery(Math.random() > 0.5 ? 'restaurant' : 'customer');
    setConfirmationCode(newConfirmationCode);
  };

  // Cargar productos del menú del restaurante
  useEffect(() => {
    if (!restaurantId) {
      navigate('/login');
      return;
    }

    // let isMounted = true;

    return () => {
      // isMounted = false;
    };
  }, [restaurantId, navigate]);

  const calculateTotal = (): number => {
    return manualSubtotal + deliveryFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Por favor ingresa el nombre del cliente');
      return;
    }
    
    if (!customerAddress.trim()) {
      setError('Por favor ingresa la dirección del cliente');
      return;
    }
    
    if (manualSubtotal <= 0) {
      setError('Por favor ingresa un monto válido en el restaurante');
      return;
    }
    
    try {
      // Obtener el nombre del restaurante
      const restaurantInfo = await OrderCreationService.getRestaurantInfo(restaurantId!);
      const restaurantName = restaurantInfo.name || 'Restaurante sin nombre';
      
      // Generar código de confirmación único (4 dígitos) si no existe
      const confirmationCodeFinal = confirmationCode || Math.floor(1000 + Math.random() * 9000).toString();
      
      // Generar fecha y hora automática del pedido
      const orderDateTimeString = new Date().toLocaleString();
      
      // Crear el objeto de pedido
      const orderRequest = {
        restaurantId: restaurantId!,
        restaurantName,
        customer: {
          name: customerName,
          address: customerAddress,
          phone: customerPhone
        },
        customerName, // Mantener para compatibilidad
        customerAddress, // Mantener para compatibilidad
        customerPhone, // Usar el valor del formulario
        items: [], // No hay productos seleccionados, se envía un array vacío
        subtotal: manualSubtotal,
        deliveryCost: deliveryFee,
        total: calculateTotal(),
        deliveryTimeEstimate: deliveryTime,
        specialRequests,
        status: OrderStatus.PENDING,
        paymentMethod: paymentMethod,
        whoPaysDelivery: paymentMethod === 'cash' ? whoPaysDelivery : 'restaurant', // En transferencia, siempre es el restaurante
        candidateDeliveryIds: [], // No hay candidatos específicos, el pedido será visible para todos los repartidores
        deliveryReferences: deliveryReferences,
        customerMapUrl: customerMapUrl, // URL de Google Maps
        customerCode: confirmationCodeFinal, // Código de confirmación para la entrega (usando customerCode)
        orderDateTime: orderDateTimeString, // Fecha y hora automática de creación del pedido
        orderType: 'MANUAL' as 'RESTAURANT' | 'MANUAL' // Indica que el pedido es creado manualmente por el admin
      };
      
      // Crear el pedido en Firebase
      const result = await OrderCreationService.createOrder(orderRequest);
      
      if (result.success) {
        alert(`Pedido creado exitosamente.\nID del pedido: ${result.orderId}\nCódigo de confirmación: ${confirmationCodeFinal}`);
        
        // Resetear el formulario
        setCustomerName('');
        setCustomerAddress('');
        setDeliveryTime('');
        setConfirmationCode('');
        setSpecialRequests('');
        setError('');
        
        // Redirigir al dashboard
        navigate('/inicio');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido');
    }
  };

  if (!restaurantId) {
    return null;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Crear Nuevo Pedido</h1>
        <button className="btn btn-danger" onClick={() => navigate('/inicio')}>
          Volver al Inicio
        </button>
      </header>

      {/* Contenido principal */}
      <main style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Crear Nuevo Pedido</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={simulateOrder}
              style={{ backgroundColor: '#28a745', color: 'white' }}
            >
              🎲 Simular Pedido
            </button>
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Datos del Cliente</h3>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="customerName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ingresa el nombre del cliente"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label htmlFor="customerAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Dirección del Cliente *
                  </label>
                  <input
                    type="text"
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ingresa la dirección del cliente"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="customerPhone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Teléfono del Cliente
                  </label>
                  <input
                    type="text"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ingresa el teléfono del cliente"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="deliveryReferences" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Referencias del Domicilio
                  </label>
                  <input
                    type="text"
                    id="deliveryReferences"
                    value={deliveryReferences}
                    onChange={(e) => setDeliveryReferences(e.target.value)}
                    placeholder="Referencias para encontrar la dirección"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="customerMapUrl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                  📍 URL de Google Maps del Cliente
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    id="customerMapUrl"
                    value={customerMapUrl}
                    onChange={(e) => setCustomerMapUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '2px solid #dc3545',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      if (customerMapUrl) {
                        window.open(customerMapUrl, '_blank');
                      } else {
                        alert('Por favor ingresa una URL de Google Maps');
                      }
                    }}
                    title="Abrir ubicación en Google Maps"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    🗺️ Ver Ubicación
                  </button>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                  ℹ️ Pega el link de Google Maps para facilitar la ubicación del repartidor
                </p>
              </div>

              <div>
                <label htmlFor="confirmationCode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#6f42c1' }}>
                  🎫 Código de Confirmación
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Generado automáticamente o ingresa un código"
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #6f42c1',
                    borderRadius: '0.375rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: '#f8f0ff'
                  }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6f42c1' }}>
                  ℹ️ Este código se usará para verificar la entrega del pedido
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Productos del Pedido</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="manualSubtotal" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Monto en Restaurante
                  </label>
                  <input
                    type="number"
                    id="manualSubtotal"
                    value={manualSubtotal || ''}
                    onChange={(e) => setManualSubtotal(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="Monto total del pedido en el restaurante"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryFee" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Tarifa de Entrega
                  </label>
                  <select
                    id="deliveryFee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  >
                    {deliveryFees.map(fee => (
                      <option key={fee} value={fee}>${fee}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Total
                  </label>
                  <div style={{ padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '0.375rem', backgroundColor: '#d4edda', fontWeight: 'bold' }}>
                    ${(manualSubtotal + deliveryFee).toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#e7f3ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#0066cc' }}>
                  {paymentMethod === 'cash' 
                    ? (whoPaysDelivery === 'restaurant' 
                      ? 'El repartidor paga el monto en el restaurante. El restaurante paga la tarifa de entrega.' 
                      : 'El repartidor paga el monto en el restaurante. El cliente paga la tarifa de entrega.')
                    : 'El repartidor recoge el pedido pagado. El restaurante paga la tarifa de entrega.'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Detalles Adicionales</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="deliveryTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Tiempo Estimado de Entrega
                </label>
                <input
                  type="text"
                  id="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ej: 30-45 minutos"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Método de Pago
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              {paymentMethod === 'cash' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="whoPaysDelivery" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    ¿Quién paga el envío?
                  </label>
                  <select
                    id="whoPaysDelivery"
                    value={whoPaysDelivery}
                    onChange={(e) => setWhoPaysDelivery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="restaurant">Restaurante paga el envío</option>
                    <option value="customer">Cliente paga el envío</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Envío
                  </label>
                  <div style={{ padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '0.375rem', backgroundColor: '#f8f9fa' }}>
                    Restaurante paga el envío
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="specialRequests" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Solicitudes Especiales
                </label>
                <textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Comentarios especiales sobre el pedido..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/inicio')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Crear Pedido
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateOrderPage;
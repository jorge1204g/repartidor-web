import { useState, useEffect } from 'react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { database } from './config/firebase';
import { Client } from './types';
import './App.css';

const DEFAULT_USER_ID = 'gym2026';
const DEFAULT_PASSWORD = 'rutinas123';

const DEFAULT_ROUTINES = {
  Lunes: 'Press de banca plano con barra 4x10\nPress inclinado con mancuernas 4x12\nAperturas con mancuernas 3x15\nFondos en paralelas 3x12\nPress declinado 3x10\nCruces en polea alta 3x15',
  Martes: 'Dominadas agarre prono 4x8\nRemo con barra 4x10\nJalón al pecho agarre estrecho 3x12\nRemo en polea baja 3x12\nPullover con mancuerna 3x15\nRemo en máquina 3x10',
  Miércoles: 'Sentadillas con barra 4x10\nPrensa de piernas 4x12\nExtensiones de cuádriceps 3x15\nCurl femoral acostado 3x12\nPeso muerto rumano 3x10\nElevación de gemelos de pie 4x20',
  Jueves: 'Press militar con barra 4x10\nElevaciones laterales con mancuernas 3x15\nFace pull en polea 3x12\nElevación frontal alterna 3x12\nEncogimientos con mancuernas 4x15\nPress Arnold 3x10',
  Viernes: 'Curl de bíceps con barra 3x12\nExtensión de tríceps en polea 3x15\nCurl martillo alterno 3x12\nPress francés con mancuernas 3x10\nCurl de bíceps inclinado 3x12\nFondos para tríceps en banco 3x15',
  Sábado: 'Peso muerto convencional 4x8\nSentadilla búlgara 3x10 por pierna\nCurl femoral sentado 3x12\nHip thrust con barra 4x10\nZancadas caminando 3x12 por pierna\nElevación de gemelos sentado 4x20'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Login form
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: '',
    weight: '',
    goal: ''
  });

  // Load clients from Firebase
  useEffect(() => {
    if (!isAuthenticated) return;

    const clientsRef = ref(database, 'gym_clients');
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clientsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        }));
        setClients(clientsArray);
      } else {
        setClients([]);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Load logo from localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('gym_logo');
    if (savedLogo) {
      setCurrentLogo(savedLogo);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === DEFAULT_USER_ID && password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMessage('');
      setUserId('');
      setPassword('');
    } else {
      setErrorMessage('Usuario o contraseña incorrectos');
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const client: Omit<Client, 'id'> = {
      name: formData.name,
      number: formData.number,
      phone: formData.phone,
      startDate: formData.startDate,
      duration: formData.duration,
      weight: parseFloat(formData.weight),
      goal: formData.goal,
      routines: DEFAULT_ROUTINES,
      createdAt: new Date().toISOString()
    };

    try {
      const clientsRef = ref(database, 'gym_clients');
      const newClientRef = push(clientsRef);
      await set(newClientRef, client);
      
      setShowRegisterModal(false);
      setFormData({
        name: '',
        number: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: '',
        weight: '',
        goal: ''
      });
      alert('✅ Cliente registrado exitosamente');
    } catch (error) {
      console.error('Error registering client:', error);
      alert('❌ Error al registrar el cliente');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        const clientRef = ref(database, `gym_clients/${clientId}`);
        await remove(clientRef);
        alert('✅ Cliente eliminado');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('❌ Error al eliminar el cliente');
      }
    }
  };

  const handleUpdateRoutine = async (clientId: string, day: string, routine: string) => {
    try {
      const clientRef = ref(database, `gym_clients/${clientId}/routines/${day}`);
      await update(clientRef, routine);
    } catch (error) {
      console.error('Error updating routine:', error);
    }
  };

  const handleFillRoutine = async (clientId: string) => {
    if (confirm('¿Estás seguro de rellenar la rutina con 6 ejercicios por día? Esto reemplazará el contenido actual.')) {
      try {
        const routinesRef = ref(database, `gym_clients/${clientId}/routines`);
        await update(routinesRef, DEFAULT_ROUTINES);
        alert('✅ Rutina rellenada exitosamente con 6 ejercicios por día');
      } catch (error) {
        console.error('Error filling routine:', error);
        alert('❌ Error al rellenar la rutina');
      }
    }
  };

  const handleClearRoutine = async (clientId: string) => {
    if (confirm('¿Estás seguro de eliminar la rutina de lunes a sábado? Esta acción no se puede deshacer.')) {
      try {
        const routinesRef = ref(database, `gym_clients/${clientId}/routines`);
        await update(routinesRef, {
          Lunes: '',
          Martes: '',
          Miércoles: '',
          Jueves: '',
          Viernes: '',
          Sábado: ''
        });
        alert('✅ Rutina eliminada. Ahora puedes agregar los ejercicios manualmente.');
      } catch (error) {
        console.error('Error clearing routine:', error);
        alert('❌ Error al eliminar la rutina');
      }
    }
  };

  const sendWhatsApp = (client: Client) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let message = `💪 *RUTINA GYM - ${client.name.toUpperCase()}*\n\n`;
    message += `📅 Duración: ${client.duration} semanas\n`;
    message += `⚖️ Peso: ${client.weight} kg\n`;
    message += `🎯 Objetivo: ${client.goal}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    days.forEach(day => {
      message += `*${day}:*\n${(client.routines as any)[day]}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `¡A entrenar duro! 💪🔥`;

    const phone = client.phone.replace(/\D/g, '');
    const url = `https://wa.me/52${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ La imagen es demasiado grande. Máximo 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          if (compressedDataUrl.length > 4.5 * 1024 * 1024) {
            alert('⚠️ La imagen comprimida sigue siendo muy grande. Intenta con una imagen de menor resolución.');
            return;
          }
          
          try {
            setCurrentLogo(compressedDataUrl);
            localStorage.setItem('gym_logo', compressedDataUrl);
            alert('✅ Logo cargado exitosamente');
          } catch (error) {
            alert('❌ Error al guardar el logo. localStorage puede estar lleno.');
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const viewRoutinePDF = (client: Client) => {
    setCurrentClient(client);
    setShowPrintModal(true);
  };

  const printRoutine = () => {
    const printContent = document.getElementById('printableRoutine');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(`
      <html>
        <head>
          <title>Rutina GYM - Imprimir</title>
          <style>
            @page {
              size: letter;
              margin: 10mm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 10px;
              background: white;
              font-size: 11px;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow!.document.close();
    printWindow!.focus();
    setTimeout(() => {
      printWindow!.print();
      printWindow!.close();
    }, 250);
  };

  const downloadPDF = () => {
    const printContent = document.getElementById('printableRoutine');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow!.document.write(`
      <html>
        <head>
          <title>Rutina GYM - Descargar PDF</title>
          <style>
            @page {
              size: letter;
              margin: 10mm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 10px;
              background: white;
              font-size: 11px;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            setTimeout(function() {
              window.print();
            }, 500);
          <\/script>
        </body>
      </html>
    `);
    printWindow!.document.close();
    printWindow!.focus();
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      number: client.number,
      phone: client.phone,
      startDate: client.startDate,
      duration: client.duration,
      weight: client.weight.toString(),
      goal: client.goal
    });
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClient) return;

    try {
      const clientRef = ref(database, `gym_clients/${editingClient.id}`);
      await update(clientRef, {
        name: formData.name,
        number: formData.number,
        phone: formData.phone,
        startDate: formData.startDate,
        duration: formData.duration,
        weight: parseFloat(formData.weight),
        goal: formData.goal
      });
      
      setShowEditModal(false);
      setEditingClient(null);
      setFormData({
        name: '',
        number: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: '',
        weight: '',
        goal: ''
      });
      alert('✅ Cliente actualizado exitosamente');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('❌ Error al actualizar el cliente');
    }
  };

  const filteredClients = clients.filter(client => {
    if (searchTerm === '') return true;
    const searchTermLower = searchTerm.toLowerCase();
    const cleanPhone = client.phone.replace(/\s/g, '');
    return (
      client.name.toLowerCase().includes(searchTermLower) ||
      cleanPhone.includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.number.toLowerCase().includes(searchTermLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-header">
            <div className="login-icon">
              {currentLogo ? (
                <img src={currentLogo} alt="Logo" style={{ width: '280px', height: '280px', objectFit: 'contain', borderRadius: '10px' }} />
              ) : (
                '💪'
              )}
            </div>
            <h1>FITNESS CENTER GYM</h1>
            <p style={{ color: '#b0b0b0' }}>Inicia sesión para continuar</p>
            <label htmlFor="logoInput" style={{
              background: '#333',
              color: '#ff6b35',
              border: '2px dashed #ff6b35',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              marginTop: '10px',
              display: 'inline-block'
            }}>
              📷 Cargar Logo/Imagen
            </label>
            <input
              type="file"
              id="logoInput"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
          </div>

          {errorMessage && (
            <div className="error-message" style={{ background: '#ff4444', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>👤 ID de Usuario</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ingresa tu ID" 
                required 
              />
            </div>

            <div className="form-group">
              <label>🔒 Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Iniciar Sesión</button>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => {
                setUserId('gym2026');
                setPassword('rutinas123');
              }}
            >
              ⚡ Autocompletar Credenciales
            </button>
          </form>

          <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #333' }}>
            <p style={{ color: '#b0b0b0', fontSize: '13px', marginBottom: '8px' }}><strong style={{ color: '#ff6b35' }}>Credenciales de acceso:</strong></p>
            <p style={{ color: '#b0b0b0', fontSize: '13px' }}>ID: <strong style={{ color: '#ff6b35' }}>gym2026</strong></p>
            <p style={{ color: '#b0b0b0', fontSize: '13px' }}>Contraseña: <strong style={{ color: '#ff6b35' }}>rutinas123</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>💪 FITNESS CENTER GYM - Gestión de Clientes</h1>
        <button className="logout-button" onClick={() => setIsAuthenticated(false)}>🚪 Cerrar Sesión</button>
      </div>

      <div className="container">
        <div className="search-bar">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Buscar cliente por nombre o teléfono..." 
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>➕ Registrar Nuevo Cliente</button>
        </div>

        <div id="clientsList">
          {filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#b0b0b0' }}>
              <h3>No hay clientes registrados</h3>
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="client-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="info-item" style={{ flex: 1 }}>
                    <label>👤 Nombre</label>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{client.name}</p>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={() => setCurrentClient(client)}>📋 Ver Rutina</button>
                  <button className="btn btn-success" onClick={() => sendWhatsApp(client)}>💬 Enviar por WhatsApp</button>
                  <button className="btn btn-info" onClick={() => handleEditClient(client)} style={{ background: '#17a2b8', color: 'white' }}>✏️ Editar</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteClient(client.id)}>🗑️ Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {currentClient && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2>📋 Rutina Semanal</h2>
              <button className="close-btn" onClick={() => setCurrentClient(null)}>&times;</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button className="btn btn-primary" onClick={() => handleFillRoutine(currentClient.id)}>📝 Rellenar Formulario</button>
              <button className="btn btn-success" onClick={() => sendWhatsApp(currentClient)}>💬 Enviar Rutina por WhatsApp</button>
              <button className="btn btn-info" onClick={() => viewRoutinePDF(currentClient)}>📄 Ver Rutina para Imprimir</button>
              <button className="btn btn-danger" onClick={() => handleClearRoutine(currentClient.id)}>🗑️ Eliminar Rutina</button>
            </div>

            <div style={{ marginBottom: '30px', padding: '20px', background: '#1a1a1a', borderRadius: '10px', border: '2px solid #ff6b35' }}>
              <h3 style={{ color: '#ff6b35', marginBottom: '15px', fontSize: '22px' }}>📋 Información del Cliente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="info-item">
                  <label>👤 Nombre</label>
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{currentClient.name}</p>
                </div>
                <div className="info-item">
                  <label>🔢 Número</label>
                  <p>{currentClient.number}</p>
                </div>
                <div className="info-item">
                  <label>📱 Teléfono</label>
                  <p>{currentClient.phone}</p>
                </div>
                <div className="info-item">
                  <label>📅 Inicio</label>
                  <p>{formatDate(currentClient.startDate)}</p>
                </div>
                <div className="info-item">
                  <label>⏱️ Duración</label>
                  <p>{currentClient.duration} semanas</p>
                </div>
                <div className="info-item">
                  <label>⚖️ Peso</label>
                  <p>{currentClient.weight} kg</p>
                </div>
              </div>
              <div className="info-item" style={{ marginTop: '15px' }}>
                <label>🎯 Objetivo</label>
                <p style={{ fontSize: '15px' }}>{currentClient.goal}</p>
              </div>
            </div>

            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
              <div key={day} className="routine-day">
                <h4>{day}</h4>
                <textarea 
                  defaultValue={currentClient.routines[day]}
                  onChange={(e) => handleUpdateRoutine(currentClient.id, day, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>➕ Registrar Nuevo Cliente</h2>
              <button className="close-btn" onClick={() => setShowRegisterModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleRegisterClient}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Cliente *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Número de Cliente *</label>
                  <input 
                    type="text" 
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono Personal *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Duración de la Rutina *</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  >
                    <option value="">Selecciona duración</option>
                    <option value="4">4 semanas</option>
                    <option value="6">6 semanas</option>
                    <option value="8">8 semanas</option>
                    <option value="12">12 semanas</option>
                    <option value="16">16 semanas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Peso Actual (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Objetivo del Cliente *</label>
                  <textarea 
                    rows={3} 
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="Ej: Ganancia muscular, pérdida de peso, tonificación, etc." 
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button type="submit" className="btn btn-primary">💾 Registrar Cliente</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingClient && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Editar Cliente</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleUpdateClient}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Cliente *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Número de Cliente *</label>
                  <input 
                    type="text" 
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono Personal *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Duración de la Rutina *</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  >
                    <option value="">Selecciona duración</option>
                    <option value="4">4 semanas</option>
                    <option value="6">6 semanas</option>
                    <option value="8">8 semanas</option>
                    <option value="12">12 semanas</option>
                    <option value="16">16 semanas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Peso Actual (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Objetivo del Cliente *</label>
                  <textarea 
                    rows={3} 
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="Ej: Ganancia muscular, pérdida de peso, tonificación, etc." 
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button type="submit" className="btn btn-primary">💾 Guardar Cambios</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrintModal && currentClient && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>📄 Vista de Impresión</h2>
              <div>
                <button className="btn btn-primary" onClick={printRoutine} style={{ marginRight: '10px' }}>🖨️ Imprimir</button>
                <button className="btn btn-purple" onClick={downloadPDF} style={{ marginRight: '10px', background: '#9C27B0', color: 'white' }}>📥 Descargar PDF</button>
                <button className="close-btn" onClick={() => setShowPrintModal(false)}>&times;</button>
              </div>
            </div>

            <div id="printableRoutine" style={{ background: 'white', color: '#000', padding: '20px', fontSize: '17px' }}>
              <div style={{ textAlign: 'center', borderBottom: '3px solid #ff6b35', paddingBottom: '10px', marginBottom: '15px' }}>
                {currentLogo ? (
                  <div style={{ marginBottom: '2px' }}>
                    <img src={currentLogo} alt="Logo" style={{ width: '350px', height: '350px', objectFit: 'contain', borderRadius: '10px' }} />
                  </div>
                ) : (
                  <div style={{ fontSize: '30px', marginBottom: '5px' }}>💪</div>
                )}
                <h1 style={{ color: '#ff6b35', fontSize: '36px', margin: '0 0 2px 0', fontFamily: 'Impact, Arial Black, sans-serif', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>FITNESS CENTER GYM</h1>
                <p style={{ color: '#666', fontSize: '18px', fontStyle: 'italic', margin: 0 }}>Tu Entrenamiento Personalizado</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '5px', borderLeft: '4px solid #ff6b35' }}>
                  <h2 style={{ color: '#ff6b35', marginBottom: '8px', fontSize: '20px' }}>📋 Datos del Cliente</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '17px' }}>
                    <div>
                      <strong style={{ color: '#333' }}>👤 Nombre:</strong>
                      <p style={{ margin: '3px 0' }}>{currentClient.name}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#333' }}>🔢 Número:</strong>
                      <p style={{ margin: '3px 0' }}>{currentClient.number}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#333' }}>📅 Inicio:</strong>
                      <p style={{ margin: '3px 0' }}>{formatDate(currentClient.startDate)}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#333' }}>⏱️ Duración:</strong>
                      <p style={{ margin: '3px 0' }}>{currentClient.duration} semanas</p>
                    </div>
                    <div>
                      <strong style={{ color: '#333' }}>⚖️ Peso:</strong>
                      <p style={{ margin: '3px 0' }}>{currentClient.weight} kg</p>
                    </div>
                    <div>
                      <strong style={{ color: '#333' }}>🎯 Objetivo:</strong>
                      <p style={{ margin: '3px 0' }}>{currentClient.goal}</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 style={{ color: '#ff6b35', marginBottom: '10px', fontSize: '22px', textAlign: 'center' }}>🏋️ Tu Rutina Semanal</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                  <div key={day} style={{ background: '#f9f9f9', borderLeft: '4px solid #ff6b35', padding: '10px', borderRadius: '3px' }}>
                    <h3 style={{ color: '#ff6b35', fontSize: '19px', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>{day}</h3>
                    <div style={{ fontSize: '16px', lineHeight: 1.5, color: '#333' }}>
                      {(currentClient.routines as any)[day].split('\n').map((line: string, idx: number) => (
                        <p key={idx} style={{ margin: '4px 0', paddingLeft: '15px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: '#ff6b35', fontWeight: 'bold' }}>✓</span> {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid #ff6b35', paddingTop: '10px', marginTop: '15px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', color: '#ff6b35', fontWeight: 'bold', marginBottom: '5px' }}>¡A entrenar duro! 💪🔥</p>
                <p style={{ color: '#666', fontSize: '15px' }}>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} | © 2026 FITNESS CENTER GYM</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

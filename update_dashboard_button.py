# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Actualizar el botón de Chat Clientes para que navegue a la página
old_button = '''<button
          onClick={() => {
            // TODO: Implementar página de lista de chats con clientes
            alert('💬 Chat con Clientes\\n\\nAquí podrás ver la lista de todos tus clientes activos y chatear con ellos.\\n\\nFunción en desarrollo...');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/chat-clientes' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬👤</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Chat Clientes</span>
        </button>'''
                
new_button = '''<button
          onClick={() => navigate('/chat-clientes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: location.pathname === '/chat-clientes' ? '#2196F3' : '#666'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬👤</span>
          <span style={{ fontSize: '12px', marginTop: '2px' }}>Chat Clientes</span>
        </button>'''

content = content.replace(old_button, new_button)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Botón de Chat Clientes actualizado para navegar a /chat-clientes")

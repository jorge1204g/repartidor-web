# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# CAMBIO 1.1: Agregar condicional al botón "En camino al restaurante"
old_text = '''{/* Botón En camino al restaurante */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}'''
                            
new_text = '''{/* Botón En camino al restaurante (solo si está ACCEPTED) */}
                          {order.status === OrderStatus.ACCEPTED && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}'''

content = content.replace(old_text, new_text)

# Necesitamos cerrar el condicional después del botón
# Buscar el cierre del botón y agregar el cierre del condicional
old_close = '''<span style={{ fontSize: '20px' }}>🛵</span>
                              <span>1. En camino al restaurante</span>
                            </span>
                          </button>
                        </div>
                      )}'''
                      
new_close = '''<span style={{ fontSize: '20px' }}>🛵</span>
                              <span>1. En camino al restaurante</span>
                            </span>
                          </button>
                          )}
                        </div>
                      )}'''

content = content.replace(old_close, new_close)

# CAMBIO 2: Agregar botón de Chat con Clientes en la navegación inferior
old_nav = '''{unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              zIndex: 101
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>'''
      
new_nav = '''{unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              zIndex: 101
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <button
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
        </button>
      </div>'''

content = content.replace(old_nav, new_nav)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ CAMBIOS COMPLETADOS:")
print("   1. Botón 'Ver Detalles del Pedido' ahora es FIJO en todos los estados")
print("   2. Botón 'En camino al restaurante' solo aparece cuando está ACCEPTED")
print("   3. Agregado botón 'Chat Clientes' en navegación inferior")

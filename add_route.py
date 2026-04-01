# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar import de ClientListPage
old_import = '''import ClientChatPage from './pages/ClientChatPage';'''
new_import = '''import ClientChatPage from './pages/ClientChatPage';
import ClientListPage from './pages/ClientListPage';'''

content = content.replace(old_import, new_import)

# Agregar ruta para /chat-clientes
old_route = '''<Route path="/chat-cliente" element={<ClientChatPage />} />'''
new_route = '''<Route path="/chat-cliente" element={<ClientChatPage />} />
        <Route path="/chat-clientes" element={<ClientListPage />} />'''

content = content.replace(old_route, new_route)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Ruta /chat-clientes agregada a App.tsx")

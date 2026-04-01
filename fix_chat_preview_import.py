# Leer el archivo ChatPreviewWidget.tsx
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\components\ChatPreviewWidget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar import de AuthService
old_imports = """import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageService from '../services/MessageService';
import AudioNotificationService from '../utils/AudioNotificationService';"""

new_imports = """import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import AudioNotificationService from '../utils/AudioNotificationService';"""

content = content.replace(old_imports, new_imports)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\components\ChatPreviewWidget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ AuthService importado correctamente en ChatPreviewWidget")

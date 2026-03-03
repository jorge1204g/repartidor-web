# Sistema de Asignación de Pedidos - 2 Aplicaciones

## Descripción

Este proyecto contiene **2 aplicaciones Android**:

1. **App Administrador** (`app`) - Para crear y asignar pedidos a repartidores
2. **App Repartidor** (`app-repartidor`) - Para recibir y gestionar pedidos asignados

## Configuración de Firebase

### IMPORTANTE: Debes configurar Firebase antes de usar las apps

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Agrega 2 aplicaciones Android:
   - **App Administrador**: `com.example.aplicacionnuevaprueba1`
   - **App Repartidor**: `com.example.repartidor`
4. Descarga los archivos `google-services.json` para cada app
5. Coloca los archivos en las carpetas correspondientes:
   - `app/google-services.json` (para app administrador)
   - `app-repartidor/google-services.json` (para app repartidor)

### Habilitar Realtime Database en Firebase

1. En Firebase Console, ve a **Realtime Database**
2. Haz clic en **Crear base de datos**
3. Selecciona ubicación (ejemplo: us-central1)
4. Comienza en **modo de prueba** (para desarrollo)

### Reglas de Seguridad (para desarrollo)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas son solo para desarrollo. Para producción, configura reglas más seguras.

### (Opcional) Cloud Messaging para Notificaciones

1. En Firebase Console, ve a **Cloud Messaging**
2. No necesitas configuración adicional para notificaciones básicas

## Cómo Usar

### App Administrador

1. Instala la app en un dispositivo
2. Abre la app
3. Ve a la pestaña **"Repartidores"**
4. Agrega repartidores (guarda el ID que se genera)
5. Ve a la pestaña **"Crear Pedido"**
6. Llena el formulario con la información del pedido:
   - ID del Pedido (ejemplo: 17691537)
   - Restaurante (ejemplo: BURGER BUS FRESNILLO)
   - Fecha y Hora (formato: dd/MM/yyyy HH:mm)
   - Método de Pago (ejemplo: Tarjeta)
   - Información del cliente (nombre, teléfono, email)
   - Producto, cantidad, precio
   - Ubicación (latitud, longitud)
7. Haz clic en **"Crear Pedido"**
8. Ve a la pestaña **"Pedidos"**
9. Haz clic en un pedido pendiente
10. Selecciona un repartidor para asignarlo

### App Repartidor

1. Instala la app en un dispositivo (puede ser el mismo o diferente)
2. Abre la app
3. Ingresa el **ID del repartidor** (el que guardaste al crearlo en la app administrador)
4. Haz clic en **"Iniciar Sesión"**
5. Verás los pedidos asignados a ti
6. Haz clic en un pedido para ver detalles
7. Usa los botones:
   - **"Llamar"**: Para llamar al cliente
   - **"Mapa"**: Para abrir Google Maps con la ubicación del cliente
   - **"Iniciar Entrega"**: Para cambiar el estado a "En progreso"
   - **"Marcar Entregado"**: Para completar el pedido

## Flujo Completo de Ejemplo

1. **En App Administrador**:
   - Crea un repartidor: "Juan Pérez" - "4931001143"
   - Copia el ID generado (ejemplo: "-NxAbCd123456")
   
2. **En App Repartidor**:
   - Ingresa el ID: "-NxAbCd123456"
   - Inicia sesión
   
3. **En App Administrador**:
   - Crea un pedido con los datos:
     - ID: 17691537
     - Restaurante: BURGER BUS FRESNILLO
     - Fecha: 23/01/2026 01:35
     - Cliente: Jorge Garcia
     - Teléfono: 4931001143
     - Producto: Taco de Bistec x1 - $102.00
     - Envío: $40.00
     - Ubicación: 23.174267, -102.845803
   - Asigna el pedido a "Juan Pérez"
   
4. **En App Repartidor**:
   - Automáticamente aparecerá el nuevo pedido
   - Haz clic para ver detalles
   - Usa "Mapa" para ver la ubicación del cliente
   - Marca como "Iniciar Entrega"
   - Cuando termines, marca como "Entregado"

## Estructura del Proyecto

```
Prueba New/
├── app/                          # App Administrador
│   ├── src/main/
│   │   ├── java/
│   │   │   └── com/example/aplicacionnuevaprueba1/
│   │   │       ├── data/
│   │   │       │   ├── model/
│   │   │       │   └── repository/
│   │   │       ├── ui/
│   │   │       │   ├── screens/
│   │   │       │   ├── theme/
│   │   │       │   └── viewmodel/
│   │   │       └── MainActivity.kt
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
│
├── app-repartidor/              # App Repartidor
│   ├── src/main/
│   │   ├── java/
│   │   │   └── com/example/repartidor/
│   │   │       ├── data/
│   │   │       ├── service/
│   │   │       ├── ui/
│   │   │       └── MainActivity.kt
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
│
└── gradle/
    └── libs.versions.toml
```

## Tecnologías Usadas

- **Kotlin**
- **Jetpack Compose** (UI moderna)
- **Firebase Realtime Database** (sincronización en tiempo real)
- **Firebase Cloud Messaging** (notificaciones push)
- **Google Maps** (integración con mapas)
- **Material Design 3**

## Notas Importantes

- Ambas apps deben estar conectadas a internet
- El ID del repartidor es crucial para que funcione la sincronización
- Los pedidos se actualizan en tiempo real
- La ubicación del cliente se abre con Google Maps automáticamente
- Las notificaciones requieren permisos en Android 13+

## Próximas Mejoras Sugeridas

- [ ] Autenticación de usuarios
- [ ] Historial de pedidos
- [ ] Estadísticas y reportes
- [ ] Mapa integrado en la app
- [ ] Chat entre administrador y repartidor
- [ ] Notificaciones push automáticas
- [ ] Soporte para múltiples productos por pedido
- [ ] Cálculo automático de rutas

## Problemas Comunes

**Error: "Default FirebaseApp is not initialized"**
- Solución: Verifica que `google-services.json` esté en la carpeta correcta

**No aparecen los pedidos en la app repartidor**
- Verifica que el ID del repartidor sea el correcto
- Asegúrate de que el pedido esté asignado a ese repartidor

**Error de compilación**
- Sincroniza el proyecto con Gradle (Sync Now)
- Limpia y reconstruye: Build → Clean Project → Rebuild Project

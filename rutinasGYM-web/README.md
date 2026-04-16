# FITNESS CENTER GYM Web - Gestión de Clientes y Rutinas

Aplicación web para la gestión de clientes y rutinas de gimnasio, con base de datos en tiempo real usando Firebase y despliegue en Vercel.

## 🚀 Características

- ✅ **Base de datos en tiempo real** con Firebase Realtime Database
- ✅ **Sincronización automática** entre todos los dispositivos
- ✅ **Acceso desde cualquier lugar** con URL de Vercel
- ✅ **Registro de clientes** con información completa
- ✅ **Rutinas semanales** editables (Lunes a Sábado)
- ✅ **Envío por WhatsApp** de rutinas a clientes
- ✅ **Búsqueda** por nombre, teléfono o número de cliente
- ✅ **Rellenado automático** de rutinas con 6 ejercicios por día
- ✅ **Diseño responsive** para móvil y escritorio

## 📋 Requisitos Previos

- Node.js 16+ y npm
- Cuenta de Firebase (gratis)
- Cuenta de Vercel (gratis)

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

Sigue las instrucciones completas en [CONFIGURACION_FIREBASE_VERCEL.md](./CONFIGURACION_FIREBASE_VERCEL.md)

**Resumen rápido:**

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Realtime Database en modo prueba
3. Registra una app web y copia las credenciales
4. Crea un archivo `.env.local` con las variables:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu_proyecto.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Configurar reglas de Firebase

En Firebase Console > Realtime Database > Reglas:

```json
{
  "rules": {
    "clients": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 🏃‍♂️ Ejecutar en Desarrollo

```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

## 🚀 Desplegar en Vercel

### Opción 1: Usando el script

```bash
deploy-vercel.bat
```

### Opción 2: Manual con Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel --prod
```

### Opción 3: GitHub + Vercel

1. Sube el proyecto a GitHub
2. Conecta tu repositorio en Vercel
3. Configura las variables de entorno
4. Despliega automáticamente

## 📱 Credenciales de Acceso

- **ID**: `gym2026`
- **Contraseña**: `rutinas123`

## 🏗️ Estructura del Proyecto

```
rutinasGYM-web/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Configuración de Firebase
│   ├── components/              # Componentes React
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── App.tsx                  # Componente principal
│   ├── App.css                  # Estilos
│   ├── index.css                # Estilos globales
│   └── main.tsx                 # Punto de entrada
├── public/                      # Archivos estáticos
├── .env.example                 # Ejemplo de variables
├── .env.local                   # Variables locales (no commitear)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                  # Configuración de Vercel
└── deploy-vercel.bat            # Script de despliegue
```

## 🔧 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Firebase** - Base de datos en tiempo real
- **Vercel** - Hosting y despliegue

## 📊 Funcionalidades

### Registro de Clientes
- Nombre, número de cliente, teléfono
- Fecha de inicio y duración de rutina
- Peso actual y objetivo

### Gestión de Rutinas
- Rutinas semanales (Lunes a Sábado)
- 6 ejercicios predeterminados por día
- Edición en tiempo real
- Rellenado automático

### Comunicación
- Envío de rutinas por WhatsApp
- Mensajes formateados con emojis
- Incluye datos del cliente y objetivo

### Búsqueda
- Por nombre del cliente
- Por teléfono
- Por número de cliente

## 🔐 Seguridad

**Para desarrollo:**
- Reglas de Firebase abiertas (lectura/escritura pública)

**Para producción (recomendado):**
- Implementar autenticación de Firebase
- Actualizar reglas de seguridad
- Proteger con tokens de acceso

## 📝 Notas

- La base de datos está en Firebase (no en localStorage)
- Todos los dispositivos ven los mismos datos en tiempo real
- Los cambios se sincronizan automáticamente
- Puedes acceder desde cualquier dispositivo con la URL de Vercel

## 🆘 Solución de Problemas

Ver la sección de [Solución de Problemas](./CONFIGURACION_FIREBASE_VERCEL.md#-solución-de-problemas) en la guía de configuración.

## 📄 Licencia

ISC

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

---

**Desarrollado con ❤️ para FITNESS CENTER GYM**

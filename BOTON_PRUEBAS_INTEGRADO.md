# 🧪 Botón de Pruebas Integrado

## ✅ Cambios Realizados

### 1. **Botón "Pruebas" en Dashboard**
- Se agregó un botón **🧪 Pruebas** al lado del botón **👤 Perfil** en el dashboard principal
- El botón tiene un diseño atractivo con gradiente naranja/amarillo
- Al hacer clic, abre las pruebas de Google Maps en una nueva pestaña

### 2. **Características del Botón**

**Ubicación:**
```
Dashboard → Header → Botones de acción
[📦 Crear Pedido] [📋 Mis Pedidos] [👤 Perfil] [🧪 Pruebas]
```

**Diseño:**
- Color: Gradiente naranja/amarillo (`#f59e0b` → `#d97706`)
- Icono: 🧪 (tubo de ensayo)
- Sombra: Naranja brillante
- Mismo tamaño que los otros botones

**Funcionalidad:**
- Abre `http://localhost:8000/test-maps-simple.html` en una nueva pestaña
- Integra las pruebas de autocompletado de Google Maps Places
- Permite testear cálculo de distancias y costos de envío

## 🚀 Cómo Usar

### 1. Iniciar el Servidor de Pruebas

El servidor Python debe estar corriendo en puerto 8000:

```bash
python -m http.server 8000
```

### 2. Acceder al Dashboard

1. Ve a: `https://cliente-web-mu.vercel.app/inicio`
2. Inicia sesión con tus credenciales
3. Verás el nuevo botón **🧪 Pruebas** junto a **👤 Perfil**

### 3. Probar Google Maps

1. Haz clic en **🧪 Pruebas**
2. Se abrirá la página de pruebas en una nueva pestaña
3. Escribe direcciones como "Juana Gallo 624"
4. Google Maps mostrará sugerencias automáticas
5. Selecciona recogida y entrega
6. Calcula la distancia y costo del envío

## 📋 Archivos Modificados

### `cliente-web/src/pages/Dashboard.tsx`
- Agregada función `handlePruebas()`
- Agregado botón en la sección de acciones
- Estilo único con gradiente naranja

### `test-maps-simple.html`
- Integración con Google Maps Places API
- Autocompletado de direcciones en tiempo real
- Cálculo de distancias usando coordenadas GPS
- Interfaz mejorada con soporte para API Key

## 🔧 Configuración Requerida

### API Key de Google Maps
El archivo usa tu API Key: `AIzaSyCjqlvk5RqykmtVyjYwe6vF0QWxZ9RFRYE`

**Asegúrate de tener habilitadas:**
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Distance Matrix API

### Servidor Local
El botón apunta a `http://localhost:8000/test-maps-simple.html`

**Importante:** El servidor Python debe estar corriendo para que funcione.

## 🎯 Flujo de Prueba

1. **Dashboard** → Click en **🧪 Pruebas**
2. **Página de Pruebas** se abre en nueva pestaña
3. **Escribir dirección** de recogida (ej: "Av. Hidalgo")
4. **Seleccionar sugerencia** de Google Maps
5. **Escribir dirección** de entrega (ej: "Juana Gallo 624")
6. **Seleccionar sugerencia** de Google Maps
7. **Click en "🗺️ Calcular Distancia"**
8. **Ver resultado** con distancia en km y costo del envío

## 💡 Beneficios

✅ **Testing rápido** de funcionalidades de mapas  
✅ **Validación en tiempo real** de direcciones  
✅ **Cálculo automático** de costos de envío  
✅ **Integración perfecta** con la app principal  
✅ **Sin salir del dashboard** para hacer pruebas  

## 📸 Captura

El botón se ve así:

```
┌─────────────────────────────────────────┐
│  📦 Crear Pedido  │  📋 Mis Pedidos    │
│  👤 Perfil        │  🧪 Pruebas        │
└─────────────────────────────────────────┘
```

## 🔍 Solución de Problemas

### El botón no abre nada
- Verifica que el servidor Python esté corriendo: `python -m http.server 8000`
- Revisa la consola del navegador (F12) por errores

### Google Maps no muestra sugerencias
- Verifica que tu API Key tenga Places API habilitada
- Revisa la consola (F12) por errores de API Key
- Asegúrate de tener facturación configurada en Google Cloud

### Error "RefererNotAllowedMapError"
- Tu API Key tiene restricciones de HTTP Referrer
- Quita las restricciones temporalmente en Google Cloud Console
- O agrega `http://localhost` a los referers permitidos

## 📝 Notas

- Este botón es solo para desarrollo/testing
- En producción, podrías querer removerlo o protegerlo con autenticación
- El servidor local solo corre en tu máquina de desarrollo

---

**Última actualización:** 24 de Marzo, 2026  
**Estado:** ✅ Funcional

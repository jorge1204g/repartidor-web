# App Web del Repartidor - Configuración Actualizada ✅

## ¿Qué es esta aplicación?

Es una **aplicación web progresiva (PWA)** que permite a los repartidores gestionar pedidos desde cualquier navegador web, sin necesidad de instalar una aplicación móvil.

## Características Principales

- ✅ **Login con ID de repartidor** - Mismo sistema que la app móvil
- ✅ **Dashboard en tiempo real** - Ver pedidos asignados instantáneamente
- ✅ **Gestión de pedidos** - Aceptar, actualizar estado, completar entregas
- ✅ **Mensajería** - Chat con el administrador
- ✅ **Historial** - Ver entregas completadas y ganancias
- ✅ **Perfil** - Información del repartidor y estadísticas

## Configuración Actual

La app está configurada para conectarse a tu proyecto de Firebase:

- **Project ID**: `myappdelivery-4a576`
- **Database URL**: `https://myappdelivery-4a576-default-rtdb.firebaseio.com`
- **Reglas de seguridad**: Activas hasta abril 2026

## ¿Cómo ejecutar la app web?

### Prerrequisitos

- Node.js instalado (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - La app se abrirá automáticamente en `http://localhost:5173`
   - O abre manualmente esa URL en tu navegador

4. **Probar la app**:
   - Usa un ID de repartidor válido (creado desde la app de administrador)
   - Inicia sesión y verás los mismos datos que en la app móvil

## Comandos disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de la versión compilada

## Archivos de configuración actualizados

Los siguientes archivos han sido actualizados para conectarse a tu Firebase:

1. `.env.local` - Variable de entorno principal
2. `src/config/appConfig.ts` - Configuración de la aplicación
3. `src/services/Firebase.ts` - Servicio de Firebase

## Diferencias con la app móvil Android

| Característica | App Móvil (Android) | App Web |
|----------------|---------------------|---------|
| Plataforma | Android nativo | Navegador web |
| Instalación | Requiere APK | Sin instalación |
| Notificaciones push | Sí (FCM) | Limitado (depende del navegador) |
| Acceso offline | Parcial | Limitado |
| Desarrollo | Kotlin + Jetpack Compose | React + TypeScript |

## Ventajas de tener ambas apps

1. **Flexibilidad**: Los repartidores pueden elegir qué usar
2. **Respaldo**: Si falla una, pueden usar la otra
3. **Desarrollo rápido**: Nuevas funciones primero en web
4. **Acceso universal**: Desde cualquier dispositivo con navegador

## Datos compartidos

Ambas apps comparten:
- ✅ Misma base de datos Firebase
- ✅ Mismos repartidores registrados
- ✅ Mismos pedidos
- ✅ Mismos mensajes
- ✅ Sincronización en tiempo real

## Solución de problemas

### La app no carga los datos
1. Verifica que el ID de repartidor sea correcto
2. Revisa que el repartidor esté aprobado en Firebase
3. Refresca la página (F5)

### Error de conexión con Firebase
1. Verifica tu conexión a internet
2. Revisa las reglas de seguridad en Firebase Console
3. Confirma que las reglas no hayan expirado

### Los datos no se sincronizan
1. Ambas apps deben estar conectadas al mismo proyecto Firebase
2. Verifica que las URLs de Firebase coincidan
3. Reinicia la app para forzar recarga completa

## Próximos pasos recomendados

1. **Probar la app web**:
   ```bash
   npm run dev
   ```

2. **Crear un repartidor de prueba** desde la app administrador

3. **Iniciar sesión** en la app web con ese ID

4. **Verificar que los datos se sincronicen** entre:
   - App móvil del repartidor
   - App web del repartidor
   - Firebase Console

## Notas importantes

- ⚠️ Las reglas de seguridad expiran en abril 2026
- ⚠️ Para producción, configura reglas más estrictas
- ⚠️ Considera implementar autenticación con Firebase Auth
- ⚠️ Para notificaciones push en web, necesitas configurar Service Workers

## Soporte

Si encuentras errores o necesitas ayuda:
1. Revisa la consola del navegador (F12)
2. Verifica Firebase Console para ver si hay datos
3. Confirma que todas las URLs de Firebase sean correctas

---

**Estado**: ✅ Configurada y lista para usar
**Última actualización**: Marzo 2025
**Versión**: 1.0.0

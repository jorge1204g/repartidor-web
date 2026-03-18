# Aplicación Web de Restaurante

Aplicación web para que los restaurantes gestionen sus pedidos, menú y cocina.

## Características

- ✅ **Gestión de pedidos activos** - Ver todos los pedidos en tiempo real
- ✅ **Crear nuevos pedidos** - Formulario completo para crear órdenes
- ✅ **Historial de pedidos** - Ver pedidos entregados y cancelados
- ✅ **Menú** - Administrar productos del restaurante
- ✅ **Vista de cocina** - Preparación de pedidos
- ✅ **Autenticación por ID** - Acceso seguro con credenciales únicas

## Tecnologías utilizadas

- React 19
- TypeScript
- Firebase Realtime Database
- Vite
- React Router DOM

## Instalación

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```

3. Ejecuta servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre en tu navegador: `http://localhost:3001`

## Comandos disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de la versión compilada

## Despliegue en Vercel

La aplicación está configurada para desplegarse fácilmente en Vercel:

### Opción 1: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
```

### Opción 2: Desde GitHub

1. Sube este proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Selecciona la carpeta `restaurante-web`
5. Configura las variables de entorno:
   - `VITE_FIREBASE_DATABASE_URL`
6. ¡Despliega!

Obtendrás una URL como: `https://tu-restaurante.vercel.app`

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_FIREBASE_DATABASE_URL=https://myappdelivery-4a576-default-rtdb.firebaseio.com
```

## Estructura del Proyecto

```
restaurante-web/
├── src/
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── CreateOrderPage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── KitchenPage.tsx
│   │   └── ManageOrdersPage.tsx
│   ├── services/       # Servicios de Firebase y autenticación
│   ├── types/          # Tipos de TypeScript
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json
```

## Características Responsivas

✅ **Totalmente responsiva** - Se adapta a móviles, tablets y escritorio
✅ **Meta tags para iOS** - Funciona como app nativa en iPhones
✅ **Touch-friendly** - Botones grandes y fáciles de tocar
✅ **Navegación móvil** - Menú adaptable para pantallas pequeñas

## URLs de Interés

- **Repartidor Web**: https://repartidor-web.vercel.app/
- **Restaurante Web**: (Tu URL aquí después de desplegar)

## Datos Compartidos

Todas las apps comparten:
- ✅ Misma base de datos Firebase
- ✅ Mismos pedidos en tiempo real
- ✅ Sincronización instantánea
- ✅ IDs de restaurantes únicos

## Solución de Problemas

### La app no carga los datos
1. Verifica que el ID de restaurante sea correcto
2. Revisa que el restaurante esté aprobado en Firebase
3. Refresca la página (F5)

### Error de conexión con Firebase
1. Verifica tu conexión a internet
2. Revisa las reglas de seguridad en Firebase Console
3. Confirma que las URLs de Firebase coincidan

### Los datos no se sincronizan
1. Ambas apps deben estar conectadas al mismo proyecto Firebase
2. Verifica que las URLs de Firebase sean correctas
3. Reinicia la app para forzar recarga completa

## Notas Importantes

- ⚠️ Las reglas de seguridad de Firebase expiran en abril 2026
- ⚠️ Para producción, configura reglas más estrictas
- ⚠️ Considera implementar autenticación con Firebase Auth
- ⚠️ El puerto local es 3001 (diferente al de repartidor que es 3000)

## Soporte

Si encuentras errores o necesitas ayuda:
1. Revisa la consola del navegador (F12)
2. Verifica Firebase Console para ver si hay datos
3. Confirma que todas las URLs de Firebase sean correctas

---

**Estado**: ✅ Lista para desplegar
**Versión**: 1.0.0
**Última actualización**: Marzo 2025

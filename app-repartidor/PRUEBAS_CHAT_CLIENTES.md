# 🧪 GUÍA RÁPIDA DE PRUEBAS - CHAT CON CLIENTES

## 📱 Antes de Probar

### Requisitos:
- ✅ APK compilado de la app móvil del repartidor
- ✅ Dispositivo Android o emulador instalado
- ✅ Cuenta de repartidor válida
- ✅ Al menos 1 pedido activo asignado al repartidor
- ✅ Conexión a internet en el dispositivo

---

## 🔢 Pasos de Prueba

### Test 1: Verificar Nueva Pestaña "Clientes"

**Pasos**:
1. Abrir app del repartidor
2. Iniciar sesión con credenciales
3. Mirar menú inferior (abajo)

**Resultado Esperado**:
```
┌─────────────────────────────┐
│  [Inicio] [Historial]       │
│  [Clientes] [Mensajes]      │
│    ↑                        │
│   NUEVA                     │
└─────────────────────────────┘
```

✅ **Éxito**: Se ve pestaña "Clientes" con ícono 💬  
❌ **Falla**: No aparece la pestaña o muestra error

---

### Test 2: Abrir Lista de Clientes

**Pasos**:
1. Estar logueado como repartidor
2. Tener al menos 1 pedido activo
3. Tocar pestaña "Clientes" (posición 2)

**Resultado Esperado**:
```
┌─────────────────────────────┐
│  💬 Chats con Clientes  ←   │
├─────────────────────────────┤
│                             │
│  👤 Nombre del Cliente      │
│  📦 Pedido: PED-XXXXXX      │
│  📞 555-XXXX                │
│                          🏠 │
│                             │
└─────────────────────────────┘
```

✅ **Éxito**: Muestra lista con clientes y sus pedidos  
❌ **Falla**: Muestra "No hay chats activos" sin tener pedidos  
❌ **Falla**: Muestra error o pantalla vacía

---

### Test 3: Abrir Chat Individual

**Pre-requisitos**:
- ✅ Test 2 completado exitosamente
- ✅ Al menos 1 cliente en la lista

**Pasos**:
1. En lista de clientes, tocar un cliente
2. Observar pantalla que se abre

**Resultado Esperado**:
```
┌─────────────────────────────┐
│ ← 💬 María García           │
│    📦 Pedido: PED-995705    │
├─────────────────────────────┤
│                             │
│     💬 Hola, ¿dónde estás?  │
│         14:30               │
│                             │
│ ┌───────────────────────┐   │
│ │ Escribe un mensaje... │ → │
│ └───────────────────────┘   │
│                             │
└─────────────────────────────┘
```

✅ **Éxito**: Abre chat con header verde y campo para escribir  
❌ **Falla**: Muestra error o pantalla negra  
❌ **Falla**: Botón atrás no funciona

---

### Test 4: Enviar Mensaje

**Pre-requisitos**:
- ✅ Test 3 completado exitosamente
- ✅ Chat individual abierto

**Pasos**:
1. Tocar campo de texto
2. Escribir: "Hola, ya estoy en camino"
3. Tocar botón enviar (ícono avión de papel)
4. Observar resultado

**Resultado Esperado**:
```
┌─────────────────────────────┐
│ ← 💬 María García           │
├─────────────────────────────┤
│                             │
│     Hola, ¿dónde estás?     │
│     14:30                   │
│                             │
│ Hola, ya estoy en camino 🛵 │
│ 14:32                       │
│                             │
│ ┌───────────────────────┐   │
│ │                       │ → │
│ └───────────────────────┘   │
│                             │
└─────────────────────────────┘
```

✅ **Éxito**: Mensaje aparece en burbuja azul a la derecha  
✅ **Éxito**: Campo de texto se limpia después de enviar  
✅ **Éxito**: Timestamp muestra hora actual  
❌ **Falla**: Mensaje no aparece  
❌ **Falla**: Muestra mensaje de error  
❌ **Falla**: Campo no se limpia

---

### Test 5: Regresar a Lista

**Pre-requisitos**:
- ✅ Test 4 completado exitosamente
- ✅ Dentro de un chat individual

**Pasos**:
1. Tocar botón atrás (←) en esquina superior izquierda
2. Observar pantalla resultante

**Resultado Esperado**:
```
┌─────────────────────────────┐
│  💬 Chats con Clientes      │
├─────────────────────────────┤
│  👤 María García            │
│  📦 Pedido: PED-995705      │
│  📞 555-1234                │
│                          🏠 │
└─────────────────────────────┘
```

✅ **Éxito**: Regresa a lista de clientes  
✅ **Éxito**: Mantiene datos en lista  
❌ **Falla**: Regresa al dashboard  
❌ **Falla**: Cierra la app  
❌ **Falla**: Muestra error

---

### Test 6: Cambiar entre Pestañas

**Pre-requisitos**:
- ✅ App iniciada correctamente

**Pasos**:
1. Estar en pestaña "Clientes" (2)
2. Tocar pestaña "Inicio" (0)
3. Esperar 2 segundos
4. Tocar pestaña "Clientes" (2) nuevamente

**Resultado Esperado**:
- ✅ Navegación fluida entre pestañas
- ✅ Mantiene estado de la lista de clientes
- ✅ No muestra errores de navegación

❌ **Falla**: Error al cambiar pestañas  
❌ **Falla**: Pierde el estado  
❌ **Falla**: Muestra pantalla negra

---

## 🐛 Errores Comunes y Soluciones

### Error 1: "No hay chats activos"
**Causa**: No hay pedidos activos asignados al repartidor

**Solución**:
1. Crear un pedido de prueba desde app del cliente
2. Aceptar el pedido como repartidor
3. El pedido debe estar en estado: ACCEPTED, ON_THE_WAY_TO_STORE, etc.

---

### Error 2: Pantalla negra al abrir chat
**Causa Posible**: Error en filtros de mensajes

**Solución**:
1. Verificar conexión a internet
2. Revisar logs de Android (Logcat)
3. Verificar que el nombre del cliente coincide exactamente

---

### Error 3: Mensaje no se envía
**Causa Posible**: 
- Sin conexión a internet
- Error en Firebase
- ViewModel no tiene datos del repartidor

**Solución**:
1. Verificar conexión WiFi/datos
2. Revisar si Firebase está configurado correctamente
3. Verificar que `deliveryPerson` no sea null

---

### Error 4: App se cierra al tocar "Clientes"
**Causa Posible**: Crash por null pointer exception

**Solución**:
1. Revisar Logcat para ver stack trace
2. Verificar que `viewModel.orders` no sea null
3. Agregar manejo de errores en el código

---

## 📊 Checklist de Pruebas

### Funcionalidad Básica:
- [ ] Pestaña "Clientes" visible en menú
- [ ] Lista de clientes muestra pedidos activos
- [ ] Información del cliente es correcta
- [ ] Íconos de estado coinciden con estado real

### Chat Individual:
- [ ] Click en cliente abre chat
- [ ] Header muestra nombre y pedido correcto
- [ ] Botón atrás funciona
- [ ] Campo de texto editable

### Envío de Mensajes:
- [ ] Puede escribir mensajes
- [ ] Botón enviar funciona
- [ ] Mensaje aparece en chat
- [ ] Timestamp es correcto
- [ ] Campo se limpia después de enviar

### Navegación:
- [ ] Cambiar entre pestañas funciona
- [ ] Regresar a lista funciona
- [ ] No hay crashes o errores
- [ ] Mantiene estado al navegar

### Integración:
- [ ] Mensajes se guardan en Firebase
- [ ] Mensajes persisten al cerrar app
- [ ] Múltiples clientes separados correctamente
- [ ] No mezcla conversaciones

---

## 🎯 Criterios de Aceptación

### ✅ La funcionalidad se considera COMPLETADA si:

1. **Todas las pruebas anteriores pasan** ✅
2. **No hay crashes reportados** ✅
3. **Los mensajes se envían y reciben correctamente** ✅
4. **La navegación es fluida e intuitiva** ✅
5. **El diseño es consistente con el resto de la app** ✅

### ⚠️ La funcionalidad requiere AJUSTES si:

1. Algunas pruebas fallan ❌
2. Hay errores menores pero la funcionalidad principal trabaja ⚠️
3. El diseño no es consistente ⚠️

### 🛑 La funcionalidad requiere CORRECCIÓN MAYOR si:

1. La app crashea consistentemente 🛑
2. Los mensajes no se envían 🛑
3. La navegación no funciona 🛑

---

## 📝 Reporte de Pruebas

### Template para Reportar Resultados:

```
FECHA: _______________
TESTER: _______________
VERSIÓN APP: _________
DISPOSITIVO: _________

Test 1: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA
Test 2: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA
Test 3: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA
Test 4: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA
Test 5: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA
Test 6: ☐ PASÓ  ☐ FALLÓ  ☐ NO APLICA

BUGS ENCONTRADOS:
1. ________________________________
2. ________________________________
3. ________________________________

COMENTARIOS ADICIONALES:
_______________________________________
_______________________________________

ESTADO FINAL: ☐ APROBADO  ☐ REQUIERE AJUSTES  ☐ RECHAZADO
```

---

## 🚀 Siguientes Pasos Después de Pruebas

### Si todas las pruebas PASAN:
1. ✅ Documentar resultados
2. ✅ Marcar funcionalidad como COMPLETADA
3. ✅ Preparar deploy a producción
4. ✅ Notificar a usuarios sobre nueva funcionalidad

### Si algunas pruebas FALLAN:
1. 📝 Documentar bugs encontrados
2. 🔧 Priorizar correcciones
3. 👨‍💻 Asignar desarrollador para fixes
4. 🔄 Re-programar pruebas después de correcciones

---

**Fecha**: 26 de marzo, 2026  
**Versión**: 1.0  
**Estado**: LISTO PARA PROBAR

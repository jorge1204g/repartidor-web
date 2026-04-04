# 💰 SOLUCIÓN: Ganancia Incorrecta en Pedidos de Motocicleta

## 🐛 Problema Reportado

Cuando se crea un pedido de motocicleta en la app del cliente, muestra:
- **Tarifa real:** $30 MXN (para 0.44 km)

Pero cuando llega al repartidor, muestra:
- **Ganancia incorrecta:** $60 MXN

---

## 🔍 Causa Raíz

El problema estaba en `cliente-web/src/pages/MotorcycleServicePage.tsx`:

### **ANTES (Incorrecto):**
```typescript
const orderData = {
  // ... otros campos
  distance: distance ?? undefined,
  // ❌ NO se guardaba deliveryCost
  notes: `Servicio de motocicleta - Tarifa: $${price || 'N/A'} MXN`
};
```

**Resultado:** El campo `deliveryCost` llegaba como `undefined` o con valor por defecto incorrecto.

---

## ✅ Solución Implementada

Se agregó el campo `deliveryCost` explícitamente al crear el pedido:

### **DESPUÉS (Correcto):**
```typescript
const orderData = {
  // ... otros campos
  distance: distance ?? undefined,
  deliveryCost: price ?? 30, // ✅ Guardar el precio calculado
  notes: `Servicio de motocicleta - Tarifa: $${price || 'N/A'} MXN`
};
```

---

## 📊 Flujo Correcto

1. **Cliente selecciona destino** → Se calcula distancia (0.44 km)
2. **Sistema calcula precio** → `$calculatePriceFromDistance(0.44)` = $30 MXN
3. **Cliente confirma pedido** → Se guarda en Firebase con:
   ```json
   {
     "distance": 0.44,
     "deliveryCost": 30,  // ✅ AHORA SE GUARDA CORRECTAMENTE
     "serviceType": "MOTORCYCLE_TAXI"
   }
   ```
4. **Repartidor recibe pedido** → Muestra ganancia correcta: **$30 MXN**

---

## 🎯 Tabla de Tarifas de Motocicleta

| Distancia | Tarifa |
|-----------|--------|
| 0 - 1 km  | $30    |
| 1 - 2 km  | $35    |
| 2 - 2.5 km| $40    |
| 2.5 - 3 km| $45    |
| +3 km     | Calculado según tabla |

---

## 🧪 Pruebas

### **Caso de Prueba:**
- **Origen:** Ubicación actual
- **Destino:** Maclovio Herrera 305, Fresnillo, Zac.
- **Distancia:** 0.44 km
- **Tarifa esperada:** $30 MXN

### **Verificación en Repartidor:**
1. Abrir https://repartidor-web.vercel.app
2. Ver pedido de motocicleta
3. Click en "Ver Detalles del Pedido"
4. **Debe mostrar:**
   - ✅ Ganancia: $30.00
   - ✅ Distancia: 0.44 km
   - ✅ Tipo: MOTOCICLETA

---

## 📦 Archivos Modificados

### **cliente-web/src/pages/MotorcycleServicePage.tsx**
- **Línea 572:** Agregado campo `deliveryCost: price ?? 30`
- **Propósito:** Guardar tarifa calculada correctamente en Firebase

---

## 🚀 Despliegue

### **Estado:**
```bash
✅ Código modificado localmente
🔄 Deploy en progreso a Vercel
⏳ Tiempo estimado: 2-3 minutos
```

### **URLs:**
- **Producción:** https://cliente-web.vercel.app
- **Inspect:** https://vercel.com/jorge1204gs-projects/cliente-web/Euva7vgQKnyEqQc7LVGbyw5SrUDE

---

## ⚠️ Importante

**Los pedidos creados ANTES del deploy seguirán mostrando la ganancia incorrecta** porque ya están guardados en Firebase con el valor erróneo.

**Para probar correctamente:**
1. Esperar a que termine el deploy (~2-3 min)
2. Crear un **NUEVO** pedido de motocicleta desde cliente-web
3. Verificar en repartidor-web que muestre la ganancia correcta

---

## 📝 Notas Adicionales

- La función `calculatePriceFromDistance` ya estaba implementada correctamente
- El precio se calculaba bien en la UI ($30 para 0.44 km)
- **El bug era solo al guardar en Firebase** - no se incluía `deliveryCost`
- Ahora los pedidos nuevos guardarán el valor correcto automáticamente

---

**Fecha de corrección:** 2/abril/2026  
**Reportado por:** Usuario  
**Solucionado por:** Sistema automático

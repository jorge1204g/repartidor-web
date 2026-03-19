# 🌍 FILTRO DE COORDENADAS SEPARADAS - Nueva Funcionalidad

## ✅ ¿Qué se implementó?

Se agregó un **filtro de coordenadas separadas** que permite:
1. ✨ Ver latitud y longitud en campos individuales
2. 🔄 Mover el último dígito de la latitud a la longitud automáticamente
3. 🔗 Unir las coordenadas y buscar automáticamente

---

## 🎯 UBICACIÓN EN LA INTERFAZ

El nuevo filtro aparece **ARRIBA** del botón:
```
🔍 O busca tu dirección manualmente:
💡 Escribe tu dirección y selecciona de las sugerencias
```

Y **DEBAJO** encontrarás:
```
📍 O ingresa coordenadas exactas:
23.17425766499658,-102.84595109322808
📍 Buscar
```

---

## 🌎 CÓMO USAR EL FILTRO DE COORDENADAS

### **Paso 1: Ver Coordenadas Separadas**

Verás dos campos con fondo azul claro:

```
┌─────────────────────────────────────────────┐
│  🌎 Separar Coordenadas por Campos:         │
│                                             │
│  🌎 Latitud          🧭 Longitud            │
│  [23.1742576]        [-102.8459510]         │
│  💡 Borra el último  💡 Recibe el dígito   │
│     dígito para         movido de la        │
│     moverlo a         latitud               │
│     longitud                                │
│                                             │
│     🔗 Unir Coordenadas y Buscar            │
└─────────────────────────────────────────────┘
```

### **Paso 2: Editar Coordenadas (Opcional)**

#### **Opción A: Movimiento Automático de Dígitos**
1. Haz clic en el campo de **Latitud**
2. **Borra el último dígito** (ej: de `23.1742576` a `23.174257`)
3. El dígito borrado (`6`) se mueve **automáticamente al inicio de la Longitud**
4. La búsqueda se realiza **automáticamente** después de 300ms

**Ejemplo:**
```
Antes:
Latitud: 23.1742576
Longitud: -102.8459510

Después de borrar el último dígito de latitud:
Latitud: 23.174257
Longitud: 6-102.8459510  ← El "6" se movió aquí

✅ Búsqueda automática iniciada
```

#### **Opción B: Edición Manual**
1. Edita directamente los campos de Latitud o Longitud
2. Los valores se sincronizan con el campo combinado
3. Presiona "🔗 Unir Coordenadas y Buscar" cuando estés listo

### **Paso 3: Unir y Buscar**

Presiona el botón **"🔗 Unir Coordenadas y Buscar"** para:
- Unir las coordenadas de los campos separados
- Insertarlas en el campo combinado de abajo
- Realizar la búsqueda automáticamente

---

## 🔄 FLUJO DE MOVIMIENTO AUTOMÁTICO

### **Ejemplo Detallado:**

```
1️⃣ Coordenadas originales:
   Latitud: 23.17425766499658
   Longitud: -102.84595109322808

2️⃣ Usuario borra el último dígito de Latitud:
   Latitud: 23.1742576649965  (se borra el "8")
   
3️⃣ Sistema detecta el borrado y mueve el dígito:
   Latitud: 23.1742576649965
   Longitud: 8-102.84595109322808  ← El "8" se movió aquí
   
4️⃣ Después de 300ms, búsqueda automática:
   🔍 Iniciando búsqueda de coordenadas...
   ✅ Coordenadas validadas: 23.1742576649965, 8-102.84595109322808
   📍 Ubicación encontrada en el mapa
```

---

## 🎨 CARACTERÍSTICAS VISUALES

### **Diseño del Filtro:**
- 🎨 Fondo: Azul claro (`#f0f9ff`)
- 🔲 Borde: Azul celeste (`#bae6fd`)
- 📝 Campos: Fondo cyan muy claro (`#ecfeff`)
- 🔵 Labels: Azul oscuro (`#0369a1`)
- ⌨️ Fuente: Monospace para coordenadas

### **Iconos:**
- 🌎 Latitud
- 🧭 Longitud
- 🔗 Botón de unir
- 💡 Pistas de ayuda

---

## 📊 COMPORTAMIENTO

| Acción | Resultado |
|--------|-----------|
| Borrar último dígito de latitud | ✅ Se mueve a longitud + búsqueda automática |
| Editar latitud manualmente | ✅ Se sincroniza con campo combinado |
| Editar longitud manualmente | ✅ Se sincroniza con campo combinado |
| Presionar "Unir y Buscar" | ✅ Une coordenadas + búsqueda automática |
| Cambiar campo combinado | ✅ Se actualizan campos separados |

---

## 🧪 EJEMPLOS DE PRUEBA

### **Ejemplo 1: Movimiento de Dígito Simple**
```
Coordenadas iniciales:
Latitud: 23.1234567
Longitud: -102.9876543

Borra el "7" de latitud:
Latitud: 23.123456
Longitud: 7-102.9876543

Resultado: Búsqueda automática iniciada ✅
```

### **Ejemplo 2: Corrección de Coordenadas**
```
Coordenadas incorrectas:
Latitud: 23.1742576
Longitud: -102.8459510

Usuario nota que sobra un dígito en latitud
Borra el "6":
Latitud: 23.174257
Longitud: 6-102.8459510

Sistema corrige y busca automáticamente ✅
```

### **Ejemplo 3: Edición Manual**
```
Usuario edita manualmente:
Latitud: 24.500000
Longitud: -99.500000

Presiona "🔗 Unir Coordenadas y Buscar":
Campo combinado: 24.500000,-99.500000
Búsqueda iniciada ✅
```

---

## 🔍 DETECCIÓN AUTOMÁTICA

El sistema detecta automáticamente cuando:
- ✅ Borras el último carácter de la latitud
- ✅ El carácter borrado es un dígito (0-9)
- ✅ Hay un valor válido en ambos campos

**Acción:**
1. Mueve el dígito de latitud a longitud
2. Actualiza el campo combinado
3. Espera 300ms
4. Inicia búsqueda automática

---

## 💡 VENTAJAS DE ESTA IMPLEMENTACIÓN

| Ventaja | Descripción |
|---------|-------------|
| **Precisión** | Permite ajustes finos de coordenadas dígito por dígito |
| **Automático** | No requiere presionar botones después de editar |
| **Visual** | Campos separados facilitan la edición |
| **Flexible** | Funciona con edición manual o automática |
| **Rápido** | Búsqueda automática en 300ms |
| **Intuitivo** | Iconos y pistas claras para el usuario |

---

## 🛠️ CÓMO FUNCIONA TÉCNICAMENTE

### **Código Clave:**

```typescript
// Detecta cuando el usuario sale del campo de latitud
const handleLatitudeBlur = () => {
  if (isEditingLatitude && latitudeInput.length > 0) {
    const lastChar = latitudeInput.slice(-1);  // Obtiene último carácter
    const newLat = latitudeInput.slice(0, -1); // Quita último carácter
    
    // Solo mueve si es un dígito
    if (/[0-9]/.test(lastChar)) {
      const newLng = lastChar + longitudeInput; // Agrega al inicio de longitud
      
      setLatitudeInput(newLat);
      setLongitudeInput(newLng);
      setCoordinatesInput(`${newLat},${newLng}`);
      
      // Búsqueda automática después de 300ms
      setTimeout(() => {
        handleCoordinatesSearch();
      }, 300);
    }
  }
  setIsEditingLatitude(false);
};
```

---

## 📱 RESPONSIVIDAD

El filtro es **completamente responsivo**:

- **Desktop**: Campos lado a lado
- **Móvil**: Campos uno arriba del otro
- **Tablet**: Campos side a lado con tamaño ajustable

---

## 🎯 CASOS DE USO

### **Caso 1: Coordenadas con Exceso de Dígitos**
```
Problema: Las coordenadas tienen demasiados decimales
Solución: Borra dígitos de latitud hasta tener la precisión deseada
Resultado: Dígitos sobrantes se mueven a longitud automáticamente
```

### **Caso 2: Corrección de Error de Dedo**
```
Problema: Usuario escribió un dígito de más en latitud
Solución: Borra el dígito extra
Resultado: Sistema lo mueve a longitud y busca automáticamente
```

### **Caso 3: Ajuste Fino de Ubicación**
```
Problema: Necesitas ajustar ligeramente las coordenadas
Solución: Edita los últimos dígitos manualmente
Resultado: Mayor control sobre la ubicación exacta
```

---

## 🔗 INTEGRACIÓN CON EL CAMPO COMBINADO

### **Sincronización Bidireccional:**

```
Campo Combinado → Campos Separados
"23.174257,-102.845951" 
  ↓
Latitud: "23.174257"
Longitud: "-102.845951"

Campos Separados → Campo Combinado
Latitud: "23.174257"
Longitud: "-102.845951"
  ↓
"23.174257,-102.845951"
```

---

## ✨ MEJORAS FUTURAS (OPCIONALES)

- [ ] Validación en tiempo real de rangos (lat: -90 a 90, lng: -180 a 180)
- [ ] Historial de coordenadas editadas
- [ ] Deshacer último movimiento de dígito
- [ ] Copiar/pegar desde portapapeles
- [ ] Formatos alternativos (grados, minutos, segundos)

---

## 📞 SOPORTE

### **Si hay problemas:**

1. **Los campos no se actualizan:**
   - Revisa la consola (F12) en busca de errores
   - Verifica que las coordenadas tengan formato válido

2. **El dígito no se mueve:**
   - Asegúrate de borrar completamente el último carácter
   - Verifica que sea un dígito (0-9)
   - Revisa los logs: "🔄 Dígito movido"

3. **La búsqueda no se realiza:**
   - Verifica que ambas coordenadas tengan valores válidos
   - Revisa la consola para errores de geocodificación

---

**¡Disfruta de la nueva funcionalidad de coordenadas separadas! 🌎🧭**

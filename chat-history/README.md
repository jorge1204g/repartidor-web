# Historial de Chats y Modificaciones

Este sistema permite llevar un registro detallado de las conversaciones y los cambios realizados en el proyecto.

## Estructura de Carpetas

- `chat-history/logs/`: Registros técnicos de cada sesión en formato JSON.
- `chat-history/summaries/`: Resúmenes legibles de cada sesión en formato Markdown.

## Cómo funciona

1. **Inicio de Sesión**: Al comenzar una nueva interacción, se crea un ID único basado en la fecha y hora.
2. **Registro de Cambios**: Cada modificación en el código se registra con:
   - Archivo afectado
   - Descripción del cambio
   - Detalles técnicos
3. **Resumen Final**: Al finalizar, se genera un resumen ejecutivo de lo realizado.

## Uso para el Desarrollador (AI)

Para registrar una modificación, utiliza el script `chat_logger.py`:

```python
from chat_logger import logger

# Registrar un cambio
logger.log_modification(
    file_path="src/App.tsx",
    description="Actualización del componente principal",
    changes=["Añadido hook de estado", "Mejorada la interfaz"]
)

# Guardar resumen al final
logger.save_summary("Se implementó la funcionalidad de login...")
```

## Beneficios

- **Trazabilidad**: Sabrás exactamente qué se hizo y cuándo.
- **Recuperación**: Si cambias de cuenta o dispositivo, el historial permanece en la carpeta local.
- **Organización**: Búsqueda rápida por fecha o tipo de cambio.

# Leer el archivo MessageService.ts
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar cierre de clase antes del export default
old_end = """  }

export default new MessageService();"""

new_end = """  }
}

export default new MessageService();"""

content = content.replace(old_end, new_end)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Clase MessageService cerrada correctamente")

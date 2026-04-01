# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Mover el método dentro de la clase - antes del cierre }
old_text = '''  }
}


  // Método para obtener últimos mensajes de todas las conversaciones
  observeLastMessages(userId: string, callback: (messages: Message[]) => void) {'''
  
new_text = '''  }

  // Método para obtener últimos mensajes de todas las conversaciones
  observeLastMessages(userId: string, callback: (messages: Message[]) => void) {'''

content = content.replace(old_text, new_text)

# También necesitamos cerrar correctamente la clase después del método
# Buscar donde termina el método y asegurar que haya un cierre de clase
old_end = '''callback([]);
      }
    });
  }

export default new MessageService();'''

new_end = '''callback([]);
      }
    });
  }
}

export default new MessageService();'''

content = content.replace(old_end, new_end)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\services\MessageService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Método observeLastMessages movido dentro de la clase")

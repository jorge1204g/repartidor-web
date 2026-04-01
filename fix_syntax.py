# Leer archivo
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Corregir el cierre del condicional - agregar )} después del botón
old_text = '''<span>1. En camino al restaurante</span>
                            </span>
                          </button>
                          
                          {/* Botón Ver Detalles - Gradiente Azul */}'''
                          
new_text = '''<span>1. En camino al restaurante</span>
                            </span>
                          </button>
                          )}
                          
                          {/* Botón Ver Detalles - Gradiente Azul */}'''

content = content.replace(old_text, new_text)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Error de sintaxis corregido - Agregado cierre de condicional")

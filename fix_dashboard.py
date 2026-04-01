import re

# Leer el archivo original
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# CAMBIO 1: Hacer que el botón "Ver Detalles del Pedido" sea fijo en todos los estados
# Reemplazar la condición para que incluya todos los estados activos
old_pattern = r'{/\* Botones cuando el pedido está ACEPTADO \*/}\s+{order\.status === OrderStatus\.ACCEPTED && \('
new_pattern = '{/* Botón Ver Detalles del Pedido - FIJO EN TODOS LOS ESTADOS */}\n                      {(order.status === OrderStatus.ACCEPTED || \n                        order.status === OrderStatus.ON_THE_WAY_TO_STORE || \n                        order.status === OrderStatus.ARRIVED_AT_STORE || \n                        order.status === OrderStatus.PICKING_UP_ORDER || \n                        order.status === OrderStatus.ON_THE_WAY_TO_CUSTOMER) && ('

content = re.sub(old_pattern, new_pattern, content)

# También necesitamos mover el botón de "En camino al restaurante" dentro del bloque fijo
# Buscar el botón y envolverlo condicionalmente
old_button = r'''{/* Botón En camino al restaurante \*/}
                          <button
                            onClick={() => handleUpdateOrderStatus\(order\.id, OrderStatus\.ON_THE_WAY_TO_STORE\)}'''

new_button = '''{/* Botón En camino al restaurante (solo si está ACCEPTED) */}
                          {order.status === OrderStatus.ACCEPTED && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY_TO_STORE)}'''

content = re.sub(old_button, new_button, content)

# Guardar cambios
with open(r'c:\1234\Nueva carpeta (22)\apl\Prueba New\repartidor-web\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ CAMBIO 1 COMPLETADO - Botón Ver Detalles ahora es fijo")

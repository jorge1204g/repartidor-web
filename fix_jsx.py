# Fix the JSX syntax error in MyOrdersPage.tsx line 647

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix line 647 - remove extra opening paren and add closing paren
old_line = "{((order.status === 'pending' || order.status === 'PENDING' || order.status === 'MANUAL_ASSIGNED') && !order.assignedToDeliveryId && timeRemaining[order.id!] !== undefined && ("
new_line = "{((order.status === 'pending' || order.status === 'PENDING' || order.status === 'MANUAL_ASSIGNED') && !order.assignedToDeliveryId && timeRemaining[order.id!] !== undefined) && ("

content = content.replace(old_line, new_line)

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ JSX corregido exitosamente")

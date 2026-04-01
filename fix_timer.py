# Fix the TypeScript syntax errors in MyOrdersPage.tsx

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the incorrect syntax from PowerShell replacement
old_text = "order.status === ''pending'' || order.status === ''PENDING'' || order.status === ''MANUAL_ASSIGNED'') -and !order.assignedToDeliveryId"
new_text = "(order.status === 'pending' || order.status === 'PENDING' || order.status === 'MANUAL_ASSIGNED') && !order.assignedToDeliveryId"

content = content.replace(old_text, new_text)

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo corregido exitosamente")

# Fix the missing closing parenthesis in MyOrdersPage.tsx

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix line 329 and 339 - add missing closing parenthesis
content = content.replace(
    "!order.assignedToDeliveryId {",
    "!order.assignedToDeliveryId) {"
)

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Paréntesis agregado exitosamente")

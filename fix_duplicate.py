# Remove duplicated content from MyOrdersPage.tsx

with open('cliente-web/src/pages/MyOrdersPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where duplication starts (around line 1015)
# We want to keep only the first occurrence
clean_lines = []
for i, line in enumerate(lines):
    if i < 1015:  # Keep lines 0-1014 (lines 1-1015 in editor)
        clean_lines.append(line)
    elif line.strip() == 'export default MyOrdersPage;':
        # This is the first export, keep it and stop
        clean_lines.append(line)
        break

# Write back
with open('cliente-web/src/pages/MyOrdersPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print("✅ Archivo limpio exitosamente")
print(f"Líneas totales: {len(clean_lines)}")

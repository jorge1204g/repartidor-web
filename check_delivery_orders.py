# Script para verificar pedidos del repartidor -OmqqZ4HbDDkEzijIc2D

import requests
import json

# Firebase Realtime Database URL
DB_URL = "https://myappdelivery-4a576-default-rtdb.firebaseio.com"

# ID del repartidor que está causando problemas
DELIVERY_ID = "-OmqqZ4HbDDkEzijIc2D"

print("=" * 80)
print(f"🔍 VERIFICANDO PEDIDOS DEL REPARTIDOR: {DELIVERY_ID}")
print("=" * 80)
print()

# 1. Verificar todos los pedidos en la base de datos
print("📋 Consultando todos los pedidos en Firebase...")
print()

try:
    # Obtener todos los pedidos
    response = requests.get(f"{DB_URL}/orders.json")
    
    if response.status_code == 200:
        orders = response.json()
        
        if orders:
            print(f"✅ Total de pedidos encontrados: {len(orders)}")
            print()
            
            # Filtrar pedidos asignados a este repartidor
            assigned_orders = []
            pending_orders = []
            
            for order_id, order in orders.items():
                if order:
                    # Verificar si está asignado a este repartidor
                    if order.get('assignedToDeliveryId') == DELIVERY_ID:
                        assigned_orders.append((order_id, order))
                    
                    # Verificar si es MANUAL_ASSIGNED y está disponible
                    if order.get('status') == 'MANUAL_ASSIGNED' and not order.get('assignedToDeliveryId'):
                        candidate_ids = order.get('candidateDeliveryIds', [])
                        if not candidate_ids or DELIVERY_ID in candidate_ids:
                            pending_orders.append((order_id, order))
            
            print("-" * 80)
            print(f"🚚 PEDIDOS ASIGNADOS AL REPARTIDOR {DELIVERY_ID}:")
            print("-" * 80)
            
            if assigned_orders:
                for order_id, order in assigned_orders:
                    print()
                    print(f"📦 Pedido ID: {order_id}")
                    print(f"   Código: {order.get('orderCode', 'N/A')}")
                    print(f"   Estado: {order.get('status', 'N/A')}")
                    print(f"   Cliente: {order.get('clientName', 'N/A')}")
                    print(f"   Restaurante: {order.get('restaurantName', 'N/A')}")
                    print(f"   Servicio: {order.get('serviceType', 'N/A')}")
                    print(f"   Creado: {order.get('createdAt', 'N/A')}")
                    
                    # Convertir timestamp a fecha legible
                    if order.get('createdAt'):
                        from datetime import datetime
                        try:
                            timestamp = order.get('createdAt')
                            if isinstance(timestamp, (int, float)):
                                date_str = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S')
                                print(f"   Fecha: {date_str}")
                        except:
                            pass
                    
                    print(f"   Repartidor Asignado: {order.get('assignedToDeliveryId', 'N/A')}")
                    print(f"   ¿Aceptado?: {'✅ SÍ' if order.get('acceptedByDeliveryId') else '❌ NO'}")
                    
                    if order.get('acceptedByDeliveryId'):
                        print(f"   Aceptado por: {order.get('acceptedByDeliveryId')}")
            else:
                print("   ❌ No hay pedidos asignados a este repartidor")
            
            print()
            print("-" * 80)
            print(f"⏳ PEDIDOS MANUALES DISPONIBLES PARA ESTE REPARTIDOR:")
            print("-" * 80)
            
            if pending_orders:
                for order_id, order in pending_orders:
                    print()
                    print(f"📦 Pedido ID: {order_id}")
                    print(f"   Código: {order.get('orderCode', 'N/A')}")
                    print(f"   Estado: {order.get('status', 'N/A')}")
                    print(f"   Cliente: {order.get('clientName', 'N/A')}")
                    print(f"   ¿En lista de candidatos?: {'✅ SÍ' if DELIVERY_ID in order.get('candidateDeliveryIds', []) else '❌ NO'}")
                    print(f"   Candidatos: {order.get('candidateDeliveryIds', [])}")
            else:
                print("   ❌ No hay pedidos manuales disponibles para este repartidor")
            
            print()
            print("=" * 80)
            print("📊 RESUMEN:")
            print("=" * 80)
            print(f"   Pedidos asignados: {len(assigned_orders)}")
            print(f"   Pedidos disponibles: {len(pending_orders)}")
            print()
            
            # Verificar si hay pedidos recientes (últimos 10 minutos)
            from datetime import datetime, timedelta
            now = datetime.now().timestamp() * 1000
            ten_minutes_ago = now - (10 * 60 * 1000)
            
            recent_assigned = [o for o in assigned_orders if o[1].get('createdAt', 0) > ten_minutes_ago]
            
            if recent_assigned:
                print("⚠️  PEDIDOS RECIENTES (últimos 10 minutos):")
                for order_id, order in recent_assigned:
                    print(f"   - {order.get('orderCode', 'N/A')} ({order.get('status', 'N/A')})")
                print()
            
        else:
            print("❌ No se encontraron pedidos en la base de datos")
    else:
        print(f"❌ Error al consultar Firebase: {response.status_code}")
        print(f"   Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("Posibles causas:")
    print("   1. No hay conexión a internet")
    print("   2. La URL de Firebase es incorrecta")
    print("   3. Las reglas de seguridad de Firebase bloquean el acceso")
    print()

print()
print("=" * 80)
print("Script finalizado")
print("=" * 80)

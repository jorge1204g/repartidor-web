package com.example.repartidor.utils

object OrderUtils {
    fun translateOrderStatus(status: String): String {
        return when (status) {
            "PENDING" -> "Pendiente"
            "ASSIGNED" -> "Asignado"
            "MANUAL_ASSIGNED" -> "Asignado Manualmente"
            "ACCEPTED" -> "Aceptado"
            "ON_THE_WAY_TO_STORE" -> "En Camino al Restaurante"
            "ARRIVED_AT_STORE" -> "Llegó al Restaurante"
            "PICKING_UP_ORDER" -> "Recogiendo Pedido"
            "ON_THE_WAY_TO_CUSTOMER" -> "En Camino al Cliente"
            "DELIVERED" -> "Entregado"
            "CANCELLED" -> "Cancelado"
            else -> status
        }
    }
}

// Función de extensión para facilitar el uso
fun translateOrderStatus(status: String): String {
    return OrderUtils.translateOrderStatus(status)
}
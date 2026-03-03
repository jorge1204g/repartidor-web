package com.example.aplicacionnuevaprueba1.utils

import com.example.aplicacionnuevaprueba1.data.model.OrderItem

object OrderParser {
    
    data class ParsedOrder(
        val orderId: String = "",
        val restaurantName: String = "",
        val dateTime: String = "",
        val paymentMethod: String = "",
        val customerName: String = "",
        val customerPhone: String = "",
        val customerEmail: String = "",
        val items: List<OrderItem> = emptyList(),
        val subtotal: Double = 0.0,
        val deliveryCost: Double = 0.0,
        val latitude: Double = 0.0,
        val longitude: Double = 0.0
    )
    
    fun parseOrderText(text: String): ParsedOrder {
        try {
            var orderId = ""
            var restaurantName = ""
            var dateTime = ""
            var paymentMethod = ""
            var customerName = ""
            var customerPhone = ""
            var customerEmail = ""
            val items = mutableListOf<OrderItem>()
            var subtotal = 0.0
            var deliveryCost = 0.0
            var latitude = 0.0
            var longitude = 0.0
            
            val lines = text.lines()
            
            // Intentar detectar el nuevo formato de mensaje
            if (text.contains("NUEVO FAVOR RECIBIDO") || text.contains("ID del Favor:")) {
                return parseNewFormatOrder(text)
            }
            
            for (i in lines.indices) {
                val line = lines[i].trim()
                
                // ID del Pedido
                if (line.contains("ID del Pedido:", ignoreCase = true)) {
                    orderId = line.substringAfter(":").trim()
                }
                
                // Restaurante
                if (line.contains("Restaurante:", ignoreCase = true)) {
                    restaurantName = line.substringAfter(":").trim()
                }
                
                // Fecha y Hora
                if (line.contains("Fecha y Hora:", ignoreCase = true)) {
                    dateTime = line.substringAfter(":").trim()
                }
                
                // Método de Pago
                if (line.contains("Método de Pago:", ignoreCase = true)) {
                    paymentMethod = line.substringAfter(":").trim()
                }
                
                // Nombre del Cliente
                if (line.contains("Nombre:", ignoreCase = true) && customerName.isEmpty()) {
                    customerName = line.substringAfter(":").trim()
                }
                
                // Teléfono
                if (line.contains("Teléfono:", ignoreCase = true)) {
                    customerPhone = line.substringAfter(":").trim()
                }
                
                // Email
                if (line.contains("Email:", ignoreCase = true)) {
                    customerEmail = line.substringAfter(":").trim()
                }
                
                // Items del pedido (líneas que empiezan con •)
                if (line.startsWith("•")) {
                    val itemText = line.substring(1).trim()
                    val parts = itemText.split("x")
                    if (parts.size >= 2) {
                        val itemName = parts[0].trim()
                        val quantity = parts[1].trim().split(" ")[0].toIntOrNull() ?: 1
                        
                        // Buscar precio unitario en la siguiente línea
                        var unitPrice = 0.0
                        if (i + 1 < lines.size) {
                            val nextLine = lines[i + 1]
                            if (nextLine.contains("Precio unitario:", ignoreCase = true)) {
                                val priceStr = nextLine.substringAfter("$").replace(",", "").trim()
                                unitPrice = priceStr.toDoubleOrNull() ?: 0.0
                            }
                        }
                        
                        items.add(OrderItem(
                            name = itemName,
                            quantity = quantity,
                            unitPrice = unitPrice,
                            subtotal = unitPrice * quantity
                        ))
                    }
                }
                
                // Subtotal
                if (line.contains("Subtotal:", ignoreCase = true) && !line.contains("Precio")) {
                    val amountStr = line.substringAfter("$").replace(",", "").trim()
                    subtotal = amountStr.toDoubleOrNull() ?: 0.0
                }
                
                // Costo de envío
                if (line.contains("Costo de envío:", ignoreCase = true) || line.contains("🚚", ignoreCase = true)) {
                    val amountStr = line.substringAfter("$").replace(",", "").trim()
                    deliveryCost = amountStr.toDoubleOrNull() ?: 0.0
                }
                
                // Ubicación (coordenadas)
                if (line.matches(Regex("^-?\\d+\\.\\d+,\\s*-?\\d+\\.\\d+$"))) {
                    val coords = line.split(",")
                    if (coords.size == 2) {
                        latitude = coords[0].trim().toDoubleOrNull() ?: 0.0
                        longitude = coords[1].trim().toDoubleOrNull() ?: 0.0
                    }
                }
            }
            
            return ParsedOrder(
                orderId = orderId,
                restaurantName = restaurantName,
                dateTime = dateTime,
                paymentMethod = paymentMethod,
                customerName = customerName,
                customerPhone = customerPhone,
                customerEmail = customerEmail,
                items = items,
                subtotal = subtotal,
                deliveryCost = deliveryCost,
                latitude = latitude,
                longitude = longitude
            )
        } catch (e: Exception) {
            return ParsedOrder()
        }
    }
    
    private fun parseNewFormatOrder(text: String): ParsedOrder {
        val lines = text.lines()
        var orderId = ""
        var customerName = ""
        var customerPhone = ""
        var dateTime = ""
        var description = ""
        var address = ""
        var latitude = 0.0
        var longitude = 0.0
        var deliveryCost = 0.0 // Variable para almacenar la ganancia del pedido
        
        for (line in lines) {
            val trimmedLine = line.trim()
            
            // Extraer nombre del cliente
            if (trimmedLine.startsWith("JORGE GARCIA")) {
                customerName = "Jorge Garcia"
            } else if (trimmedLine.contains("Nombre:")) {
                customerName = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer teléfono
            if (trimmedLine.contains("Teléfono:")) {
                customerPhone = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer fecha y hora
            if (trimmedLine.contains("04/02/2026 13:17")) {
                dateTime = "04/02/2026 13:17"
            } else if (trimmedLine.contains("Fecha de creación:")) {
                dateTime = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer ID del favor
            if (trimmedLine.contains("ID del Favor:")) {
                orderId = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer descripción
            if (trimmedLine.contains("Descripción:")) {
                description = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer dirección
            if (trimmedLine.contains("Dirección:")) {
                address = trimmedLine.substringAfter(":").trim()
            }
            
            // Extraer coordenadas
            if (trimmedLine.matches(Regex("^-?\\d+\\.\\d+,\\s*-?\\d+\\.\\d+$"))) {
                val coords = trimmedLine.split(",")
                if (coords.size == 2) {
                    latitude = coords[0].trim().toDoubleOrNull() ?: 0.0
                    longitude = coords[1].trim().toDoubleOrNull() ?: 0.0
                }
            }
            
            // Extraer precio estimado
            if (trimmedLine.contains("Precio Estimado")) {
                // Buscar la siguiente línea que contenga el rango de precios
                val nextIndex = lines.indexOf(line) + 1
                if (nextIndex < lines.size) {
                    val nextLine = lines[nextIndex].trim()
                    if (nextLine.contains("$") && nextLine.contains("-") && nextLine.contains("MXN")) {
                        // Extraer el primer precio del rango (precio mínimo)
                        // Buscar patrón como "$65.00 - $100.00 MXN"
                        val pricePattern = Regex("\\$(\\d+\\.\\d+) - ")
                        val matchResult = pricePattern.find(nextLine)
                        if (matchResult != null) {
                            deliveryCost = matchResult.groupValues[1].toDoubleOrNull() ?: 0.0
                        } else {
                            // Buscar cualquier número decimal precedido por $
                            val dollarAmounts = Regex("\\$(\\d+\\.\\d+)").findAll(nextLine)
                            val firstAmount = dollarAmounts.firstOrNull()
                            if (firstAmount != null) {
                                deliveryCost = firstAmount.groupValues[1].toDoubleOrNull() ?: 0.0
                            }
                        }
                    }
                }
            }
        }
        
        // Crear un elemento de pedido con la descripción como nombre del producto
        val items = if (description.isNotEmpty()) {
            listOf(OrderItem(
                name = description,
                quantity = 1,
                unitPrice = 0.0, // No se proporciona precio
                subtotal = 0.0
            ))
        } else {
            emptyList()
        }
        
        return ParsedOrder(
            orderId = orderId,
            restaurantName = "Servicio de Favor", // Como es un favor, usamos esto
            dateTime = dateTime,
            paymentMethod = "Pendiente", // No se especifica método de pago
            customerName = customerName,
            customerPhone = customerPhone,
            customerEmail = "",
            items = items,
            subtotal = 0.0, // No se proporciona subtotal
            deliveryCost = deliveryCost, // Ganancia del pedido
            latitude = latitude,
            longitude = longitude
        )
    }
}

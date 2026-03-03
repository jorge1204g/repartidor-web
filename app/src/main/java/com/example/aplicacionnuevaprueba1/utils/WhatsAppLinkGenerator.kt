package com.example.aplicacionnuevaprueba1.utils

import android.content.Context
import android.content.Intent
import android.net.Uri

class WhatsAppLinkGenerator {
    companion object {
        fun generateWhatsAppLink(phoneNumber: String, message: String): String {
            // Formatear el número de teléfono (eliminar espacios y caracteres especiales)
            val formattedNumber = phoneNumber.replace("[^+0-9]".toRegex(), "")
            
            // Crear el enlace de WhatsApp
            return "https://wa.me/$formattedNumber?text=${Uri.encode(message)}"
        }
        
        fun shareWhatsAppLink(context: Context, phoneNumber: String, message: String) {
            val link = generateWhatsAppLink(phoneNumber, message)
            
            val intent = Intent().apply {
                action = Intent.ACTION_SEND
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, link)
                putExtra(Intent.EXTRA_TITLE, "Compartir enlace de WhatsApp con el cliente")
            }
            
            val shareIntent = Intent.createChooser(intent, "Compartir enlace de seguimiento del pedido")
            context.startActivity(shareIntent)
        }
        
        fun openWhatsAppDirectly(context: Context, phoneNumber: String, message: String) {
            // Formatear el número de teléfono
            val formattedNumber = phoneNumber.replace("[^+0-9]".toRegex(), "")
            
            // Intent para abrir WhatsApp directamente
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://api.whatsapp.com/send?phone=$formattedNumber&text=${Uri.encode(message)}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            
            try {
                context.startActivity(intent)
            } catch (e: Exception) {
                // Si falla, intentar con el enlace estándar
                val fallbackIntent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse(generateWhatsAppLink(phoneNumber, message))
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(fallbackIntent)
            }
        }
    }
}
package com.example.repartidor.utils

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri

class WhatsAppSender {
    companion object {
        fun sendWhatsAppMessage(context: Context, phoneNumber: String, message: String): Boolean {
            return try {
                // Verificar si WhatsApp está instalado
                if (!isWhatsAppInstalled(context)) {
                    return false
                }

                // Formatear el número de teléfono (eliminar espacios y caracteres especiales)
                val formattedNumber = phoneNumber.replace("[^+0-9]".toRegex(), "")
                
                // Crear el enlace de WhatsApp Business
                val url = "https://wa.me/$formattedNumber?text=${Uri.encode(message)}"
                
                val intent = Intent(Intent.ACTION_VIEW)
                intent.data = Uri.parse(url)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                
                context.startActivity(intent)
                true
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        private fun isWhatsAppInstalled(context: Context): Boolean {
            return try {
                context.packageManager.getPackageInfo("com.whatsapp", PackageManager.GET_ACTIVITIES)
                true
            } catch (e: PackageManager.NameNotFoundException) {
                false
            }
        }
    }
}
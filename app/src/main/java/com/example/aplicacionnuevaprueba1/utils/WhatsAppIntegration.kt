package com.example.aplicacionnuevaprueba1.utils

import android.content.Context
import com.example.aplicacionnuevaprueba1.ui.viewmodel.AdminViewModel

class WhatsAppIntegration {
    companion object {
        // Variable para almacenar el callback de envío de WhatsApp
        private var whatsappCallback: ((phoneNumber: String, message: String) -> Unit)? = null
        
        fun initializeWhatsAppCallback(context: Context) {
            whatsappCallback = { phoneNumber, message ->
                WhatsAppSender.sendWhatsAppMessage(context, phoneNumber, message)
            }
        }
        
        fun getWhatsAppCallback(): ((phoneNumber: String, message: String) -> Unit)? {
            return whatsappCallback
        }
        
        fun clearWhatsAppCallback() {
            whatsappCallback = null
        }
    }
}
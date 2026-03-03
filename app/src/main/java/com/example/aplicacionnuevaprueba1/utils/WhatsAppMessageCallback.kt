package com.example.aplicacionnuevaprueba1.utils

interface WhatsAppMessageCallback {
    fun sendWhatsAppMessage(phoneNumber: String, message: String)
}
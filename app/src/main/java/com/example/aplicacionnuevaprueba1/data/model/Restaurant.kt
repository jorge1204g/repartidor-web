package com.example.aplicacionnuevaprueba1.data.model

data class Restaurant(
    val id: String = "",
    val name: String = "",
    val phone: String = "",
    val address: String = "",
    val isApproved: Boolean = true,
    val registrationDate: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val email: String = "",
    val notes: String = "",
    val mapUrl: String = "" // URL de Google Maps del restaurante
)

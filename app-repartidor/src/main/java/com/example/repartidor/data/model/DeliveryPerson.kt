package com.example.repartidor.data.model

data class DeliveryPerson(
    val id: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val isApproved: Boolean = false,
    val registrationDate: String = "",
    val isOnline: Boolean = false,
    val isActive: Boolean = false,
    val lastSeen: Long = 0L
)
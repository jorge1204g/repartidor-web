package com.example.repartidor.utils

/**
 * Utilidad para manejar números de teléfono que pueden haberse almacenado incorrectamente como números en Firebase
 */
object PhoneNumberUtils {
    
    /**
     * Convierte un valor de teléfono que puede ser un número o cadena a una cadena limpia de dígitos
     */
    fun cleanPhoneNumber(phoneValue: Any?): String {
        if (phoneValue == null) return ""
        
        return when (phoneValue) {
            is String -> cleanStringPhoneNumber(phoneValue)
            is Number -> {
                // Si es un número (como un Double), convertirlo a cadena y limpiarlo
                val phoneNumberStr = phoneValue.toString()
                cleanStringPhoneNumber(phoneNumberStr)
            }
            else -> {
                // Para otros tipos, convertir a cadena y limpiar
                val phoneNumberStr = phoneValue.toString()
                cleanStringPhoneNumber(phoneNumberStr)
            }
        }
    }
    
    /**
     * Limpia una cadena de número de teléfono eliminando caracteres no deseados
     */
    private fun cleanStringPhoneNumber(phoneNumber: String): String {
        // Eliminar todos los caracteres que no sean dígitos ni el signo +
        return phoneNumber.replace("[^0-9+]".toRegex(), "")
    }
}
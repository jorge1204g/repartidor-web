package com.example.repartidor.utils

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log

/**
 * Servicio de notificación de sonido para pedidos nuevos en la app del repartidor
 */
object SoundNotificationService {
    private var mediaPlayer: MediaPlayer? = null
    private const val TAG = "SoundNotification"
    
    /**
     * Reproduce el sonido de notificación de pedido nuevo
     */
    fun playNewOrderSound(context: Context) {
        try {
            // Detener cualquier sonido que esté sonando
            stopSound()
            
            // Intentar reproducir sonido personalizado, si no existe usar tono del sistema
            val soundUri = try {
                Uri.parse("android.resource://${context.packageName}/${com.example.repartidor.R.raw.new_order_notification}")
            } catch (e: Exception) {
                // Si no existe el recurso, usar tono de notificación del sistema
                Log.w(TAG, "⚠️ Sonido personalizado no encontrado, usando tono del sistema")
                android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)
            }
            
            // Crear nuevo MediaPlayer
            mediaPlayer = MediaPlayer.create(context, soundUri).apply {
                isLooping = false // No repetir en bucle
                setVolume(1.0f, 1.0f) // Volumen al máximo
            }
            
            // Iniciar reproducción
            mediaPlayer?.start()
            Log.d(TAG, "🔊 Reproduciendo sonido de pedido nuevo")
            
            // Liberar recursos cuando termine
            mediaPlayer?.setOnCompletionListener {
                Log.d(TAG, "✅ Sonido completado")
                release()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al reproducir sonido: ${e.message}")
            e.printStackTrace()
        }
    }
    
    /**
     * Reproduce el sonido de notificación de mensaje nuevo
     */
    fun playMessageSound(context: Context) {
        try {
            // Detener cualquier sonido que esté sonando
            stopSound()
            
            // Intentar reproducir sonido personalizado, si no existe usar tono del sistema
            val soundUri = try {
                Uri.parse("android.resource://${context.packageName}/${com.example.repartidor.R.raw.message_notification}")
            } catch (e: Exception) {
                // Si no existe el recurso, usar tono de notificación del sistema
                Log.w(TAG, "⚠️ Sonido de mensaje no encontrado, usando tono del sistema")
                android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)
            }
            
            // Crear nuevo MediaPlayer
            mediaPlayer = MediaPlayer.create(context, soundUri).apply {
                isLooping = false // No repetir en bucle
                setVolume(1.0f, 1.0f) // Volumen al máximo
            }
            
            // Iniciar reproducción
            mediaPlayer?.start()
            Log.d(TAG, "💬 Reproduciendo sonido de mensaje nuevo")
            
            // Liberar recursos cuando termine
            mediaPlayer?.setOnCompletionListener {
                Log.d(TAG, "✅ Sonido de mensaje completado")
                release()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al reproducir sonido de mensaje: ${e.message}")
            e.printStackTrace()
        }
    }
    
    /**
     * Detiene el sonido actual
     */
    fun stopSound() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                    Log.d(TAG, "⏹️ Sonido detenido")
                }
                release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al detener sonido: ${e.message}")
        }
    }
    
    /**
     * Libera los recursos del MediaPlayer
     */
    fun release() {
        try {
            mediaPlayer?.release()
            mediaPlayer = null
            Log.d(TAG, "🔇 Recursos liberados")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al liberar recursos: ${e.message}")
        }
    }
    
    /**
     * Verifica si hay sonido reproduciéndose
     */
    fun isPlaying(): Boolean {
        return mediaPlayer?.isPlaying ?: false
    }
}

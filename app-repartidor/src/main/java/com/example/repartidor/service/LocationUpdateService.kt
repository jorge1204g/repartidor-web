package com.example.repartidor.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.example.repartidor.MainActivity
import com.example.repartidor.R
import com.example.repartidor.data.repository.OrderRepository
import com.google.android.gms.location.*
import kotlinx.coroutines.*

class LocationUpdateService : Service() {
    
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val orderRepository = OrderRepository()
    
    private var deliveryId: String = ""
    private var isTracking = false
    
    companion object {
        const val CHANNEL_ID = "location_tracking_channel"
        const val NOTIFICATION_ID = 12345
        const val ACTION_START_TRACKING = "com.example.repartidor.START_TRACKING"
        const val ACTION_STOP_TRACKING = "com.example.repartidor.STOP_TRACKING"
        const val EXTRA_DELIVERY_ID = "delivery_id"
    }
    
    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_TRACKING -> {
                deliveryId = intent.getStringExtra(EXTRA_DELIVERY_ID) ?: ""
                if (deliveryId.isNotEmpty() && !isTracking) {
                    startForeground(NOTIFICATION_ID, createNotification())
                    startLocationUpdates()
                }
            }
            ACTION_STOP_TRACKING -> {
                stopLocationUpdates()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Seguimiento de ubicacion",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notificacion de seguimiento de ubicacion activo"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Seguimiento activo")
            .setContentText("Compartiendo tu ubicacion con el cliente")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
    
    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5000 // Update every 5 seconds
        ).apply {
            setMinUpdateIntervalMillis(5000)
            setGranularity(Granularity.GRANULARITY_PERMISSION_LEVEL)
            setWaitForAccurateLocation(true)
        }.build()
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    updateLocationToFirebase(location)
                }
            }
        }
        
        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            isTracking = true
        } catch (e: SecurityException) {
            // Handle permission denied
        }
    }
    
    private fun stopLocationUpdates() {
        if (::locationCallback.isInitialized) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
        isTracking = false
    }
    
    private fun updateLocationToFirebase(location: Location) {
        if (deliveryId.isEmpty()) return
        
        serviceScope.launch {
            orderRepository.updateDeliveryLocation(
                deliveryId = deliveryId,
                latitude = location.latitude,
                longitude = location.longitude
            )
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        stopLocationUpdates()
        serviceScope.cancel()
    }
}

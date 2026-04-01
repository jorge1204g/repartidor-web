package com.example.repartidor

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.repartidor.ui.screens.LoginScreen
import com.example.repartidor.ui.screens.MainScreen
import com.example.repartidor.ui.theme.RepartidorTheme
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import com.example.repartidor.utils.NotificationHelper
import com.example.repartidor.utils.SoundNotificationService
import com.example.repartidor.utils.WhatsAppIntegration
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    
    // Launcher para solicitar permisos de ubicacion
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocation = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseLocation = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        
        if (fineLocation || coarseLocation) {
            Toast.makeText(this, "Permisos de ubicacion concedidos", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Se necesitan permisos de ubicacion para el seguimiento", Toast.LENGTH_LONG).show()
        }
    }
    
    // Funcion para verificar y solicitar permisos de ubicacion
    private fun checkAndRequestLocationPermissions() {
        val fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarseLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        
        if (fineLocation != PackageManager.PERMISSION_GRANTED || coarseLocation != PackageManager.PERMISSION_GRANTED) {
            locationPermissionLauncher.launch(arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ))
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Solicitar permisos de ubicacion al iniciar
        checkAndRequestLocationPermissions()
        
        // Inicializar el callback de WhatsApp
        WhatsAppIntegration.initializeWhatsAppCallback(this)
        
        setContent {
            RepartidorTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: DeliveryViewModel = viewModel()
                    val orders by viewModel.orders.collectAsState()
                    
                    // Inicializar el canal de notificaciones
                    LaunchedEffect(Unit) {
                        viewModel.initialize(this@MainActivity)
                        NotificationHelper.createNotificationChannel(this@MainActivity)
                    }
                    
                    // Verificar permisos cuando llegan nuevos pedidos
                    LaunchedEffect(orders.size) {
                        if (orders.isNotEmpty()) {
                            checkAndRequestLocationPermissions()
                        }
                    }
                    
                    // Observar cambios en los pedidos para mostrar notificaciones
                    LaunchedEffect(orders) {
                        // No implementaremos aquí la lógica de detección de nuevos pedidos
                        // porque ya está implementada en el ViewModel
                    }
                    
                    // Observar el estado de visibilidad de la actividad
                    DisposableEffect(Unit) {
                        val observer = LifecycleEventObserver { _, event ->
                            when (event) {
                                androidx.lifecycle.Lifecycle.Event.ON_RESUME -> {
                                    // App en foreground - usuario activo, mantener el estado de conexión deseado
                                    lifecycleScope.launch {
                                        // Cargar el estado deseado por el usuario desde preferencias
                                        val desiredOnlineStatus = viewModel.getDesiredOnlineStatus()
                                        // Si el usuario quiere estar conectado, mantenerlo activo; si no, mantener su estado
                                        val activeStatus = if (desiredOnlineStatus) true else viewModel.getDesiredActiveStatus()
                                        
                                        // Mantener el estado de conexión deseado por el usuario pero marcar como activo
                                        viewModel.updatePresence(desiredOnlineStatus, activeStatus)
                                    }
                                }
                                androidx.lifecycle.Lifecycle.Event.ON_PAUSE -> {
                                    // App en background - usuario inactivo, mantener el estado de conexión deseado
                                    lifecycleScope.launch {
                                        val desiredOnlineStatus = viewModel.getDesiredOnlineStatus()
                                        // Si el usuario quiere estar conectado, marcarlo como inactivo; si no, mantener su estado
                                        val activeStatus = if (desiredOnlineStatus) false else viewModel.getDesiredActiveStatus()
                                        
                                        // Mantener el estado de conexión deseado por el usuario pero marcar como inactivo
                                        viewModel.updatePresence(desiredOnlineStatus, activeStatus)
                                    }
                                }
                                androidx.lifecycle.Lifecycle.Event.ON_STOP -> {
                                    // App being stopped - mantener el estado de conexión deseado por el usuario pero inactivo
                                    lifecycleScope.launch {
                                        val desiredOnlineStatus = viewModel.getDesiredOnlineStatus()
                                        val activeStatus = if (desiredOnlineStatus) false else viewModel.getDesiredActiveStatus()
                                        
                                        // Mantener el estado de conexión deseado por el usuario pero marcar como inactivo
                                        viewModel.updatePresence(desiredOnlineStatus, activeStatus)
                                    }
                                }
                                androidx.lifecycle.Lifecycle.Event.ON_DESTROY -> {
                                    // App being closed - mantener el estado de conexión deseado por el usuario
                                    lifecycleScope.launch {
                                        val desiredOnlineStatus = viewModel.getDesiredOnlineStatus()
                                        val activeStatus = if (desiredOnlineStatus) false else viewModel.getDesiredActiveStatus()
                                        
                                        // Mantener el estado de conexión deseado por el usuario
                                        viewModel.updatePresence(desiredOnlineStatus, activeStatus)
                                    }
                                }
                                else -> {}
                            }
                        }
                        
                        lifecycle.addObserver(observer)
                        
                        onDispose {
                            lifecycle.removeObserver(observer)
                        }
                    }
                    
                    DeliveryApp(viewModel)
                }
            }
        }
    }
}

@Composable
fun DeliveryApp(viewModel: DeliveryViewModel) {
    val deliveryId by viewModel.deliveryId.collectAsState()
    val deliveryPerson by viewModel.deliveryPerson.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    
    when {
        deliveryId == null -> {
            LoginScreen(
                isLoading = isLoading,
                errorMessage = errorMessage,
                onLoginAttempt = { id ->
                    viewModel.loginWithId(id)
                },
                onClearError = {
                    viewModel.clearError()
                }
            )
        }
        else -> {
            MainScreen(
                deliveryPerson = deliveryPerson,
                viewModel = viewModel,
                onLogout = { 
                    viewModel.logout()
                }
            )
        }
    }
}
package com.example.repartidor

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.repartidor.ui.screens.LoginScreen
import com.example.repartidor.ui.screens.MainScreen
import com.example.repartidor.ui.theme.RepartidorTheme
import com.example.repartidor.ui.viewmodel.DeliveryViewModel
import com.example.repartidor.utils.NotificationHelper
import com.example.repartidor.utils.WhatsAppIntegration
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
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
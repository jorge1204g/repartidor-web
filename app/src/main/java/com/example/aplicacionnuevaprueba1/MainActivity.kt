package com.example.aplicacionnuevaprueba1

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.aplicacionnuevaprueba1.ui.screens.AdminScreen
import com.example.aplicacionnuevaprueba1.ui.theme.Aplicacionnuevaprueba1Theme
import com.example.aplicacionnuevaprueba1.ui.viewmodel.AdminViewModel
import com.example.aplicacionnuevaprueba1.utils.WhatsAppIntegration

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Inicializar el callback de WhatsApp
        WhatsAppIntegration.initializeWhatsAppCallback(this)
        
        setContent {
            Aplicacionnuevaprueba1Theme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: AdminViewModel = viewModel()
                    AdminScreen(viewModel)
                }
            }
        }
    }
}
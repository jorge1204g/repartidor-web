package com.example.aplicacionnuevaprueba1.ui.screens

import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Lock
import androidx.compose.ui.platform.LocalContext

@Composable
fun ClientLoginScreen(
    onLoginSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    
    // Credenciales por defecto
    val DEFAULT_EMAIL = "cliente@demo.com"
    val DEFAULT_PASSWORD = "123456"
    
    val context = LocalContext.current
    
    // Auto-login al cargar
    LaunchedEffect(Unit) {
        autoLogin(context, onLoginSuccess)
    }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF667eea)),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Logo y título
                Text(
                    text = "🚚 Click Entrega",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF667eea)
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "¡Nosotros sí te hacemos los mandados!",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Caja de cuenta por defecto
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFf0f9ff)
                    ),
                    border = BorderStroke(1.dp, Color(0xFFbae6fd))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "🎯 Cuenta Virtual de Prueba",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF0369a1)
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "Email: $DEFAULT_EMAIL",
                            fontSize = 11.sp,
                            color = Color(0xFF0c4a6e)
                        )
                        
                        Text(
                            text = "Contraseña: $DEFAULT_PASSWORD",
                            fontSize = 11.sp,
                            color = Color(0xFF0c4a6e)
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Button(
                            onClick = {
                                performLogin(email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD, context = context, 
                                    onSuccess = onLoginSuccess,
                                    onError = { error = it })
                            },
                            enabled = !isLoading,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0ea5e9)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                if (isLoading) "Iniciando..." else "⚡ Entrada Rápida (Demo)",
                                fontSize = 12.sp
                            )
                        }
                    }
                }
                
                Divider()
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Campo Email
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Correo electrónico") },
                    leadingIcon = {
                        Icon(Icons.Default.Person, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text(DEFAULT_EMAIL) }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Campo Contraseña
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Contraseña") },
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text(DEFAULT_PASSWORD) }
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Mensaje de error
                error?.let {
                    Text(
                        text = it,
                        color = Color.Red,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }
                
                // Botón Iniciar Sesión
                Button(
                    onClick = {
                        performLogin(email = email, password = password, context = context,
                            onSuccess = onLoginSuccess,
                            onError = { error = it })
                    },
                    enabled = !isLoading && email.isNotBlank() && password.isNotBlank(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isLoading) Color.Gray else Color(0xFF667eea)
                    )
                ) {
                    Text(
                        if (isLoading) "Iniciando..." else "Iniciar Sesión",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

private fun autoLogin(
    context: Context,
    onLoginSuccess: () -> Unit
) {
    // Verificar si ya hay sesión
    val prefs = context.getSharedPreferences("client_prefs", Context.MODE_PRIVATE)
    val isLoggedIn = prefs.getBoolean("is_logged_in", false)
    
    if (isLoggedIn) {
        onLoginSuccess()
        return
    }
    
    // Intentar auto-login con credenciales por defecto
    val defaultEmail = "cliente@demo.com"
    val defaultPassword = "123456"
    
    // Simular login (en producción esto validaría contra Firebase)
    if (defaultEmail == "cliente@demo.com" && defaultPassword == "123456") {
        saveClientSession(context, "cliente_default_001", defaultEmail, "Cliente Demo")
        onLoginSuccess()
    }
}

private fun performLogin(
    email: String,
    password: String,
    context: Context,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    // En producción, validar contra Firebase
    // Por ahora, aceptación simple para demo
    if (email == "cliente@demo.com" && password == "123456") {
        saveClientSession(context, "cliente_default_001", email, "Cliente Demo")
        onSuccess()
    } else {
        // Para demo, aceptar cualquier credencial no vacía
        if (email.isNotBlank() && password.isNotBlank()) {
            saveClientSession(context, "client_${System.currentTimeMillis()}", email, "Cliente")
            onSuccess()
        } else {
            onError("Correo o contraseña incorrectos")
        }
    }
}

private fun saveClientSession(
    context: Context,
    clientId: String,
    email: String,
    name: String
) {
    val prefs = context.getSharedPreferences("client_prefs", Context.MODE_PRIVATE)
    prefs.edit().apply {
        putBoolean("is_logged_in", true)
        putString("client_id", clientId)
        putString("client_email", email)
        putString("client_name", name)
        apply()
    }
}

package com.example.repartidor.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.repartidor.ui.theme.md_theme_dark_primary
import com.example.repartidor.ui.theme.md_theme_dark_surface

@Composable
fun AdminBottomNavigationComponent(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit
) {
    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp),  // Aumenté aún más la altura para bajar la botonera
        containerColor = md_theme_dark_surface,  // Color similar al encabezado del repartidor
        contentColor = MaterialTheme.colorScheme.onSurface,
        tonalElevation = 0.dp
    ) {
        NavigationBarItem(
            selected = selectedTab == 0,
            onClick = { onTabSelected(0) },
            icon = {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = "Inicio"
                )
            },
            label = { Text("Inicio") },
            alwaysShowLabel = true,
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = md_theme_dark_primary,
                selectedTextColor = md_theme_dark_primary,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                indicatorColor = MaterialTheme.colorScheme.surfaceVariant
            )
        )
        
        NavigationBarItem(
            selected = selectedTab == 1,
            onClick = { onTabSelected(1) },
            icon = {
                Icon(
                    imageVector = Icons.Default.LocalShipping,
                    contentDescription = "Pedidos"
                )
            },
            label = { Text("Pedidos") },
            alwaysShowLabel = true,
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = md_theme_dark_primary,
                selectedTextColor = md_theme_dark_primary,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                indicatorColor = MaterialTheme.colorScheme.surfaceVariant
            )
        )
        
        NavigationBarItem(
            selected = selectedTab == 2,
            onClick = { onTabSelected(2) },
            icon = {
                Icon(
                    imageVector = Icons.Default.ContentPaste,
                    contentDescription = "Pegar Pedido"
                )
            },
            label = { Text("Pegar") },
            alwaysShowLabel = true,
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = md_theme_dark_primary,
                selectedTextColor = md_theme_dark_primary,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                indicatorColor = MaterialTheme.colorScheme.surfaceVariant
            )
        )
        
        NavigationBarItem(
            selected = selectedTab == 3,
            onClick = { onTabSelected(3) },
            icon = {
                Icon(
                    imageVector = Icons.Default.AddCircle,
                    contentDescription = "Crear Manual"
                )
            },
            label = { Text("Manual") },
            alwaysShowLabel = true,
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = md_theme_dark_primary,
                selectedTextColor = md_theme_dark_primary,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                indicatorColor = MaterialTheme.colorScheme.surfaceVariant
            )
        )
        
        NavigationBarItem(
            selected = selectedTab == 4,
            onClick = { onTabSelected(4) },
            icon = {
                Icon(
                    imageVector = Icons.Default.Face,
                    contentDescription = "Repartidores"
                )
            },
            label = { Text("Rep") },
            alwaysShowLabel = true,
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = md_theme_dark_primary,
                selectedTextColor = md_theme_dark_primary,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                indicatorColor = MaterialTheme.colorScheme.surfaceVariant
            )
        )
    }
}
package com.romerolabs.ecomapa.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.romerolabs.ecomapa.ui.screens.badges.BadgesScreen
import com.romerolabs.ecomapa.ui.screens.home.HomeScreen
import com.romerolabs.ecomapa.ui.screens.pickup.PickupScreen
import com.romerolabs.ecomapa.ui.screens.rewards.RewardsScreen
import com.romerolabs.ecomapa.ui.screens.scan.ScanScreen

/**
 * Rutas de navegación de EcoMapa V2.1.
 */
object EcoRoutes {
    const val HOME    = "home"
    const val CHAT    = "chat"
    const val BADGES  = "badges"
    const val REWARDS = "rewards"
    const val PICKUP  = "pickup"
    const val SCAN    = "scan"

    // Ruta de pickup con argumento opcional para pre-cargar el tipo de residuo desde el escáner
    const val PICKUP_WITH_TYPE = "pickup?wasteType={wasteType}"
    fun pickupWithType(wasteType: String) = "pickup?wasteType=$wasteType"
}

@Composable
fun EcoNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = EcoRoutes.HOME
    ) {
        composable(EcoRoutes.HOME) {
            HomeScreen(
                onNavigateToChat = { navController.navigate(EcoRoutes.CHAT) },
                onNavigateToBadges = { navController.navigate(EcoRoutes.BADGES) },
                onNavigateToRewards = { navController.navigate(EcoRoutes.REWARDS) },
                onNavigateToPickup = { navController.navigate(EcoRoutes.PICKUP) },
                onNavigateToScan = { navController.navigate(EcoRoutes.SCAN) }
            )
        }

        composable(EcoRoutes.CHAT) {
            com.romerolabs.ecomapa.ui.screens.chat.ChatScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(EcoRoutes.BADGES) {
            BadgesScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(EcoRoutes.REWARDS) {
            RewardsScreen(onNavigateBack = { navController.popBackStack() })
        }

        // Ruta de retiro simple (sin pre-carga, desde BottomBar)
        composable(EcoRoutes.PICKUP) {
            PickupScreen(
                onNavigateBack = { navController.popBackStack() },
                prefilledWasteType = null
            )
        }

        // Ruta de retiro con tipo pre-cargado (desde resultado del escáner IA)
        composable(
            route = EcoRoutes.PICKUP_WITH_TYPE,
            arguments = listOf(
                navArgument("wasteType") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) { backStackEntry ->
            val wasteType = backStackEntry.arguments?.getString("wasteType")
            PickupScreen(
                onNavigateBack = { navController.popBackStack() },
                prefilledWasteType = wasteType
            )
        }

        // Ruta del escáner de IA con foto
        composable(EcoRoutes.SCAN) {
            ScanScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToPickup = { wasteType ->
                    navController.navigate(EcoRoutes.pickupWithType(wasteType))
                }
            )
        }
    }
}

package com.romerolabs.ecomapa.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.romerolabs.ecomapa.ui.screens.badges.BadgesScreen
import com.romerolabs.ecomapa.ui.screens.home.HomeScreen
import com.romerolabs.ecomapa.ui.screens.pickup.PickupScreen
import com.romerolabs.ecomapa.ui.screens.rewards.RewardsScreen

/**
 * Rutas de navegación de EcoMapa V2.1.
 */
object EcoRoutes {
    const val HOME = "home"
    const val BADGES = "badges"
    const val REWARDS = "rewards"
    const val PICKUP = "pickup"
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
                onNavigateToBadges = {
                    navController.navigate(EcoRoutes.BADGES)
                },
                onNavigateToRewards = {
                    navController.navigate(EcoRoutes.REWARDS)
                },
                onNavigateToPickup = {
                    navController.navigate(EcoRoutes.PICKUP)
                }
            )
        }
        composable(EcoRoutes.BADGES) {
            BadgesScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        composable(EcoRoutes.REWARDS) {
            RewardsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        composable(EcoRoutes.PICKUP) {
            PickupScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}

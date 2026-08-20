package com.romerolabs.ecomapa.data.repository

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.romerolabs.ecomapa.data.local.GamificationStore
import com.romerolabs.ecomapa.domain.model.AiResponse
import com.romerolabs.ecomapa.domain.model.Badge
import com.romerolabs.ecomapa.domain.model.GamificationResult
import com.romerolabs.ecomapa.domain.model.UserProgress
import com.romerolabs.ecomapa.domain.repository.GamificationRepository
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

class GamificationRepositoryImpl(
    private val store: GamificationStore
) : GamificationRepository {

    private val gson = Gson()

    override suspend fun getTotalPoints(): Int {
        return store.getInt(GamificationStore.ECO_TOTAL_POINTS)
    }

    override suspend fun addPoints(points: Int): Int {
        val current = store.getInt(GamificationStore.ECO_TOTAL_POINTS)
        val newTotal = current + points
        store.setInt(GamificationStore.ECO_TOTAL_POINTS, newTotal)
        return newTotal
    }

    override suspend fun getQueriesCount(): Int {
        return store.getInt(GamificationStore.ECO_QUERIES_COUNT)
    }

    override suspend fun incrementQueries() {
        val current = store.getInt(GamificationStore.ECO_QUERIES_COUNT)
        store.setInt(GamificationStore.ECO_QUERIES_COUNT, current + 1)
    }

    override suspend fun getStreakDays(): Int {
        return store.getInt(GamificationStore.ECO_STREAK_DAYS)
    }

    /**
     * Actualiza la racha de días consecutivos basada en fechas de calendario (LocalDate).
     * - Si consulta múltiples veces el mismo día: mantiene la racha activa sin reiniciarla.
     * - Si consulta al día siguiente consecutivo: incrementa la racha (+1).
     * - Si pasaron más de 48 horas sin consultas: reinicia la racha en 1.
     */
    override suspend fun updateStreak() {
        val lastQueryStr = store.getString(GamificationStore.ECO_LAST_QUERY)
        val now = Instant.now()
        val today = LocalDate.now(ZoneId.systemDefault())
        var currentStreak = store.getInt(GamificationStore.ECO_STREAK_DAYS)

        if (lastQueryStr != null) {
            val lastQueryDate = Instant.parse(lastQueryStr)
                .atZone(ZoneId.systemDefault())
                .toLocalDate()

            val daysBetween = ChronoUnit.DAYS.between(lastQueryDate, today)

            currentStreak = when {
                daysBetween == 0L -> if (currentStreak == 0) 1 else currentStreak // Mismo día
                daysBetween == 1L -> currentStreak + 1 // Día consecutivo
                else -> 1 // Se rompió la racha (> 1 día)
            }
        } else {
            currentStreak = 1
        }

        store.setInt(GamificationStore.ECO_STREAK_DAYS, currentStreak)
        store.setString(GamificationStore.ECO_LAST_QUERY, now.toString())
    }

    override suspend fun getUnlockedBadgeIds(): List<String> {
        val badgesStr = store.getString(GamificationStore.ECO_BADGES)
        if (badgesStr != null) {
            val type = object : TypeToken<List<String>>() {}.type
            return gson.fromJson(badgesStr, type)
        }
        return emptyList()
    }

    override suspend fun getUserProgress(): UserProgress {
        val lastQueryStr = store.getString(GamificationStore.ECO_LAST_QUERY)
        return UserProgress(
            totalPoints = getTotalPoints(),
            queriesCount = getQueriesCount(),
            unlockedBadgeIds = getUnlockedBadgeIds(),
            lastQueryDate = lastQueryStr?.let { Instant.parse(it) },
            streakDays = getStreakDays()
        )
    }

    private suspend fun evaluateNewBadges(
        response: AiResponse,
        totalPoints: Int,
        queriesCount: Int,
        streakDays: Int
    ): List<Badge> {
        val unlockedIds = getUnlockedBadgeIds().toMutableList()
        val newBadges = mutableListOf<Badge>()

        if (response.containerType.lowercase() == "vidrio" ||
            response.wasteType.lowercase().contains("vidrio")
        ) {
            val glassCount = store.getInt(GamificationStore.ECO_GLASS_COUNT) + 1
            store.setInt(GamificationStore.ECO_GLASS_COUNT, glassCount)
        }

        val glassCount = store.getInt(GamificationStore.ECO_GLASS_COUNT)

        for (badge in Badge.catalog) {
            if (badge.id in unlockedIds) continue

            val isUnlocked = when (badge.id) {
                "first_query" -> queriesCount >= 1
                "toxic_hero" -> response.containerType.lowercase() == "peligroso"
                "glass_master" -> glassCount >= 3
                "recycler_10" -> queriesCount >= 10
                "streak_3" -> streakDays >= 3
                "eco_warrior" -> totalPoints >= 500
                else -> false
            }

            if (isUnlocked) {
                newBadges.add(badge)
                unlockedIds.add(badge.id)
            }
        }

        if (newBadges.isNotEmpty()) {
            store.setString(GamificationStore.ECO_BADGES, gson.toJson(unlockedIds))
        }

        return newBadges
    }

    override suspend fun processReward(response: AiResponse): GamificationResult {
        incrementQueries()
        updateStreak()

        val streakDays = getStreakDays()
        val queriesCount = getQueriesCount()

        val multiplier = if (streakDays >= 3) 1.5 else 1.0
        var pointsEarned = (response.ecopointsEarned * multiplier).toInt()

        var totalPoints = getTotalPoints()
        val newBadges = evaluateNewBadges(response, totalPoints + pointsEarned, queriesCount, streakDays)

        for (badge in newBadges) {
            pointsEarned += badge.bonusPoints
        }

        totalPoints = addPoints(pointsEarned)

        return GamificationResult(
            pointsEarned = pointsEarned,
            totalPoints = totalPoints,
            newBadges = newBadges
        )
    }
}

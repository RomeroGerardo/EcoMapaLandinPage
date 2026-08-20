package com.romerolabs.ecomapa.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.gamificationDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "eco_gamification"
)

class GamificationStore(private val context: Context) {

    companion object {
        val ECO_TOTAL_POINTS = intPreferencesKey("eco_total_points")
        val ECO_QUERIES_COUNT = intPreferencesKey("eco_queries_count")
        val ECO_BADGES = stringPreferencesKey("eco_badges")
        val ECO_LAST_QUERY = stringPreferencesKey("eco_last_query")
        val ECO_STREAK_DAYS = intPreferencesKey("eco_streak_days")
        val ECO_GLASS_COUNT = intPreferencesKey("eco_glass_count")
    }

    private val dataStore get() = context.gamificationDataStore

    suspend fun getInt(key: Preferences.Key<Int>, default: Int = 0): Int {
        return dataStore.data.map { prefs -> prefs[key] ?: default }.first()
    }

    suspend fun setInt(key: Preferences.Key<Int>, value: Int) {
        dataStore.edit { prefs -> prefs[key] = value }
    }

    suspend fun getString(key: Preferences.Key<String>, default: String? = null): String? {
        return dataStore.data.map { prefs -> prefs[key] ?: default }.first()
    }

    suspend fun setString(key: Preferences.Key<String>, value: String) {
        dataStore.edit { prefs -> prefs[key] = value }
    }
}

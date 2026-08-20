package com.romerolabs.ecomapa.domain.model

/**
 * Modelo de una insignia/logro del sistema de gamificación.
 *
 * Incluye el catálogo estático con las 6 insignias definidas en el RFC §6.2.
 */
data class Badge(
    /** Identificador único de la insignia. */
    val id: String,
    /** Nombre visible de la insignia. */
    val name: String,
    /** Emoji/ícono representativo. */
    val icon: String,
    /** Descripción de cómo desbloquear la insignia. */
    val description: String,
    /** Puntos bonus otorgados al desbloquear. */
    val bonusPoints: Int,
    /** `true` si el usuario ya desbloqueó esta insignia. */
    val isUnlocked: Boolean = false
) {
    companion object {
        /**
         * Catálogo completo de insignias del MVP (RFC §6.2).
         *
         * | ID            | Nombre             | Condición                         | Bonus |
         * |---------------|--------------------|-----------------------------------|-------|
         * | first_query   | Eco Curioso        | Primera consulta al asistente IA  | +10   |
         * | toxic_hero    | Héroe Tóxico       | Reciclar primer residuo peligroso | +50   |
         * | glass_master  | Maestro del Vidrio | Reciclar 3 items de vidrio        | +30   |
         * | recycler_10   | Reciclador x10     | 10 consultas totales              | +100  |
         * | streak_3      | Racha Verde        | 3 días consecutivos               | +75   |
         * | eco_warrior   | Guerrero Eco       | Acumular 500 Ecopuntos            | +200  |
         */
        val catalog: List<Badge> = listOf(
            Badge(
                id = "first_query",
                name = "Eco Curioso",
                icon = "\uD83C\uDF31", // 🌱
                description = "Realiza tu primera consulta al asistente IA.",
                bonusPoints = 10
            ),
            Badge(
                id = "toxic_hero",
                name = "Héroe Tóxico",
                icon = "\uD83D\uDD0B", // 🔋
                description = "Recicla tu primer residuo peligroso (pilas, baterías).",
                bonusPoints = 50
            ),
            Badge(
                id = "glass_master",
                name = "Maestro del Vidrio",
                icon = "\uD83C\uDF76", // 🍶
                description = "Recicla 3 items de vidrio.",
                bonusPoints = 30
            ),
            Badge(
                id = "recycler_10",
                name = "Reciclador x10",
                icon = "♻\uFE0F", // ♻️
                description = "Alcanza 10 consultas totales al asistente.",
                bonusPoints = 100
            ),
            Badge(
                id = "streak_3",
                name = "Racha Verde",
                icon = "\uD83D\uDD25", // 🔥
                description = "Usa la app 3 días consecutivos.",
                bonusPoints = 75
            ),
            Badge(
                id = "eco_warrior",
                name = "Guerrero Eco",
                icon = "\uD83D\uDEE1\uFE0F", // 🛡️
                description = "Acumula 500 Ecopuntos totales.",
                bonusPoints = 200
            )
        )
    }
}

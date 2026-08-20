package com.romerolabs.ecomapa.ui.components.gamification

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.romerolabs.ecomapa.domain.model.Badge

@Composable
fun BadgeCard(
    badge: Badge,
    modifier: Modifier = Modifier
) {
    val alpha = if (badge.isUnlocked) 1f else 0.4f

    Card(
        modifier = modifier.alpha(alpha),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (badge.isUnlocked) 4.dp else 0.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = badge.icon,
                fontSize = 40.sp,
                modifier = Modifier.size(48.dp)
            )
            Text(
                text = badge.name,
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp)
            )
            Text(
                text = badge.description,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp)
            )
            if (badge.isUnlocked) {
                Text(
                    text = "+${badge.bonusPoints} pts",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            } else {
                Text(
                    text = "\uD83D\uDD12 Bloqueada",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

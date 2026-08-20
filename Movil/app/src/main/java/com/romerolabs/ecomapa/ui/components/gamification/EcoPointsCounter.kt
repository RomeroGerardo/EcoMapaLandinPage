package com.romerolabs.ecomapa.ui.components.gamification

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.romerolabs.ecomapa.ui.theme.PrimaryGreen

@Composable
fun EcoPointsCounter(
    points: Int,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .shadow(4.dp, RoundedCornerShape(20.dp))
            .clip(RoundedCornerShape(20.dp))
            .background(PrimaryGreen)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "\uD83C\uDF3F ",
            style = MaterialTheme.typography.titleMedium
        )
        AnimatedContent(
            targetState = points,
            transitionSpec = {
                slideInVertically { it } togetherWith slideOutVertically { -it }
            },
            label = "points_animation"
        ) { targetPoints ->
            Text(
                text = "$targetPoints",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )
        }
        Text(
            text = " pts",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.White.copy(alpha = 0.8f)
        )
    }
}

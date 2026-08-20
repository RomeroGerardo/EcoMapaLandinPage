package com.romerolabs.ecomapa.ui.components.chat

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.romerolabs.ecomapa.domain.model.ChatMessage
import com.romerolabs.ecomapa.ui.theme.PrimaryGreen

@Composable
fun ChatBubble(
    message: ChatMessage,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val isUser = message.isUser
    val bubbleColor = if (isUser) PrimaryGreen else Color(0xFFF0F0F0)
    val textColor = if (isUser) Color.White else Color(0xFF1B1B1B)
    val shape = if (isUser) {
        RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp)
    } else {
        RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp)
    }

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(shape)
                .background(bubbleColor)
                .padding(12.dp)
        ) {
            Column {
                Text(
                    text = message.content,
                    color = textColor,
                    style = MaterialTheme.typography.bodyMedium
                )

                val aiResponse = message.aiResponse
                if (aiResponse != null && aiResponse.environmentalImpact.isNotBlank()) {
                    Text(
                        text = "\n🌍 ${aiResponse.environmentalImpact}",
                        color = textColor.copy(alpha = 0.8f),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Text(
                        text = "✨ +${aiResponse.ecopointsEarned} Ecopuntos",
                        color = if (isUser) Color.White else PrimaryGreen,
                        style = MaterialTheme.typography.labelLarge,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                if (aiResponse?.suggestedPoint != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            val lat = aiResponse.suggestedPoint.latitude
                            val lng = aiResponse.suggestedPoint.longitude
                            val gmmIntentUri = Uri.parse("google.navigation:q=$lat,$lng")
                            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                            mapIntent.setPackage("com.google.android.apps.maps")
                            
                            if (mapIntent.resolveActivity(context.packageManager) != null) {
                                context.startActivity(mapIntent)
                            } else {
                                // Fallback a navegador web si Google Maps no está instalado
                                val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?daddr=$lat,$lng"))
                                context.startActivity(fallbackIntent)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = if (isUser) Color.White else PrimaryGreen, contentColor = if (isUser) PrimaryGreen else Color.White),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "📍 Ir a ${aiResponse.suggestedPoint.name}",
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            }
        }
    }
}

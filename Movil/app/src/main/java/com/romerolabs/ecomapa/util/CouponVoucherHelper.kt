package com.romerolabs.ecomapa.util

import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.romerolabs.ecomapa.domain.model.RewardClaim
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

object CouponVoucherHelper {

    /**
     * Genera un Bitmap con el código QR del cupón usando ZXing.
     */
    fun generateQrBitmap(content: String, size: Int = 400): Bitmap {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(
                    x, y,
                    if (bitMatrix[x, y]) Color.parseColor("#064E3B") else Color.WHITE
                )
            }
        }
        return bitmap
    }

    /**
     * Dibuja un comprobante digital completo (Voucher) con estética GovTech.
     */
    fun generateVoucherBitmap(claim: RewardClaim): Bitmap {
        val width = 900
        val height = 1250
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Fondo general
        val bgPaint = Paint().apply { color = Color.parseColor("#F8FAFC") }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Tarjeta central blanca
        val cardPaint = Paint().apply {
            color = Color.WHITE
            isAntiAlias = true
            setShadowLayer(16f, 0f, 8f, Color.parseColor("#20000000"))
        }
        val cardRect = RectF(40f, 40f, (width - 40).toFloat(), (height - 40).toFloat())
        canvas.drawRoundRect(cardRect, 32f, 32f, cardPaint)

        // Cabecera superior esmeralda
        val headerPaint = Paint().apply {
            color = Color.parseColor("#059669")
            isAntiAlias = true
        }
        val headerRect = RectF(40f, 40f, (width - 40).toFloat(), 220f)
        canvas.drawRoundRect(headerRect, 32f, 32f, headerPaint)
        canvas.drawRect(40f, 180f, (width - 40).toFloat(), 220f, headerPaint)

        // Textos de cabecera
        val headerTitlePaint = Paint().apply {
            color = Color.WHITE
            textSize = 42f
            isFakeBoldText = true
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("EcoMapa 🌿", width / 2f, 115f, headerTitlePaint)

        val headerSubPaint = Paint().apply {
            color = Color.parseColor("#D1FAE5")
            textSize = 24f
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("COMPROBANTE OFICIAL DE CANJE", width / 2f, 165f, headerSubPaint)

        // Comercio asociado
        val partnerPaint = Paint().apply {
            color = Color.parseColor("#059669")
            textSize = 34f
            isFakeBoldText = true
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText(claim.partnerName, width / 2f, 290f, partnerPaint)

        // Título del beneficio
        val titlePaint = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 36f
            isFakeBoldText = true
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        val title = claim.rewardTitle
        if (title.length > 32) {
            val line1 = title.take(32)
            val line2 = title.substring(32).trim()
            canvas.drawText(line1, width / 2f, 360f, titlePaint)
            canvas.drawText(line2, width / 2f, 410f, titlePaint)
        } else {
            canvas.drawText(title, width / 2f, 380f, titlePaint)
        }

        // Puntos gastados
        val pointsPaint = Paint().apply {
            color = Color.parseColor("#64748B")
            textSize = 26f
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("Canjeado por ${claim.pointsSpent} Ecopuntos · Estado: ACTIVO", width / 2f, 470f, pointsPaint)

        // Línea divisoria
        val dividerPaint = Paint().apply {
            color = Color.parseColor("#CBD5E1")
            strokeWidth = 3f
        }
        canvas.drawLine(80f, 510f, (width - 80).toFloat(), 510f, dividerPaint)

        // Código QR
        val qrBitmap = generateQrBitmap(claim.couponCode, 360)
        canvas.drawBitmap(qrBitmap, (width - 360) / 2f, 540f, null)

        // Contenedor del código de texto
        val codeBoxPaint = Paint().apply {
            color = Color.parseColor("#ECFDF5")
            isAntiAlias = true
        }
        val codeBoxStroke = Paint().apply {
            color = Color.parseColor("#10B981")
            style = Paint.Style.STROKE
            strokeWidth = 3f
            isAntiAlias = true
        }
        val codeRect = RectF(120f, 930f, (width - 120).toFloat(), 1030f)
        canvas.drawRoundRect(codeRect, 18f, 18f, codeBoxPaint)
        canvas.drawRoundRect(codeRect, 18f, 18f, codeBoxStroke)

        val codePaint = Paint().apply {
            color = Color.parseColor("#047857")
            textSize = 46f
            typeface = Typeface.MONOSPACE
            isFakeBoldText = true
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText(claim.couponCode, width / 2f, 995f, codePaint)

        // Instrucción para caja
        val notePaint = Paint().apply {
            color = Color.parseColor("#64748B")
            textSize = 22f
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("Presenta este cupón o código en la caja del comercio.", width / 2f, 1080f, notePaint)

        // Footer corporativo CivicLoop Technologies
        val footerPaint = Paint().apply {
            color = Color.parseColor("#94A3B8")
            textSize = 20f
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("Desarrollado por CivicLoop Technologies S.A.S. · Red EcoMapa", width / 2f, 1170f, footerPaint)

        return bitmap
    }

    /**
     * Guarda el comprobante digital en la Galería / Pictures del dispositivo móvil.
     */
    fun saveVoucherToGallery(context: Context, claim: RewardClaim): Boolean {
        return try {
            val bitmap = generateVoucherBitmap(claim)
            val filename = "EcoMapa_Cupon_${claim.couponCode}.png"
            var outputStream: OutputStream? = null

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                    put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/EcoMapa")
                }
                val uri = context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    outputStream = context.contentResolver.openOutputStream(uri)
                }
            } else {
                val imagesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                val ecoDir = File(imagesDir, "EcoMapa")
                if (!ecoDir.exists()) ecoDir.mkdirs()
                val imageFile = File(ecoDir, filename)
                outputStream = FileOutputStream(imageFile)
            }

            outputStream?.use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }

            Toast.makeText(context, "✅ Cupón guardado en Galería (Fotos/EcoMapa)", Toast.LENGTH_LONG).show()
            true
        } catch (e: Exception) {
            Toast.makeText(context, "Error al guardar cupón: ${e.message}", Toast.LENGTH_SHORT).show()
            false
        }
    }

    /**
     * Comparte el cupón por WhatsApp, Telegram, etc.
     */
    fun shareCoupon(context: Context, claim: RewardClaim) {
        val shareText = """
            🌿 *Cupón de Descuento EcoMapa* 🌿
            
            🏪 *Comercio:* ${claim.partnerName}
            🎁 *Beneficio:* ${claim.rewardTitle}
            🎟️ *Código:* ${claim.couponCode}
            ⭐ *Ecopuntos:* ${claim.pointsSpent} pts
            
            Presenta este código en la caja del local para acceder a tu descuento sustentable.
            _EcoMapa · Desarrollado por CivicLoop Technologies_
        """.trimIndent()

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Mi Cupón EcoMapa - ${claim.partnerName}")
            putExtra(Intent.EXTRA_TEXT, shareText)
        }
        val chooser = Intent.createChooser(intent, "Compartir Cupón EcoMapa").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(chooser)
    }

    /**
     * Copia el código al portapapeles.
     */
    fun copyToClipboard(context: Context, code: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Código de Cupón EcoMapa", code)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(context, "📋 Código $code copiado", Toast.LENGTH_SHORT).show()
    }
}

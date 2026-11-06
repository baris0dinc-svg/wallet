package com.example.wallet.data

import com.google.gson.JsonElement
import com.google.gson.JsonObject

/**
 * İzlenecek kodlar. ANAHTAR (JSON'daki alan adı) -> uygulamadaki kod/tür.
 * DOĞRULANMASI GEREKİR: USD ve EUR Truncgil örnek yanıtında görüldü; altın ve BIST
 * anahtarlarını canlı yanıttan kontrol edip burayı düzeltin.
 */
val WATCHED: Map<String, Pair<String, RateKind>> = mapOf(
    "USD" to ("USD" to RateKind.FX),
    "EUR" to ("EUR" to RateKind.FX),
    "GRA" to ("GRA" to RateKind.GOLD),     // gram altın (anahtar tahmini)
    "XU100" to ("XU100" to RateKind.STOCK) // BIST 100 (anahtar tahmini)
)

class RatesRepository(
    private val api: RatesApi,
    private val url: String = "https://finans.truncgil.com/v4/today.json"
) {
    suspend fun load(): Pair<Map<String, Rate>, String?> {
        val root: JsonObject = api.fetch(url)
        val updated = root.get("Update_Date")?.takeIf { it.isJsonPrimitive }?.asString
        val out = LinkedHashMap<String, Rate>()
        for ((key, meta) in WATCHED) {
            val el: JsonElement = root.get(key) ?: continue
            if (!el.isJsonObject) continue
            val o = el.asJsonObject
            out[meta.first] = Rate(
                code = meta.first,
                kind = meta.second,
                buy = parseNumber(o.get("Buying")),
                sell = parseNumber(o.get("Selling")),
                changePct = parseNumber(o.get("Change"))
            )
        }
        return out to updated
    }
}

/** "1.234,56", "34,12", "34.12", 34.12 gibi değerleri güvenle Double'a çevirir; olmazsa null. */
fun parseNumber(el: JsonElement?): Double? {
    if (el == null || el.isJsonNull || !el.isJsonPrimitive) return null
    val p = el.asJsonPrimitive
    if (p.isNumber) return p.asDouble
    var s = p.asString.trim().replace("%", "").replace(" ", "")
    if (s.isEmpty()) return null
    val c = s.count { it == ',' }
    val d = s.count { it == '.' }
    s = when {
        c > 0 && d > 0 ->
            if (s.lastIndexOf(',') > s.lastIndexOf('.')) s.replace(".", "").replace(',', '.')
            else s.replace(",", "")
        c > 1 -> s.replace(",", "")
        c == 1 -> s.replace(',', '.')
        d > 1 -> s.replace(".", "")
        else -> s
    }
    return s.toDoubleOrNull()
}

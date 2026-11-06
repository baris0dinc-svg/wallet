package com.example.wallet.data

enum class RateKind { FX, GOLD, STOCK }

/** Uygulamada tutulan tek bir kur/fiyat. */
data class Rate(
    val code: String,          // USD, EUR, GRA (gram altın), XU100 ...
    val kind: RateKind,
    val buy: Double?,
    val sell: Double?,
    val changePct: Double?
) {
    /** Gösterilecek fiyat: satış varsa satış, yoksa alış. */
    val price: Double? get() = sell ?: buy
}

data class RatesState(
    val rates: Map<String, Rate> = emptyMap(),
    val updatedAt: String? = null,   // sağlayıcının verdiği güncelleme zamanı
    val loading: Boolean = false,
    val error: String? = null
)

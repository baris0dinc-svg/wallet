package com.example.wallet.data

import com.google.gson.JsonObject
import retrofit2.http.GET
import retrofit2.http.Url

/**
 * Retrofit arayüzü. Adres sabit değil: BASE_URL ayarlanabilir, uç nokta tam URL ile verilir.
 * Truncgil örneği: https://finans.truncgil.com/v4/today.json  (anahtar gerektirmez)
 *
 * NOT: Yanıtı JsonObject olarak alıyoruz çünkü "Update_Date" gibi nesne olmayan alanlar
 * ile döviz/altın nesneleri aynı seviyede. Alan adlarını canlı yanıtta doğrulayın.
 */
interface RatesApi {
    @GET
    suspend fun fetch(@Url url: String): JsonObject
}

package com.example.wallet

import com.example.wallet.data.RatesApi
import com.example.wallet.data.RatesRepository
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/** Retrofit kurulumu. @Url kullandığımız için baseUrl yalnızca zorunlu bir yer tutucu. */
object ServiceLocator {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    val api: RatesApi = Retrofit.Builder()
        .baseUrl("https://finans.truncgil.com/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(RatesApi::class.java)

    val repo = RatesRepository(api)
}

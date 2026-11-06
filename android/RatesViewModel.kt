package com.example.wallet.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.wallet.data.RatesRepository
import com.example.wallet.data.RatesState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/** Canlı kurları tutar. UI: val state by vm.state.collectAsState() */
class RatesViewModel(
    private val repo: RatesRepository,
    private val refreshMs: Long = 60_000L
) : ViewModel() {

    private val _state = MutableStateFlow(RatesState())
    val state: StateFlow<RatesState> = _state.asStateFlow()
    private var job: Job? = null

    /** Ekran görünürken çağırın; periyodik yeniler. */
    fun startAutoRefresh() {
        if (job?.isActive == true) return
        job = viewModelScope.launch {
            while (isActive) {
                refresh()
                delay(refreshMs)
            }
        }
    }

    fun stopAutoRefresh() { job?.cancel(); job = null }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val (rates, updated) = repo.load()
                _state.update { it.copy(rates = rates, updatedAt = updated, loading = false) }
            } catch (e: Exception) {
                // Eski veriyi koru, sadece hatayı göster
                _state.update { it.copy(loading = false, error = e.message ?: "Kurlar alınamadı") }
            }
        }
    }

    override fun onCleared() { stopAutoRefresh() }
}

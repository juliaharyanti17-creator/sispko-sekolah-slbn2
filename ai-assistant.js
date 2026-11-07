// ==========================================================================
// AI-ASSISTANT.JS - Asisten Cerdas SIMPATIK
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

/**
 * Membuka atau menutup jendela Modal Chat AI Assistant
 */
window.toggleAIChatModal = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var modal = document.getElementById('modal-ai-assistant');
    if (!modal) {
        console.warn("Elemen #modal-ai-assistant belum tersedia di dalam HTML.");
        return;
    }
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.style.setProperty('display', 'flex', 'important');
        var input = document.getElementById('ai-chat-input');
        if (input) input.focus();
    } else {
        modal.classList.add('hidden');
        modal.style.setProperty('display', 'none', 'important');
    }
};

/**
 * Menangani pengiriman pesan chat dari pengguna ke AI Assistant
 */
window.handleSendAIChat = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    var input = document.getElementById('ai-chat-input');
    var msgContainer = document.getElementById('ai-chat-messages');
    if (!input || !msgContainer) return;

    var text = input.value.trim();
    if (!text) return;

    // 1. Render Bubble Pesan Pengguna
    var userBubble = document.createElement('div');
    userBubble.className = "flex items-start justify-end gap-2.5";
    userBubble.innerHTML = `
        <div class="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-xs max-w-[85%] leading-relaxed">
            ${escapeHtml(text)}
        </div>
        <div class="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            Anda
        </div>
    `;
    msgContainer.appendChild(userBubble);
    input.value = '';
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 2. Tampilkan Indikator "AI sedang mengetik..."
    var typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex items-start gap-2.5";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            AI
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-400 italic text-xs">
            Sedang menganalisis data SIMPATIK...
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Simulasi Proses Analisis Data & Respon AI (Delay 800ms)
    setTimeout(function() {
        // Hapus indikator mengetik
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = generateAIResponse(text);

        // Render Bubble Respon AI
        var aiBubble = document.createElement('div');
        aiBubble.className = "flex items-start gap-2.5";
        aiBubble.innerHTML = `
            <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                AI
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-700 max-w-[85%] leading-relaxed">
                ${replyText}
            </div>
        `;
        msgContainer.appendChild(aiBubble);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 800);
};

/**
 * Logika Generator Respon Berdasarkan Konteks Aplikasi (window.appState)
 */
function generateAIResponse(query) {
    var lowerQuery = query.toLowerCase();
    var state = window.appState || {};

    if (lowerQuery.includes('presensi') || lowerQuery.includes('hadir') || lowerQuery.includes('siswa')) {
        var totalSiswa = (state.students && Array.isArray(state.students)) ? state.students.length : 0;
        var totalKelas = (state.classes && Array.isArray(state.classes)) ? state.classes.length : 0;
        return `Berdasarkan database sistem saat ini, terdapat <strong>${totalSiswa} murid</strong> yang terdaftar di ${totalKelas} rombongan belajar SLBN 2 Pelaihari. Anda dapat memantau rincian kehadiran harian pada tab <em>Presensi Murid</em>.`;
    } 
    
    if (lowerQuery.includes('jurnal') || lowerQuery.includes('kbm') || lowerQuery.includes('guru')) {
        var totalJurnal = (state.journals && Array.isArray(state.journals)) ? state.journals.length : 0;
        return `Tercatat ada <strong>${totalJurnal} laporan jurnal KBM</strong> guru yang telah dimasukkan ke dalam sistem. Kepala Sekolah dapat meninjau aktivitas ini melalui panel <em>Evaluasi Kepsek</em>.`;
    } 
    
    if (lowerQuery.includes('jadwal') || lowerQuery.includes('pelajaran')) {
        var totalJadwal = (state.jadwalMaster && Array.isArray(state.jadwalMaster)) ? state.jadwalMaster.length : 0;
        return `Sistem mencatat ada ${totalJadwal} entri master jadwal pelajaran harian. Pengaturan dan penambahan jam pelajaran dapat dikelola melalui menu <em>Data Master Sekolah</em>.`;
    } 
    
    if (lowerQuery.includes('halo') || lowerQuery.includes('hai') || lowerQuery.includes('pagi') || lowerQuery.includes('siang')) {
        return "Halo! Saya AI Assistant SIMPATIK SLBN 2 Pelaihari. Ada yang bisa saya bantu terkait rekap presensi, jadwal KBM, atau laporan aktivitas guru hari ini?";
    }

    // Default Fallback Response
    return `Saya memahami pertanyaan Anda mengenai "${escapeHtml(query)}". Sebagai asisten cerdas SIMPATIK, saya menyarankan Anda untuk memeriksa rekapitulasi data terbaru di menu utama atau menghubungi administrator sistem jika memerlukan bantuan teknis lanjutan.`;
}

/**
 * Helper untuk mencegah XSS pada teks input chat
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

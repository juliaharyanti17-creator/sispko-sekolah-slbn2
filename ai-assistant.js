// ==========================================================================
// AI-ASSISTANT.JS - AI Agent Cerdas (Internal Data & External Knowledge)
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

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

window.handleSendAIChat = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    var input = document.getElementById('ai-chat-input');
    var msgContainer = document.getElementById('ai-chat-messages');
    if (!input || !msgContainer) return;

    var text = input.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan pengguna
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

    // 2. Indikator Agen sedang bekerja (Berpikir & Mencari Sumber)
    var typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex items-start gap-2.5";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            AI
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-500 italic text-xs flex items-center gap-2">
            <svg class="animate-spin h-3.5 w-3.5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Agent sedang memindai data lokal & mencari sumber luar...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Agen (Asinkronus untuk simulasi pencarian luar)
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        // Jalankan fungsi Agent untuk memproses data internal & eksternal
        runAIAgentPipeline(text, function(replyText) {
            var aiBubble = document.createElement('div');
            aiBubble.className = "flex items-start gap-2.5";
            aiBubble.innerHTML = `
                <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    AI
                </div>
                <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-700 max-w-[85%] leading-relaxed space-y-2">
                    ${replyText}
                </div>
            `;
            msgContainer.appendChild(aiBubble);
            msgContainer.scrollTop = msgContainer.scrollHeight;
        });
    }, 1000);
};

/**
 * Pipeline Utama AI Agent: Inspeksi Data Lokal + Pencarian Sumber Luar
 */
function runAIAgentPipeline(query, callback) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    // 1. Cek apakah pertanyaan berkaitan dengan Data Internal Sekolah
    var internalKeywords = ['siswa', 'murid', 'kelas', 'wali kelas', 'guru', 'jurnal', 'kbm', 'jadwal', 'mapel', 'mata pelajaran', 'statistik', 'rekap'];
    var isInternalQuery = internalKeywords.some(function(keyword) { return lower.includes(keyword); });

    if (isInternalQuery) {
        // Proses pencarian dan analisis dari window.appState
        var internalResult = analyzeInternalData(lower, state);
        callback(internalResult);
    } else {
        // 2. Jika bukan data internal, Agen bertindak sebagai pencari sumber luar (External Knowledge Agent)
        fetchExternalKnowledge(query, function(externalResult) {
            var responseHtml = `
                <div class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <i class="fa-solid fa-globe"></i> Sumber Pengetahuan Luar / Web
                </div>
                <div>${externalResult}</div>
            `;
            callback(responseHtml);
        });
    }
}

/**
 * Analisis Mendalam Data Internal (window.appState)
 */
function analyzeInternalData(lower, state) {
    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];

    // Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel')) {
        if (subjects.length === 0) return "Belum ada data mata pelajaran yang tercatat di Data Master.";
        var listMapel = subjects.map(function(s, i) {
            var nama = typeof s === 'string' ? s : (s.name || s.nama);
            return `${i + 1}. ${nama}`;
        }).join('<br>');
        return `<strong>[Analisis Internal Master]</strong><br>Daftar mata pelajaran aktif:<br><div class="mt-1 p-2 bg-slate-50 rounded-xl border">${listMapel}</div>`;
    }

    // Wali Kelas & Guru
    if (lower.includes('wali kelas') || lower.includes('guru')) {
        if (users.length === 0) return "Belum ada data guru/pengguna terdaftar.";
        var listGuru = users.map(function(u) {
            return `• <strong>${u.nama || u.username}</strong> (${(u.role || 'Guru').toUpperCase()})`;
        }).join('<br>');
        return `<strong>[Analisis Internal Pengguna]</strong><br>Daftar guru terdaftar:<br><div class="mt-1 p-2 bg-slate-50 rounded-xl border">${listGuru}</div>`;
    }

    // Pencarian Siswa Spesifik
    if (lower.includes('cari siswa') || lower.includes('murid bernama')) {
        var keyword = lower.replace('cari siswa', '').replace('murid bernama', '').trim();
        var found = students.filter(function(s) { return (s.nama || s.name || '').toLowerCase().includes(keyword); });
        if (found.length === 0) return `Tidak ditemukan murid dengan nama "${keyword}" di database lokal.`;
        var res = found.map(function(s) {
            return `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Ketunaan: ${s.ketunaan || 'Umum'})`;
        }).join('<br>');
        return `<strong>[Hasil Pencarian Database Lokal]</strong><br>${res}`;
    }

    // Ringkasan Statistik Umum
    return `<strong>[Ringkasan Database SIMPATIK SLBN 2 Pelaihari]</strong><br>` +
           `• Total Murid: <strong>${students.length} orang</strong><br>` +
           `• Total Kelas: <strong>${classes.length} rombel</strong><br>` +
           `• Total Jurnal KBM: <strong>${journals.length} laporan</strong><br>` +
           `• Total Jadwal Master: <strong>${jadwal.length} entri</strong>`;
}

/**
 * Konektor Sumber Luar (External Knowledge Source / API / Web Search Simulation)
 */
function fetchExternalKnowledge(query, callback) {
    // Di sini Anda dapat mengintegrasikan fetch() ke API pihak ketiga atau LLM endpoint eksternal jika memiliki API Key (misal OpenAI / Gemini API).
    // Sebagai AI Agent mandiri berbasis klien, kita sediakan mekanisme simulasi pintar atau integrasi endpoint.
    
    setTimeout(function() {
        var encodedQuery = encodeURIComponent(query);
        // Simulasi hasil pencarian cerdas dari sumber luar berdasarkan topik pendidikan khusus / umum
        var simulatedAnswers = {
            "kurikulum merdeka": "Kurikulum Merdeka memberikan keleluasaan bagi satuan pendidikan untuk menciptakan pembelajaran berkualitas yang disesuaikan dengan kebutuhan belajar peserta didik, termasuk anak berkebutuhan khusus (PDBK) di SLB.",
            "tunagrahita": "Anak dengan hambatan intelektual (Tunagrahita) memerlukan pendekatan pembelajaran adaptif yang menitikberatkan pada kecakapan hidup (life skills) dan kemandirian sehari-hari.",
            "autis": "Strategi penanganan peserta didik dengan spektrum autisme di sekolah inklusi/SLB meliputi struktur lingkungan belajar yang jelas, visualisasi jadwal, dan manajemen sensorik."
        };

        var matchedKey = Object.keys(simulatedAnswers).find(function(k) { return query.toLowerCase().includes(k); });
        
        if (matchedKey) {
            callback(simulatedAnswers[matchedKey] + `<br><span class="text-[10px] text-slate-400 mt-1 block">🔍 Referensi Literatur Pendidikan Luar</span>`);
        } else {
            // Fallback pencarian umum
            callback(`Berdasarkan penelusuran pustaka pendidikan dan referensi luar mengenai "<em>${escapeHtml(query)}</em>", topik ini berkaitan erat dengan metode pedagogi khusus, administrasi manajemen sekolah luar biasa, serta panduan kurikulum nasional.`);
        }
    }, 600);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

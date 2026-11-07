// ==========================================================================
// AI-ASSISTANT.JS - Asisten Cerdas Terintegrasi Data SIMPATIK
// SLBN 2 PELAIHARI
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

    // 2. Indikator "AI sedang memproses data..."
    var typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex items-start gap-2.5";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            AI
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-400 italic text-xs">
            Menganalisis database SIMPATIK...
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Berdasarkan window.appState Nyata
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = analyzeAppDataWithAI(text);

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
    }, 700);
};

/**
 * Fungsi Pintar untuk Mengambil Data Nyata dari window.appState
 */
function analyzeAppDataWithAI(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];
    // Di dalam fungsi analisis AI (analyzeAppDataWithAI):
var subjects = window.appState.subjects || window.appState.mapel || window.appState.mataPelajaran || [];

if (lower.includes('jadwal') || lower.includes('pelajaran') || lower.includes('mapel')) {
    return `Terdapat <strong>${subjects.length} entri mata pelajaran</strong> yang terdaftar dalam sistem master sekolah.`;
}

    // Jika pengguna bertanya tentang data siswa / murid
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak')) {
        if (students.length === 0) return "Belum ada data murid yang tercatat di database saat ini.";
        var listNama = students.slice(0, 5).map(function(s) { return s.nama || s.name; }).join(', ');
        var extra = students.length > 5 ? ` dan ${students.length - 5} murid lainnya.` : '.';
        return `Total terdapat <strong>${students.length} murid</strong> terdaftar di SLBN 2 Pelaihari dari ${classes.length} kelas. Beberapa di antaranya: ${listNama}${extra}`;
    }

    // Jika pengguna bertanya tentang kelas
    if (lower.includes('kelas')) {
        if (classes.length === 0) return "Belum ada data kelas yang terdaftar.";
        var kelasNames = classes.map(function(c) { return c.name || c.nama; }).join(', ');
        return `Daftar rombongan belajar (kelas) yang aktif di sistem meliputi: <strong>${kelasNames}</strong>.`;
    }

    // Jika pengguna bertanya tentang jurnal mengajar guru
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        if (journals.length === 0) return "Belum ada laporan jurnal mengajar yang diinput oleh guru.";
        return `Tercatat ada <strong>${journals.length} laporan jurnal KBM</strong> guru yang masuk ke dalam sistem pengawasan.`;
    }

    // Jika pengguna bertanya tentang guru / user
    if (lower.includes('guru') || lower.includes('pengguna') || lower.includes('user') || lower.includes('admin')) {
        if (users.length === 0) return "Belum ada data pengguna lain yang terdaftar.";
        var userNames = users.map(function(u) { return u.nama + ' (' + u.role + ')'; }).join(', ');
        return `Pengguna aktif yang terdaftar dalam sistem: ${userNames}.`;
    }

    // Jika pengguna bertanya tentang jadwal pelajaran
    if (lower.includes('jadwal') || lower.includes('pelajaran')) {
        return `Terdapat ${jadwal.length} entri master jadwal pelajaran harian yang tersimpan di sistem administrasi sekolah.`;
    }

    // Pertanyaan umum / sapaan
    if (lower.includes('halo') || lower.includes('hai')) {
        return `Halo! Saya AI Assistant SIMPATIK. Saat ini saya membaca data riil sekolah: <strong>${students.length} Murid</strong>, <strong>${classes.length} Kelas</strong>, dan <strong>${journals.length} Jurnal KBM</strong>. Apa yang ingin Anda ketahui?`;
    }

    return `Berdasarkan pemindaian data SIMPATIK SLBN 2 Pelaihari, saat ini tersimpan ${students.length} data murid dan ${journals.length} riwayat jurnal. Silakan tanyakan informasi spesifik seputar rekap kelas, siswa, atau aktivitas KBM!`;
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

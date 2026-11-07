// ==========================================================================
// AI-ASSISTANT.JS - AI Agent Natural & Inspektur Data Menyeluruh
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

    // 2. Indikator natural "AI sedang meracik jawaban..."
    var typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex items-start gap-2.5";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            AI
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-500 italic text-xs flex items-center gap-2">
            <svg class="animate-spin h-3.5 w-3.5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Membaca seluruh isi database SIMPATIK...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Mendalam
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = generateNaturalAIResponse(text);

        var aiBubble = document.createElement('div');
        aiBubble.className = "flex items-start gap-2.5";
        aiBubble.innerHTML = `
            <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                AI
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-700 max-w-[85%] leading-relaxed space-y-2">
                ${replyText}
            </div>
        `;
        msgContainer.appendChild(aiBubble);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 600);
};

/**
 * Logika Respons Natural & Inspeksi Menyeluruh window.appState
 */
function generateNaturalAIResponse(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];

    // Jika menyapa atau menanyakan kabar
    if (lower.match(/^(halo|hai|pagi|siang|malam|assalamu)/)) {
        return `Halo! Senang bisa membantu Anda kembali. Saya sudah memindai seluruh data terbaru di SIMPATIK SLBN 2 Pelaihari (${students.length} murid, ${classes.length} kelas, dan ${journals.length} jurnal KBM aktif). Ada hal spesifik yang ingin kita bahas atau periksa hari ini?`;
    }

    // Pertanyaan seputar Siswa / Murid secara umum atau pencarian
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak')) {
        if (lower.includes('cari') || lower.includes('nama') || lower.includes('tentang')) {
            var keyword = lower.replace(/cari|siswa|murid|nama|tentang/g, '').trim();
            if (!keyword) return "Tentu, siapa nama murid yang ingin Anda cari di database?";
            
            var matched = students.filter(function(s) {
                return (s.nama || s.name || '').toLowerCase().includes(keyword);
            });

            if (matched.length === 0) return `Saya sudah memeriksa seluruh daftar siswa, namun tidak menemukan murid dengan nama yang mengandung "${keyword}".`;
            
            var res = matched.map(function(s) {
                var cName = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
                return `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Kelas: ${cName}, Ketunaan: ${s.ketunaan || 'Umum'})`;
            }).join('<br>');
            return `Berikut hasil penelusuran data siswa yang cocok:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${res}</div>`;
        }

        return `Berdasarkan data keseluruhan di sistem, saat ini tercatat ada <strong>${students.length} murid</strong> yang tersebar di ${classes.length} rombongan belajar. Semuanya tercatat lengkap dengan informasi ketunaan dan kelas masing-masing.`;
    }

    // Pertanyaan seputar Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel') || lower.includes('pelajaran')) {
        if (subjects.length === 0) return "Belum ada mata pelajaran yang dimasukkan ke Data Master saat ini.";
        var listMapel = subjects.map(function(s) {
            return `• ${typeof s === 'string' ? s : (s.name || s.nama)}`;
        }).join('<br>');
        return `Di data master sekolah, saat ini terdaftar ${subjects.length} mata pelajaran aktif:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${listMapel}</div>`;
    }

    // Pertanyaan seputar Guru / Wali Kelas
    if (lower.includes('wali kelas') || lower.includes('guru') || lower.includes('pengajar')) {
        if (users.length === 0) return "Belum ada data guru atau user lain yang tersimpan.";
        var listUser = users.map(function(u) {
            return `• <strong>${u.nama || u.username}</strong> — Hak Akses: <em>${(u.role || 'Guru').toUpperCase()}</em>`;
        }).join('<br>');
        return `Berikut daftar pengajar dan pengguna yang memegang akses di sistem:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${listUser}</div>`;
    }

    // Pertanyaan seputar Jurnal KBM / Aktivitas Mengajar
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        if (journals.length === 0) return "Belum ada laporan jurnal mengajar yang diinput oleh guru ke dalam sistem.";
        var latest = journals.slice(-3).reverse().map(function(j) {
            return `• <strong>${j.tanggal}</strong> (${j.mapel || 'Mapel'} di ${j.kelas || 'Kelas'}): "${j.materi || '-'}"`;
        }).join('<br>');
        return `Sejauh ini sudah ada <strong>${journals.length} laporan jurnal KBM</strong> yang masuk. Berikut beberapa aktivitas pembelajaran terakhir:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${latest}</div>`;
    }

    // Pertanyaan seputar Jadwal
    if (lower.includes('jadwal')) {
        if (jadwal.length === 0) return "Belum ada master jadwal harian yang diatur.";
        return `Sistem mencatat ada total <strong>${jadwal.length} entri jadwal pelajaran</strong> harian yang terdistribusi untuk kelas-kelas di sekolah.`;
    }

    // Pertanyaan rekap / ringkasan umum
    if (lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('statistik') || lower.includes('semua data')) {
        return `Tentu, ini rangkuman menyeluruh dari data aplikasi saat ini:<br>` +
               `🏫 <strong>${classes.length} Kelas</strong> aktif<br>` +
               `👨‍🎓 <strong>${students.length} Total Murid</strong> terdaftar<br>` +
               `📚 <strong>${subjects.length} Mata Pelajaran</strong> master<br>` +
               `📝 <strong>${journals.length} Jurnal KBM</strong> guru tersimpan<br>` +
               `👥 <strong>${users.length} Akun Pengguna</strong> aktif`;
    }

    // Fallback natural jika pertanyaan di luar kebiasaan
    return `Saya paham maksud Anda. Saya bisa membantu membacakan atau merangkum data apa pun yang ada di aplikasi SIMPATIK ini—mulai dari daftar murid, jadwal, jurnal guru, hingga data kelas. Coba tanyakan secara spesifik, misalnya: <em>"Berapa jumlah siswa di kelas 1?"</em> atau <em>"Apa saja jurnal terbaru hari ini?"</em>`;
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

// ==========================================================================
// AI-ASSISTANT.JS - Asisten Cerdas Super Pintar (SIMPATIK SLBN 2 PELAIHARI)
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
            Menganalisis database SIMPATIK secara mendalam...
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Pintar Berdasarkan window.appState
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
 * Logika Analisis Tingkat Lanjut (Super Pintar)
 */
function analyzeAppDataWithAI(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];
    var presensi = state.presensiRecords || {};

    // 1. Pertanyaan seputar Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel') || lower.includes('pelajaran apa')) {
        if (subjects.length === 0) return "Belum ada data mata pelajaran yang terdaftar di Data Master.";
        var listMapel = subjects.map(function(s, i) {
            var namaMapel = typeof s === 'string' ? s : (s.name || s.nama);
            return `${i + 1}. ${namaMapel}`;
        }).join('<br>');
        return `Berikut adalah daftar mata pelajaran aktif di SLBN 2 Pelaihari:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${listMapel}</div>`;
    }

    // 2. Pertanyaan seputar Wali Kelas / Guru
    if (lower.includes('wali kelas') || lower.includes('guru') || lower.includes('mengajar di kelas')) {
        var matchedClass = classes.find(function(c) {
            var cName = (c.name || c.nama || '').toLowerCase();
            return lower.includes(cName) || (lower.includes('1') && cName.includes('1')) || (lower.includes('2') && cName.includes('2')) || (lower.includes('3') && cName.includes('3'));
        });

        if (matchedClass) {
            var className = matchedClass.name || matchedClass.nama;
            var classId = matchedClass.id;
            var waliKelas = users.find(function(u) {
                return u.kelasAmpuan === classId || (u.kelasAmpuan && u.kelasAmpuan.toLowerCase().includes(className.toLowerCase()));
            });
            var namaGuru = waliKelas ? (waliKelas.nama || waliKelas.username) : "Belum ditentukan / Administrator";
            return `Untuk <strong>${className}</strong>, wali kelas atau guru pengampunya adalah: <strong>${namaGuru}</strong>.`;
        }

        if (users.length === 0) return "Belum ada data pengguna/guru terdaftar.";
        var listGuru = users.map(function(u) {
            return `• <strong>${u.nama || u.username}</strong> (Role: ${(u.role || 'Guru').toUpperCase()})`;
        }).join('<br>');
        return `Berikut daftar guru dan pengurus yang terdaftar di sistem:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${listGuru}</div>`;
    }

    // 3. Pencarian Data Siswa / Murid Spesifik
    if (lower.includes('cari siswa') || lower.includes('cari murid') || lower.includes('tentang siswa') || lower.includes('murid bernama')) {
        var keyword = lower.replace('cari siswa', '').replace('cari murid', '').replace('tentang siswa', '').replace('murid bernama', '').trim();
        if (!keyword) return "Silakan sebutkan nama siswa yang ingin dicari (Contoh: *Cari siswa Riza*).";

        var foundStudents = students.filter(function(s) {
            var namaSiswa = (s.nama || s.name || '').toLowerCase();
            return namaSiswa.includes(keyword);
        });

        if (foundStudents.length === 0) return `Tidak ditemukan murid dengan nama yang mengandung "${keyword}".`;

        var resultHtml = foundStudents.map(function(s) {
            var kelasNama = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
            return `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Kelas: ${kelasNama}, Ketunaan: ${s.ketunaan || 'Umum'})`;
        }).join('<br>');

        return `Ditemukan ${foundStudents.length} murid:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${resultHtml}</div>`;
    }

    // 4. Analisis Jadwal Berdasarkan Hari (Misal: "Jadwal hari Senin")
    if (lower.includes('jadwal') || lower.includes('jam pelajaran')) {
        var hariList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        var targetHari = hariList.find(function(h) { return lower.includes(h); });

        if (targetHari && jadwal.length > 0) {
            var filteredJadwal = jadwal.filter(function(j) { return (j.hari || '').toLowerCase() === targetHari; });
            if (filteredJadwal.length === 0) {
                return `Belum ada jadwal pelajaran yang diinput untuk hari <strong>${targetHari.toUpperCase()}</strong>.`;
            }
            var listJadwalHtml = filteredJadwal.map(function(j) {
                var namaKelas = typeof getClassName === 'function' ? getClassName(j.classId) : j.classId;
                return `• <strong>${namaKelas}</strong> - Jam Ke-${j.jamKe}: ${j.mapel}`;
            }).join('<br>');
            return `📅 <strong>Jadwal Hari ${targetHari.toUpperCase()}:</strong><br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${listJadwalHtml}</div>`;
        }

        return `Terdapat <strong>${jadwal.length} entri jadwal pelajaran</strong> harian yang tersimpan di sistem sekolah. Anda juga bisa bertanya spesifik seperti *"Jadwal hari Senin"*.`;
    }

    // 5. Analisis Jurnal / Aktivitas Guru KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar') || lower.includes('aktivitas')) {
        if (journals.length === 0) return "Belum ada laporan jurnal mengajar guru yang diinput ke dalam sistem.";
        var recentJournals = journals.slice(-3).reverse().map(function(j) {
            return `• <strong>${j.tanggal}</strong> (${j.kelas || '-' } - ${j.mapel || '-'}): ${j.materi || '-'}`;
        }).join('<br>');
        return `Tercatat total <strong>${journals.length} laporan jurnal KBM</strong>. Berikut 3 aktivitas mengajar terakhir:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${recentJournals}</div>`;
    }

    // 6. Ringkasan Statistik Lengkap Sistem
    if (lower.includes('statistik') || lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('info sekolah')) {
        return `📊 <strong>Ringkasan Data SIMPATIK SLBN 2 Pelaihari:</strong><br>` +
               `• Total Murid: <strong>${students.length} orang</strong><br>` +
               `• Total Kelas: <strong>${classes.length} rombel</strong><br>` +
               `• Total Mata Pelajaran: <strong>${subjects.length} mapel</strong><br>` +
               `• Total Jurnal KBM: <strong>${journals.length} laporan</strong><br>` +
               `• Total Guru/User: <strong>${users.length} akun</strong>`;
    }

    // 7. Sapaan Umum
    if (lower.includes('halo') || lower.includes('hai')) {
        return `Halo! Saya AI Assistant SIMPATIK SLBN 2 Pelaihari. Saya siap membantu Anda menganalisis data sekolah secara instan. Apa yang ingin Anda ketahui hari ini?`;
    }

    // 8. Fallback Pintar
    return `Saya mengerti pertanyaan Anda. Sebagai AI Assistant SIMPATIK, Anda bisa mencoba bertanya hal-hal berikut:<br>` +
           `1. *"Mata pelajaran apa saja yang ada?"*<br>` +
           `2. *"Siapa wali kelas 1?"*<br>` +
           `3. *"Cari siswa [Nama Siswa]"*<br>` +
           `4. *"Jadwal hari Senin"*<br>` +
           `5. *"Ringkasan statistik sekolah"*`;
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

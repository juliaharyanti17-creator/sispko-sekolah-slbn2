// ==========================================================================
// AI-ASSISTANT.JS - Smart Role-Based Agent & Deep Data Inspector
// SIMPATIK SLBN 2 PELAIHARI
// ==========================================================================

window.toggleAIChatModal = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var modal = document.getElementById('modal-ai-assistant');
    if (!modal) return;
    
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

    // 1. Tampilkan pesan user
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

    // 2. Indikator pemindaian mendalam
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
            <span>Memindai seluruh profil role, siswa, kelas, dan jurnal...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Role & Data
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = roleBasedInspector(text);

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
    }, 700);
};

/**
 * Mesin Inspeksi Berbasis Role & Data Menyeluruh
 */
function roleBasedInspector(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];

    // 1. Pertanyaan seputar Kepala Sekolah (Role: kepsek)
    if (lower.includes('kepala sekolah') || lower.includes('kepsek')) {
        var kepsekList = users.filter(function(u) {
            var role = (u.role || '').toLowerCase();
            return role === 'kepsek' || role === 'kepala sekolah' || (u.jabatan && u.jabatan.toLowerCase().includes('kepala sekolah'));
        });

        if (kepsekList.length === 0) {
            return "Belum ada user yang diatur dengan role <strong>Kepala Sekolah (Kepsek)</strong> di data master pengguna.";
        }

        var listNamaKepsek = kepsekList.map(function(u) {
            return `<strong>${u.nama || u.username}</strong> (Username: ${u.username})`;
        }).join(', ');

        return `Berdasarkan data sistem, yang menjabat sebagai <strong>Kepala Sekolah</strong> di SLBN 2 Pelaihari adalah: ${listNamaKepsek}.`;
    }

    // 2. Pertanyaan seputar Administrator / Admin
    if (lower.includes('admin') || lower.includes('administrator')) {
        var adminList = users.filter(function(u) {
            return (u.role || '').toLowerCase() === 'admin';
        });

        if (adminList.length === 0) return "Tidak ada user dengan role Administrator yang tercatat.";
        var names = adminList.map(u => `<strong>${u.nama || u.username}</strong>`).join(', ');
        return `Pengguna yang memegang jabatan sebagai <strong>Administrator</strong> sistem adalah: ${names}.`;
    }

    // 3. Pertanyaan seputar Guru / Wali Kelas & Distribusi Role
    if (lower.includes('guru') || lower.includes('wali kelas') || lower.includes('pengajar') || lower.includes('staff') || lower.includes('jabatan')) {
        if (users.length === 0) return "Belum ada data user/pengguna terdaftar.";

        var userSummary = users.map(function(u) {
            var roleFormatted = (u.role || 'Guru').toUpperCase();
            return `• <strong>${u.nama || u.username}</strong> menjabat sebagai <em>${roleFormatted}</em>`;
        }).join('<br>');

        return `Berikut adalah daftar seluruh pengguna beserta jabatan/role mereka di sistem:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${userSummary}</div>`;
    }

    // 4. Pertanyaan Spesifik Ketunaan (Contoh: "Berapa murid autis?", "Cari siswa tunanetra")
    var ketunaanKeywords = ['autis', 'netra', 'rungu', 'grahita', 'daksa', 'laras'];
    var matchedKetunaan = ketunaanKeywords.find(k => lower.includes(k));

    if (matchedKetunaan || lower.includes('ketunaan') || lower.includes('disabilitas')) {
        if (students.length === 0) return "Belum ada data siswa terdaftar.";

        if (matchedKetunaan) {
            var filteredStudents = students.filter(function(s) {
                var ket = (s.ketunaan || '').toLowerCase();
                return ket.includes(matchedKetunaan);
            });

            if (filteredStudents.length === 0) {
                return `Tidak ditemukan siswa dengan kategori ketunaan <strong>${matchedKetunaan.toUpperCase()}</strong>.`;
            }

            var listSiswa = filteredStudents.map(function(s, idx) {
                var cName = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
                return `${idx + 1}. <strong>${s.nama || s.name}</strong> (Kelas: ${cName}, NISN: ${s.nisn || '-'})`;
            }).join('<br>');

            return `Ditemukan <strong>${filteredStudents.length} murid</strong> dengan kategori <strong>${matchedKetunaan.toUpperCase()}</strong>:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${listSiswa}</div>`;
        }
    }

    // 5. Pencarian Siswa Umum
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak') || lower.includes('cari')) {
        var keyword = lower.replace(/cari|siswa|murid|nama|tentang/g, '').trim();
        if (keyword && keyword.length > 1) {
            var found = students.filter(s => (s.nama || s.name || '').toLowerCase().includes(keyword) || (s.nisn || '').toLowerCase().includes(keyword));
            if (found.length > 0) {
                var res = found.map(s => `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Ketunaan: ${s.ketunaan || 'Umum'})`).join('<br>');
                return `Hasil pencarian siswa:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${res}</div>`;
            }
        }
        return `Total terdapat <strong>${students.length} murid</strong> terdaftar di ${classes.length} kelas aktif.`;
    }

    // 6. Pertanyaan seputar Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel') || lower.includes('pelajaran')) {
        if (subjects.length === 0) return "Belum ada mata pelajaran terdaftar.";
        var mapelList = subjects.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : (s.name || s.nama)}`).join('<br>');
        return `Daftar mata pelajaran aktif:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${mapelList}</div>`;
    }

    // 7. Pertanyaan seputar Jurnal KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        if (journals.length === 0) return "Belum ada laporan jurnal KBM yang masuk.";
        var recent = journals.slice(-4).reverse().map(j => `• <strong>${j.tanggal}</strong> (${j.kelas || '-'} - ${j.mapel || '-'}): ${j.materi || '-'}`).join('<br>');
        return `Tercatat ada ${journals.length} laporan jurnal KBM. Catatan terbaru:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${recent}</div>`;
    }

    // 8. Ringkasan Keseluruhan / Statistik
    if (lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('statistik') || lower.includes('laporan') || lower.includes('info')) {
        return `📊 <strong>Ringkasan Eksekutif SIMPATIK:</strong><br>` +
               `• <strong>Total Kelas:</strong> ${classes.length} rombel<br>` +
               `• <strong>Total Siswa:</strong> ${students.length} anak<br>` +
               `• <strong>Total Pengguna / User:</strong> ${users.length} akun<br>` +
               `• <strong>Total Jurnal KBM:</strong> ${journals.length} laporan<br>` +
               `• <strong>Total Master Mapel:</strong> ${subjects.length} mata pelajaran`;
    }

    // 9. Deep Fallback Universal Search
    var matchResults = [];
    students.forEach(s => {
        if (JSON.stringify(s).toLowerCase().includes(lower)) matchResults.push(`Siswa: ${s.nama || s.name}`);
    });
    users.forEach(u => {
        if (JSON.stringify(u).toLowerCase().includes(lower)) matchResults.push(`User: ${u.nama || u.username} (${u.role})`);
    });

    if (matchResults.length > 0) {
        return `Hasil penelusuran mendalam:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${matchResults.slice(0, 5).join('<br>')}</div>`;
    }

    return `Saya telah memindai seluruh data SIMPATIK (${students.length} siswa, ${users.length} user/guru, ${classes.length} kelas). Namun saya kurang memahami "<em>${escapeHtml(query)}</em>".<br><br>` +
           `Coba tanyakan:<br>` +
           `• <em>"Siapa kepala sekolah?"</em><br>` +
           `• <em>"Berapa murid autis?"</em><br>` +
           `• <em>"Siapa saja guru yang bertugas?"</em><br>` +
           `• <em>"Tampilkan ringkasan statistik sekolah"</em>`;
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

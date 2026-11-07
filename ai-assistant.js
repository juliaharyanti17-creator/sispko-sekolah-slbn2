// ==========================================================================
// AI-ASSISTANT.JS - Deep Data Inspector & AI Agent SIMPATIK
// SLBN 2 PELAIHARI
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
            <span>Memindai dan menyaring seluruh database window.appState...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Kontekstual
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = deepInspectAppState(text);

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
 * Mesin Inspeksi Mendalam (Deep Inspector) dengan Filter Ketunaan Cerdas
 */
function deepInspectAppState(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];
    var ketunaanList = state.ketunaanList || [];

    // 1. Analisis Ketunaan / Disabilitas Spesifik (Misal: "autis", "tuna rungu", dll)
    if (lower.includes('ketunaan') || lower.includes('autis') || lower.includes('tuna') || lower.includes('kategori')) {
        // Cari keyword ketunaan dari list atau teks pertanyaan
        var searchCat = "";
        if (lower.includes('autis')) searchCat = "autis";
        else if (lower.includes('netra')) searchCat = "netra";
        else if (lower.includes('rungu')) searchCat = "rungu";
        else if (lower.includes('grahita')) searchCat = "grahita";
        else if (lower.includes('daksa')) searchCat = "daksa";
        else {
            // Ambil kata setelah kata kunci jika ada
            var parts = lower.split('ketunaan');
            if (parts.length > 1) searchCat = parts[1].trim();
        }

        if (searchCat) {
            var filteredStudents = students.filter(function(s) {
                var sKet = (s.ketunaan || '').toLowerCase();
                return sKet.includes(searchCat);
            });

            if (filteredStudents.length === 0) {
                return `Berdasarkan pemindaian database, tidak ditemukan murid dengan kategori ketunaan yang mengandung "${searchCat}". (Total siswa terdaftar: ${students.length} anak).`;
            }

            var listMatch = filteredStudents.map(function(s, idx) {
                var cName = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
                return `${idx + 1}. <strong>${s.nama || s.name}</strong> (Kelas: ${cName}, Ketunaan: ${s.ketunaan})`;
            }).join('<br>');

            return `Ditemukan <strong>${filteredStudents.length} murid</strong> dengan kategori ketunaan <strong>"${searchCat}"</strong>:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${listMatch}</div>`;
        }

        // Jika hanya bertanya secara umum tentang ketunaan
        var catSummary = ketunaanList.map(function(k) {
            var count = students.filter(s => (s.ketunaan || '').toLowerCase().includes(k.toLowerCase())).length;
            return `• <strong>${k}</strong>: ${count} murid`;
        }).join('<br>');

        return `Berikut adalah rekap jumlah murid berdasarkan kategori ketunaan:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${catSummary || 'Belum ada data ketunaan terpetakan.'}</div>`;
    }

    // 2. Ringkasan Eksekutif / Statistik Menyeluruh
    if (lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('statistik') || lower.includes('laporan') || lower.includes('semua data')) {
        return `📊 <strong>Laporan Eksekutif SIMPATIK SLBN 2 Pelaihari:</strong><br>` +
               `• <strong>Rombongan Belajar:</strong> ${classes.length} kelas aktif<br>` +
               `• <strong>Total Peserta Didik:</strong> ${students.length} anak<br>` +
               `• <strong>Mata Pelajaran Master:</strong> ${subjects.length} mapel<br>` +
               `• <strong>Akumulasi Jurnal KBM:</strong> ${journals.length} laporan masuk<br>` +
               `• <strong>Entri Jadwal Pelajaran:</strong> ${jadwal.length} sesi`;
    }

    // 3. Analisis Data Siswa & Pencarian Spesifik
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak') || lower.includes('cari')) {
        if (students.length === 0) return "Belum ada data peserta didik yang tersimpan di dalam sistem.";

        var matched = students.filter(function(s) {
            var nama = (s.nama || s.name || '').toLowerCase();
            var nisn = (s.nisn || '').toLowerCase();
            var ketunaan = (s.ketunaan || '').toLowerCase();
            return lower.includes(nama) || (nisn && lower.includes(nisn)) || (ketunaan && lower.includes(ketunaan));
        });

        if (matched.length > 0) {
            var results = matched.map(function(s) {
                var cName = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
                return `• <strong>${s.nama || s.name}</strong><br>` +
                       `&nbsp;&nbsp;&nbsp;&nbsp;- NISN: ${s.nisn || '-'}<br>` +
                       `&nbsp;&nbsp;&nbsp;&nbsp;- Kelas: ${cName}<br>` +
                       `&nbsp;&nbsp;&nbsp;&nbsp;- Kategori Ketunaan: <span class="text-purple-700 font-bold">${s.ketunaan || 'Umum'}</span>`;
            }).join('<br>');
            return `Hasil penelusuran data peserta didik:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${results}</div>`;
        }

        return `Saat ini tercatat ada <strong>${students.length} peserta didik</strong> yang terdaftar. Anda dapat menanyakan jumlah berdasarkan ketunaan tertentu (contoh: <em>"Berapa murid autis?"</em>).`;
    }

    // 4. Analisis Relasi Kelas & Wali Kelas
    if (lower.includes('kelas') || lower.includes('wali kelas') || lower.includes('guru') || lower.includes('pengajar')) {
        if (classes.length === 0) return "Belum ada data kelas yang diatur di Data Master.";

        var detailKelas = classes.map(function(c) {
            var cId = c.id;
            var cName = c.name || c.nama;
            var siswaKelas = students.filter(s => s.classId === cId || s.kelas === cId || s.kelas === cName);
            var wali = users.find(u => u.kelasAmpuan === cId || (u.kelasAmpuan && u.kelasAmpuan.toLowerCase().includes(cName.toLowerCase())));
            var namaWali = wali ? (wali.nama || wali.username) : "Belum ditentukan";

            return `• <strong>${cName}</strong> (${siswaKelas.length} Siswa) — Wali Kelas: <em>${namaWali}</em>`;
        }).join('<br>');

        return `Berikut adalah rincian rombongan belajar dan pengampunya:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${detailKelas}</div>`;
    }

    // 5. Analisis Mata Pelajaran
    if (lower.includes('pelajaran') || lower.includes('mapel')) {
        if (subjects.length === 0) return "Belum ada mata pelajaran yang dimasukkan ke Data Master.";
        var listMapel = subjects.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : (s.name || s.nama)}`).join('<br>');
        return `Daftar mata pelajaran aktif:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${listMapel}</div>`;
    }

    // 6. Analisis Jurnal KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        if (journals.length === 0) return "Belum ada laporan jurnal KBM yang masuk ke dalam sistem.";
        var recentJournals = journals.slice(-5).reverse().map(function(j) {
            return `• <strong>${j.tanggal}</strong> [${j.kelas || '-'}] (${j.mapel || '-'}): ${j.materi || '-'}`;
        }).join('<br>');
        return `Tercatat ada ${journals.length} laporan jurnal KBM. Berikut 5 aktivitas pembelajaran terakhir:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1">${recentJournals}</div>`;
    }

    // 7. Analisis Jadwal Pelajaran
    if (lower.includes('jadwal')) {
        if (jadwal.length === 0) return "Belum ada master jadwal pelajaran yang diinput.";
        return `Terdapat <strong>${jadwal.length} entri master jadwal pelajaran</strong> harian yang terdistribusi di sistem administrasi sekolah.`;
    }

    // 8. Deep Search Universal
    var foundMatches = [];
    students.forEach(s => {
        if (JSON.stringify(s).toLowerCase().includes(lower)) {
            foundMatches.push(`Siswa: ${s.nama || s.name} (Kelas: ${s.classId || s.kelas || '-'})`);
        }
    });
    users.forEach(u => {
        if (JSON.stringify(u).toLowerCase().includes(lower)) {
            foundMatches.push(`Guru/User: ${u.nama || u.username}`);
        }
    });

    if (foundMatches.length > 0) {
        return `Hasil penelusuran mendalam menemukan data berikut:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1">${foundMatches.slice(0, 5).join('<br>')}</div>`;
    }

    // 9. Fallback Kontekstual
    return `Saya sudah memindai seluruh isi memori aplikasi SIMPATIK (mencakup ${students.length} siswa, ${classes.length} kelas, dan ${journals.length} jurnal). Namun, saya belum menangkap maksud dari "<em>${escapeHtml(query)}</em>".<br><br>` +
           `Coba tanyakan hal seperti:<br>` +
           `• <em>"Berapa murid dengan ketunaan autis?"</em><br>` +
           `• <em>"Siapa wali kelas 1?"</em><br>` +
           `• <em>"Cari siswa [Nama]"</em><br>` +
           `• <em>"Mata pelajaran apa saja yang ada?"</em>`;
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

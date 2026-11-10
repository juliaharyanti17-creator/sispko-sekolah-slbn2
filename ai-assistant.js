// ==========================================================================
// AI-ASSISTANT.JS - Smart Role-Based Agent & Deep Data Inspector (SIMANTAP v5)
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

/**
 * Mengirim pesan chat AI dengan dukungan chip cepat
 */
window.handleSendAIChat = function(e, presetText) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    var input = document.getElementById('ai-chat-input');
    var msgContainer = document.getElementById('ai-chat-messages');
    if (!msgContainer) return;

    var text = presetText || (input ? input.value.trim() : '');
    if (!text) return;

    // 1. Tampilkan pesan user
    var userBubble = document.createElement('div');
    userBubble.className = "flex items-start justify-end gap-2.5 animate-fadeIn";
    userBubble.innerHTML = `
        <div class="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-xs max-w-[85%] leading-relaxed text-sm">
            ${escapeHtml(text)}
        </div>
        <div class="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            Anda
        </div>
    `;
    msgContainer.appendChild(userBubble);
    
    if (input && !presetText) input.value = '';
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 2. Indikator pemindaian mendalam
    var typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex items-start gap-2.5 animate-fadeIn";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
            AI
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-500 italic text-xs flex items-center gap-2">
            <svg class="animate-spin h-3.5 w-3.5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memindai data SIMANTAP secara mendalam...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis & Respon
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = roleBasedInspector(text);

        var aiBubble = document.createElement('div');
        aiBubble.className = "flex items-start gap-2.5 animate-fadeIn";
        aiBubble.innerHTML = `
            <div class="w-7 h-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                AI
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-slate-700 max-w-[85%] leading-relaxed space-y-2 text-sm">
                ${replyText}
            </div>
        `;
        msgContainer.appendChild(aiBubble);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 600);
};

/**
 * Mesin Inspeksi Berbasis Role & Deep Data Inspector (SIMANTAP v5)
 */
function roleBasedInspector(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    
    // Tangkap data presensi dari appState (presensi & presensiRecords)
    var presensiList = state.presensi || [];
    var presensiRecords = state.presensiRecords || {};

    // Helper untuk mendapatkan nama kelas yang aman
    function resolveClassName(cId) {
        if (!cId) return '-';
        var foundC = classes.find(function(c) { return c.id == cId || c.classId == cId; });
        return foundC ? (foundC.name || foundC.nama || cId) : cId;
    }

    // 1. Kepala Sekolah
    if (lower.includes('kepala sekolah') || lower.includes('kepsek')) {
        var kepsekList = users.filter(function(u) {
            var role = (u.role || '').toLowerCase();
            return role === 'kepsek' || role === 'kepala sekolah' || (u.jabatan && u.jabatan.toLowerCase().includes('kepala sekolah'));
        });

        if (kepsekList.length === 0) return "Belum ada user dengan role Kepala Sekolah tercatat.";
        var listNamaKepsek = kepsekList.map(function(u) {
            return `🔹 <strong>${u.nama || u.username}</strong> (Username: <code>${u.username}</code>)`;
        }).join('<br>');
        return `Berdasarkan data sistem SIMANTAP, Kepala Sekolah:<br>${listNamaKepsek}`;
    }

    // 2. Administrator / Admin
    if (lower.includes('admin') || lower.includes('administrator')) {
        var adminList = users.filter(function(u) {
            return (u.role || '').toLowerCase() === 'admin';
        });
        if (adminList.length === 0) return "Tidak ada user dengan role Administrator.";
        var names = adminList.map(function(u) { return `🔸 <strong>${u.nama || u.username}</strong>`; }).join('<br>');
        return `Pengguna Administrator:<br>${names}`;
    }

    // 3. Guru / Wali Kelas
    if (lower.includes('guru') || lower.includes('wali kelas') || lower.includes('pengajar') || lower.includes('staff')) {
        if (users.length === 0) return "Belum ada data user terdaftar.";
        var userSummary = users.map(function(u) {
            var roleFormatted = (u.role || 'Guru').toUpperCase();
            return `• <strong>${u.nama || u.username}</strong> <span class="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">${roleFormatted}</span>`;
        }).join('<br>');
        return `Daftar seluruh pengguna (${users.length} akun):<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1 text-xs max-h-48 overflow-y-auto">${userSummary}</div>`;
    }

    // 4. Pengecekan Kehadiran / Absensi (Hadir, Sakit, Izin, Alpa)
    if (lower.includes('hadir') || lower.includes('sakit') || lower.includes('izin') || lower.includes('alpa') || lower.includes('alpha') || lower.includes('kehadiran') || lower.includes('absensi')) {
        
        var targetStatus = '';
        if (lower.includes('sakit')) targetStatus = 'sakit';
        else if (lower.includes('izin')) targetStatus = 'izin';
        else if (lower.includes('alpa') || lower.includes('alpha')) targetStatus = 'alpa';
        else if (lower.includes('hadir')) targetStatus = 'hadir';

        var matchedItems = [];

        // Periksa data dari array 'presensi'
        if (Array.isArray(presensiList) && presensiList.length > 0) {
            presensiList.forEach(function(p) {
                var st = (p.status || p.keterangan || '').toLowerCase();
                if (!targetStatus || st.includes(targetStatus)) {
                    matchedItems.push({
                        nama: p.namaSiswa || p.nama || p.studentName || 'Siswa',
                        status: st || 'hadir',
                        tanggal: p.tanggal || p.date || 'Hari ini',
                        kelas: resolveClassName(p.classId || p.kelas)
                    });
                }
            });
        }

        // Periksa data dari objek 'presensiRecords'
        if (presensiRecords && typeof presensiRecords === 'object') {
            for (var key in presensiRecords) {
                var recordVal = presensiRecords[key];
                if (recordVal) {
                    if (typeof recordVal === 'object') {
                        for (var subKey in recordVal) {
                            var item = recordVal[subKey];
                            var st = (item.status || item.keterangan || '').toLowerCase();
                            if (!targetStatus || st.includes(targetStatus)) {
                                var foundS = students.find(function(s) { return s.id == subKey || s.nisn == subKey; });
                                matchedItems.push({
                                    nama: foundS ? (foundS.nama || foundS.name) : (item.nama || subKey),
                                    status: st || 'hadir',
                                    tanggal: key,
                                    kelas: '-'
                                });
                            }
                        }
                    }
                }
            }
        }

        if (matchedItems.length > 0) {
            var listHtml = matchedItems.map(function(m, idx) {
                return `${idx + 1}. <strong>${m.nama}</strong> — Status: <span class="uppercase font-semibold text-indigo-600">${m.status}</span> (${m.tanggal})`;
            }).join('<br>');

            return `Ditemukan <strong>${matchedItems.length} catatan</strong>${targetStatus ? ' dengan status <strong>' + targetStatus.toUpperCase() + '</strong>' : ''}:<br>` +
                   `<div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1 text-xs max-h-48 overflow-y-auto">${listHtml}</div>`;
        }

        return `⚠️ Belum ada data catatan presensi (${targetStatus ? targetStatus.toUpperCase() : 'Hadir/Izin/Sakit/Alpa'}) yang terekam di dalam <code>window.appState.presensi</code> atau <code>presensiRecords</code> saat ini.`;
    }

    // 5. Ketunaan / Disabilitas Siswa
    var ketunaanKeywords = ['autis', 'netra', 'rungu', 'grahita', 'daksa', 'laras'];
    var matchedKetunaan = ketunaanKeywords.find(function(k) { return lower.includes(k); });

    if (matchedKetunaan || lower.includes('ketunaan') || lower.includes('disabilitas')) {
        if (students.length === 0) return "Belum ada data siswa terdaftar.";
        var filteredStudents = students.filter(function(s) {
            var ket = (s.ketunaan || s.jenisKetunaan || s.disabilitas || '').toLowerCase();
            return ket.includes(matchedKetunaan);
        });
        if (filteredStudents.length === 0) return `Tidak ditemukan siswa kategori <strong>${matchedKetunaan.toUpperCase()}</strong>.`;
        var listSiswa = filteredStudents.map(function(s, idx) {
            var cName = resolveClassName(s.classId || s.kelas);
            return `${idx + 1}. <strong>${s.nama || s.name}</strong> — Kelas: ${cName}`;
        }).join('<br>');
        return `Ditemukan <strong>${filteredStudents.length} murid</strong> kategori <strong>${matchedKetunaan.toUpperCase()}</strong>:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 space-y-1 text-xs max-h-48 overflow-y-auto">${listSiswa}</div>`;
    }

    // 6. Pencarian Siswa Umum
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak') || lower.includes('cari')) {
        var keyword = lower.replace(/cari|siswa|murid|nama|tentang/g, '').trim();
        if (keyword && keyword.length > 1) {
            var found = students.filter(function(s) {
                var n = (s.nama || s.name || '').toLowerCase();
                var nisn = (s.nisn || '').toLowerCase();
                return n.includes(keyword) || nisn.includes(keyword);
            });
            if (found.length > 0) {
                var res = found.map(function(s) {
                    var cName = resolveClassName(s.classId || s.kelas);
                    return `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Kelas: ${cName})`;
                }).join('<br>');
                return `Hasil pencarian siswa:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 text-xs space-y-1">${res}</div>`;
            }
        }
        return `Total terdapat <strong>${students.length} murid</strong> terdaftar di dalam ${classes.length} rombongan belajar aktif.`;
    }

    // 7. Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel') || lower.includes('pelajaran')) {
        if (subjects.length === 0) return "Belum ada mata pelajaran terdaftar.";
        var mapelList = subjects.map(function(s, i) {
            var mName = typeof s === 'string' ? s : (s.name || s.nama);
            return `${i + 1}. ${mName}`;
        }).join('<br>');
        return `Daftar Mata Pelajaran Aktif:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 text-xs max-h-40 overflow-y-auto">${mapelList}</div>`;
    }

    // 8. Jurnal KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        if (journals.length === 0) return "Belum ada laporan jurnal KBM.";
        var recent = journals.slice(-5).reverse().map(function(j) {
            return `• <strong>${j.tanggal || 'Hari ini'}</strong> (${j.kelas || '-'} | ${j.mapel || '-'}): ${j.materi || '-'}`;
        }).join('<br>');
        return `Total <strong>${journals.length} laporan jurnal KBM</strong>. 5 Terbaru:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 text-xs space-y-1">${recent}</div>`;
    }

    // 9. Statistik Umum
    if (lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('statistik') || lower.includes('info')) {
        return `📊 <strong>Ringkasan Eksekutif SIMANTAP SLBN 2 Pelaihari:</strong><br>` +
               `<div class="grid grid-cols-2 gap-2 mt-2 text-xs">` +
               `<div class="p-2 bg-indigo-50 rounded-lg border">🏫 <strong>Kelas:</strong> ${classes.length} rombel</div>` +
               `<div class="p-2 bg-purple-50 rounded-lg border">👨‍🎓 <strong>Siswa:</strong> ${students.length} anak</div>` +
               `<div class="p-2 bg-emerald-50 rounded-lg border">👥 <strong>Pengguna:</strong> ${users.length} akun</div>` +
               `<div class="p-2 bg-amber-50 rounded-lg border">📚 <strong>Jurnal KBM:</strong> ${journals.length} laporan</div>` +
               `</div>`;
    }

    // 10. Deep Fallback Universal
    var matchResults = [];
    students.forEach(function(s) {
        if (JSON.stringify(s).toLowerCase().includes(lower)) matchResults.push(`Siswa: ${s.nama || s.name}`);
    });

    if (matchResults.length > 0) {
        return `Hasil penelusuran mendalam:<br><div class="p-2.5 bg-slate-50 rounded-xl border mt-1 text-xs">${matchResults.slice(0, 5).join('<br>')}</div>`;
    }

    // 11. Suggester Default
    return `Saya telah memindai seluruh data SIMANTAP (${students.length} siswa, ${users.length} user, ${presensiList.length} data presensi). Namun saya kurang menangkap maksud dari "<em>${escapeHtml(query)}</em>".<br><br>` +
           `Coba pilih topik cepat di bawah ini:<br>` +
           `<div class="flex flex-wrap gap-1.5 mt-2">` +
           `<button onclick="handleSendAIChat(event, 'Berapa siswa yang izin dan alpa?')" class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 transition">📋 Siswa Izin & Alpa</button>` +
           `<button onclick="handleSendAIChat(event, 'Tampilkan ringkasan statistik sekolah')" class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 transition">📊 Statistik Sekolah</button>` +
           `<button onclick="handleSendAIChat(event, 'Siapa kepala sekolah?')" class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 transition">👤 Kepala Sekolah</button>` +
           `</div>`;
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

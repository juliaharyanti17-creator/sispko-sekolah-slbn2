// ==========================================================================
// AI-ASSISTANT.JS - Smart Data Inspector & AI Agent SIMPATIK
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

    // 2. Indikator pemindaian data
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
            <span>Memindai seluruh isi database aplikasi...</span>
        </div>
    `;
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 3. Proses Analisis Menyeluruh Terhadap window.appState
    setTimeout(function() {
        var indicatorEl = document.getElementById('ai-typing-indicator');
        if (indicatorEl) indicatorEl.remove();

        var replyText = smartInspectAppState(text);

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
 * Mesin Inspeksi Cerdas (Smart Inspector)
 * Membaca window.appState secara utuh tanpa batasan kata kunci kaku
 */
function smartInspectAppState(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];
    var jadwal = state.jadwalMaster || [];
    var ketunaanList = state.ketunaanList || [];

    // Jika menanyakan ringkasan/statistik total
    if (lower.includes('semua') || lower.includes('rekap') || lower.includes('ringkasan') || lower.includes('statistik') || lower.includes('info')) {
        return `Berikut adalah rekam data lengkap yang saya temukan di sistem SIMPATIK saat ini:<br>` +
               `🏫 <strong>Kelas (${classes.length}):</strong> ` + (classes.map(c => c.name || c.nama).join(', ') || 'Belum ada') + `<br>` +
               `👨‍🎓 <strong>Total Siswa:</strong> ${students.length} orang<br>` +
               `📚 <strong>Mata Pelajaran (${subjects.length}):</strong> ` + (subjects.map(s => typeof s === 'string' ? s : (s.name || s.nama)).join(', ') || 'Belum ada') + `<br>` +
               `📝 <strong>Jurnal KBM Masuk:</strong> ${journals.length} laporan<br>` +
               `👥 <strong>Pengguna/Guru (${users.length}):</strong> ` + (users.map(u => u.nama || u.username).join(', ') || 'Belum ada');
    }

    // Jika mencari siswa berdasarkan nama atau kelas
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak') || lower.includes('cari')) {
        if (students.length === 0) return "Belum ada data siswa yang tersimpan di database.";
        
        // Cek apakah ada penyebutan nama atau kelas spesifik
        var matchedStudents = students.filter(function(s) {
            var nama = (s.nama || s.name || '').toLowerCase();
            var nisn = (s.nisn || '').toLowerCase();
            var ketunaan = (s.ketunaan || '').toLowerCase();
            return lower.includes(nama) || (nisn && lower.includes(nisn)) || (ketunaan && lower.includes(ketunaan));
        });

        if (matchedStudents.length > 0) {
            var details = matchedStudents.map(function(s) {
                var cName = typeof getClassName === 'function' ? getClassName(s.classId || s.kelas) : (s.classId || '-');
                return `• <strong>${s.nama || s.name}</strong> (NISN: ${s.nisn || '-'}, Kelas: ${cName}, Ketunaan: ${s.ketunaan || 'Umum'})`;
            }).join('<br>');
            return `Hasil pencarian data siswa:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${details}</div>`;
        }

        // Jika tidak spesifik menyebut nama, berikan ringkasan daftar siswa
        var sampleStudents = students.slice(0, 8).map(s => s.nama || s.name).join(', ');
        return `Terdapat total <strong>${students.length} siswa</strong> terdaftar. Di antaranya: ${sampleStudents}${students.length > 8 ? '...' : ''}. (Anda bisa mengetik "Cari siswa [Nama]" untuk mencari data spesifik).`;
    }

    // Jika menanyakan mata pelajaran
    if (lower.includes('pelajaran') || lower.includes('mapel')) {
        if (subjects.length === 0) return "Belum ada mata pelajaran yang dimasukkan ke dalam Data Master.";
        var listMapel = subjects.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : (s.name || s.nama)}`).join('<br>');
        return `Daftar mata pelajaran aktif di sekolah:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${listMapel}</div>`;
    }

    // Jika menanyakan kelas atau wali kelas
    if (lower.includes('kelas') || lower.includes('wali kelas') || lower.includes('guru') || lower.includes('pengajar')) {
        if (classes.length === 0) return "Belum ada data kelas terdaftar.";
        
        var classInfo = classes.map(function(c) {
            var cId = c.id;
            var cName = c.name || c.nama;
            // Hitung jumlah siswa di kelas ini
            var jmlSiswa = students.filter(s => s.classId === cId || s.kelas === cId || s.kelas === cName).length;
            // Cari guru pengampu
            var pengampu = users.find(u => u.kelasAmpuan === cId || (u.kelasAmpuan && u.kelasAmpuan.toLowerCase().includes(cName.toLowerCase())));
            var namaGuru = pengampu ? (pengampu.nama || pengampu.username) : "Belum diset";
            return `• <strong>${cName}</strong> (${jmlSiswa} Siswa) — Wali Kelas: ${namaGuru}`;
        }).join('<br>');

        return `Rincian data rombongan belajar (kelas):<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${classInfo}</div>`;
    }

    // Jika menanyakan jurnal / kegiatan KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar') || lower.includes('aktivitas')) {
        if (journals.length === 0) return "Belum ada laporan jurnal mengajar yang diinput.";
        var jurnalList = journals.slice(-5).reverse().map(j => `• <strong>${j.tanggal}</strong> [${j.kelas || '-'}] ${j.mapel || '-'}: ${j.materi || '-'}`).join('<br>');
        return `Total ada ${journals.length} jurnal KBM. Berikut catatan terbaru:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${jurnalList}</div>`;
    }

    // Jika menanyakan jadwal
    if (lower.includes('jadwal')) {
        if (jadwal.length === 0) return "Belum ada data master jadwal pelajaran.";
        return `Terdapat ${jadwal.length} entri master jadwal pelajaran harian yang tersimpan di sistem.`;
    }

    // JIKA PERTANYAAN DI LUAR KATEGORI DI ATAS, LAKUKAN PENCARIAN CERDAS MENYELURUH (DEEP SEARCH)
    // AI akan mencari apakah ada teks dalam state yang cocok dengan pertanyaan user
    var foundResults = [];
    
    // Cek di students
    students.forEach(s => {
        if (JSON.stringify(s).toLowerCase().includes(lower)) {
            foundResults.push(`Siswa: ${s.nama || s.name}`);
        }
    });
    // Cek di users
    users.forEach(u => {
        if (JSON.stringify(u).toLowerCase().includes(lower)) {
            foundResults.push(`User/Guru: ${u.nama || u.username}`);
        }
    });

    if (foundResults.length > 0) {
        return `Saya menemukan beberapa data yang cocok dengan pencarian Anda:<br><div class="p-2 bg-slate-50 rounded-xl border mt-1">${foundResults.slice(0, 5).join('<br>')}</div>`;
    }

    // Fallback ramah jika benar-benar tidak ditemukan
    return `Saya sudah memindai seluruh memori aplikasi (${students.length} siswa, ${classes.length} kelas, ${journals.length} jurnal), tetapi belum menemukan informasi spesifik untuk "<em>${escapeHtml(query)}</em>". Coba tanyakan hal seputar data siswa, rekap kelas, mata pelajaran, atau jurnal KBM!`;
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

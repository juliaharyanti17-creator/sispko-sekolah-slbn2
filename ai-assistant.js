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
 * Fungsi Pintar untuk Mengurai Pertanyaan dan Mengambil Data Nyata dari window.appState
 */
function analyzeAppDataWithAI(query) {
    var lower = query.toLowerCase();
    var state = window.appState || {};

    var students = state.students || [];
    var classes = state.classes || [];
    var users = state.users || [];
    var subjects = state.subjects || [];
    var journals = state.journals || [];

    // 1. Pertanyaan seputar Mata Pelajaran
    if (lower.includes('mata pelajaran') || lower.includes('mapel') || lower.includes('pelajaran apa')) {
        if (subjects.length === 0) {
            return "Belum ada data mata pelajaran yang terdaftar di menu Data Master.";
        }
        var listMapel = subjects.map(function(s, i) {
            var namaMapel = typeof s === 'string' ? s : (s.name || s.nama);
            return `${i + 1}. ${namaMapel}`;
        }).join('<br>');
        
        return `Berikut adalah daftar mata pelajaran yang aktif di SLBN 2 Pelaihari:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${listMapel}</div>`;
    }

    // 2. Pertanyaan seputar Wali Kelas / Guru Kelas
    if (lower.includes('wali kelas') || lower.includes('guru') || lower.includes('siapa yang mengajar')) {
        // Cek apakah user menyebutkan kelas tertentu (misal: "kelas 1", "kelas 2")
        var matchedClass = classes.find(function(c) {
            var cName = (c.name || c.nama || '').toLowerCase();
            return lower.includes(cName) || (lower.includes('1') && cName.includes('1')) || (lower.includes('2') && cName.includes('2'));
        });

        if (matchedClass) {
            var className = matchedClass.name || matchedClass.nama;
            var classId = matchedClass.id;
            // Cari guru yang mengampu kelas tersebut
            var waliKelas = users.find(function(u) {
                return u.kelasAmpuan === classId || (u.kelasAmpuan && u.kelasAmpuan.toLowerCase().includes(className.toLowerCase()));
            });

            var namaGuru = waliKelas ? (waliKelas.nama || waliKelas.username) : "Belum ditentukan / Administrator";
            return `Untuk <strong>${className}</strong>, wali kelas / guru pengampunya adalah: <strong>${namaGuru}</strong>.`;
        }

        // Jika tidak spesifik menyebut kelas, tampilkan semua daftar guru/wali kelas
        if (users.length === 0) return "Belum ada data pengguna/guru terdaftar.";
        var listGuru = users.map(function(u) {
            return `• <strong>${u.nama || u.username}</strong> (Role: ${(u.role || 'Guru').toUpperCase()})`;
        }).join('<br>');

        return `Berikut adalah daftar guru dan pengurus yang terdaftar di sistem:<br><div class="mt-2 p-2 bg-slate-50 rounded-xl border">${listGuru}</div>`;
    }

    // 3. Pertanyaan seputar Siswa / Murid
    if (lower.includes('siswa') || lower.includes('murid') || lower.includes('anak')) {
        if (students.length === 0) return "Belum ada data murid yang tercatat di database saat ini.";
        return `Total terdapat <strong>${students.length} murid</strong> terdaftar di SLBN 2 Pelaihari dari ${classes.length} rombongan belajar.`;
    }

    // 4. Pertanyaan seputar Jurnal / KBM
    if (lower.includes('jurnal') || lower.includes('kbm') || lower.includes('mengajar')) {
        return `Tercatat ada <strong>${journals.length} laporan jurnal KBM</strong> guru yang masuk ke dalam sistem pengawasan.`;
    }

    // 5. Sapaan Umum
    if (lower.includes('halo') || lower.includes('hai')) {
        return `Halo! Saya AI Assistant SIMPATIK. Saya dapat membantu Anda mengecek daftar mata pelajaran, wali kelas, rekap murid, hingga jurnal KBM. Silakan ajukan pertanyaan Anda!`;
    }

    // Fallback Default
    return `Saya memahami pertanyaan Anda mengenai "${escapeHtml(query)}". Anda bisa menanyakan hal seperti *"Mata pelajaran apa saja yang ada?"* atau *"Siapa wali kelas 1?"* untuk melihat rincian datanya.`;
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

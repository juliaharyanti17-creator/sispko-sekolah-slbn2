// ==========================================================================
// Engine Assistant AI Chatbot SIMPATIK SLBN 2 PELAIHARI
// Version: Real-Time Synchronized Backend Handler (Istilah Murid)
// ==========================================================================

var VERCEL_BACKEND_URL = "https://simpatik-slbn2.vercel.app/api/chat";

window.toggleAIChatModal = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var modal = document.getElementById('ai-chat-modal');
    if (!modal) {
        alert("Error: Elemen modal 'ai-chat-modal' tidak ditemukan!");
        return;
    }

    var isHidden = modal.classList.contains('hidden') || modal.style.display === 'none' || getComputedStyle(modal).display === 'none';

    if (isHidden) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.style.setProperty('display', 'flex', 'important');
        
        renderQuickChips();

        var input = document.getElementById('ai-input-prompt');
        if (input) {
            setTimeout(function() { input.focus(); }, 150);
        }
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.style.setProperty('display', 'none', 'important');
    }
};

function renderQuickChips() {
    var chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer || document.getElementById('ai-quick-chips-container')) return;

    var chipsDiv = document.createElement('div');
    chipsDiv.id = 'ai-quick-chips-container';
    chipsDiv.className = 'my-3 p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-2 shadow-sm';
    chipsDiv.innerHTML = `
        <div class="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <i class="fa-solid fa-lightbulb text-amber-500"></i> Pertanyaan Cepat:
        </div>
        <div class="flex flex-wrap gap-1.5 text-xs">
            <button type="button" onclick="window.sendQuickPrompt(event, 'Tes koneksi AI singkat')" class="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg transition text-[11px] cursor-pointer shadow-sm">
                ⚡ Tes Koneksi Cepat
            </button>
            <button type="button" onclick="window.sendQuickPrompt(event, 'Siapa saja murid yang alpa atau sakit minggu ini?')" class="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 font-semibold rounded-lg border border-indigo-200 transition text-[11px] cursor-pointer shadow-sm">
                💡 Rekap murid alpa/sakit
            </button>
            <button type="button" onclick="window.sendQuickPrompt(event, 'Buatkan laporan resmi presensi minggu ini siap cetak')" class="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 font-semibold rounded-lg border border-indigo-200 transition text-[11px] cursor-pointer shadow-sm">
                🖨️ Cetak Laporan Resmi
            </button>
        </div>
    `;
    chatContainer.appendChild(chipsDiv);
}

window.sendQuickPrompt = function(e, promptText) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    var inputEl = document.getElementById('ai-input-prompt');
    if (inputEl) {
        inputEl.value = promptText;
        window.handleSendAIPrompt(e);
    }
};

function getOptimizedPresensiSummary() {
    if (typeof appState === 'undefined' || !appState.presensiRecords) return [];
    
    var summary = [];
    var activeStudentMap = {};
    
    (appState.students || []).forEach(function(s) {
        if (s && s.id) {
            activeStudentMap[s.id] = { nama: s.nama || s.name || 'Murid', classId: s.classId };
        }
    });

    var count = 0;
    var keys = Object.keys(appState.presensiRecords).reverse();
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var parts = key.split('_');
        var tgl = parts[0];
        var cId = parts[1];
        var recMap = appState.presensiRecords[key] || {};

        for (var sId in recMap) {
            var st = recMap[sId];
            if (st !== 'H' && st !== 'Hadir' && activeStudentMap[sId]) {
                summary.push({
                    tgl: tgl,
                    kelas: typeof getClassName === 'function' ? getClassName(cId) : cId,
                    murid: activeStudentMap[sId].nama,
                    status: st === 'S' ? 'Sakit' : (st === 'I' ? 'Izin' : 'Alpa')
                });
                count++;
                if (count >= 5) break;
            }
        }
        if (count >= 5) break;
    }

    return summary;
}

window.handleSendAIPrompt = async function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var inputEl = document.getElementById('ai-input-prompt');
    if (!inputEl) return;

    var userPrompt = inputEl.value.trim();
    if (!userPrompt) return;

    appendChatMessage('user', userPrompt);
    inputEl.value = '';

    var loadingId = appendChatMessage('ai', '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menjawab...');

    try {
        var isDataRequired = /murid|siswa|absen|presensi|alpa|sakit|izin|laporan|rekapan|cetak|jumlah|total|guru|kelas|rombel|rombongan/i.test(userPrompt);
        var promptText = "";

        if (isDataRequired) {
            var validStudents = (typeof appState !== 'undefined' && Array.isArray(appState.students)) 
                ? appState.students.filter(function(s) { return s && (s.nama || s.name); }) 
                : [];
                
            var validUsers = (typeof appState !== 'undefined' && Array.isArray(appState.users)) 
                ? appState.users.filter(function(u) { return u && (u.nama || u.username); }) 
                : [];

            var validClasses = (typeof appState !== 'undefined' && Array.isArray(appState.classes)) 
                ? appState.classes.filter(function(c) { return c && (c.name || c.nama); }) 
                : [];

            var contextData = {
                jumlah_murid_terdaftar: validStudents.length,
                jumlah_guru_terdaftar: validUsers.length,
                jumlah_kelas_rombel: validClasses.length,
                daftar_nama_murid: validStudents.map(function(s) { return s.nama || s.name; }),
                daftar_nama_guru: validUsers.map(function(u) { return u.nama || u.username; }),
                daftar_nama_kelas: validClasses.map(function(c) { return c.name || c.nama; }),
                absensi_terbaru: typeof getOptimizedPresensiSummary === 'function' ? getOptimizedPresensiSummary() : []
            };

            promptText = "ATURAN MUTLAK SIMPATIK AI (SLBN 2 Pelaihari):\n" +
                "1. ABAIKAN semua ingatan, cache, atau riwayat angka masa lalu (seperti 12 rombel, 108/118/84 murid/siswa).\n" +
                "2. Gunakan HANYA Data Realtime berikut ini untuk menjawab pertanyaannya:\n\n" +
                "DATA REALTIME SAAT INI:\n" + JSON.stringify(contextData) + "\n\n" +
                "PENTING:\n" +
                "- Jika jumlah_kelas_rombel bernilai 0, Anda WAJIB menjawab bahwa saat ini BELUM ADA kelas/rombongan belajar yang terdaftar di database.\n" +
                "- Jika jumlah_murid_terdaftar bernilai 0, Anda WAJIB menjawab bahwa saat ini BELUM ADA data murid yang terdaftar di database.\n\n" +
                "Pertanyaan Pengguna: " + userPrompt;
        } else {
            promptText = "Anda SIMPATIK AI (SLBN 2 Pelaihari). Jawab ramah dan sangat singkat (1-2 kalimat).\nTanya: " + userPrompt;
        }

        var response = await fetch(VERCEL_BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ promptText: promptText })
        });

        var data = await response.json();

        if (!response.ok || data.error) {
            updateChatMessage(loadingId, "Gagal terhubung ke Server AI: " + (data.error || "HTTP " + response.status));
            return;
        }

        var isPrintRequest = /cetak|laporan|rekap resmi|dokumen/i.test(userPrompt);
        updateChatMessage(loadingId, formatAIResponseText(data.responseText, isPrintRequest));

    } catch (err) {
        console.error("AI Assistant Exception:", err);
        updateChatMessage(loadingId, "Kesalahan koneksi: " + err.message);
    }
};

function appendChatMessage(sender, text) {
    var chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    var msgId = "msg_" + Date.now();
    var msgDiv = document.createElement('div');
    msgDiv.id = msgId;

    if (sender === 'user') {
        msgDiv.className = "flex justify-end my-2";
        msgDiv.innerHTML = 
            '<div class="bg-indigo-600 text-white text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">' +
                '<div class="font-bold mb-0.5 text-[10px] text-indigo-200">Anda</div>' + text +
            '</div>';
    } else {
        msgDiv.className = "flex justify-start my-2";
        msgDiv.innerHTML = 
            '<div class="bg-slate-100 text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-none max-w-[90%] border border-slate-200 shadow-sm space-y-2">' +
                '<div class="font-bold mb-1 text-[10px] text-indigo-600 flex items-center gap-1.5"><i class="fa-solid fa-robot"></i> SIMPATIK AI</div>' +
                '<div class="ai-content-body">' + text + '</div>' +
            '</div>';
    }

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgId;
}

function updateChatMessage(msgId, htmlContent) {
    var msgEl = document.getElementById(msgId);
    if (!msgEl) return;
    var body = msgEl.querySelector('.ai-content-body');
    if (body) {
        body.innerHTML = htmlContent;
    } else {
        msgEl.innerHTML = htmlContent;
    }
    var chatContainer = document.getElementById('ai-chat-messages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatAIResponseText(rawText, isPrintRequest) {
    var output = rawText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/\n/g, '<br>');

    if (isPrintRequest) {
        var docId = "doc_" + Date.now();
        window[docId] = rawText;

        output += 
            '<div class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">' +
                '<div class="font-bold text-emerald-900 text-xs flex items-center gap-1.5">' +
                    '<i class="fa-solid fa-file-contract text-emerald-600"></i> Laporan Siap Cetak Dihasilkan!' +
                '</div>' +
                '<button type="button" onclick="window.generateAndPrintReport(\'' + docId + '\')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer">' +
                    '<i class="fa-solid fa-print"></i> Pratinjau & Cetak Dokumen Formal' +
                '</button>' +
            '</div>';
    }

    return output;
}

window.generateAndPrintReport = function(docId) {
    var aiAnalysisText = window[docId] || "Laporan Presensi dan Evaluasi Kehadiran Murid SLBN 2 Pelaihari.";
    var todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    var htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
            <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="margin:0; font-size: 16px; text-transform: uppercase;">PEMERINTAH PROVINSI KALIMANTAN SELATAN</h3>
                <h2 style="margin:5px 0; font-size: 18px; font-weight: bold;">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
                <h1 style="margin:0; font-size: 20px; font-weight: bold;">SLB NEGERI 2 PELAIHARI</h1>
                <p style="margin:5px 0 0 0; font-size: 12px; font-style: italic;">Jl. A. Yani, Kec. Pelaihari, Kabupaten Tanah Laut, Kalimantan Selatan</p>
            </div>

            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">LAPORAN HASIL ANALISIS PRESENSI & EVALUASI</h3>

            <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
                <strong>Hasil Analisis Sistem SIMPATIK:</strong><br>
                ${aiAnalysisText.replace(/\n/g, '<br>')}
            </div>

            <div style="margin-top: 50px; float: right; text-align: left; width: 250px; font-size: 13px;">
                <p style="margin:0;">Pelaihari, ${todayStr}</p>
                <p style="margin:5px 0 60px 0;">Kepala Sekolah SLBN 2 Pelaihari,</p>
                <p style="margin:0; font-weight: bold; text-decoration: underline;">MAISYANTI DISI FATIMAH, S.Pd.I., M.Pd</p>
                <p style="margin:0;">NIP. 198305142006042018</p>
            </div>
        </div>
    `;

    var printWindow = window.open('', '_blank');
    printWindow.document.write(
        '<!DOCTYPE html><html><head><title>Cetak Laporan - SIMPATIK SLBN 2 PELAIHARI</title>' +
        '<script src="https://cdn.tailwindcss.com"></script>' +
        '<style>@media print { body { padding: 0; } .no-print { display: none; } }</style>' +
        '</head><body class="p-8 bg-white text-black">' +
        '<div class="no-print mb-4 flex justify-end"><button onclick="window.print()" class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer">Cetak / Simpan PDF</button></div>' +
        htmlContent +
        '</body></html>'
    );
    printWindow.document.close();
};
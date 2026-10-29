// Engine Assistant AI Chatbot & Generator Laporan SIMPATIK SLBN 2 PELAIHARI

// Inisialisasi Pesan Obrolan
var aiChatHistory = [];

function toggleAIChatModal(e) {
    if (e) e.preventDefault();
    var user = appState.currentUser;
    
    // Keamanan: Restriksi hanya untuk Admin dan Kepala Sekolah
    if (!user || (user.role !== 'admin' && user.role !== 'kepsek')) {
        alert("Akses Terbatas: Fitur AI Assistant hanya dapat diakses oleh Admin dan Kepala Sekolah.");
        return;
    }

    var modal = document.getElementById('ai-chat-modal');
    if (modal) {
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            var input = document.getElementById('ai-input-prompt');
            if (input) input.focus();
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
}

async function handleSendAIPrompt(e) {
    if (e) e.preventDefault();
    var inputEl = document.getElementById('ai-input-prompt');
    if (!inputEl) return;

    var userPrompt = inputEl.value.trim();
    if (!userPrompt) return;

    // Tampilkan pesan pengguna di UI Chatbot
    appendChatMessage('user', userPrompt);
    inputEl.value = '';

    // Indikator Loading AI
    var loadingId = appendChatMessage('ai', '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Memproses data presensi & menyusun analisis...');

    try {
        // Susun konteks data sekolah lokal secara terstruktur untuk dikirim ke Gemini API
        var contextData = {
            classes: appState.classes || [],
            students: appState.students || [],
            presensiRecords: appState.presensiRecords || {},
            journals: appState.journals || []
        };

        var systemInstruction = 
            "Anda adalah Asisten AI Resmi SIMPATIK SLBN 2 PELAIHARI untuk Kepala Sekolah dan Admin.\n" +
            "Tugas Anda: Menganalisis data presensi dan jurnal kegiatan guru berdasarkan JSON yang diberikan.\n" +
            "Aturan Output:\n" +
            "1. Jika pengguna meminta laporan/rangkuman resmi (misal: rangkum absen/alpa/rekap), berikan jawaban ringkas di awal, LALU sertakan blok kode HTML lengkap yang dibungkus dengan tag ```html ``` untuk dicetak.\n" +
            "2. Template HTML harus memiliki KOP SURAT FORMAL SLBN 2 PELAIHARI, TABEL DATA RAPI, serta BLOK TANDA TANGAN KEPALA SEKOLAH di sebelah kanan bawah dengan format:\n" +
            "   Pelaihari, [Tanggal Cetak]\n" +
            "   Kepala Sekolah SLBN 2 Pelaihari,\n\n\n\n" +
            "   MAISYANTI DISI FATIMAH, S.Pd.I., M.Pd\n" +
            "   NIP. 198305142006042018\n" +
            "3. Tanggapi dengan sopan, presisi, dan menggunakan bahasa Indonesia formal.";

        var requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstruction },
                        { text: "Data Sistem SIMPATIK (JSON):\n" + JSON.stringify(contextData) },
                        { text: "Pertanyaan/Perintah Kepala Sekolah: " + userPrompt }
                    ]
                }
            ]
        };

        var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + CONFIG.GEMINI_MODEL + ":generateContent?key=" + CONFIG.GEMINI_API_KEY;

        var response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        var data = await response.json();

        if (data.error) {
            updateChatMessage(loadingId, "Gagal memproses permintaan: " + data.error.message);
            return;
        }

        var aiResponseText = data.candidates[0].content.parts[0].text;
        
        // Hapus indikator loading dan tampilkan jawaban AI
        updateChatMessage(loadingId, formatAIResponseText(aiResponseText));

    } catch (err) {
        console.error("AI Assistant Error:", err);
        updateChatMessage(loadingId, "Terjadi kesalahan koneksi saat menghubungkan ke Gemini API. Pastikan tablet terhubung ke internet.");
    }
}

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
                '<div class="font-bold mb-1 text-[10px] text-indigo-600 flex items-center gap-1.5"><i class="fa-solid fa-robot"></i> AI Assistant SIMPATIK</div>' +
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

function formatAIResponseText(rawText) {
    // Deteksi jika AI menghasilkan kode HTML dokumen cetak
    var htmlMatch = rawText.match(/```html([\s\S]*?)```/);
    var output = rawText.replace(/```html[\s\S]*?```/g, ''); // Ambil penjelasan teksnya saja
    
    // Format teks penjelasan biasa (bold & new line)
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/\n/g, '<br>');

    if (htmlMatch && htmlMatch[1]) {
        var rawHtmlDocument = htmlMatch[1].trim();
        var docId = "doc_" + Date.now();
        window[docId] = rawHtmlDocument;

        output += 
            '<div class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">' +
                '<div class="font-bold text-emerald-900 text-xs flex items-center gap-1.5">' +
                    '<i class="fa-solid fa-file-contract text-emerald-600"></i> Laporan Siap Cetak Dihasilkan!' +
                '</div>' +
                '<button type="button" onclick="printAIDocument(\'' + docId + '\')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer">' +
                    '<i class="fa-solid fa-print"></i> Pratinjau & Cetak Dokumen' +
                '</button>' +
            '</div>';
    }

    return output;
}

function printAIDocument(docId) {
    var htmlContent = window[docId];
    if (!htmlContent) {
        alert("Dokumen tidak ditemukan!");
        return;
    }

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
}

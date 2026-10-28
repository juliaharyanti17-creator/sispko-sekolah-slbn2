// Modul Jurnal Pembelajaran & Feedback Kepsek

function populateJurnalDropdowns() {
    var user = appState.currentUser;
    if (!user) return;

    var selectKelas = document.getElementById('jurnal-kelas-select');
    var selectMapel = document.getElementById('jurnal-mapel-select');

    if (!selectKelas || !selectMapel) return;

    selectKelas.innerHTML = '';
    selectMapel.innerHTML = '';

    // 1. FILTER KELAS UTK JURNAL
    var availableClasses = [];
    if (user.role === 'walikelas') {
        // Wali Kelas hanya bisa memilih kelas ampuannya
        availableClasses = (appState.classes || []).filter(function(c) {
            return (user.classIds || []).includes(c.id);
        });
    } else {
        // Guru Mapel / Admin bisa memilih semua kelas
        availableClasses = appState.classes || [];
    }

    if (availableClasses.length === 0) {
        selectKelas.innerHTML = '<option value="">- Tidak ada kelas ampu -</option>';
    } else {
        availableClasses.forEach(function(c) {
            selectKelas.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }

    // 2. FILTER MAPEL UTK JURNAL
    var availableMapels = [];
    if (user.role === 'gurumapel') {
        // Guru Mapel HANYA bisa memilih mapel ampuannya
        availableMapels = user.assignedMapels || [];
    } else {
        // Wali Kelas / Admin bisa memilih semua mapel umum
        availableMapels = appState.mapels || [];
    }

    if (availableMapels.length === 0) {
        selectMapel.innerHTML = '<option value="">- Tidak ada mapel ampu -</option>';
    } else {
        availableMapels.forEach(function(m) {
            selectMapel.innerHTML += '<option value="' + m + '">' + m + '</option>';
        });
    }
}

function renderJurnalList() {
    populateJurnalDropdowns();
    var container = document.getElementById('jurnal-list-container');
    if (!container) return;
    container.innerHTML = '';

    var user = appState.currentUser;
    var journals = appState.journals || [];

    // Filter jurnal berdasarkan role
    var filtered = journals;
    if (user && (user.role === 'walikelas' || user.role === 'gurumapel')) {
        filtered = journals.filter(function(j) {
            return j.guru === user.nama;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">Belum ada jurnal kegiatan tersimpan.</div>';
        return;
    }

    filtered.forEach(function(j) {
        var card = document.createElement('div');
        card.className = "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative";

        var feedbackHtml = '';
        if (j.feedback) {
            feedbackHtml = 
                '<div class="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-1">' +
                    '<div class="font-bold text-indigo-900 flex items-center gap-1.5"><i class="fa-solid fa-comment-dots text-indigo-600"></i> Catatan Evaluasi Kepala Sekolah:</div>' +
                    '<div class="text-indigo-800 italic">"' + j.feedback + '"</div>' +
                '</div>';
        }

        card.innerHTML = 
            '<div class="flex items-center justify-between border-b border-slate-100 pb-2">' +
                '<span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"><i class="fa-solid fa-calendar-day mr-1"></i>' + j.tanggal + '</span>' +
                '<span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-door-open mr-1"></i>' + getClassName(j.classId) + '</span>' +
            '</div>' +
            '<div class="text-xs font-semibold text-slate-800">Mapel: <span class="text-slate-600">' + j.mapel + '</span></div>' +
            '<div class="text-xs text-slate-600 line-clamp-3"><strong>Materi/Kegiatan:</strong> ' + j.materi + '</div>' +
            '<div class="text-[11px] text-slate-400 pt-1 flex items-center justify-between">' +
                '<span><i class="fa-solid fa-user-pen mr-1"></i>' + j.guru + '</span>' +
                (user && user.role === 'admin' ? '<button type="button" onclick="handleDeleteJurnal(\'' + j.id + '\')" class="text-rose-500 hover:text-rose-700 cursor-pointer"><i class="fa-solid fa-trash"></i> Hapus</button>' : '') +
            '</div>' +
            feedbackHtml;

        container.appendChild(card);
    });
}

function handleSaveJurnal(e) {
    if (e) e.preventDefault();
    var tgl = document.getElementById('jurnal-tanggal').value;
    var classId = document.getElementById('jurnal-kelas-select').value;
    var mapel = document.getElementById('jurnal-mapel-select').value;
    var guru = document.getElementById('jurnal-guru').value.trim();
    var materi = document.getElementById('jurnal-materi').value.trim();

    if (!classId || !mapel || !materi) {
        alert("Mohon lengkapi Kelas, Mata Pelajaran, dan Materi/Kegiatan!");
        return;
    }

    var newJurnal = {
        id: "j_" + Date.now(),
        tanggal: tgl,
        classId: classId,
        mapel: mapel,
        guru: guru || (appState.currentUser ? appState.currentUser.nama : 'Guru'),
        materi: materi,
        feedback: ""
    };

    if (!appState.journals) appState.journals = [];
    appState.journals.unshift(newJurnal);

    saveAppState();
    document.getElementById('jurnal-materi').value = '';
    renderJurnalList();
    showToast("Jurnal kegiatan pembelajaran berhasil disimpan!");
}

function handleDeleteJurnal(jurnalId) {
    if (!confirm("Hapus jurnal kegiatan ini?")) return;
    appState.journals = (appState.journals || []).filter(function(j) { return j.id !== jurnalId; });
    saveAppState();
    renderJurnalList();
    showToast("Jurnal berhasil dihapus.");
}

function renderGuruFeedbackSection() {
    // Dipanggil saat refresh UI untuk menampilkan umpan balik terbaru dari Kepsek
}

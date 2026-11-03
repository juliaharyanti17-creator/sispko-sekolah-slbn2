// ==========================================================================
// Modul Jurnal Mengajar & Supervisi Guru SLBN 2 PELAIHARI
// ==========================================================================

function renderJurnalList() {
    var tbody = document.getElementById('jurnal-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var journals = appState.journals || [];
    if (journals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400 font-medium">Belum ada riwayat jurnal mengajar.</td></tr>';
        return;
    }

    var currentUser = appState.currentUser || { role: 'admin', nama: '' };
    var currentRole = (currentUser.role || 'admin').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();

    // FILTER HAK AKSES: Guru hanya melihat jurnal buatannya sendiri, Kepsek/Admin melihat semuanya
    var filteredJournals = journals.filter(function(j) {
        if (!j) return false;
        if (currentRole === 'admin' || currentRole === 'kepsek') return true;
        var namaGuruJurnal = (j.guru || '').toLowerCase();
        return namaGuruJurnal.includes(currentNama) || currentNama.includes(namaGuruJurnal);
    });

    if (filteredJournals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400 font-medium">Anda belum memiliki riwayat jurnal mengajar.</td></tr>';
        return;
    }

    var sortedJournals = filteredJournals.slice().reverse();

    sortedJournals.forEach(function(j, idx) {
        var realIndex = journals.indexOf(j);
        
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100 text-xs";

        var tglFormatted = j.tanggal || '-';
        if (j.tanggal) {
            var p = j.tanggal.split('-');
            if (p.length === 3) tglFormatted = p[2] + '/' + p[1] + '/' + p[0];
        }

        var btnPdf = j.lampiranFile 
            ? '<a href="' + j.lampiranFile + '" target="_blank" class="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-[10px] hover:bg-rose-100 transition" title="Buka PDF"><i class="fa-solid fa-file-pdf"></i> PDF</a>' 
            : '<span class="text-slate-300">-</span>';

        var btnVideo = j.linkVideo 
            ? '<a href="' + j.linkVideo + '" target="_blank" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[10px] hover:bg-emerald-100 transition" title="Buka Video Drive"><i class="fa-brands fa-google-drive"></i> Video</a>' 
            : '<span class="text-slate-300">-</span>';

        var statusSupervisi = j.supervisi 
            ? '<button type="button" onclick="showHasilSupervisi(' + realIndex + ')" class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] cursor-pointer" title="Lihat Catatan Kepsek"><i class="fa-solid fa-circle-check"></i> Sudah Disupervisi</button>' 
            : '<span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[10px]">Belum Disupervisi</span>';

        var actionButtons = '';
        if (currentRole === 'kepsek' || currentRole === 'admin') {
            actionButtons += '<button type="button" onclick="openModalSupervisi(' + realIndex + ')" class="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition cursor-pointer" title="Beri Supervisi"><i class="fa-solid fa-clipboard-check"></i> Supervisi</button> ';
        }

        if (currentRole === 'admin') {
            actionButtons += '<button type="button" onclick="handleDeleteJurnal(' + realIndex + ')" class="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer" title="Hapus Jurnal"><i class="fa-solid fa-trash"></i></button>';
        }

        if (!actionButtons) actionButtons = '<span class="text-slate-400 font-medium text-[10px]">Akses Terbatas</span>';

        tr.innerHTML = 
            '<td class="p-3 text-center text-slate-500 font-bold">' + (filteredJournals.length - idx) + '</td>' +
            '<td class="p-3 font-semibold text-slate-700 whitespace-nowrap">' + tglFormatted + '</td>' +
            '<td class="p-3 font-bold text-slate-800 whitespace-nowrap">' + (j.guru || '-') + '</td>' +
            '<td class="p-3 text-slate-600 font-medium whitespace-nowrap">' + (typeof getClassName === 'function' ? getClassName(j.classId) : j.classId) + '</td>' +
            '<td class="p-3 text-indigo-700 font-semibold whitespace-nowrap">' + (j.mapel || '-') + '</td>' +
            '<td class="p-3 text-slate-700 min-w-[180px] max-w-[260px] break-words">' + (j.materi || '-') + '</td>' +
            '<td class="p-3 text-center space-x-1 whitespace-nowrap">' + btnPdf + ' ' + btnVideo + '</td>' +
            '<td class="p-3 text-center whitespace-nowrap">' + statusSupervisi + '</td>' +
            '<td class="p-3 text-center space-x-1 whitespace-nowrap">' + actionButtons + '</td>';
        tbody.appendChild(tr);
    });
}

async function handleSaveJurnal(e) {
    if (e) e.preventDefault();

    var tglInput = document.getElementById('jurnal-tanggal');
    var guruInput = document.getElementById('jurnal-guru');
    var kelasInput = document.getElementById('jurnal-kelas-select');
    var mapelInput = document.getElementById('jurnal-mapel-select');
    var materiInput = document.getElementById('jurnal-materi');
    var filePdfInput = document.getElementById('jurnal-file-pdf');
    var linkVideoInput = document.getElementById('jurnal-link-video');

    var tgl = tglInput ? tglInput.value : '';
    var guru = guruInput ? guruInput.value.trim() : '';
    var classId = kelasInput ? kelasInput.value : '';
    var mapel = mapelInput ? mapelInput.value : '';
    var materi = materiInput ? materiInput.value.trim() : '';
    var linkVideo = linkVideoInput ? linkVideoInput.value.trim() : '';

    if (!tgl || !materi) {
        alert("Tanggal dan Aktivitas Pembelajaran wajib diisi!");
        return;
    }

    if (!guru && appState.currentUser) {
        guru = appState.currentUser.nama || appState.currentUser.username;
    }

    var lampiranUrl = '';
    var namaFile = '';
    if (filePdfInput && filePdfInput.files && filePdfInput.files[0]) {
        var file = filePdfInput.files[0];
        namaFile = file.name;
        lampiranUrl = await new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onload = function(evt) { resolve(evt.target.result); };
            reader.readAsDataURL(file);
        });
    }

    var newJurnal = {
        id: "j_" + Date.now(),
        tanggal: tgl,
        guru: guru || "Guru SLBN 2 Pelaihari",
        classId: classId,
        mapel: mapel,
        materi: materi,
        lampiranFile: lampiranUrl,
        namaFile: namaFile,
        linkVideo: linkVideo,
        supervisi: null,
        createdAt: new Date().toISOString()
    };

    if (!appState.journals) appState.journals = [];
    appState.journals.push(newJurnal);

    if (typeof saveAppState === 'function') saveAppState();
    if (typeof saveJournalsData === 'function') saveJournalsData();

    if (materiInput) materiInput.value = '';
    if (filePdfInput) filePdfInput.value = '';
    if (linkVideoInput) linkVideoInput.value = '';

    renderJurnalList();
    if (typeof renderEvaluasiSupervisiDashboard === 'function') renderEvaluasiSupervisiDashboard();
    if (typeof showToast === 'function') showToast("Jurnal mengajar berhasil disimpan!");
}

function handleDeleteJurnal(index) {
    if (typeof index !== 'number' || index < 0 || !appState.journals || !appState.journals[index]) return;

    var currentRole = appState.currentUser ? (appState.currentUser.role || '').toLowerCase() : '';
    if (currentRole !== 'admin') {
        alert("Akses Ditolak: Hanya Administrator yang berhak menghapus jurnal.");
        return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus catatan jurnal ini?")) return;

    appState.journals.splice(index, 1);
    if (typeof saveAppState === 'function') saveAppState();
    if (typeof saveJournalsData === 'function') saveJournalsData();
    
    renderJurnalList();
    if (typeof renderEvaluasiSupervisiDashboard === 'function') renderEvaluasiSupervisiDashboard();
    if (typeof showToast === 'function') showToast("Jurnal berhasil dihapus.");
}

function openModalSupervisi(index) {
    var j = appState.journals[index];
    if (!j) return;

    document.getElementById('supervisi-jurnal-id').value = index;
    
    var infoBox = document.getElementById('supervisi-target-info');
    infoBox.innerHTML = 
        '<div><strong>Guru:</strong> ' + (j.guru || '-') + '</div>' +
        '<div><strong>Kelas / Mapel:</strong> ' + (typeof getClassName === 'function' ? getClassName(j.classId) : j.classId) + ' | ' + (j.mapel || '-') + '</div>' +
        '<div><strong>Materi:</strong> ' + (j.materi || '-') + '</div>';

    if (j.supervisi) {
        document.getElementById('supervisi-aspek-media').value = j.supervisi.penilaianMedia || 'Sangat Baik';
        document.getElementById('supervisi-catatan-kepsek').value = j.supervisi.catatanKepsek || '';
    } else {
        document.getElementById('supervisi-aspek-media').value = 'Sangat Baik';
        document.getElementById('supervisi-catatan-kepsek').value = '';
    }

    var modal = document.getElementById('modal-supervisi');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModalSupervisi() {
    var modal = document.getElementById('modal-supervisi');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleSaveSupervisi(e) {
    if (e) e.preventDefault();

    var index = parseInt(document.getElementById('supervisi-jurnal-id').value);
    var penilaianMedia = document.getElementById('supervisi-aspek-media').value;
    var catatanKepsek = document.getElementById('supervisi-catatan-kepsek').value.trim();

    if (!appState.journals[index]) return;

    appState.journals[index].supervisi = {
        tanggalSupervisi: new Date().toISOString().split('T')[0],
        evaluator: "Maisyanti Disi Fatimah, S.Pd.I., M.Pd",
        penilaianMedia: penilaianMedia,
        catatanKepsek: catatanKepsek
    };

    if (typeof saveAppState === 'function') saveAppState();
    if (typeof saveJournalsData === 'function') saveJournalsData();
    closeModalSupervisi();
    
    renderJurnalList();
    if (typeof renderEvaluasiSupervisiDashboard === 'function') renderEvaluasiSupervisiDashboard();
    if (typeof showToast === 'function') showToast("Supervisi Kepala Sekolah berhasil disimpan!");
}

function showHasilSupervisi(index) {
    var j = appState.journals[index];
    if (!j || !j.supervisi) return;

    var sup = j.supervisi;
    alert(
        "--- HASIL SUPERVISI AKADEMIK ---\n" +
        "Evaluator: " + sup.evaluator + "\n" +
        "Tanggal: " + sup.tanggalSupervisi + "\n" +
        "Penilaian Media: " + sup.penilaianMedia + "\n\n" +
        "Catatan Pembinaan Ibu Kepsek:\n\"" + sup.catatanKepsek + "\""
    );
}

document.addEventListener('DOMContentLoaded', function() {
    var formJurnal = document.getElementById('form-jurnal-mengajar');
    if (formJurnal) {
        formJurnal.addEventListener('submit', handleSaveJurnal);
    }
    renderJurnalList();
});

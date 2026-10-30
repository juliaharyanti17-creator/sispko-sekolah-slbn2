// Logika Modul Jurnal KBM Guru
function handleSaveJurnal(e) {
    if (e) e.preventDefault();
    const newEntry = {
        id: Date.now(),
        tanggal: document.getElementById('jurnal-tanggal').value,
        classId: document.getElementById('jurnal-kelas-select').value,
        mapel: document.getElementById('jurnal-mapel-select').value,
        guru: document.getElementById('jurnal-guru').value,
        materi: document.getElementById('jurnal-materi').value,
        capaian: document.getElementById('jurnal-capaian').value,
        kegiatan: document.getElementById('jurnal-kegiatan').value,
        kendala: document.getElementById('jurnal-kendala').value
    };
    if (!appState.journals) appState.journals = [];
    appState.journals.unshift(newEntry);
    saveAppState();
    renderJurnalList();
    document.getElementById('form-jurnal-kbm').reset();
    document.getElementById('jurnal-tanggal').value = new Date().toISOString().split('T')[0];
    if (appState.currentUser && appState.currentUser.role === 'walikelas') {
        document.getElementById('jurnal-guru').value = appState.currentUser.nama;
    }
    showToast("Jurnal KBM harian tersimpan!");
}

function renderJurnalList() {
    const filterKelas = document.getElementById('filter-jurnal-kelas').value;
    const searchText = document.getElementById('jurnal-search').value.toLowerCase();
    const container = document.getElementById('jurnal-list-container');
    const journals = appState.journals || [];

    let allowedClassIds = (appState.classes || []).map(c => c.id);
    if (appState.currentUser && appState.currentUser.role === 'walikelas') {
        allowedClassIds = appState.currentUser.classIds || (appState.currentUser.classId ? [appState.currentUser.classId] : []);
    }

    let filtered = journals.filter(j => {
        const isClassAllowed = allowedClassIds.includes(j.classId);
        const matchKelas = filterKelas === 'ALL' || j.classId === filterKelas;
        const matchSearch = j.materi.toLowerCase().includes(searchText) || j.guru.toLowerCase().includes(searchText);
        return isClassAllowed && matchKelas && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400"><i class="fa-regular fa-folder-open text-3xl mb-2"></i><p class="text-xs">Belum ada histori jurnal mengajar.</p></div>`;
        return;
    }

    container.innerHTML = '';
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative hover:border-indigo-200 transition";
        card.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <div>
                    <span class="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg mb-1">${getClassName(item.classId)} • ${item.mapel}</span>
                    <h4 class="font-extrabold text-slate-800 text-sm">${item.materi}</h4>
                    <p class="text-xs text-slate-500 font-semibold">Pengajar: ${item.guru}</p>
                </div>
                <div class="text-right">
                    <span class="text-[11px] text-slate-400 font-medium block"><i class="fa-regular fa-calendar"></i> ${item.tanggal}</span>
                    <button type="button" onclick="deleteJurnal(event, ${item.id})" class="text-slate-300 hover:text-rose-600 text-xs mt-1.5 transition cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div><strong class="text-slate-700 block mb-0.5">CP/PPI:</strong><p class="text-slate-600">${item.capaian}</p></div>
                <div><strong class="text-slate-700 block mb-0.5">Kegiatan:</strong><p class="text-slate-600">${item.kegiatan}</p></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteJurnal(e, id) {
    if (e) e.preventDefault();
    if (confirm("Hapus catatan jurnal ini?")) {
        appState.journals = appState.journals.filter(j => j.id !== id);
        saveAppState();
        renderJurnalList();
        showToast("Jurnal berhasil dihapus.");
    }
}

function renderGuruFeedbackSection() {
    const container = document.getElementById('guru-feedback-container');
    if (!container) return;
    const currentUser = appState.currentUser;
    if (!currentUser) return;

    let myFeedbacks = (appState.evaluations || []).filter(ev => ev.target === currentUser.nama);

    if (myFeedbacks.length === 0) {
        container.innerHTML = `<div class="p-3 bg-white/10 rounded-xl text-xs text-amber-100 text-center">Belum ada umpan balik atau catatan supervisi dari Kepsek.</div>`;
        return;
    }

    container.innerHTML = '';
    myFeedbacks.forEach(ev => {
        const div = document.createElement('div');
        div.className = "p-3 bg-white text-slate-800 rounded-xl text-xs space-y-1 shadow-xs";
        const classLabel = ev.classId ? getClassName(ev.classId) : 'Semua Kelas';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-900">${classLabel} • ${ev.mapel || 'Semua Mapel'}</span>
                <span class="text-[10px] text-slate-400 font-semibold">${ev.tanggal}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">${ev.kategori}</span>
            </div>
            <p class="text-slate-600 font-medium pt-1">${ev.catatan}</p>
        `;
        container.appendChild(div);
    });
}
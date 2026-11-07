// ==========================================================================
// Modul Evaluasi & Dashboard Pengawasan Kepala Sekolah SLBN 2 PELAIHARI
// ==========================================================================

function updateEvaluasiDashboard() {
    renderEvaluasiSupervisiDashboard();
    if (typeof updateEvaluasiCharts === 'function') {
        updateEvaluasiCharts();
    }
}

function renderEvaluasiSupervisiDashboard() {
    var container = document.getElementById('eval-jurnal-list-container');
    if (!container) return;
    container.innerHTML = '';

    var journals = (window.appState && window.appState.journals) ? window.appState.journals : [];
    if (journals.length === 0) {
        container.innerHTML = '<div class="p-4 bg-slate-50 text-center text-slate-400 font-medium rounded-2xl col-span-2">Belum ada aktivitas jurnal mengajar dari guru.</div>';
        return;
    }

    var reversedJournals = journals.slice().reverse();

    reversedJournals.forEach(function(j) {
        var realIndex = journals.indexOf(j);
        var card = document.createElement('div');
        card.className = "bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs";

        var statusBadge = j.supervisi 
            ? '<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]"><i class="fa-solid fa-check-circle mr-1"></i>Sudah Disupervisi</span>' 
            : '<span class="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]"><i class="fa-solid fa-clock mr-1"></i>Belum Disupervisi</span>';

        var catatanSup = j.supervisi 
            ? '<div class="mt-2 p-2.5 bg-white border border-emerald-200 rounded-xl text-emerald-900 font-medium"><strong>Catatan & Ulasan Kepsek:</strong> "' + j.supervisi.catatanKepsek + '"</div>' 
            : '';

        var btnSupervisiKepsek = '';
        var currentUserRole = window.appState && window.appState.currentUser ? (window.appState.currentUser.role || '').toLowerCase() : '';
        
        if (currentUserRole === 'kepsek' || currentUserRole === 'admin' || currentUserRole === 'kapala sekolah') {
            btnSupervisiKepsek = `
                <button type="button" onclick="openModalSupervisi(${realIndex})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5">
                    <i class="fa-solid fa-clipboard-check"></i> ${j.supervisi ? 'Edit Supervisi' : 'Beri Supervisi Sekarang'}
                </button>
            `;
        }

        var namaKelasFormatted = typeof getClassName === 'function' ? getClassName(j.classId) : j.classId;
        var namaMapelFormatted = typeof getSubjectName === 'function' ? getSubjectName(j.mapel) : j.mapel;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-slate-800 text-sm">${j.guru || 'Guru SLBN 2'}</h4>
                    <p class="text-[11px] text-slate-500 font-semibold">${j.tanggal} | Kelas ${namaKelasFormatted} (${namaMapelFormatted})</p>
                </div>
                ${statusBadge}
            </div>
            <p class="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">${j.materi || '-'}</p>
            ${catatanSup}
            <div class="pt-2 flex justify-end">
                ${btnSupervisiKepsek}
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderEvaluasiSupervisiDashboard();
});

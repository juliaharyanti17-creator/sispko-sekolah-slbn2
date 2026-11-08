// ==========================================================================
// Modul Evaluasi & Dashboard Pengawasan Kepala Sekolah SLBN 2 PELAIHARI
// ==========================================================================

function updateEvaluasiDashboard() {
    initEvaluasiDefaultDate();
    renderEvaluasiSupervisiDashboard();
    updateEvaluasiWidgets();
    renderEvaluasiRealtimeKelasTable();
    updateEvaluasiCharts();
}

// Inisialisasi tanggal default ke hari ini pada filter evaluasi jika kosong
function initEvaluasiDefaultDate() {
    var todayStr = new Date().toISOString().split('T')[0];
    var startInput = document.getElementById('eval-filter-start-date');
    var endInput = document.getElementById('eval-filter-end-date');

    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = todayStr;
}

function setPresetEvalRange(type) {
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];
    var startInput = document.getElementById('eval-filter-start-date');
    var endInput = document.getElementById('eval-filter-end-date');

    if (!startInput || !endInput) return;

    if (type === 'today') {
        startInput.value = todayStr;
        endInput.value = todayStr;
    } else if (type === 'this_week') {
        var dayOfWeek = today.getDay();
        var distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        var monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);
        startInput.value = monday.toISOString().split('T')[0];
        endInput.value = todayStr;
    } else if (type === 'this_month') {
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startInput.value = firstDay.toISOString().split('T')[0];
        endInput.value = todayStr;
    }
    updateEvaluasiDashboard();
}

// 1. WIDGET STATISTIK KEHADIRAN MURID & JURNAL BERDASARKAN RENTANG TANGGAL
function updateEvaluasiWidgets() {
    var startInput = document.getElementById('eval-filter-start-date');
    var endInput = document.getElementById('eval-filter-end-date');
    var todayStr = new Date().toISOString().split('T')[0];

    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;

    var journals = (window.appState && window.appState.journals) ? window.appState.journals : [];
    var filteredJournals = journals.filter(function(j) {
        return j.tanggal && j.tanggal >= startDate && j.tanggal <= endDate;
    });

    var totalJurnal = filteredJournals.length;
    var totalSupervisi = filteredJournals.filter(function(j) { return j.supervisi; }).length;
    var totalBelum = totalJurnal - totalSupervisi;

    var hadir = 0, sakit = 0, izin = 0, alpa = 0;
    var activeStudents = window.appState.students || [];
    var activeStudentIds = activeStudents.map(function(s) { return String(s.id || s.nisn); });
    var presensiRecords = window.appState.presensiRecords || {};

    Object.keys(presensiRecords).forEach(function(key) {
        var parts = key.split('_');
        if (parts.length >= 3) {
            var tgl = parts[0];
            if (tgl >= startDate && tgl <= endDate) {
                var recMap = presensiRecords[key] || {};
                Object.keys(recMap).forEach(function(sId) {
                    if (activeStudentIds.includes(String(sId))) {
                        var st = recMap[sId];
                        if (st === 'H' || st === 'Hadir') hadir++;
                        else if (st === 'S' || st === 'Sakit') sakit++;
                        else if (st === 'I' || st === 'Izin') izin++;
                        else if (st === 'A' || st === 'Alpa') alpa++;
                    }
                });
            }
        }
    });

    if (document.getElementById('eval-stat-total-jurnal')) document.getElementById('eval-stat-total-jurnal').innerText = totalJurnal;
    if (document.getElementById('eval-stat-sudah-supervisi')) document.getElementById('eval-stat-sudah-supervisi').innerText = totalSupervisi;
    if (document.getElementById('eval-stat-belum-supervisi')) document.getElementById('eval-stat-belum-supervisi').innerText = totalBelum;

    if (document.getElementById('eval-stat-hadir')) document.getElementById('eval-stat-hadir').innerText = hadir;
    if (document.getElementById('eval-stat-sakit')) document.getElementById('eval-stat-sakit').innerText = sakit;
    if (document.getElementById('eval-stat-izin')) document.getElementById('eval-stat-izin').innerText = izin;
    if (document.getElementById('eval-stat-alpa')) document.getElementById('eval-stat-alpa').innerText = alpa;
}

// 2. TABEL REKAP REAL-TIME PER KELAS KHUSUS KEPSEK
function renderEvaluasiRealtimeKelasTable() {
    var tbody = document.getElementById('eval-realtime-kelas-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    var startInput = document.getElementById('eval-filter-start-date');
    var endInput = document.getElementById('eval-filter-end-date');
    var todayStr = new Date().toISOString().split('T')[0];
    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;

    var classes = window.appState.classes || [];
    var students = window.appState.students || [];
    var presensiRecords = window.appState.presensiRecords || {};

    if (classes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">Belum ada data kelas.</td></tr>';
        return;
    }

    classes.forEach(function(c, index) {
        var cId = String(c.id || '').trim();
        var cName = String(c.name || c.nama || '').trim().toLowerCase();

        var classStudents = students.filter(function(s) {
            var sClassId = String(s.classId || s.kelas || '').trim();
            var sClassName = String(s.className || s.namaKelas || '').trim().toLowerCase();
            return sClassId === cId || sClassId === cName || sClassName === cName || sClassName.includes(cName);
        });

        var totalMurid = classStudents.length;
        var studentIds = classStudents.map(function(s) { return String(s.id || s.nisn); });

        var cHadir = 0, cSakit = 0, cIzin = 0, cAlpa = 0;

        Object.keys(presensiRecords).forEach(function(key) {
            var parts = key.split('_');
            if (parts.length >= 3) {
                var tgl = parts[0];
                var classIdMatch = parts.slice(1, parts.length - 1).join('_').toLowerCase();

                if ((classIdMatch === cId.toLowerCase() || classIdMatch === cName) && tgl >= startDate && tgl <= endDate) {
                    var recMap = presensiRecords[key] || {};
                    studentIds.forEach(function(sId) {
                        var st = recMap[sId];
                        if (st === 'H' || st === 'Hadir') cHadir++;
                        else if (st === 'S' || st === 'Sakit') cSakit++;
                        else if (st === 'I' || st === 'Izin') cIzin++;
                        else cAlpa++; 
                    });
                }
            }
        });

        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-500 font-bold">${index + 1}</td>
            <td class="p-3 font-bold text-slate-800">${c.name || c.nama}</td>
            <td class="p-3 text-center font-semibold text-slate-700">${totalMurid}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${cHadir}</td>
            <td class="p-3 text-center font-bold text-amber-700">${cSakit}</td>
            <td class="p-3 text-center font-bold text-blue-700">${cIzin}</td>
            <td class="p-3 text-center font-bold text-rose-700">${cAlpa}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. GRAFIK STATISTIK MENGGUNAKAN CHART.JS
var evaluasiChartInstance = null;

function updateEvaluasiCharts() {
    var ctx = document.getElementById('evaluasi-chart-canvas');
    if (!ctx) return;

    var startInput = document.getElementById('eval-filter-start-date');
    var endInput = document.getElementById('eval-filter-end-date');
    var todayStr = new Date().toISOString().split('T')[0];
    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;

    var journals = (window.appState && window.appState.journals) ? window.appState.journals : [];
    var filteredJournals = journals.filter(function(j) {
        return j.tanggal && j.tanggal >= startDate && j.tanggal <= endDate;
    });

    var sudahSupervisi = filteredJournals.filter(function(j) { return j.supervisi; }).length;
    var belumSupervisi = filteredJournals.length - sudahSupervisi;

    if (evaluasiChartInstance) {
        evaluasiChartInstance.destroy();
    }

    evaluasiChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sudah Disupervisi', 'Belum Disupervisi'],
            datasets: [{
                data: [sudahSupervisi, belumSupervisi],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 11, weight: 'bold' },
                        color: '#334155'
                    }
                }
            }
        }
    });
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

        var catatanSup = j.supervisi && j.supervisi.catatanKepsek 
            ? '<div class="mt-2 p-2.5 bg-white border border-emerald-200 rounded-xl text-emerald-900 font-medium"><strong>Catatan & Ulasan Kepsek:</strong> "' + j.supervisi.catatanKepsek + '"</div>' 
            : '';

        var btnSupervisiKepsek = '';
        var currentUserRole = window.appState && window.appState.currentUser ? (window.appState.currentUser.role || '').toLowerCase() : '';
        
        if (currentUserRole === 'kepsek' || currentUserRole === 'admin' || currentUserRole === 'kepala sekolah') {
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
                    <p class="text-[11px] text-slate-500 font-semibold">${j.tanggal || '-'} | Kelas ${namaKelasFormatted || '-'} (${namaMapelFormatted || '-'})</p>
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
    updateEvaluasiDashboard();
});

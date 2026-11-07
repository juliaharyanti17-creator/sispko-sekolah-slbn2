// ==========================================================================
// MODUL REKAPITULASI LAPORAN PRESENSI & JURNAL KBM
// SIMPATIK SLBN 2 PELAIHARI (DENGAN RANGKUMAN HARIAN & RINCIAN PER MAPEL)
// ==========================================================================

function renderRekapModule() {
    initRekapDefaultDates();
    renderRekapPresensiTable();
    renderRekapJurnalTable();
}

function initRekapDefaultDates() {
    var todayStr = new Date().toISOString().split('T')[0];
    var startInput = document.getElementById('filter-rekap-start-date');
    var endInput = document.getElementById('filter-rekap-end-date');

    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = todayStr;

    // Populasikan dropdown filter kelas berdasarkan role user
    populateRekapKelasDropdown();
}

function populateRekapKelasDropdown() {
    var selectKelas = document.getElementById('filter-rekap-kelas');
    if (!selectKelas) return;

    var currentVal = selectKelas.value;
    selectKelas.innerHTML = '<option value="ALL">Semua Kelas</option>';

    var classes = window.appState.classes || [];
    var currentUser = window.appState.currentUser || {};
    var role = (currentUser.role || '').toLowerCase();

    // Jika wali kelas, batasi pilihan hanya kelas ampuannya
    classes.forEach(function(c) {
        var cId = c.id;
        var cName = c.name || c.nama;

        if (role === 'walikelas' || role === 'guru') {
            if (currentUser.kelasAmpuan && currentUser.kelasAmpuan.includes(cId)) {
                var opt = document.createElement('option');
                opt.value = cId;
                opt.textContent = cName;
                selectKelas.appendChild(opt);
            }
        } else {
            // Admin & Kepsek bisa lihat semua
            var opt = document.createElement('option');
            opt.value = cId;
            opt.textContent = cName;
            selectKelas.appendChild(opt);
        }
    });

    if (currentVal) selectKelas.value = currentVal;
}

// 1. RENDER TABEL REKAPITULASI PRESENSI HARIAN & INTERAKTIF KLIK
function renderRekapPresensiTable() {
    var tbody = document.getElementById('rekap-table-presensi-body');
    var periodLabel = document.getElementById('rekap-presensi-period-label');
    if (!tbody) return;
    tbody.innerHTML = '';

    var startInput = document.getElementById('filter-rekap-start-date');
    var endInput = document.getElementById('filter-rekap-end-date');
    var filterKelas = document.getElementById('filter-rekap-kelas');

    var todayStr = new Date().toISOString().split('T')[0];
    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;
    var selectedKelasId = filterKelas ? filterKelas.value : 'ALL';

    if (periodLabel) periodLabel.innerText = startDate === endDate ? startDate : (startDate + ' s.d. ' + endDate);

    var classes = window.appState.classes || [];
    var students = window.appState.students || [];
    var presensiRecords = window.appState.presensiRecords || {};

    // Filter kelas berdasarkan pilihan / role
    var targetClasses = classes.filter(function(c) {
        if (selectedKelasId !== 'ALL' && c.id !== selectedKelasId && c.name !== selectedKelasId) return false;
        return true;
    });

    if (targetClasses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">Tidak ada data rekap untuk filter yang dipilih.</td></tr>';
        return;
    }

    var no = 1;
    targetClasses.forEach(function(c) {
        var classStudents = students.filter(function(s) {
            return s.classId === c.id || s.kelas === c.id || s.classId === c.name || s.kelas === c.name;
        });
        var totalMurid = classStudents.length;
        var studentIds = classStudents.map(function(s) { return s.id; });

        // Ambil status snapshot terakhir / harian pada rentang tanggal tersebut
        var totalHadir = 0, totalSakit = 0, totalIzin = 0, totalAlpa = 0, hariEfektif = 0;

        // Kita telusuri presensiRecords berdasarkan tanggal
        var datesChecked = [];
        Object.keys(presensiRecords).forEach(function(key) {
            var parts = key.split('_');
            if (parts.length >= 3) {
                var tgl = parts[0];
                var cMatch = parts.slice(1, parts.length - 1).join('_');

                if ((cMatch === c.id || cMatch === c.name || cMatch === c.nama) && tgl >= startDate && tgl <= endDate) {
                    if (!datesChecked.includes(tgl)) {
                        datesChecked.push(tgl);
                        hariEfektif++;

                        // Ambil rekam data terakhir hari itu (Utamakan HARIAN atau sesi mapel terakhir)
                        var harianKey = tgl + '_' + cMatch + '_HARIAN';
                        var recMap = presensiRecords[harianKey] || {};
                        
                        // Jika tidak ada harian, ambil mapel apa saja di tanggal itu
                        if (Object.keys(recMap).length === 0) {
                            Object.keys(presensiRecords).forEach(function(subKey) {
                                if (subKey.startsWith(tgl + '_' + cMatch)) {
                                    recMap = presensiRecords[subKey];
                                }
                            });
                        }

                        studentIds.forEach(function(sId) {
                            var st = recMap[sId] || 'H'; // Default Hadir jika tidak diabsen
                            if (st === 'H' || st === 'Hadir') totalHadir++;
                            else if (st === 'S' || st === 'Sakit') totalSakit++;
                            else if (st === 'I' || st === 'Izin') totalIzin++;
                            else if (st === 'A' || st === 'Alpa') totalAlpa++;
                        });
                    }
                }
            }
        });

        // Rata-rata atau total bersih
        var avgHadir = hariEfektif > 0 ? Math.round(totalHadir / hariEfektif) : 0;
        var avgSakit = hariEfektif > 0 ? Math.round(totalSakit / hariEfektif) : 0;
        var avgIzin = hariEfektif > 0 ? Math.round(totalIzin / hariEfektif) : 0;
        var avgAlpa = hariEfektif > 0 ? Math.round(totalAlpa / hariEfektif) : 0;
        
        var persentaseHadir = (totalMurid * hariEfektif) > 0 ? Math.round((totalHadir / (totalMurid * hariEfektif)) * 100) : 0;

        // Baris Utama Rekap Kelas
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer";
        tr.title = "Klik untuk melihat rincian presensi per mata pelajaran";
        tr.onclick = function() {
            toggleRekapDetailPerMapel(c.id, startDate, endDate, tr);
        };
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-500 font-bold">${no++}</td>
            <td class="p-3 font-bold text-slate-800">${c.name || c.nama} <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1"></i></td>
            <td class="p-3 text-center font-semibold text-slate-700">${totalMurid}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${avgHadir}</td>
            <td class="p-3 text-center font-bold text-blue-700">${avgIzin}</td>
            <td class="p-3 text-center font-bold text-amber-700">${avgSakit}</td>
            <td class="p-3 text-center font-bold text-rose-700">${avgAlpa}</td>
            <td class="p-3 text-center"><span class="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg font-bold text-[11px]">${persentaseHadir}%</span></td>
        `;
        tbody.appendChild(tr);

        // Baris Kontainer Detail Per Mapel (Hidden secara default, muncul saat diklik)
        var trDetail = document.createElement('tr');
        trDetail.id = 'rekap-detail-' + c.id;
        trDetail.className = "hidden bg-slate-50/80 border-b border-slate-200";
        trDetail.innerHTML = `
            <td colspan="8" class="p-4">
                <div class="space-y-2">
                    <p class="font-bold text-xs text-indigo-900"><i class="fa-solid fa-circle-info mr-1"></i> Rincian Perubahan / Sesi Mata Pelajaran untuk Kelas ${c.name || c.nama}:</p>
                    <div id="rekap-detail-content-${c.id}" class="text-[11px] text-slate-600 space-y-1">
                        Memuat rincian sesi pelajaran...
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trDetail);
    });
}

// Fungsi Interaktif Klik untuk Membuka Rincian Per Sesi / Mata Pelajaran
function toggleRekapDetailPerMapel(classId, startDate, endDate, rowElement) {
    var detailRow = document.getElementById('rekap-detail-' + classId);
    var contentDiv = document.getElementById('rekap-detail-content-' + classId);
    if (!detailRow || !contentDiv) return;

    if (!detailRow.classList.contains('hidden')) {
        detailRow.classList.add('hidden');
        return;
    }

    // Tampilkan detail row dan populate data sesi mapel
    detailRow.classList.remove('hidden');
    contentDiv.innerHTML = '';

    var presensiRecords = window.appState.presensiRecords || {};
    var sessionList = [];

    Object.keys(presensiRecords).forEach(function(key) {
        var parts = key.split('_');
        if (parts.length >= 3) {
            var tgl = parts[0];
            var cMatch = parts.slice(1, parts.length - 1).join('_');
            var mapelSesi = parts[parts.length - 1];

            if (cMatch === classId && tgl >= startDate && tgl <= endDate) {
                sessionList.push({ tanggal: tgl, sesi: mapelSesi, record: presensiRecords[key] });
            }
        }
    });

    if (sessionList.length === 0) {
        contentDiv.innerHTML = '<p class="italic text-slate-400">Tidak ada rincian sesi mata pelajaran khusus pada rentang tanggal ini (menggunakan status harian umum).</p>';
        return;
    }

    var html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">';
    sessionList.forEach(function(item) {
        var hCount = 0, sCount = 0, iCount = 0, aCount = 0;
        Object.values(item.record).forEach(function(st) {
            if (st === 'H' || st === 'Hadir') hCount++;
            else if (st === 'S' || st === 'Sakit') sCount++;
            else if (st === 'I' || st === 'Izin') iCount++;
            else aCount++;
        });

        html += `
            <div class="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-slate-800">${item.tanggal}</span>
                    <span class="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[10px]">${item.sesi}</span>
                </div>
                <div class="space-x-2 text-[11px]">
                    <span class="text-emerald-700 font-bold">H: ${hCount}</span>
                    <span class="text-blue-700 font-bold">I: ${iCount}</span>
                    <span class="text-amber-700 font-bold">S: ${sCount}</span>
                    <span class="text-rose-700 font-bold">A: ${aCount}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    contentDiv.innerHTML = html;
}

// 2. RENDER TABEL REKAPITULASI JURNAL GURU (DENGAN PEMBATASAN ROLE)
function renderRekapJurnalTable() {
    var tbody = document.getElementById('rekap-table-jurnal-body');
    var periodLabel = document.getElementById('rekap-jurnal-period-label');
    if (!tbody) return;
    tbody.innerHTML = '';

    var startInput = document.getElementById('filter-rekap-start-date');
    var endInput = document.getElementById('filter-rekap-end-date');
    var todayStr = new Date().toISOString().split('T')[0];
    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;

    if (periodLabel) periodLabel.innerText = startDate === endDate ? startDate : (startDate + ' s.d. ' + endDate);

    var journals = window.appState.journals || [];
    var currentUser = window.appState.currentUser || {};
    var role = (currentUser.role || '').toLowerCase();

    // Saring berdasarkan role (Wali Kelas/Guru Mapel hanya lihat jurnal ampuannya sendiri)
    var filteredJournals = journals.filter(function(j) {
        if (j.tanggal < startDate || j.tanggal > endDate) return false;

        if (role === 'walikelas' || role === 'guru') {
            var matchGuru = (j.guru && j.guru.toLowerCase() === currentUser.nama.toLowerCase()) || 
                            (j.username && j.username === currentUser.username);
            var matchKelas = currentUser.kelasAmpuan && currentUser.kelasAmpuan.includes(j.classId);
            return matchGuru || matchKelas;
        }
        return true; // Admin & Kepsek lihat semua
    });

    if (filteredJournals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada data jurnal mengajar pada periode ini.</td></tr>';
        return;
    }

    filteredJournals.forEach(function(j, idx) {
        var namaKelas = typeof getClassName === 'function' ? getClassName(j.classId) : j.classId;
        var namaMapel = typeof getSubjectName === 'function' ? getSubjectName(j.mapel) : j.mapel;

        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="p-3 font-semibold text-slate-700">${j.tanggal}</td>
            <td class="p-3 font-bold text-slate-800">${j.guru || '-'}</td>
            <td class="p-3 font-semibold text-indigo-700">${namaKelas} (${namaMapel})</td>
            <td class="p-3 text-slate-600">${j.materi || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

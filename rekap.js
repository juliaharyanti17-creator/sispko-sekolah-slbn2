// ==========================================================================
// MODUL REKAPITULASI LAPORAN PRESENSI & JURNAL KBM
// SIMPATIK SLBN 2 PELAIHARI (DENGAN FILTER STATUS & TOTAL KESELURUHAN)
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
            var opt = document.createElement('option');
            opt.value = cId;
            opt.textContent = cName;
            selectKelas.appendChild(opt);
        }
    });

    if (currentVal) selectKelas.value = currentVal;
}

// 1. RENDER TABEL REKAPITULASI PRESENSI HARIAN & FILTER STATUS KEHADIRAN
function renderRekapPresensiTable() {
    var tbody = document.getElementById('rekap-table-presensi-body');
    var periodLabel = document.getElementById('rekap-presensi-period-label');
    if (!tbody) return;
    tbody.innerHTML = '';

    var startInput = document.getElementById('filter-rekap-start-date');
    var endInput = document.getElementById('filter-rekap-end-date');
    var filterKelas = document.getElementById('filter-rekap-kelas');
    var filterStatus = document.getElementById('filter-rekap-status'); // Elemen filter status baru

    var todayStr = new Date().toISOString().split('T')[0];
    var startDate = (startInput && startInput.value) ? startInput.value : todayStr;
    var endDate = (endInput && endInput.value) ? endInput.value : startDate;
    var selectedKelasId = filterKelas ? filterKelas.value : 'ALL';
    var selectedStatus = filterStatus ? filterStatus.value : 'ALL'; // ALL, H, S, I, A

    if (periodLabel) periodLabel.innerText = startDate === endDate ? startDate : (startDate + ' s.d. ' + endDate);

    var classes = window.appState.classes || [];
    var students = window.appState.students || [];
    var presensiRecords = window.appState.presensiRecords || {};

    var targetClasses = classes.filter(function(c) {
        if (selectedKelasId !== 'ALL' && c.id !== selectedKelasId && c.name !== selectedKelasId) return false;
        return true;
    });

    if (targetClasses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">Tidak ada data rekap untuk filter yang dipilih.</td></tr>';
        return;
    }

    var no = 1;
    var grandTotalMurid = 0;
    var grandTotalHadir = 0;
    var grandTotalIzin = 0;
    var grandTotalSakit = 0;
    var grandTotalAlpa = 0;

    targetClasses.forEach(function(c) {
        var classStudents = students.filter(function(s) {
            return s.classId === c.id || s.kelas === c.id || s.classId === c.name || s.kelas === c.name;
        });
        var totalMurid = classStudents.length;
        var studentIds = classStudents.map(function(s) { return s.id; });

        var totalHadir = 0, totalSakit = 0, totalIzin = 0, totalAlpa = 0, hariEfektif = 0;
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

                        var harianKey = tgl + '_' + cMatch + '_HARIAN';
                        var recMap = presensiRecords[harianKey] || {};
                        
                        if (Object.keys(recMap).length === 0) {
                            Object.keys(presensiRecords).forEach(function(subKey) {
                                if (subKey.startsWith(tgl + '_' + cMatch)) {
                                    recMap = presensiRecords[subKey];
                                }
                            });
                        }

                        studentIds.forEach(function(sId) {
                            var st = recMap[sId] || 'H';
                            if (st === 'H' || st === 'Hadir') totalHadir++;
                            else if (st === 'S' || st === 'Sakit') totalSakit++;
                            else if (st === 'I' || st === 'Izin') totalIzin++;
                            else if (st === 'A' || st === 'Alpa') totalAlpa++;
                        });
                    }
                }
            }
        });

        var avgHadir = hariEfektif > 0 ? Math.round(totalHadir / hariEfektif) : 0;
        var avgSakit = hariEfektif > 0 ? Math.round(totalSakit / hariEfektif) : 0;
        var avgIzin = hariEfektif > 0 ? Math.round(totalIzin / hariEfektif) : 0;
        var avgAlpa = hariEfektif > 0 ? Math.round(totalAlpa / hariEfektif) : 0;
        
        var persentaseHadir = (totalMurid * hariEfektif) > 0 ? Math.round((totalHadir / (totalMurid * hariEfektif)) * 100) : 0;

        grandTotalMurid += totalMurid;
        grandTotalHadir += avgHadir;
        grandTotalIzin += avgIzin;
        grandTotalSakit += avgSakit;
        grandTotalAlpa += avgAlpa;

        // Baris Utama Rekap Kelas
        var tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer";
        tr.title = "Klik untuk melihat rincian presensi dan nama siswa";
        tr.onclick = function() {
            toggleRekapDetailPerMapel(c.id, startDate, endDate, selectedStatus, tr);
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

        // Baris Kontainer Detail Per Mapel & Nama Siswa
        var trDetail = document.createElement('tr');
        trDetail.id = 'rekap-detail-' + c.id;
        trDetail.className = "hidden bg-slate-50/80 border-b border-slate-200";
        trDetail.innerHTML = `
            <td colspan="8" class="p-4">
                <div class="space-y-2">
                    <p class="font-bold text-xs text-indigo-900"><i class="fa-solid fa-circle-info mr-1"></i> Rincian Nama Siswa & Sesi Mata Pelajaran untuk Kelas ${c.name || c.nama}:</p>
                    <div id="rekap-detail-content-${c.id}" class="text-[11px] text-slate-600 space-y-1">
                        Memuat rincian sesi pelajaran...
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trDetail);
    });

    // --- BARIS TOTAL KESELURUHAN DI BAGIAN BAWAH ---
    var overallPersentase = grandTotalMurid > 0 ? Math.round((grandTotalHadir / grandTotalMurid) * 100) : 0;
    
    var trTotal = document.createElement('tr');
    trTotal.className = "bg-indigo-950 text-white font-bold text-xs border-t-2 border-indigo-900";
    trTotal.innerHTML = `
        <td colspan="2" class="p-3 text-right uppercase tracking-wider">TOTAL KESELURUHAN:</td>
        <td class="p-3 text-center text-white">${grandTotalMurid}</td>
        <td class="p-3 text-center text-emerald-300">${grandTotalHadir}</td>
        <td class="p-3 text-center text-blue-300">${grandTotalIzin}</td>
        <td class="p-3 text-center text-amber-300">${grandTotalSakit}</td>
        <td class="p-3 text-center text-rose-300">${grandTotalAlpa}</td>
        <td class="p-3 text-center"><span class="px-2.5 py-1 bg-indigo-800 text-indigo-100 rounded-lg text-[11px]">${overallPersentase}%</span></td>
    `;
    tbody.appendChild(trTotal);
}

// Fungsi Interaktif Klik dengan Filter Status Kehadiran (H, S, I, A)
function toggleRekapDetailPerMapel(classId, startDate, endDate, statusFilter, rowElement) {
    var detailRow = document.getElementById('rekap-detail-' + classId);
    var contentDiv = document.getElementById('rekap-detail-content-' + classId);
    if (!detailRow || !contentDiv) return;

    if (!detailRow.classList.contains('hidden')) {
        detailRow.classList.add('hidden');
        return;
    }

    detailRow.classList.remove('hidden');
    contentDiv.innerHTML = '<p class="text-slate-400 italic">Memuat rincian data siswa...</p>';

    var presensiRecords = window.appState.presensiRecords || {};
    var students = window.appState.students || [];
    
    var classStudents = students.filter(function(s) {
        var sClassId = String(s.classId || s.kelas || '').trim();
        var sClassName = String(s.className || s.namaKelas || '').trim().toLowerCase();
        return sClassId === classId || sClassName === classId.toLowerCase() || sClassName.includes(classId.toLowerCase());
    });

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
        contentDiv.innerHTML = '<p class="italic text-slate-400">Tidak ada rincian sesi mata pelajaran khusus pada rentang tanggal ini.</p>';
        return;
    }

    var html = '<div class="space-y-3 pt-1">';
    
    sessionList.forEach(function(item) {
        var hCount = 0, sCount = 0, iCount = 0, aCount = 0;
        
        Object.values(item.record).forEach(function(st) {
            if (st === 'H' || st === 'Hadir') hCount++;
            else if (st === 'S' || st === 'Sakit') sCount++;
            else if (st === 'I' || st === 'Izin') iCount++;
            else aCount++;
        });

        // Filter daftar siswa berdasarkan status pilihan dropdown (H, S, I, A, atau ALL)
        var filteredStudents = classStudents.filter(function(s) {
            var sId = String(s.id || s.nisn);
            var st = item.record[sId] || 'H';
            if (statusFilter === 'ALL') return true;
            if (statusFilter === 'H' && (st === 'H' || st === 'Hadir')) return true;
            if (statusFilter === 'S' && (st === 'S' || st === 'Sakit')) return true;
            if (statusFilter === 'I' && (st === 'I' || st === 'Izin')) return true;
            if (statusFilter === 'A' && (st === 'A' || st === 'Alpa')) return true;
            return false;
        });

        html += `
            <div class="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 gap-1">
                    <div>
                        <span class="font-black text-slate-800"><i class="fa-regular fa-calendar text-indigo-600 mr-1"></i> ${item.tanggal}</span>
                        <span class="ml-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-800 rounded-lg font-bold text-[10px]">Sesi: ${item.sesi}</span>
                    </div>
                    <div class="space-x-2 text-[11px] font-semibold">
                        <span class="text-emerald-700">Hadir: ${hCount}</span>
                        <span class="text-blue-700">Izin: ${iCount}</span>
                        <span class="text-amber-700">Sakit: ${sCount}</span>
                        <span class="text-rose-700">Alpa: ${aCount}</span>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-[11px]">
                        <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                            <tr>
                                <th class="p-2 w-10 text-center">No</th>
                                <th class="p-2">Nama Siswa / Murid</th>
                                <th class="p-2 w-24 text-center">Status Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
        `;

        if (filteredStudents.length === 0) {
            html += '<tr><td colspan="3" class="p-2 text-center text-slate-400 italic">Tidak ada siswa dengan status presensi tersebut pada sesi ini.</td></tr>';
        } else {
            filteredStudents.forEach(function(s, sIdx) {
                var sId = String(s.id || s.nisn);
                var statusPresensi = item.record[sId] || 'H';
                
                var badgeClass = "bg-emerald-100 text-emerald-800";
                var statusText = "Hadir (H)";
                
                if (statusPresensi === 'S' || statusPresensi === 'Sakit') {
                    badgeClass = "bg-amber-100 text-amber-800";
                    statusText = "Sakit (S)";
                } else if (statusPresensi === 'I' || statusPresensi === 'Izin') {
                    badgeClass = "bg-blue-100 text-blue-800";
                    statusText = "Izin (I)";
                } else if (statusPresensi === 'A' || statusPresensi === 'Alpa') {
                    badgeClass = "bg-rose-100 text-rose-800";
                    statusText = "Alpa (A)";
                }

                html += `
                    <tr class="hover:bg-slate-50">
                        <td class="p-2 text-center text-slate-400">${sIdx + 1}</td>
                        <td class="p-2 font-semibold text-slate-800">${s.name || s.nama || '-'}</td>
                        <td class="p-2 text-center">
                            <span class="px-2 py-0.5 rounded-md font-bold text-[10px] ${badgeClass}">${statusText}</span>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
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

    var filteredJournals = journals.filter(function(j) {
        if (j.tanggal < startDate || j.tanggal > endDate) return false;

        if (role === 'walikelas' || role === 'guru') {
            var matchGuru = (j.guru && j.guru.toLowerCase() === currentUser.nama.toLowerCase()) || 
                            (j.username && j.username === currentUser.username);
            var matchKelas = currentUser.kelasAmpuan && currentUser.kelasAmpuan.includes(j.classId);
            return matchGuru || matchKelas;
        }
        return true;
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

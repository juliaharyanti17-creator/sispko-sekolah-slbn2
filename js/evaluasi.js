// Logika Dashboard Kepsek & Chart.js
function toggleSubMenu(subMenuId, iconId, tabId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (tabId && appState.currentTab !== tabId) switchTab(null, tabId);

    const subMenu = document.getElementById(subMenuId);
    const icon = document.getElementById(iconId);

    if (subMenu) {
        if (subMenu.classList.contains('hidden')) {
            subMenu.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            subMenu.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    }
}

function scrollToSubSection(event, tabId, sectionId) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (appState.currentTab !== tabId) switchTab(null, tabId);

    setTimeout(() => {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar-nav');
        if (!sidebar.classList.contains('hidden')) toggleMobileSidebar(null);
    }
}

function setPresetEvalRange(e, type) {
    if (e) e.preventDefault();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startInput = document.getElementById('filter-eval-start-date');
    const endInput = document.getElementById('filter-eval-end-date');

    if (!startInput || !endInput) return;

    if (type === 'today') {
        startInput.value = todayStr;
        endInput.value = todayStr;
    } else if (type === 'this_week') {
        const dayOfWeek = today.getDay();
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);
        startInput.value = monday.toISOString().split('T')[0];
        endInput.value = todayStr;
    } else if (type === 'this_month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startInput.value = firstDay.toISOString().split('T')[0];
        endInput.value = todayStr;
    }
    updateEvaluasiDashboard();
}

function updateEvaluasiDashboard() {
    const startDate = document.getElementById('filter-eval-start-date').value || new Date().toISOString().split('T')[0];
    const endDate = document.getElementById('filter-eval-end-date').value || startDate;
    const filterKelas = document.getElementById('filter-eval-kelas') ? document.getElementById('filter-eval-kelas').value : 'ALL';

    let periodLabel = `${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    if (startDate === endDate) {
        periodLabel = new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    document.querySelectorAll('.label-chart-period').forEach(el => { el.innerText = periodLabel; });

    let totalRecordsRange = 0, totalHadirRange = 0;
    let absenceList = [];
    const activeStudentIds = (appState.students || []).map(s => s.id);

    Object.keys(appState.presensiRecords || {}).forEach(key => {
        const parts = key.split('_');
        const tgl = parts[0], cId = parts[1];

        if (tgl >= startDate && tgl <= endDate) {
            (appState.presensiRecords[key] || []).forEach(r => {
                if (activeStudentIds.includes(r.studentId)) {
                    totalRecordsRange++;
                    if (r.status === 'Hadir') totalHadirRange++;
                    else {
                        const matchKelas = filterKelas === 'ALL' || cId === filterKelas;
                        if (matchKelas) {
                            const studentObj = (appState.students || []).find(s => s.id === r.studentId);
                            if (studentObj) {
                                absenceList.push({
                                    tanggal: tgl, name: studentObj.name, ketunaan: studentObj.ketunaan || '-',
                                    className: getClassName(cId), status: r.status, notes: r.notes
                                });
                            }
                        }
                    }
                }
            });
        }
    });

    const hadirPercent = totalRecordsRange > 0 ? Math.round((totalHadirRange / totalRecordsRange) * 100) : 0;
    const journalsRange = (appState.journals || []).filter(j => j.tanggal >= startDate && j.tanggal <= endDate).length;

    document.getElementById('eval-kpi-kehadiran').innerText = `${hadirPercent}%`;
    document.getElementById('eval-kpi-jurnal').innerText = `${journalsRange} Doc`;
    document.getElementById('eval-kpi-feedback').innerText = `${(appState.evaluations || []).length} Note`;

    absenceList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const tbody = document.getElementById('eval-table-absensi-body');
    tbody.innerHTML = '';
    if (absenceList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400 font-medium">Tidak ada ketidakhadiran pada rentang tanggal terpilih.</td></tr>`;
    } else {
        absenceList.forEach(item => {
            const badgeColor = item.status === 'Alpa' ? 'bg-rose-100 text-rose-700' : (item.status === 'Sakit' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700');
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-50 hover:bg-slate-50/50 transition";
            tr.innerHTML = `
                <td class="p-3 font-medium text-slate-500">${item.tanggal}</td>
                <td class="p-3 font-bold text-slate-800">${item.name}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-200">${item.ketunaan}</span></td>
                <td class="p-3 text-slate-600">${item.className}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded-md font-bold text-[10px] ${badgeColor}">${item.status}</span></td>
                <td class="p-3 text-slate-500">${item.notes || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderKepsekJurnalList();
    renderEvaluasiFeed();
    updateChartsAndWidgets(startDate, endDate);
}

function handleSaveEvaluasi(e) {
    if (e) e.preventDefault();
    const targetGuru = document.getElementById('eval-input-target-guru').value;
    const targetKelas = document.getElementById('eval-input-target-kelas').value;
    const targetMapel = document.getElementById('eval-input-target-mapel').value;
    const kategori = document.getElementById('eval-input-kategori').value;
    const catatan = document.getElementById('eval-input-catatan').value;

    if (!targetGuru) { alert("Silakan pilih guru tujuan terlebih dahulu."); return; }

    const newEval = {
        id: Date.now(),
        target: targetGuru,
        classId: targetKelas,
        mapel: targetMapel,
        kategori: kategori,
        catatan: catatan,
        tanggal: new Date().toISOString().split('T')[0]
    };

    if (!appState.evaluations) appState.evaluations = [];
    appState.evaluations.unshift(newEval);
    saveAppState();
    updateEvaluasiDashboard();
    document.getElementById('form-evaluasi-kepsek').reset();
    updateTargetKelasDropdown();
    showToast("Umpan balik evaluasi Kepsek tersampaikan!");
}

function renderKepsekJurnalList() {
    const startDate = document.getElementById('filter-eval-start-date').value || new Date().toISOString().split('T')[0];
    const endDate = document.getElementById('filter-eval-end-date').value || startDate;
    const filterKelas = document.getElementById('eval-jurnal-filter-kelas') ? document.getElementById('eval-jurnal-filter-kelas').value : 'ALL';
    const searchText = document.getElementById('eval-jurnal-search') ? document.getElementById('eval-jurnal-search').value.toLowerCase() : '';
    const container = document.getElementById('eval-jurnal-list-container');
    if (!container) return;

    const journals = appState.journals || [];
    let filtered = journals.filter(j => {
        const inRange = j.tanggal >= startDate && j.tanggal <= endDate;
        const matchKelas = filterKelas === 'ALL' || j.classId === filterKelas;
        const matchSearch = j.materi.toLowerCase().includes(searchText) || 
                            j.guru.toLowerCase().includes(searchText) || 
                            j.capaian.toLowerCase().includes(searchText);
        return inRange && matchKelas && matchSearch;
    });

    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400"><i class="fa-solid fa-book-bookmark text-3xl mb-2 text-slate-300"></i><p class="text-xs font-semibold">Tidak ada data jurnal KBM mengajar pada periode terpilih.</p></div>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-slate-50/80 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:bg-white hover:border-indigo-200 transition";
        card.innerHTML = `
            <div class="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-2">
                <div>
                    <span class="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg mb-1">${getClassName(item.classId)} • ${item.mapel}</span>
                    <h4 class="font-bold text-slate-900 text-xs sm:text-sm">${item.materi}</h4>
                    <p class="text-[11px] text-slate-600 font-semibold"><i class="fa-solid fa-user-tie mr-1 text-indigo-500"></i>${item.guru}</p>
                </div>
                <span class="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg shrink-0"><i class="fa-regular fa-calendar mr-1"></i>${item.tanggal}</span>
            </div>
            <div class="space-y-2 text-xs">
                <div><span class="text-[10px] uppercase font-bold text-slate-400 block">Capaian Pembelajaran (CP/PPI)</span><p class="text-slate-700 font-medium">${item.capaian}</p></div>
                <div><span class="text-[10px] uppercase font-bold text-slate-400 block">Ringkasan Kegiatan</span><p class="text-slate-600">${item.kegiatan}</p></div>
                ${item.kendala ? `<div class="bg-amber-50 p-2 rounded-xl border border-amber-200/60"><span class="text-[10px] uppercase font-bold text-amber-800 block"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Kendala & Solusi</span><p class="text-amber-900 text-[11px] font-medium">${item.kendala}</p></div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderEvaluasiFeed() {
    const feedContainer = document.getElementById('eval-feed-container');
    const filterGuru = document.getElementById('filter-feed-guru') ? document.getElementById('filter-feed-guru').value : 'ALL';
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    let filteredFeed = (appState.evaluations || []).filter(ev => filterGuru === 'ALL' || ev.target === filterGuru);

    if (filteredFeed.length === 0) {
        feedContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-2">Belum ada riwayat umpan balik.</p>`;
        return;
    }

    filteredFeed.forEach(ev => {
        const div = document.createElement('div');
        div.className = "p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1";
        const classLabel = ev.classId ? getClassName(ev.classId) : 'Semua Kelas';
        div.innerHTML = `
            <div class="flex justify-between items-center"><strong class="text-indigo-700 font-bold">${ev.target} (${classLabel} • ${ev.mapel || 'Semua Mapel'})</strong><span class="text-[10px] text-slate-400">${ev.tanggal}</span></div>
            <span class="inline-block text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">${ev.kategori}</span>
            <p class="text-slate-600 mt-1">${ev.catatan}</p>
        `;
        feedContainer.appendChild(div);
    });
}

function initCharts() {
    const elBar = document.getElementById('chartKehadiranBar');
    const elPie = document.getElementById('chartKehadiranPie');
    if (!elBar || !elPie) return;
    const todayStr = new Date().toISOString().split('T')[0];

    barChartInstance = new Chart(elBar.getContext('2d'), {
        type: 'bar', data: getBarChartData(todayStr, todayStr),
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
    });

    pieChartInstance = new Chart(elPie.getContext('2d'), {
        type: 'doughnut', data: getPieChartData(todayStr, todayStr),
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function getBarChartData(startDate, endDate) {
    const activeStudentIds = (appState.students || []).map(s => s.id);
    const labels = (appState.classes || []).map(c => c.name);
    const data = (appState.classes || []).map(c => {
        let classStudents = (appState.students || []).filter(s => s.classId === c.id);
        if (classStudents.length === 0) return 0;
        let totalHadir = 0, totalRecords = 0;
        Object.keys(appState.presensiRecords || {}).forEach(key => {
            const parts = key.split('_');
            if (parts[1] === c.id && parts[0] >= startDate && parts[0] <= endDate) {
                (appState.presensiRecords[key] || []).forEach(r => {
                    if (activeStudentIds.includes(r.studentId)) {
                        totalRecords++;
                        if (r.status === 'Hadir') totalHadir++;
                    }
                });
            }
        });
        return totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0;
    });
    return { labels: labels, datasets: [{ label: '% Kehadiran', data: data, backgroundColor: '#4f46e5', borderRadius: 8 }] };
}

function getPieChartData(startDate, endDate) {
    const activeStudentIds = (appState.students || []).map(s => s.id);
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    Object.keys(appState.presensiRecords || {}).forEach(key => {
        const parts = key.split('_');
        if (parts[0] >= startDate && parts[0] <= endDate) {
            (appState.presensiRecords[key] || []).forEach(r => {
                if (activeStudentIds.includes(r.studentId)) {
                    if (r.status === 'Hadir') hadir++;
                    else if (r.status === 'Izin') izin++;
                    else if (r.status === 'Sakit') sakit++;
                    else if (r.status === 'Alpa') alpa++;
                }
            });
        }
    });
    if (hadir === 0 && izin === 0 && sakit === 0 && alpa === 0) hadir = 1;
    return { labels: ['Hadir', 'Izin', 'Sakit', 'Alpa'], datasets: [{ data: [hadir, izin, sakit, alpa], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'] }] };
}

function updateChartsAndWidgets(startDate, endDate) {
    const activeStudentIds = (appState.students || []).map(s => s.id);
    let totalSakit = 0, totalAlpa = 0, totalIzin = 0;
    let sakitPerClass = {}, alpaPerClass = {}, izinPerClass = {};

    (appState.classes || []).forEach(c => { sakitPerClass[c.id] = 0; alpaPerClass[c.id] = 0; izinPerClass[c.id] = 0; });

    Object.keys(appState.presensiRecords || {}).forEach(key => {
        const parts = key.split('_');
        const tgl = parts[0], classId = parts[1];

        if (tgl >= startDate && tgl <= endDate) {
            (appState.presensiRecords[key] || []).forEach(r => {
                if (activeStudentIds.includes(r.studentId)) {
                    if (r.status === 'Sakit') { totalSakit++; if (sakitPerClass[classId] !== undefined) sakitPerClass[classId]++; }
                    else if (r.status === 'Alpa') { totalAlpa++; if (alpaPerClass[classId] !== undefined) alpaPerClass[classId]++; }
                    else if (r.status === 'Izin') { totalIzin++; if (izinPerClass[classId] !== undefined) izinPerClass[classId]++; }
                }
            });
        }
    });

    document.getElementById('widget-sakit-count').innerText = totalSakit;
    document.getElementById('widget-alpa-count').innerText = totalAlpa;
    document.getElementById('widget-izin-count').innerText = totalIzin;

    function getHighestClassText(mapObj) {
        let maxCount = 0, maxClassId = null;
        Object.keys(mapObj).forEach(cId => {
            if (mapObj[cId] > maxCount) { maxCount = mapObj[cId]; maxClassId = cId; }
        });
        return (maxCount > 0 && maxClassId) ? `Terbanyak: ${getClassName(maxClassId)} (${maxCount})` : "Semua Kelas Nihil";
    }

    document.getElementById('widget-sakit-highest-class').innerText = getHighestClassText(sakitPerClass);
    document.getElementById('widget-alpa-highest-class').innerText = getHighestClassText(alpaPerClass);
    document.getElementById('widget-izin-highest-class').innerText = getHighestClassText(izinPerClass);

    if (barChartInstance && pieChartInstance) {
        barChartInstance.data = getBarChartData(startDate, endDate);
        barChartInstance.update();
        pieChartInstance.data = getPieChartData(startDate, endDate);
        pieChartInstance.update();
    }
}

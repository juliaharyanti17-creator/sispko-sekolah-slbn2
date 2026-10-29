// Logika Dashboard Kepsek & Chart.js
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
    const startEl = document.getElementById('filter-eval-start-date');
    const endEl = document.getElementById('filter-eval-end-date');
    const classEl = document.getElementById('filter-eval-kelas');

    const startDate = startEl ? startEl.value || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const endDate = endEl ? endEl.value || startDate : startDate;
    const filterKelas = classEl ? classEl.value : 'ALL';

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
            const recMap = appState.presensiRecords[key] || {};
            Object.keys(recMap).forEach(sId => {
                if (activeStudentIds.includes(sId)) {
                    totalRecordsRange++;
                    const st = recMap[sId];
                    if (st === 'H' || st === 'Hadir') {
                        totalHadirRange++;
                    } else {
                        const matchKelas = filterKelas === 'ALL' || cId === filterKelas;
                        if (matchKelas) {
                            const studentObj = (appState.students || []).find(s => s.id === sId);
                            if (studentObj) {
                                absenceList.push({
                                    tanggal: tgl,
                                    name: studentObj.nama || studentObj.name || 'Siswa',
                                    ketunaan: studentObj.ketunaan || '-',
                                    className: getClassName(cId),
                                    status: st === 'S' ? 'Sakit' : (st === 'I' ? 'Izin' : 'Alpa')
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

    if (document.getElementById('eval-kpi-kehadiran')) document.getElementById('eval-kpi-kehadiran').innerText = `${hadirPercent}%`;
    if (document.getElementById('eval-kpi-jurnal')) document.getElementById('eval-kpi-jurnal').innerText = `${journalsRange} Doc`;
    if (document.getElementById('eval-kpi-feedback')) document.getElementById('eval-kpi-feedback').innerText = `${(appState.evaluations || []).length} Note`;

    absenceList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const tbody = document.getElementById('eval-table-absensi-body');
    if (tbody) {
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
                    <td class="p-3 text-slate-500">-</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    updateChartsAndWidgets(startDate, endDate);
}

function initCharts() {
    const elBar = document.getElementById('chartKehadiranBar');
    const elPie = document.getElementById('chartKehadiranPie');
    if (!elBar || !elPie || typeof Chart === 'undefined') return;
    const todayStr = new Date().toISOString().split('T')[0];

    if (barChartInstance) barChartInstance.destroy();
    if (pieChartInstance) pieChartInstance.destroy();

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
                const recMap = appState.presensiRecords[key] || {};
                Object.keys(recMap).forEach(sId => {
                    if (activeStudentIds.includes(sId)) {
                        totalRecords++;
                        const st = recMap[sId];
                        if (st === 'H' || st === 'Hadir') totalHadir++;
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
            const recMap = appState.presensiRecords[key] || {};
            Object.keys(recMap).forEach(sId => {
                if (activeStudentIds.includes(sId)) {
                    const st = recMap[sId];
                    if (st === 'H' || st === 'Hadir') hadir++;
                    else if (st === 'I' || st === 'Izin') izin++;
                    else if (st === 'S' || st === 'Sakit') sakit++;
                    else if (st === 'A' || st === 'Alpa') alpa++;
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
            const recMap = appState.presensiRecords[key] || {};
            Object.keys(recMap).forEach(sId => {
                if (activeStudentIds.includes(sId)) {
                    const st = recMap[sId];
                    if (st === 'S' || st === 'Sakit') { totalSakit++; if (sakitPerClass[classId] !== undefined) sakitPerClass[classId]++; }
                    else if (st === 'A' || st === 'Alpa') { totalAlpa++; if (alpaPerClass[classId] !== undefined) alpaPerClass[classId]++; }
                    else if (st === 'I' || st === 'Izin') { totalIzin++; if (izinPerClass[classId] !== undefined) izinPerClass[classId]++; }
                }
            });
        }
    });

    if (document.getElementById('widget-sakit-count')) document.getElementById('widget-sakit-count').innerText = totalSakit;
    if (document.getElementById('widget-alpa-count')) document.getElementById('widget-alpa-count').innerText = totalAlpa;
    if (document.getElementById('widget-izin-count')) document.getElementById('widget-izin-count').innerText = totalIzin;

    function getHighestClassText(mapObj) {
        let maxCount = 0, maxClassId = null;
        Object.keys(mapObj).forEach(cId => {
            if (mapObj[cId] > maxCount) { maxCount = mapObj[cId]; maxClassId = cId; }
        });
        return (maxCount > 0 && maxClassId) ? `Terbanyak: ${getClassName(maxClassId)} (${maxCount})` : "Semua Kelas Nihil";
    }

    if (document.getElementById('widget-sakit-highest-class')) document.getElementById('widget-sakit-highest-class').innerText = getHighestClassText(sakitPerClass);
    if (document.getElementById('widget-alpa-highest-class')) document.getElementById('widget-alpa-highest-class').innerText = getHighestClassText(alpaPerClass);
    if (document.getElementById('widget-izin-highest-class')) document.getElementById('widget-izin-highest-class').innerText = getHighestClassText(izinPerClass);

    if (barChartInstance && pieChartInstance) {
        barChartInstance.data = getBarChartData(startDate, endDate);
        barChartInstance.update();
        pieChartInstance.data = getPieChartData(startDate, endDate);
        pieChartInstance.update();
    }
}

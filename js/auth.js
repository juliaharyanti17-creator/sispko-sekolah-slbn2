function applyRolePermissions(isInitial = false) {
    if (!appState.currentUser) return;
    const role = appState.currentUser.role;
    const tabPresensi = document.getElementById('tab-btn-presensi');
    const tabJurnal = document.getElementById('tab-btn-jurnal');
    const tabRekap = document.getElementById('tab-btn-rekap');
    const tabEvaluasi = document.getElementById('tab-btn-evaluasi');
    const tabMaster = document.getElementById('tab-btn-master');

    tabPresensi.style.display = 'flex';
    tabJurnal.style.display = 'flex';
    if (tabRekap) tabRekap.style.display = 'flex';
    if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'block';
    tabMaster.style.display = 'flex';

    populateDropdowns();

    if (role === 'walikelas' || role === 'gurumapel') {
        if (tabRekap) tabRekap.style.display = 'none';
        if (tabEvaluasi) tabEvaluasi.parentElement.style.display = 'none';
        tabMaster.style.display = 'none';
        if (document.getElementById('jurnal-guru')) {
            document.getElementById('jurnal-guru').value = appState.currentUser.nama;
        }
        if (isInitial) switchTab(null, 'presensi');
    } else if (role === 'kepsek') {
        tabPresensi.style.display = 'none';
        tabJurnal.style.display = 'none';
        if (tabRekap) tabRekap.style.display = 'none';
        tabMaster.style.display = 'none';
        if (isInitial) switchTab(null, 'evaluasi');
    } else if (role === 'admin') {
        if (isInitial) switchTab(null, 'presensi');
    }
}

function syncDatabaseListener() {
    if (!db) return;

    db.ref('sispko_data').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appState.classes = data.classes || [];
            appState.students = data.students || [];
            appState.mapels = data.mapels || [...DEFAULT_MAPELS];
            appState.users = (data.users && data.users.length > 0) ? data.users : [...DEFAULT_USERS];
            appState.presensiRecords = data.presensiRecords || {};
            appState.journals = data.journals || [];
            appState.evaluations = data.evaluations || [];
        } else {
            // Jika database Firebase masih kosong, inisialisasi awal
            saveAppState();
        }

        const currentFirebaseUser = auth ? auth.currentUser : null;
        if (currentFirebaseUser) {
            const userEmail = currentFirebaseUser.email || "";
            
            // Cari user yang cocok berdasarkan email
            let foundUser = (appState.users || []).find(u => formatUserEmail(u.username || u.nama) === userEmail);

            // Cek di DEFAULT_USERS jika belum ketemu
            if (!foundUser) {
                foundUser = DEFAULT_USERS.find(u => formatUserEmail(u.username || u.nama) === userEmail);
            }

            // JIKA TETAP TIDAK KETEMU: Buat objek user sementara agar BISA MASUK
            if (!foundUser) {
                const usernameFromEmail = userEmail.split('@')[0];
                foundUser = {
                    id: "u_" + Date.now(),
                    username: usernameFromEmail,
                    nama: usernameFromEmail.toUpperCase(),
                    role: "admin",
                    classIds: [],
                    assignedMapels: []
                };
            }

            appState.currentUser = foundUser;
            localStorage.setItem('sispko_session_user', JSON.stringify(foundUser));
            
            // PAKSA SEMBUNYIKAN LAYAR LOGIN & TAMPILKAN APLIKASI
            const screenLogin = document.getElementById('screen-login');
            const screenApp = document.getElementById('screen-app');

            if (screenLogin) screenLogin.classList.add('hidden');
            if (screenApp) {
                screenApp.classList.remove('hidden');
                screenApp.classList.add('flex');
            }
            
            if (document.getElementById('user-display-name')) {
                document.getElementById('user-display-name').innerText = foundUser.nama;
            }
            if (document.getElementById('user-display-role')) {
                document.getElementById('user-display-role').innerText = foundUser.role;
            }

            if (isInitialLoad) {
                populateDropdowns();
                applyRolePermissions(true);
                isInitialLoad = false;
            } else {
                refreshCurrentTabUI();
            }
        }
    });
}

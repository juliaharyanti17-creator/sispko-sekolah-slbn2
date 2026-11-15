// ==========================================================================
// Modul Notifikasi Otomatis Guru & Kepala Sekolah - SIMANTAP SLBN 2
// ==========================================================================

// Fungsi untuk menambah notifikasi baru ke sistem
function addSystemNotification(targetRoleOrUser, title, message, referenceId) {
    if (!window.appState) window.appState = {};
    if (!window.appState.notifications) window.appState.notifications = [];

    var newNotif = {
        id: "notif_" + Date.now(),
        target: targetRoleOrUser, // Bisa berupa role ('kepsek') atau nama guru spesifik
        title: title,
        message: message,
        referenceId: referenceId || '',
        read: false,
        createdAt: new Date().toISOString()
    };

    window.appState.notifications.push(newNotif);
    if (typeof saveAppState === 'function') saveAppState();
    
    // Perbarui tampilan badge notifikasi secara real-time
    renderNotificationsUI();
}

// Render UI Dropdown & Badge Notifikasi
function renderNotificationsUI() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;

    var currentRole = (currentUser.role || '').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();
    var notifications = (window.appState && window.appState.notifications) ? window.appState.notifications : [];

    // Filter notifikasi yang ditujukan untuk user ini (berdasarkan role kepsek/admin atau nama guru)
    var myNotifs = notifications.filter(function(n) {
        if (!n || n.read) return false; // Sembunyikan yang sudah dibaca dari badge utama
        var target = (n.target || '').toLowerCase();
        if (currentRole === 'admin') return true;
        if (currentRole === 'kepsek' && (target === 'kepsek' || target === 'kepala sekolah')) return true;
        if (target.includes(currentNama) || currentNama.includes(target)) return true;
        return false;
    });

    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (myNotifs.length > 0) {
            badge.innerText = myNotifs.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    var container = document.getElementById('notif-list-container');
    if (!container) return;
    container.innerHTML = '';

    // Ambil semua notifikasi untuk ditampilkan di dropdown (maksimal 10 terbaru)
    var allMyNotifs = notifications.filter(function(n) {
        var target = (n.target || '').toLowerCase();
        if (currentRole === 'admin') return true;
        if (currentRole === 'kepsek' && (target === 'kepsek' || target === 'kepala sekolah')) return true;
        if (target.includes(currentNama) || currentNama.includes(target)) return true;
        return false;
    }).slice().reverse().slice(0, 10);

    if (allMyNotifs.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-slate-400 font-medium">Tidak ada notifikasi baru.</div>';
        return;
    }

    allMyNotifs.forEach(function(n) {
        var item = document.createElement('div');
        item.className = "p-3 hover:bg-slate-50 transition flex items-start gap-2.5 " + (n.read ? "opacity-60 bg-white" : "bg-indigo-50/40");
        
        var dotIndicator = !n.read ? '<span class="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0"></span>' : '';
        
        item.innerHTML = `
            ${dotIndicator}
            <div class="flex-1">
                <div class="font-bold text-slate-800 text-xs">${n.title}</div>
                <p class="text-slate-600 text-[11px] mt-0.5 leading-snug">${n.message}</p>
                <span class="text-[9px] text-slate-400 mt-1 block">${n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function toggleNotificationDropdown(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    var dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderNotificationsUI();
        }
    }
}

function markAllNotificationsAsRead() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;
    var currentRole = (currentUser.role || '').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();

    var notifications = (window.appState && window.appState.notifications) ? window.appState.notifications : [];
    notifications.forEach(function(n) {
        var target = (n.target || '').toLowerCase();
        if (currentRole === 'admin' || (currentRole === 'kepsek' && target.includes('kepsek')) || target.includes(currentNama)) {
            n.read = true;
        }
    });

    if (typeof saveAppState === 'function') saveAppState();
    renderNotificationsUI();
}

// Tutup dropdown jika klik di luar
document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('notif-dropdown');
    if (dropdown && !dropdown.contains(e.target) && !e.target.closest('button[onclick*="toggleNotificationDropdown"]')) {
        dropdown.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    renderNotificationsUI();
});

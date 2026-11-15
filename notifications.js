// ==========================================================================
// Modul Notifikasi Otomatis & Belum Terbaca - SIMANTAP SLBN 2
// ==========================================================================

function addSystemNotification(targetRoleOrUser, title, message, referenceId) {
    if (!window.appState) window.appState = {};
    if (!window.appState.notifications) window.appState.notifications = [];

    var newNotif = {
        id: "notif_" + Date.now(),
        target: targetRoleOrUser, // Contoh: 'kepsek' atau nama guru
        title: title,
        message: message,
        referenceId: referenceId || '',
        read: false, // Status awal belum terbaca
        createdAt: new Date().toISOString()
    };

    window.appState.notifications.push(newNotif);
    
    // Simpan permanen ke localStorage
    if (typeof saveAppState === 'function') {
        saveAppState();
    } else {
        localStorage.setItem('sispko_app_state', JSON.stringify(window.appState));
    }
    
    // Refresh tampilan notifikasi seketika
    renderNotificationsUI();
}

function renderNotificationsUI() {
    var currentUser = window.appState && window.appState.currentUser ? window.appState.currentUser : null;
    if (!currentUser) return;

    var currentRole = (currentUser.role || '').toLowerCase();
    var currentNama = (currentUser.nama || currentUser.username || '').toLowerCase();
    var notifications = (window.appState && window.appState.notifications) ? window.appState.notifications : [];

    // Filter notifikasi sesuai akun yang sedang aktif
    var myNotifs = notifications.filter(function(n) {
        if (!n) return false;
        var target = (n.target || '').toLowerCase();
        if (currentRole === 'admin') return true;
        if ((currentRole === 'kepsek' || currentRole === 'kepala sekolah') && (target === 'kepsek' || target === 'kepala sekolah' || target === 'admin')) return true;
        if (target.includes(currentNama) || currentNama.includes(target)) return true;
        return false;
    });

    // Hitung pesan yang belum dibaca untuk badge merah
    var unreadList = myNotifs.filter(function(n) { return !n.read; });
    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (unreadList.length > 0) {
            badge.innerText = unreadList.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    var container = document.getElementById('notif-list-container');
    if (!container) return;
    container.innerHTML = '';

    var recentNotifs = myNotifs.slice().reverse().slice(0, 10);

    if (recentNotifs.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-slate-400 font-medium">Tidak ada notifikasi baru.</div>';
        return;
    }

    recentNotifs.forEach(function(n) {
        var item = document.createElement('div');
        item.className = "p-3 hover:bg-slate-50 transition flex items-start gap-2.5 " + (n.read ? "opacity-60 bg-white" : "bg-indigo-50/40");
        
        var unreadDot = !n.read ? '<span class="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0"></span>' : '';
        
        item.innerHTML = `
            ${unreadDot}
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
        if (currentRole === 'admin' || ((currentRole === 'kepsek' || currentRole === 'kepala sekolah') && target.includes('kepsek')) || target.includes(currentNama)) {
            n.read = true;
        }
    });

    if (typeof saveAppState === 'function') saveAppState();
    renderNotificationsUI();
}

document.addEventListener('DOMContentLoaded', function() {
    renderNotificationsUI();
});

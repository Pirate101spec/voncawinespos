document.addEventListener('DOMContentLoaded', () => {

    function activateTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.add('hidden');
        });
        document.querySelectorAll('aside nav a').forEach(l => {
            l.classList.remove('active-link');
        });
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) selectedContent.classList.remove('hidden');
        const selectedTab = document.querySelector(`aside nav a[data-tab="${tabId}"]`);
        if (selectedTab) selectedTab.classList.add('active-link');
    }

    // --- SESSION CHECK ---
    if (window.location.pathname.endsWith('index.html')) {
        fetch('assets/api/check_session.php')
            .then(res => res.json())
            .then(sessionData => {
                if (!sessionData.authenticated) {
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                    return;
                }

                sessionStorage.setItem('loggedInUser', JSON.stringify({
                    username: sessionData.username,
                    role: sessionData.role
                }));

                const user = sessionData;
                window.currentUser = user;

                const usernameEl = document.getElementById('usernameDisplay');
                if (usernameEl) usernameEl.textContent = user.username;

                if (user.role === 'admin') {
                    activateTab('posTab');
                } else {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'none';
                    });
                }
            })
            .catch(err => {
                console.error("⚠ Session check failed:", err);
                sessionStorage.clear();
                window.location.href = 'login.html';
            });
    }

    // --- LOGIN FORM ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');
            messageEl.classList.add('hidden');

            try {
                const response = await fetch('assets/api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const loginData = await response.json();

                if (loginData.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify({
                        username: loginData.user.username,
                        role: loginData.user.role
                    }));
                    window.location.href = 'index.html';
                } else {
                    messageEl.textContent = loginData.message || 'Login failed. Please try again.';
                    messageEl.classList.remove('hidden');
                }
            } catch (err) {
                console.error("Login request failed:", err);
                messageEl.textContent = 'Server error. Try again later.';
                messageEl.classList.remove('hidden');
            }
        });
    }

    // --- LOGOUT ---
    async function logout() {
        try {
            const res = await fetch('assets/api/logout.php', { method: 'POST' });
            const data = await res.json();
            console.log("Logout response:", data);
        } catch (e) {
            console.warn("Logout server-side failed:", e);
        }
        sessionStorage.clear();
        window.location.href = 'login.html';
    }

    const logoutBtn = document.querySelector('[data-tab="logoutTab"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
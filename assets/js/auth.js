document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is authenticated on the main app page
    if (window.location.pathname.endsWith('index.html')) {
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!user) {
            window.location.href = 'login.html';
        } else {
            console.log("User authenticated:", user);
            window.currentUser = user; // Make user data globally available
            
            // Hide admin-only tabs for cashiers
            if (user.role !== 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
            }
        }
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');
            messageEl.classList.add('hidden');

            const loginData = await apiFetch('login.php', 'POST', { username, password });
            
            if (loginData && loginData.success) {
                // Store user data and token in session storage
                sessionStorage.setItem('loggedInUser', JSON.stringify(loginData.user));
                window.location.href = 'index.html';
            } else {
                messageEl.textContent = loginData.message || 'Login failed. Please try again.';
                messageEl.classList.remove('hidden');
            }
        });
    }

    // Add or replace the logout function in your existing auth.js
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Attach logout function to the logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('[data-tab="logoutTab"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

});



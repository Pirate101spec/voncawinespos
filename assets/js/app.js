document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const toggleButton = document.querySelector('aside button');
    const logoutBtn = document.querySelector('[data-tab="logoutTab"]');
    const usernameDisplay = document.getElementById('usernameDisplay'); // You need to add this element to your HTML
    const navLinks = document.querySelectorAll('aside nav a[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');


    
    // Initial state: start with the sidebar collapsed
    body.classList.add('sidebar-collapsed');

    // Toggle function for the button
    toggleButton.addEventListener('click', () => {
        if (body.classList.contains('sidebar-collapsed')) {
            body.classList.remove('sidebar-collapsed');
            body.classList.add('sidebar-pinned');
        } else {
            body.classList.remove('sidebar-pinned');
            body.classList.add('sidebar-collapsed');
        }
    });

    // Your existing tab switching logic remains the same.
   
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const tabId = link.getAttribute('data-tab');

            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.classList.remove('hidden');
            }

            navLinks.forEach(navLink => navLink.classList.remove('active-link'));
            link.classList.add('active-link');

            if (!body.classList.contains('sidebar-pinned')) {
                body.classList.add('sidebar-collapsed');
            }
        });
    });

    // Sales Chart using Chart.js
    const salesCtx = document.getElementById('salesChart');

    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{
                    label: 'Sales (Ksh)',
                    data: [12000, 19000, 3000, 5000, 20000, 30000, 45000],
                    backgroundColor: 'rgba(52, 211, 153, 0.5)',
                    borderColor: 'rgba(52, 211, 153, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

 const switchTab = (tabName) => {
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tabName).classList.remove('hidden');
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            
            navLinks.forEach(navLink => navLink.classList.remove('active-link'));
            link.classList.add('active-link');
            
            switchTab(tabName);
        });
    });
    
    // Set initial tab based on URL hash if any
    const initialTab = window.location.hash.substring(1) || 'dashboardTab';
    switchTab(initialTab);
    const initialNavLink = document.querySelector(`[data-tab="${initialTab}"]`);
    if (initialNavLink) {
        initialNavLink.classList.add('active-link');
    }

   
    // Fetch and display username
    const fetchUserInfo = async () => {
        try {
            const response = await fetch('get_user_info.php');
            const result = await response.json();
            if (result.success) {
                usernameDisplay.textContent = result.username;
            } else {
                console.error('Failed to fetch user info.');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    // Handle logout link click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'logout.php';
        });
    }

    fetchUserInfo();


});


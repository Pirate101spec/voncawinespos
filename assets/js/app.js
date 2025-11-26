document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleButton = document.querySelector('aside button');
    const navLinks = document.querySelectorAll('aside nav a[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Sidebar state ---
    body.classList.add('sidebar-collapsed');

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('sidebar-collapsed');
            body.classList.toggle('sidebar-pinned');
        });
    }

    // --- Function to switch tabs ---
    const switchTab = (tabName) => {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Show the selected one
        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }

        // Update sidebar active link
        document.querySelectorAll('aside nav a[data-tab]').forEach(link => link.classList.remove('active-link'));
        const activeLink = document.querySelector(`aside nav a[data-tab="${tabName}"]`);
        if (activeLink) activeLink.classList.add('active-link');

        // Hide POS overlays when leaving POS tab
        if (tabName !== 'posTab') {
            document.querySelectorAll('#posTab .fixed').forEach(modal => modal.classList.add('hidden'));
        }
    };

    // --- Sidebar tab switching ---
    if (tabContents.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.dataset.tab;
                switchTab(tabName);

                // Collapse sidebar after switching (if not pinned)
                if (!body.classList.contains('sidebar-pinned')) {
                    body.classList.add('sidebar-collapsed');
                }
            });
        });
    }

    // --- Sales Chart (Dashboard only) ---
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
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // --- Default: show POS tab on page load ---
    switchTab('posTab');
});

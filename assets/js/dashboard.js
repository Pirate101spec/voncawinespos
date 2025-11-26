document.addEventListener('DOMContentLoaded', () => {

    // --- CARD ELEMENTS ---
    const cardTotalInvoices = document.getElementById('cardTotalInvoices');
    const cardTotalCustomers = document.getElementById('cardTotalCustomers');
    const cardTotalProducts = document.getElementById('cardTotalProducts');
    const cardRevenueToday = document.getElementById('cardRevenueToday');
    const lowStockList = document.getElementById('lowStockList');
    const recentTransactions = document.getElementById('recentTransactions');

    const lowStockModal = document.getElementById('lowStockModal');
    const lowStockModalBody = document.getElementById('lowStockModalBody');
    const recentTransactionsModal = document.getElementById('recentTransactionsModal');
    const recentTransactionsModalBody = document.getElementById('recentTransactionsModalBody');

    let chartSalesMonthly = null;
    let chartTopSellersInstance = null;

    // --- FETCH DASHBOARD STATS ---
    async function fetchDashboardStats() {
        try {
            const res = await fetch("assets/api/get_dashboard_stats.php");
            const data = await res.json();
            if (!data.success) return;

            // Update stat cards
            cardTotalInvoices.textContent = data.totalInvoices;
            cardTotalCustomers.textContent = data.totalCustomers;
            cardTotalProducts.textContent = data.totalProducts;
            cardRevenueToday.textContent = `Ksh ${data.revenueToday}`;

            // Low Stock
            lowStockList.innerHTML = "";
            lowStockModalBody.innerHTML = "";
            data.lowStock.forEach(item => {
                const div = document.createElement("div");
                div.textContent = `${item.name} — ${item.stock} left`;
                lowStockList.appendChild(div);

                const modalDiv = document.createElement("div");
                modalDiv.textContent = `${item.name} — ${item.stock} left`;
                lowStockModalBody.appendChild(modalDiv);
            });

            fetchRecentTransactions();
            fetchSalesMonthly();
            fetchTopSellers();

        } catch (err) {
            console.error(err);
        }
    }

    // --- FETCH RECENT TRANSACTIONS ---
    async function fetchRecentTransactions() {
        try {
            const res = await fetch("assets/api/get_recent_transactions.php");
            const data = await res.json();
            if (!data.success) return;

            recentTransactions.innerHTML = "";
            recentTransactionsModalBody.innerHTML = "";

            data.transactions.forEach(t => {
                const div = document.createElement("div");
                div.textContent = `${t.created_at} — Ksh ${t.total}`;
                recentTransactions.appendChild(div);

                const modalDiv = document.createElement("div");
                modalDiv.textContent = `${t.created_at} — Ksh ${t.total}`;
                recentTransactionsModalBody.appendChild(modalDiv);
            });

        } catch (err) {
            console.error(err);
        }
    }

    // --- SALES MONTHLY CHART ---
    async function fetchSalesMonthly() {
        try {
            const res = await fetch("assets/api/get_sales_monthly.php");
            const data = await res.json();
            if (!data.success) return;

            const ctx = document.getElementById("chartSalesMonthly").getContext("2d");
            const labels = data.sales.map(s => s.month);
            const totals = data.sales.map(s => parseFloat(s.total_sales));

            if (chartSalesMonthly) chartSalesMonthly.destroy();

            chartSalesMonthly = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: "Sales",
                        data: totals,
                        fill: false,
                        borderColor: "#000000",
                        backgroundColor: "#000000",
                        pointRadius: 5,
                        pointBackgroundColor: "#000000",
                        tension: 0.35
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true }, x: { ticks: { font: { size: 12 } } } }
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    // --- TOP SELLERS BAR CHART ---
    async function fetchTopSellers() {
        try {
            const res = await fetch("assets/api/get_top_sellers.php");
            const data = await res.json();
            if (!data.success) return;

            const ctx = document.getElementById("chartTopSellers").getContext("2d");
            const labels = data.topSellers.map(s => s.name);
            const totals = data.topSellers.map(s => parseInt(s.quantity_sold));

            if (chartTopSellersInstance) chartTopSellersInstance.destroy();

            chartTopSellersInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [{ label: "Units Sold", data: totals, backgroundColor: "rgb(255, 159, 64)" }]
                },
                options: { scales: { y: { beginAtZero: true } } }
            });
        } catch (err) {
            console.error(err);
        }
    }

    // --- MODAL LOGIC ---
    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    // Click to open Low Stock Modal
    lowStockList.parentElement.querySelector('h3').addEventListener('click', () => {
        openModal(lowStockModal);
    });

    // Click to open Recent Transactions Modal
    recentTransactions.parentElement.querySelector('h3').addEventListener('click', () => {
        openModal(recentTransactionsModal);
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.fixed');
            closeModal(modal);
        });
    });

    // Auto refresh every 1 minute
    fetchDashboardStats();
    setInterval(fetchDashboardStats, 60000);

});

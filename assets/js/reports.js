document.addEventListener('DOMContentLoaded', async () => {
    const reportsTab = document.getElementById('reportsTab');
    const filterReportBtn = document.getElementById('filterReportBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const topSellingProductsTableBody = document.getElementById('topSellingProductsTableBody');

    if (!reportsTab) return;

    let dailySalesChartInstance = null;
    let dailyReportsData = [];

    async function fetchReports(startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const response = await apiFetch('get_reports.php?' + params.toString());
        
        if (response && response.success) {
            dailyReportsData = response.dailySales;
            renderDailySalesChart();
            renderTopSellingProducts(response.topSelling);
        }
    }

    function renderDailySalesChart() {
        const labels = dailyReportsData.map(d => d.sale_date);
        const data = dailyReportsData.map(d => parseFloat(d.total_sales));

        if (dailySalesChartInstance) {
            dailySalesChartInstance.destroy();
        }
        
        const ctx = document.getElementById('dailySalesChart').getContext('2d');
        dailySalesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Sales (Ksh)',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderTopSellingProducts(topSelling) {
        topSellingProductsTableBody.innerHTML = '';
        topSelling.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2 text-sm">${item.name}</td>
                <td class="px-3 py-2 text-sm">${item.quantity_sold}</td>
                <td class="px-3 py-2 text-sm">Ksh ${item.total_revenue}</td>
            `;
            topSellingProductsTableBody.appendChild(row);
        });
    }

    filterReportBtn.addEventListener('click', () => {
        fetchReports(startDateInput.value, endDateInput.value);
    });

    exportReportBtn.addEventListener('click', async () => {
        const params = new URLSearchParams();
        if (startDateInput.value) params.append('start_date', startDateInput.value);
        if (endDateInput.value) params.append('end_date', endDateInput.value);
        
        const response = await fetch(`http://localhost/vonca_wines/export_report.php?${params.toString()}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `sales_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });

    fetchReports();
});

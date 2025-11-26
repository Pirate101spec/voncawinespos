document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterBtn = document.getElementById('filterReportBtn');
    const exportBtn = document.getElementById('exportReportBtn');
    const topSellingTable = document.getElementById('topSellingProductsTableBody');
    let dailyChart = null;

    async function fetchReports(start=null,end=null){
        const params = new URLSearchParams();
        if(start) params.append('start_date', start);
        if(end) params.append('end_date', end);

        try{
            const res = await fetch(`/wines/assets/api/get_reports.php?${params.toString()}`);

            const data = await res.json();
            if(!data.success) return console.error(data.message);

            renderDailyChart(data.dailySales);
            renderTopSelling(data.topSelling);
        }catch(err){console.error(err);}
    }

    function renderDailyChart(dailySales){
        const labels = dailySales.map(d=>d.sale_date);
        const values = dailySales.map(d=>parseFloat(d.total_sales));

        if(dailyChart) dailyChart.destroy();
        const ctx = document.getElementById('dailySalesChart').getContext('2d');
        dailyChart = new Chart(ctx, {
            type:'line',
            data:{ labels, datasets:[{ label:'Daily Sales', data:values, borderColor:'rgb(75,192,192)', backgroundColor:'rgba(75,192,192,0.2)', fill:true, tension:0.1 }] },
            options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
        });
    }

    function renderTopSelling(top){
        topSellingTable.innerHTML = '';
        if(top.length===0) topSellingTable.innerHTML = `<tr><td colspan="3" class="px-3 py-2 text-center">No data</td></tr>`;
        else top.forEach(item=>{
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2 text-sm">${item.name}</td>
                <td class="px-3 py-2 text-sm">${item.quantity_sold}</td>
                <td class="px-3 py-2 text-sm">Ksh ${item.total_revenue}</td>
            `;
            topSellingTable.appendChild(row);
        });
    }

    filterBtn.addEventListener('click', ()=>fetchReports(startDateInput.value,endDateInput.value));

    fetchReports(); // initial load
});

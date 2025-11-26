// ==============================
// INVOICE TAB SCRIPT
// assets/js/invoice.js
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    const invoiceTableBody = document.getElementById("invoiceTableBody");
    const invoiceSearch = document.getElementById("invoiceSearch");
    const invoiceStartDate = document.getElementById("invoiceStartDate");
    const invoiceEndDate = document.getElementById("invoiceEndDate");
    const invoiceFilterBtn = document.getElementById("invoiceFilterBtn");

    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");

    let invoices = [];          // All invoices from backend
    let filteredInvoices = [];  // After search/filter
    let currentPage = 1;
    let pageSize = 10;

    // =============================
    // FETCH INVOICE DATA
    // =============================
    async function loadInvoices() {
        try {
            const response = await fetch("assets/api/get_invoices.php");
            invoices = await response.json();
            filteredInvoices = invoices;
            renderInvoices();
        } catch (error) {
            console.error("Error loading invoices:", error);
        }
    }

    // =============================
    // RENDER TABLE + PAGINATION
    // =============================
    function renderInvoices() {
        invoiceTableBody.innerHTML = "";

        let start = (currentPage - 1) * pageSize;
        let end = start + pageSize;

        let pageItems = filteredInvoices.slice(start, end);

        if (pageItems.length === 0) {
            invoiceTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-gray-500">
                        No invoices found
                    </td>
                </tr>`;
            return;
        }

        pageItems.forEach(inv => {
            let row = `
                <tr class="border-t">
                    <td class="px-4 py-2 border">${inv.invoice_number}</td>
                    <td class="px-4 py-2 border">${inv.customer_name || "Walk-in Customer"}</td>
                    <td class="px-4 py-2 border">Ksh ${parseFloat(inv.subtotal).toFixed(2)}</td>
                    <td class="px-4 py-2 border">Ksh ${parseFloat(inv.tax).toFixed(2)}</td>
                    <td class="px-4 py-2 border font-bold">Ksh ${parseFloat(inv.total).toFixed(2)}</td>
                    <td class="px-4 py-2 border">${inv.payment_method}</td>
                    <td class="px-4 py-2 border">${inv.created_at}</td>
                </tr>
            `;
            invoiceTableBody.innerHTML += row;
        });

        // Update pagination
        let totalPages = Math.ceil(filteredInvoices.length / pageSize);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // =============================
    // PAGINATION EVENTS
    // =============================
    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderInvoices();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        let totalPages = Math.ceil(filteredInvoices.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderInvoices();
        }
    });

    // =============================
    // FILTER LOGIC (DATE + SEARCH)
    // =============================
    function applyFilters() {
        const keyword = invoiceSearch.value.toLowerCase();
        const start = invoiceStartDate.value;
        const end = invoiceEndDate.value;

        filteredInvoices = invoices.filter(inv => {

            // SEARCH filter
            let matchSearch =
                inv.customer_name.toLowerCase().includes(keyword) ||
                inv.invoice_number.toString().includes(keyword);

            // DATE filter
            let matchDate = true;

            if (start && inv.created_at < start) matchDate = false;
            if (end && inv.created_at > end + " 23:59:59") matchDate = false;

            return matchSearch && matchDate;
        });

        currentPage = 1;
        renderInvoices();
    }

    // Events
    invoiceSearch.addEventListener("input", applyFilters);
    invoiceFilterBtn.addEventListener("click", applyFilters);

    // Initial load
    loadInvoices();
});

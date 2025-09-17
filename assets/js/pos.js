function checkLowStock(product) {
    if (product.stock <= 5){
        alert('Low stock Alert: only ${product.stock} of ${product.name} left!');
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const cartTable = document.querySelector('#posTab table');
    const cartTableBody = document.getElementById('cartTableBody');
    const noItemsMessage = document.getElementById('noItemsMessage');
    const grandTotalSpan = document.getElementById('grandTotal');
    const subtotalLine = document.getElementById('subtotalLine');
    const subTotalAmountSpan = document.getElementById('subTotalAmount');
    const taxLine = document.getElementById('taxLine');
    const taxAmountSpan = document.getElementById('taxAmount');
    const discountBtn = document.getElementById('discountBtn');
    const adminDiscountBtn = document.getElementById('adminDiscountBtn');
    const payCashBtn = document.getElementById('payCashBtn');
    const payMpesaBtn = document.getElementById('payMpesaBtn');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    const errorSound = document.getElementById('errorSound');
    const beepSound = document.getElementById('beepSound');
    const dateTimeDisplay = document.getElementById('dateTimeDisplay');

    // Modals and related elements
    const cashPaymentModal = document.getElementById('cashPaymentModal');
    const cashTotalDisplay = document.getElementById('cashTotalDisplay');
    const amountGivenInput = document.getElementById('amountGiven');
    const changeDisplay = document.getElementById('changeDisplay');
    const completeCashBtn = document.getElementById('completeCashBtn');

    const mpesaInitialModal = document.getElementById('mpesaInitialModal');
    const initiateStkPushBtn = document.getElementById('initiateStkPushBtn');

    const mpesaPaymentModal = document.getElementById('mpesaPaymentModal');
    const mpesaTotalDisplay = document.getElementById('mpesaTotalDisplay');
    const mpesaPhoneInput = document.getElementById('mpesaPhone');
    const completeMpesaBtn = document.getElementById('completeMpesaBtn');

    const addCustomerModal = document.getElementById('addCustomerModal');
    const customerNameInput = document.getElementById('customerName');
    const customerPhoneInput = document.getElementById('customerPhone');
    const saveCustomerBtn = document.getElementById('saveCustomerBtn');

    const customersTab = document.getElementById('customersTab');
    const customersTableBody = document.getElementById('customersTableBody');

    // Constants & State Variables
    const TAX_RATE = 8; // 8%
    let products = []; // Will be populated by fetch
    let customers = []; // To store customer data
    let cart = {};
    let isWholesaleDiscountApplied = false;
    let customDiscount = 0; // Flat amount for admin discount
    let customerDetails = { name: 'N/A', phone: 'N/A' };

    // --- Core POS Functions ---

    async function fetchProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                const data = [
                    { id: 1, barcode: '1001', name: 'Whiskey', price: 2500, wholesalePrice: 2200, stock: 50 },
                    { id: 2, barcode: '1002', name: 'Red Wine', price: 1500, wholesalePrice: 1350, stock: 120 },
                    { id: 3, barcode: '1003', name: 'White Wine', price: 1300, wholesalePrice: 1150, stock: 80 },
                    { id: 4, barcode: '1004', name: 'Vodka', price: 2200, wholesalePrice: 2000, stock: 65 },
                    { id: 5, barcode: '1005', name: 'Gin', price: 1800, wholesalePrice: 1600, stock: 90 },
                    { id: 6, barcode: '1006', name: 'Tequila', price: 2800, wholesalePrice: 2500, stock: 45 },
                    { id: 7, barcode: '2001', name: 'Beer (Bottle)', price: 300, wholesalePrice: 270, stock: 200 },
                    { id: 8, barcode: '2002', name: 'Beer (Can)', price: 250, wholesalePrice: 220, stock: 250 },
                ];
                console.log("Product data fetched successfully.");
                resolve(data);
            }, 500);
        });
    }
    
    function playErrorSound() {
        if (errorSound) errorSound.play();
    }

    function playBeepSound() {
        if (beepSound) beepSound.play();
    }
    
    function updateCartDisplay() {
        cartTableBody.innerHTML = '';
        let subtotal = 0;

        if (Object.keys(cart).length === 0) {
            cartTable.classList.add('hidden');
            noItemsMessage.classList.remove('hidden');
        } else {
            cartTable.classList.remove('hidden');
            noItemsMessage.classList.add('hidden');
        }

        for (const productId in cart) {
            const item = cart[productId];
            const itemPrice = isWholesaleDiscountApplied ? item.wholesalePrice : item.price;
            const itemTotal = item.qty * itemPrice;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.className = 'hover:bg-green-50';
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap">${item.name}</td>
                <td class="px-3 py-2 whitespace-nowrap">
                    <input type="number" min="1" value="${item.qty}" class="w-16 text-center border rounded" onchange="updateQty(${item.id}, this.value)">
                </td>
                <td class="px-3 py-2 whitespace-nowrap">Ksh ${itemPrice.toFixed(2)}</td>
                <td class="px-3 py-2 whitespace-nowrap">Ksh ${itemTotal.toFixed(2)}</td>
                <td class="px-3 py-2 whitespace-nowrap">
                    <button class="text-red-600 hover:text-red-800" onclick="removeFromCart(${item.id})">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        }

        let finalTotal = subtotal;
        
        if (isWholesaleDiscountApplied) {
            subtotalLine.classList.remove('hidden');
            subTotalAmountSpan.textContent = `Ksh ${subtotal.toFixed(2)}`;
        } else if (customDiscount > 0) {
            finalTotal = subtotal - customDiscount;
            subtotalLine.classList.remove('hidden');
            subTotalAmountSpan.textContent = `Ksh ${subtotal.toFixed(2)} (-Ksh ${customDiscount.toFixed(2)})`;
        } else {
            subtotalLine.classList.add('hidden');
        }

        const taxAmount = finalTotal * (TAX_RATE / 100);
        finalTotal += taxAmount;
        taxLine.classList.remove('hidden');
        taxAmountSpan.textContent = `Ksh ${taxAmount.toFixed(2)}`;
        
        grandTotalSpan.textContent = `Ksh ${finalTotal.toFixed(2)}`;
    }

    function addToCart(product) {
        if (cart[product.id]) {
            cart[product.id].qty += 1;
        } else {
            cart[product.id] = { ...product, qty: 1 };
        }
        isWholesaleDiscountApplied = false;
        customDiscount = 0;
        updateCartDisplay();
        searchResults.classList.add('hidden');
        searchInput.value = '';
        playBeepSound();

        checkLowStock(product);
    }
    
    function resetCartAndTransaction() {
        cart = {};
        isWholesaleDiscountApplied = false;
        customDiscount = 0;
        customerDetails = { name: 'N/A', phone: 'N/A' };
        updateCartDisplay();
    }

    // --- Modal Functions ---
    window.closeModal = (id) => {
        document.getElementById(id).classList.add('hidden');
    };

    function showModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    function showCashPaymentModal() {
        if (Object.keys(cart).length === 0) {
            alert("Cart is empty. Nothing to pay.");
            return;
        }
        const total = parseFloat(grandTotalSpan.textContent.replace('Ksh ', ''));
        cashTotalDisplay.textContent = `Ksh ${total.toFixed(2)}`;
        amountGivenInput.value = '';
        changeDisplay.textContent = 'Ksh 0.00';
        showModal('cashPaymentModal');
        amountGivenInput.focus();
    }

    function showMpesaInitialModal() {
        if (Object.keys(cart).length === 0) {
            alert("Cart is empty. Nothing to pay.");
            return;
        }
        showModal('mpesaInitialModal');
    }

    function showMpesaPaymentModal() {
        closeModal('mpesaInitialModal');
        const total = parseFloat(grandTotalSpan.textContent.replace('Ksh ', ''));
        mpesaTotalDisplay.textContent = `Ksh ${total.toFixed(2)}`;
        showModal('mpesaPaymentModal');
        mpesaPhoneInput.focus();
    }

    function showAddCustomerModal() {
        customerNameInput.value = '';
        customerPhoneInput.value = '';
        showModal('addCustomerModal');
    }

    function processAddCustomer() {
        const name = customerNameInput.value.trim();
        const phone = customerPhoneInput.value.trim();
        if (name && phone) {
            customers.push({ name, phone, dateAdded: new Date().toISOString().slice(0, 10) });
            customerDetails = { name, phone };
            updateCustomersDisplay();
            closeModal('addCustomerModal');
            alert(`Customer ${name} added and selected for this transaction.`);
        } else {
            alert("Please enter both name and phone number.");
        }
    }

    function updateCustomersDisplay() {
        customersTableBody.innerHTML = '';
        customers.forEach(cust => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-100';
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap">${cust.name}</td>
                <td class="px-3 py-2 whitespace-nowrap">${cust.phone}</td>
                <td class="px-3 py-2 whitespace-nowrap">${cust.dateAdded}</td>
            `;
            customersTableBody.appendChild(row);
        });
    }

    // --- User Actions ---

    window.updateQty = (productId, newQty) => {
        const qty = parseInt(newQty);
        if (qty > 0) {
            cart[productId].qty = qty;
            isWholesaleDiscountApplied = false;
            customDiscount = 0;
            updateCartDisplay();
        }
    };

    window.removeFromCart = (productId) => {
        if (cart[productId]) {
            delete cart[productId];
            isWholesaleDiscountApplied = false;
            customDiscount = 0;
            updateCartDisplay();
        }
    };

    function applyWholesaleDiscount() {
        isWholesaleDiscountApplied = !isWholesaleDiscountApplied;
        customDiscount = 0;
        updateCartDisplay();
        discountBtn.textContent = isWholesaleDiscountApplied ? 'Wholesale Discount (Applied)' : 'Wholesale Discount';
    }

    function applyAdminDiscount() {
        const discountStr = prompt("Enter flat discount amount in KSh:");
        const discountValue = parseFloat(discountStr);
        if (!isNaN(discountValue) && discountValue >= 0) {
            customDiscount = discountValue;
            isWholesaleDiscountApplied = false;
            updateCartDisplay();
        } else {
            alert("Invalid discount amount. Please enter a valid number.");
        }
    }

    async function processTransaction(paymentMethod) {
        console.log(`Processing checkout for ${customerDetails.name} via ${paymentMethod}...`);

        for (const productId in cart) {
            const soldItem = cart[productId];
            const inventoryItem = products.find(p => p.id === soldItem.id);
            if (inventoryItem) {
                inventoryItem.stock -= soldItem.qty;
            }
        }

        // Generate and save receipt
        generateReceiptPDF(paymentMethod);
        
        // Reset POS state
        resetCartAndTransaction();
        alert("Transaction completed successfully!");
    }

    function generateReceiptPDF(paymentMethod) {
        if (Object.keys(cart).length === 0) {
            alert("Cart is empty. Nothing to print.");
            return;
        }
        
        const subtotal = parseFloat(subTotalAmountSpan.textContent.replace('Ksh ', ''));
        const tax = parseFloat(taxAmountSpan.textContent.replace('Ksh ', ''));
        const grandTotal = parseFloat(grandTotalSpan.textContent.replace('Ksh ', ''));

        const cartItemsHtml = Object.values(cart).map(item => {
            const itemPrice = isWholesaleDiscountApplied ? item.wholesalePrice : item.price;
            const itemTotal = item.qty * itemPrice;
            return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>Ksh ${itemPrice.toFixed(2)}</td>
                    <td>Ksh ${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        const receiptContent = `
            <style>
                body { font-family: sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                h2 { margin-bottom: 5px; }
                p { margin: 0; }
            </style>
            <h2>Receipt - Vonca Wines</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Customer:</strong> ${customerDetails.name}</p>
            <p><strong>Phone:</strong> ${customerDetails.phone}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${cartItemsHtml}</tbody>
            </table>
            <hr>
            <p>Subtotal: Ksh ${subtotal.toFixed(2)}</p>
            <p>Tax: Ksh ${tax.toFixed(2)}</p>
            <h3>Total: Ksh ${grandTotal.toFixed(2)}</h3>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        `;
        
        const pdf = new window.jspdf.jsPDF();
        pdf.html(receiptContent, {
            callback: (doc) => {
                doc.save(`receipt_${new Date().getTime()}.pdf`);
            },
            x: 10,
            y: 10
        });
    }

    // Function to update the date and time display
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const formattedDate = now.toLocaleDateString('en-US', options);
        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = formattedDate;
        }
    }

    // --- Event Listeners ---
    
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            const filteredProducts = products.filter(p => 
                p.barcode.includes(searchTerm) || p.name.toLowerCase().includes(searchTerm)
            );
            displaySearchResults(filteredProducts);
        } else {
            searchResults.classList.add('hidden');
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = event.target.value.trim();
            const product = products.find(p => p.barcode === searchTerm);
            if (product) {
                addToCart(product);
            } else {
                playErrorSound();
                alert("Barcode not found.");
            }
        }
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        if (results.length > 0) {
            results.forEach(product => {
                const resultItem = document.createElement('div');
                resultItem.className = "px-4 py-2 cursor-pointer hover:bg-gray-100";
                resultItem.textContent = `${product.name} (Ksh ${product.price})`;
                resultItem.addEventListener('click', () => {
                    addToCart(product);
                });
                searchResults.appendChild(resultItem);
            });
            searchResults.classList.remove('hidden');
        } else {
            searchResults.classList.add('hidden');
        }
    }

    // Hide search results when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.relative')) {
            searchResults.classList.add('hidden');
        }
    });

    payCashBtn.addEventListener('click', showCashPaymentModal);
    payMpesaBtn.addEventListener('click', showMpesaInitialModal);
    addCustomerBtn.addEventListener('click', showAddCustomerModal);
    discountBtn.addEventListener('click', applyWholesaleDiscount);
    adminDiscountBtn.addEventListener('click', applyAdminDiscount);
    printReceiptBtn.addEventListener('click', () => generateReceiptPDF("Not specified"));

    // Cash Modal Event Listeners
    amountGivenInput.addEventListener('input', () => {
        const total = parseFloat(grandTotalSpan.textContent.replace('Ksh ', ''));
        const amountGiven = parseFloat(amountGivenInput.value) || 0;
        const change = amountGiven - total;
        changeDisplay.textContent = `Ksh ${Math.max(0, change).toFixed(2)}`;
        changeDisplay.classList.toggle('text-red-500', change < 0);
    });

    completeCashBtn.addEventListener('click', () => {
        const total = parseFloat(grandTotalSpan.textContent.replace('Ksh ', ''));
        const amountGiven = parseFloat(amountGivenInput.value) || 0;
        if (amountGiven < total) {
            alert("Amount given is less than total.");
            return;
        }
        processTransaction('Cash');
        closeModal('cashPaymentModal');
    });

    // Mpesa Modal Event Listeners
    initiateStkPushBtn.addEventListener('click', showMpesaPaymentModal);

    completeMpesaBtn.addEventListener('click', () => {
        const phone = mpesaPhoneInput.value;
        if (!phone) {
            alert("Please enter a phone number.");
            return;
        }
        const confirmed = confirm(`Simulating M-Pesa push to ${phone}. Please confirm on their phone.`);
        if (confirmed) {
            processTransaction('M-Pesa');
            closeModal('mpesaPaymentModal');
        } else {
            alert("M-Pesa transaction canceled.");
        }
    });


    let searchTimeout = null;

    const performSearch = async (query) => {
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`search_products.php?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                renderSearchResults(result.data);
                searchResults.classList.remove('hidden');
            } else {
                searchResults.classList.add('hidden');
            }
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.classList.add('hidden');
        }
    };
    const filteredProducts = products.filter(p =>
        p.barcode.includes(searchTerm)

    );
    function
    addProductFromSearch(product){
        addToCart(product);
    }

    const renderSearchResults = (products) => {
        searchResults.innerHTML = '';
        products.forEach(product => {
            const resultItem = document.createElement('div');
            resultItem.className = 'p-2 hover:bg-gray-100 cursor-pointer';
            resultItem.textContent = `${product.name} (Ksh ${product.retail_price})`;
            resultItem.setAttribute('data-barcode', product.barcode);
            resultItem.addEventListener('click', () => {
                addToCart(product);
                addProductFromSearch(product);
                searchResults.classList.add('hidden');
                searchInput.value = '';
                focusSearch();
            });
            searchResults.appendChild(resultItem);
        });
    };

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300); // Debounce for 300ms
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });


    // Add this function to your pos.js file
function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    }
}

// Example of how you would call it:
// After a product is successfully added to the cart, call focusSearch();


    // Add Customer Modal Listener
    saveCustomerBtn.addEventListener('click', processAddCustomer);

    // Initial load
    products = await fetchProducts();
    updateCartDisplay();
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update every second
    updateCustomersDisplay(); // Initial display for customers tab

});


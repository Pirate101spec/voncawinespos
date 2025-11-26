// assets/js/pos.js
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const cartTableBody = document.getElementById("cartTableBody");

  const totalQtyEl = document.getElementById("totalQty");
  const subTotalAmount = document.getElementById("subTotalAmount");
  const taxAmount = document.getElementById("taxAmount");
  const grandTotal = document.getElementById("grandTotal");

  const payCashBtn = document.getElementById("payCashBtn");
  const payMpesaBtn = document.getElementById("payMpesaBtn");
  const discountBtn = document.getElementById("discountBtn");
  const printReceiptBtn = document.getElementById("printReceiptBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  const cashPaymentModal = document.getElementById("cashPaymentModal");
  const mpesaPaymentModal = document.getElementById("mpesaPaymentModal");
  const mpesaInitialModal = document.getElementById("mpesaInitialModal");
  const modals = document.querySelectorAll(".modal-cancel");

  const cashTotalDisplay = document.getElementById("cashTotalDisplay");
  const changeDisplay = document.getElementById("changeDisplay");
  const amountGiven = document.getElementById("amountGiven");
  const completeCashBtn = document.getElementById("completeCashBtn");

  const mpesaPhone = document.getElementById("mpesaPhone");
  const completeMpesaBtn = document.getElementById("completeMpesaBtn");
  const mpesaTotalDisplay = document.getElementById("mpesaTotalDisplay");
  const initiateStkPushBtn = document.getElementById("initiateStkPushBtn");

  const errorSound = document.getElementById("errorSound");
  const beepSound = document.getElementById("beepSound");

  const vatRate = 0.16;
  let wholesaleMode = false;
  let cart = [];
  discountBtn.textContent = "Wholesale Price: OFF ⚪";

  // --- Infinite Scroll State ---
  let currentQuery = "";
  let currentPage = 1;
  let loading = false;
  let allLoaded = false;

  // --- Toggle wholesale discount with animation ---
  discountBtn.addEventListener("click", () => {
    wholesaleMode = !wholesaleMode;

    if (wholesaleMode) {
      discountBtn.textContent = "Wholesale Price: ON ✅";
      discountBtn.classList.remove("bg-gray-200");
      discountBtn.classList.add("bg-green-300", "text-green-900", "font-semibold");
      beepSound.play();
    } else {
      discountBtn.textContent = "Wholesale Mode: OFF ⚪";
      discountBtn.classList.remove("bg-green-300", "text-green-900", "font-semibold");
      discountBtn.classList.add("bg-gray-200");
      errorSound.play();
    }

    const rows = document.querySelectorAll("#cartTableBody > div");
    rows.forEach(row => {
      row.classList.add("price-change");
      setTimeout(() => row.classList.remove("price-change"), 500);
    });

    renderCart();
    updateCartTotals();
  });

  // --- Search Products (with Infinite Scroll + barcode) ---
  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    searchResults.innerHTML = "";
    currentPage = 1;
    allLoaded = false;
    currentQuery = query;
    if (!query) return;
    await loadProducts(query, 1);
  });

  async function loadProducts(query, page = 1) {
    if (!query.trim()) {
      loading = false;
      return;
    }
    if (loading || allLoaded) return;
    loading = true;

    if (page === 1) {
      searchResults.innerHTML = `
        <div class="flex justify-center items-center py-4">
          <div class="loader"></div>
        </div>
      `;
    } else {
      const loader = document.createElement("div");
      loader.className = "loader mx-auto my-2";
      searchResults.appendChild(loader);
    }

    try {
      const data = await apiFetch(`search_products.php?query=${encodeURIComponent(query)}&page=${page}`);

      if (!data || !data.success) {
        if (page === 1) {
          searchResults.innerHTML = `
            <div class='p-3 text-red-500 text-center'>
              Error: ${data?.message || "Server error"}<br>
              <button id="retryBtn" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Retry</button>
            </div>`;
          document.getElementById("retryBtn").addEventListener("click", () => loadProducts(query, 1));
        }
        allLoaded = true;
        return;
      }

      const products = data.data || [];
      if (products.length === 0) {
        if (page === 1) {
          searchResults.innerHTML = `<div class='p-2 text-gray-500'>No products found</div>`;
        }
        allLoaded = true;
        return;
      }

      if (page === 1) searchResults.innerHTML = "";

      products.forEach((p) => {
        const div = document.createElement("div");
        div.className = "p-2 hover:bg-green-100 cursor-pointer text-sm";
        div.textContent = `${p.name} (Stock: ${p.stock}) - Ksh ${p.price}`;
        div.addEventListener("click", () => {
          addToCart(p);
          searchInput.value = "";
          searchResults.innerHTML = "";
        });
        searchResults.appendChild(div);
      });

      // barcode quick-add
      if (/^\d{8,13}$/.test(query) && products.length === 1) {
        addToCart(products[0]);
        searchInput.value = "";
        searchResults.innerHTML = "";
      }

      currentPage++;
    } catch (err) {
      console.error("Error loading products:", err);
      searchResults.innerHTML = `
        <div class='p-3 text-red-500 text-center'>
          Error loading products<br>
          <button id="retryBtn" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Retry</button>
        </div>`;
      document.getElementById("retryBtn").addEventListener("click", () => loadProducts(query, page));
    } finally {
      loading = false;
    }
  }

  searchResults.addEventListener("scroll", async () => {
    if (searchResults.scrollTop + searchResults.clientHeight >= searchResults.scrollHeight - 5) {
      await loadProducts(currentQuery, currentPage);
    }
  });

  function addToCart(product) {
    if (!product.stock || product.stock <= 0) {
      errorSound.play();
      alert("This product is out of stock or has no stock value!");
      return;
    }

    beepSound.play();

    const existing = cart.find((i) => i.id === product.id);
    const normalPrice = parseFloat(product.price);
    const wholesalePrice = parseFloat(product.wholesale_price || product.price);
    const price = wholesaleMode ? wholesalePrice : normalPrice;

    let isNewItem = false;

    if (existing) {
      if (existing.qty < product.stock) {
        existing.qty++;
      } else {
        errorSound.play();
        alert("Stock limit reached!");
      }
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        qty: 1,
        normalPrice,
        wholesalePrice,
        price,
        stock: Number(product.stock)
      });
      isNewItem = true;
    }

    renderCart(isNewItem);
  }

  function renderCart(scrollToBottom = false) {
    cartTableBody.innerHTML = "";

    if (cart.length === 0) {
      cartTableBody.innerHTML = `<div class="text-center text-gray-400 py-4">No items in cart</div>`;
      updateCartTotals();
      return;
    }

    cart.forEach((item, idx) => {
      item.price = wholesaleMode ? item.wholesalePrice : item.normalPrice;

      const row = document.createElement("div");
      row.className = "grid grid-cols-7 text-center text-sm border-b border-gray-200 py-2";
      row.innerHTML = `
      <div class="truncate px-2">${item.name}</div>
      <div>${item.stock}</div>
      <div>
        <input type="number" min="1" max="${item.stock}" value="${item.qty}"
          class="w-16 border rounded text-center qty-input">
      </div>
      <div>Ksh ${item.price.toFixed(2)}</div>
      <div>Ksh ${(item.qty * item.price).toFixed(2)}</div>
      <div>—</div>
      <div><button class="text-red-500 hover:underline remove-btn">Remove</button></div>
    `;

      const qtyInput = row.querySelector(".qty-input");
      qtyInput.addEventListener("change", (e) => {
        const qty = parseInt(e.target.value);
        if (qty > 0 && qty <= item.stock) {
          item.qty = qty;
          renderCart(false);
        } else {
          errorSound.play();
          e.target.value = item.qty;
        }
      });

      row.querySelector(".remove-btn").addEventListener("click", () => {
        cart.splice(idx, 1);
        renderCart(false);
      });

      cartTableBody.appendChild(row);
    });

    updateCartTotals();

    if (scrollToBottom && cart.length > 0) {
      const lastItem = cartTableBody.lastElementChild;
      if (lastItem) lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  // --- Update Totals ---
  function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * vatRate;
    const total = subtotal + tax;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    totalQtyEl.textContent = totalQty;
    subTotalAmount.textContent = subtotal.toFixed(2);
    taxAmount.textContent = tax.toFixed(2);
    grandTotal.textContent = `Ksh ${total.toFixed(2)}`;
  }

  // --- Clear Cart ---
  clearCartBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Cart is already empty!");
    if (confirm("Are you sure you want to clear all items?")) {
      cart = [];
      renderCart();
      clearCartBtn.classList.add("bg-green-400");
      setTimeout(() => clearCartBtn.classList.remove("bg-green-400"), 300);
      beepSound.play();
    }
  });

  // --- Cash Payment ---
  payCashBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Cart is empty!");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * vatRate;
    const total = subtotal + tax;

    cashTotalDisplay.textContent = `Ksh ${total.toFixed(2)}`;
    changeDisplay.textContent = "Ksh 0.00";
    amountGiven.value = "";
    cashPaymentModal.classList.remove("hidden");
  });

  amountGiven.addEventListener("input", () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal * (1 + vatRate);
    const given = parseFloat(amountGiven.value) || 0;
    const change = given - total;
    changeDisplay.textContent = `Ksh ${change >= 0 ? change.toFixed(2) : "0.00"}`;
  });

  completeCashBtn.addEventListener("click", async () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * vatRate;
    const total = subtotal + tax;
    const given = parseFloat(amountGiven.value) || 0;

    if (given < total) {
      errorSound.play();
      alert("Amount given is less than total!");
      return;
    }

    const saleData = {
      items: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
      cart: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })), // send both to be compatible
      subtotal,
      tax,
      total,
      payment_method: "Cash",
    };

    try {
      const response = await fetch("assets/api/process_sale.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (result.success) {
        beepSound.play();
        alert("Transaction completed successfully!");
        printReceipt(result, false);
        cart = [];
        renderCart();
        closeModals();
      } else {
        errorSound.play();
        alert(result.message || "Failed to save sale!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      errorSound.play();
      alert("An error occurred while saving the sale!");
    }
  });

  function printReceipt(data, isCopy = false) {
    const receipt = document.getElementById("receiptTemplate");
    const now = new Date();

    document.getElementById("receiptNo").textContent = data.sale_id || Math.floor(Math.random() * 100000);
    document.getElementById("receiptDate").textContent = now.toLocaleString();
    document.getElementById("receiptCashier").textContent = data.cashier || "Cashier";
    document.getElementById("receiptPayment").textContent = data.payment_method || "Cash";

    const itemsBody = document.getElementById("receiptItems");
    itemsBody.innerHTML = "";

    (data.items || []).forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${item.name}</td>
      <td class="text-right">${item.qty || item.quantity}</td>
      <td class="text-right">${parseFloat(item.price).toFixed(2)}</td>
      <td class="text-right">${parseFloat(item.total || (item.qty * item.price)).toFixed(2)}</td>`;
      itemsBody.appendChild(tr);
    });

    document.getElementById("receiptSubtotal").textContent = `Ksh ${parseFloat(data.subtotal || 0).toFixed(2)}`;
    document.getElementById("receiptTax").textContent = `Ksh ${parseFloat(data.tax || 0).toFixed(2)}`;
    document.getElementById("receiptTotal").textContent = `Ksh ${parseFloat(data.total || 0).toFixed(2)}`;

    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            ${isCopy ? `
            body::before {
              content: "COPY";
              position: fixed;
              top: 40%;
              left: 20%;
              font-size: 80px;
              color: rgba(200, 200, 200, 0.25);
              transform: rotate(-30deg);
              z-index: 0;
            }` : ""}
          </style>
        </head>
        <body>${receipt.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      if (!isCopy) setTimeout(() => printWindow.close(), 800);
    };
  }

  // --- M-Pesa Payment flow (Daraja STK Push) ---
  payMpesaBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Cart is empty!");
    mpesaTotalDisplay.textContent = grandTotal.textContent;
    if (mpesaPhone) mpesaPhone.value = "";
    mpesaPaymentModal.classList.remove("hidden");
  });

  completeMpesaBtn.addEventListener("click", async () => {
    if (cart.length === 0) return alert("Cart is empty!"); // guard - ensure cart still has items

    const phone = mpesaPhone.value.trim();
    if (!phone.match(/^2547\d{8}$/)) {
      errorSound.play();
      alert("Invalid phone number! Use 2547XXXXXXXX");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * vatRate;
    const total = subtotal + tax;

    mpesaPaymentModal.classList.add("hidden");
    mpesaInitialModal.classList.remove("hidden");

    // disable confirm to prevent double clicks while initiating/polling
    completeMpesaBtn.disabled = true;

    try {
      const initResp = await initiateStkPush(phone, total);

      if (!initResp || !initResp.success) {
        mpesaInitialModal.classList.add("hidden");
        completeMpesaBtn.disabled = false;
        errorSound.play();
        alert(initResp?.message || "Failed to initiate STK Push.");
        return;
      }

      // checkoutRequestID may be in several possible keys depending on backend
      const checkoutRequestID = initResp.checkoutRequestID || initResp.CheckoutRequestID || initResp.checkout_request_id || initResp.data?.CheckoutRequestID;
      if (!checkoutRequestID) {
        mpesaInitialModal.classList.add("hidden");
        completeMpesaBtn.disabled = false;
        errorSound.play();
        console.warn("Initiation response:", initResp);
        alert("No checkout ID received from STK initiation.");
        return;
      }

      // Poll for status
      const pollResult = await pollStkStatus(checkoutRequestID, 20, 3000); // 20 attempts, 3s interval
      mpesaInitialModal.classList.add("hidden");
      completeMpesaBtn.disabled = false;

      if (pollResult && pollResult.success && (pollResult.status === "SUCCESS" || pollResult.status === "COMPLETED")) {
        // Save sale server-side. Send both 'items' and 'cart' to be compatible with either save endpoint.
        const salePayload = {
          items: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
          cart: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
          subtotal,
          tax,
          total,
          payment_method: "M-Pesa",
          mpesa: pollResult // include mpesa transaction data if desired
        };

        const response = await fetch("assets/api/process_sale.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salePayload),
        });

        const result = await response.json();

        if (result.success) {
          beepSound.play();
          alert("Payment and sale saved successfully!");
          printReceipt(result, false);
          cart = [];
          renderCart();
          closeModals();
        } else {
          errorSound.play();
          console.error("Save sale after mpesa success response:", result);
          alert(result.message || "Sale save failed after payment.");
        }
      } else {
        errorSound.play();
        console.warn("MPESA poll result:", pollResult);
        alert(pollResult?.message || "Payment not completed or timed out.");
      }
    } catch (err) {
      mpesaInitialModal.classList.add("hidden");
      completeMpesaBtn.disabled = false;
      console.error("MPesa error:", err);
      errorSound.play();
      alert("An error occurred while processing M-Pesa payment.");
    }
  });

  if (initiateStkPushBtn) {
    initiateStkPushBtn.addEventListener("click", () => {
      // fallback to the single-step flow
      completeMpesaBtn.click();
    });
  }

  // --- STK Push helpers ---
  async function initiateStkPush(phone, amount) {
    try {
      const payload = { phone, amount, accountRef: `Sale_${Date.now()}`, description: "Vonca POS Sale" };
      // apiFetch helper will POST JSON to API_BASE_URL + endpoint
      const resp = await apiFetch("assets/api/initiate_stk_push.php", "POST", payload);
      return resp;
    } catch (err) {
      console.error("initiateStkPush error:", err);
      return { success: false, message: "Network error initiating STK" };
    }
  }

  async function checkStkStatusOnce(checkoutRequestID) {
    try {
      const resp = await apiFetch("assets/api/check_stk_status.php", "POST", { checkoutRequestID });
      return resp;
    } catch (err) {
      console.error("checkStkStatusOnce error:", err);
      return null;
    }
  }

  async function pollStkStatus(checkoutRequestID, attempts = 15, interval = 3000) {
    for (let i = 0; i < attempts; i++) {
      const res = await checkStkStatusOnce(checkoutRequestID);
      if (res && res.success && res.status && res.status !== "PENDING") {
        return res;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return { success: false, message: "Payment timed out" };
  }

  // --- Legacy processPayment kept for compatibility ---
  function processPayment(method) {
    if (method === "M-Pesa") {
      payMpesaBtn.click();
      return;
    }

    const saleData = {
      items: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
      cart: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
      subtotal: parseFloat(subTotalAmount.textContent),
      tax: parseFloat(taxAmount.textContent),
      total: parseFloat(grandTotal.textContent.replace("Ksh ", "")),
      payment_method: method,
    };

    fetch("assets/api/process_sale.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          beepSound.play();
          printReceipt(data, false);
          cart = [];
          renderCart();
        } else {
          errorSound.play();
          alert(data.message || "Failed to save sale!");
        }
      })
      .catch((err) => {
        errorSound.play();
        console.error("Payment error:", err);
      });
  }

  printReceiptBtn.addEventListener("click", () => {
    printReceipt({
      sale_id: Math.floor(Math.random() * 100000),
      cashier: localStorage.getItem("username") || "Cashier",
      payment_method: "Manual",
      items: cart,
      subtotal: parseFloat(subTotalAmount.textContent),
      tax: parseFloat(taxAmount.textContent),
      total: parseFloat(grandTotal.textContent.replace("Ksh ", "")),
    }, true);
  });

  // --- Close Modals ---
  modals.forEach((btn) => btn.addEventListener("click", closeModals));
  function closeModals() {
    document.querySelectorAll(".fixed").forEach((modal) => modal.classList.add("hidden"));
  }

  // --- Clock Display ---
  const dateTimeDisplay = document.getElementById("dateTimeDisplay");
  setInterval(() => {
    const now = new Date();
    if (dateTimeDisplay) dateTimeDisplay.textContent = now.toLocaleString();
  }, 1000);

  // --- Initial render ---
  renderCart();
});

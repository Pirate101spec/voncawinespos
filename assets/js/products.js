document.addEventListener("DOMContentLoaded", () => {
    const productsTableBody = document.getElementById("productsTablebody");
    const addProductBtn = document.getElementById("addProductBtn");

    const productModal = document.getElementById("productModal");
    const productForm = document.getElementById("productForm");
    const productModalTitle = document.getElementById("productModalTitle");
    const productIdInput = document.getElementById("productId");

    const addStockModal = document.getElementById("addStockModal");
    const saveStockBtn = document.getElementById("saveStockBtn");

    let editingProductId = null;

    // ------------------------
    // 🔔 Toast Notification
    // ------------------------
    const showToast = (message, type = "success") => {
        const toast = document.createElement("div");
        toast.className = `fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg text-white text-sm z-50 ${
            type === "success" ? "bg-green-600" : "bg-red-600"
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    };

    // ------------------------
    // 📌 Fetch Products
    // ------------------------
    const fetchProducts = async () => {
        try {
            const res = await fetch("assets/api/get_products.php");
            const data = await res.json();

            if (data.success) {
                renderProducts(data.data);
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error loading products", "error");
        }
    };

    // ------------------------
    // 📌 Render Products Table
    // ------------------------
    function renderProducts(products) {
        productsTableBody.innerHTML = "";

        products.forEach(p => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="px-3 py-2">${p.barcode}</td>
                <td class="px-3 py-2">${p.name}</td>
                <td class="px-3 py-2">${p.retail_price}</td>
                <td class="px-3 py-2">${p.wholesale_price}</td>
                <td class="px-3 py-2">${p.stock}</td>

                <td class="px-3 py-2 space-x-1">

                    <button class="edit-product-btn bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        data-id="${p.id}">
                        Edit
                    </button>

                    <button class="add-stock-btn bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        data-id="${p.id}">
                        Add Stock
                    </button>

                    <button class="delete-product-btn bg-red-600 text-white px-2 py-1 rounded text-xs"
                        data-id="${p.id}">
                        Delete
                    </button>
                </td>
            `;

            productsTableBody.appendChild(tr);
        });
    }

    // ------------------------
    // ➕ Add New Product
    // ------------------------
    addProductBtn.addEventListener("click", () => {
        editingProductId = null;
        productModalTitle.textContent = "Add New Product";
        productForm.reset();
        productIdInput.value = "";
        productModal.classList.remove("hidden");
    });

    // ------------------------
    // 📝 Open Edit Product Modal
    // ------------------------
    const openEditModal = async (id) => {
        editingProductId = id;
        productModalTitle.textContent = "Edit Product";

        try {
            const res = await fetch(`assets/api/get_product.php?id=${id}`);
            const data = await res.json();

            if (!data.success) return showToast("Failed to load product", "error");

            const p = data.product;

            productIdInput.value = p.id;
            document.getElementById("productBarcode").value = p.barcode;
            document.getElementById("productName").value = p.name;
            document.getElementById("retailPrice").value = p.retail_price;
            document.getElementById("wholesalePrice").value = p.wholesale_price;
            document.getElementById("productStock").value = p.stock;

            productModal.classList.remove("hidden");
        } catch (err) {
            showToast("Error loading product", "error");
        }
    };

    // ------------------------
    // 💾 Save Add/Edit Product
    // ------------------------
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            id: editingProductId,
            barcode: document.getElementById("productBarcode").value,
            name: document.getElementById("productName").value,
            retail_price: document.getElementById("retailPrice").value,
            wholesale_price: document.getElementById("wholesalePrice").value,
            stock: document.getElementById("productStock").value,
        };

        const url = editingProductId
            ? "assets/api/edit_product.php"
            : "assets/api/add_product.php";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                showToast(data.message, "success");
                productModal.classList.add("hidden");
                fetchProducts();
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Error saving product", "error");
        }
    });

    // ------------------------
    // ❌ Delete Product
    // ------------------------
    const deleteProduct = async (id) => {
        if (!confirm("Delete this product?")) return;

        try {
            const res = await fetch("assets/api/delete_product.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
                showToast("Deleted successfully", "success");
                fetchProducts();
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Error deleting", "error");
        }
    };

    // ------------------------
    // 📦 OPEN Add Stock Modal
    // ------------------------
    const openAddStockModal = (id) => {
        document.getElementById("addStockProductId").value = id;
        document.getElementById("addStockQuantity").value = "";
        addStockModal.classList.remove("hidden");
    };

    // ------------------------
    // 💾 Save Stock Update
    // ------------------------
    saveStockBtn.addEventListener("click", async () => {
        const id = document.getElementById("addStockProductId").value;
        const qty = parseInt(document.getElementById("addStockQuantity").value);

        if (!qty || qty <= 0) return showToast("Invalid quantity", "error");

        try {
            const res = await fetch("assets/api/add_stock.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, quantity: qty }),
            });

            const data = await res.json();

            if (data.success) {
                showToast("Stock updated", "success");
                addStockModal.classList.add("hidden");
                fetchProducts();
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Error updating stock", "error");
        }
    });

    // ------------------------
    // 🧩 ACTION BUTTONS (Delegated)
    // ------------------------
    document.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-product-btn");
        const addStockBtn = e.target.closest(".add-stock-btn");
        const deleteBtn = e.target.closest(".delete-product-btn");

        if (editBtn) openEditModal(editBtn.dataset.id);
        if (addStockBtn) openAddStockModal(addStockBtn.dataset.id);
        if (deleteBtn) deleteProduct(deleteBtn.dataset.id);
    });

    // ------------------------
    // ❌ Close Modals
    // ------------------------
    document.querySelectorAll(".modal-cancel").forEach((btn) => {
        btn.addEventListener("click", () => {
            productModal.classList.add("hidden");
            addStockModal.classList.add("hidden");
        });
    });

    productModal.addEventListener("click", (e) => {
        if (e.target === productModal) productModal.classList.add("hidden");
    });

    addStockModal.addEventListener("click", (e) => {
        if (e.target === addStockModal) addStockModal.classList.add("hidden");
    });

    // ------------------------
    // 🚀 INITIAL LOAD
    // ------------------------
    fetchProducts();
});

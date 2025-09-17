document.addEventListener('DOMContentLoaded', () => {
    const productsTableBody = document.getElementById('productsTablebody');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');

    const fetchProducts = async () => {
        try {
            const response = await fetch('get_products.php');
            const result = await response.json();
            if (result.success) {
                renderProducts(result.data);
            } else {
                console.error('Failed to fetch products:', result.message);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const renderProducts = (products) => {
        productsTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2 text-sm">${product.barcode}</td>
                <td class="px-3 py-2 text-sm">${product.name}</td>
                <td class="px-3 py-2 text-sm">Ksh ${parseFloat(product.retail_price).toFixed(2)}</td>
                <td class="px-3 py-2 text-sm">Ksh ${parseFloat(product.wholesale_price).toFixed(2)}</td>
                <td class="px-3 py-2 text-sm">${product.stock}</td>
                <td class="px-3 py-2 text-sm">
                    <button class="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                    <button class="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    };

    addProductBtn.addEventListener('click', () => {
        productForm.reset();
        productModal.classList.remove('hidden');
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            barcode: document.getElementById('productBarcode').value,
            name: document.getElementById('productName').value,
            retail_price: document.getElementById('retailPrice').value,
            wholesale_price: document.getElementById('wholesalePrice').value,
            stock: document.getElementById('productStock').value,
        };

        try {
            const response = await fetch('add_product.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                alert('Product added successfully!');
                productModal.classList.add('hidden');
                fetchProducts();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('An error occurred. Please try again.');
        }
    });

    fetchProducts();
});

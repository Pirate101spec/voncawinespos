// Sample product list (you can load from products.json or from backend later)
let products = [
  { id: 1, name: "Coca Cola", barcode: "12345", price: 50, stock: 30 },
  { id: 2, name: "Whisky", barcode: "67890", price: 1200, stock: 10 },
  { id: 3, name: "Beer", barcode: "11122", price: 150, stock: 50 },
];

// Display Inventory
function displayInventory(list = products) {
  const tbody = document.getElementById("inventoryTable");
  tbody.innerHTML = "";

  list.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${p.id}</td>
      <td class="border p-2">${p.name}</td>
      <td class="border p-2">${p.barcode}</td>
      <td class="border p-2">KES ${p.price}</td>
      <td class="border p-2">${p.stock}</td>
      <td class="border p-2">
        <button onclick="editProduct(${p.id})" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Search
document.getElementById("inventorySearch").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.barcode.toString().includes(query)
  );
  displayInventory(filtered);
});

// Add product
document.getElementById("addProductBtn").addEventListener("click", () => {
  alert("Add product form coming soon 🚀");
});

// Edit product
function editProduct(id) {
  alert("Editing product " + id);
}

// Delete product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(p => p.id !== id);
    displayInventory(products);
  }
}

// Load on page open
displayInventory(products);

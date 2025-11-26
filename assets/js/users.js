document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.getElementById("usersTableBody");
  const addUserBtn = document.getElementById("addUserBtn");
  const addUserModal = document.getElementById("addUserModal");
  const addUserForm = document.getElementById("addUserForm");

  let usersCache = [];

  // --- Toast utility ---
  function showToast(message, type = "success") {
    const id = `toast-${Date.now()}`;
    const toast = document.createElement("div");
    toast.id = id;
    toast.className =
      "fixed right-5 bottom-8 z-50 px-4 py-2 rounded shadow-md text-sm transition-opacity duration-300";
    toast.style.opacity = "0";
    toast.textContent = message;
    toast.style.backgroundColor = type === "success" ? "#059669" : "#DC2626";
    toast.style.color = "#fff";
    document.body.appendChild(toast);

    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Helper: escape HTML ---
  function escapeHtml(s = "") {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // --- Fetch users ---
  async function fetchUsers() {
    try {
      const res = await fetch("assets/api/get_users.php", {
        credentials: "same-origin",
      });

      // Handle non-JSON response (like PHP warnings or HTML)
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON:", text);
        showToast("Invalid response from server", "error");
        return;
      }

      if (!data.success) {
        showToast(data.message || "Unauthorized", "error");
        return;
      }

      const list = data.data || data.users || [];
      usersCache = list;
      renderUsers(list);
    } catch (err) {
      console.error("Fetch users failed:", err);
      showToast("Error loading users", "error");
    }
  }

  // --- Render users table ---
  function renderUsers(list) {
    usersTableBody.innerHTML = "";

    if (!list || list.length === 0) {
      usersTableBody.innerHTML = `
        <tr><td colspan="3" class="px-3 py-4 text-sm text-gray-500 text-center">No users found</td></tr>
      `;
      return;
    }

    list.forEach((user) => {
      const tr = document.createElement("tr");
      const roleBadge =
        user.role === "admin"
          ? `<span class="inline-block px-2 py-1 text-xs rounded bg-green-600 text-white">Admin</span>`
          : `<span class="inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-800">Cashier</span>`;

      tr.innerHTML = `
        <td class="px-3 py-2 text-sm">${escapeHtml(user.username)}</td>
        <td class="px-3 py-2 text-sm">${roleBadge}</td>
        <td class="px-3 py-2 text-sm">
          <button class="reset-btn bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded text-xs mr-2" data-id="${user.id}" data-username="${escapeHtml(user.username)}">Reset PW</button>
          <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" data-id="${user.id}" data-username="${escapeHtml(user.username)}">Delete</button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", onDeleteBtn);
    });
    document.querySelectorAll(".reset-btn").forEach((btn) => {
      btn.addEventListener("click", onResetBtn);
    });
  }

  // --- Delete user ---
  async function onDeleteBtn(e) {
    const id = e.currentTarget.dataset.id;
    const username = e.currentTarget.dataset.username;

    if (!confirm(`Delete user "${username}"?`)) return;

    try {
      const res = await fetch("assets/api/delete_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("User deleted successfully");
        fetchUsers();
      } else {
        showToast(data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting user", "error");
    }
  }

  // --- Reset password ---
  async function onResetBtn(e) {
    const id = e.currentTarget.dataset.id;
    const username = e.currentTarget.dataset.username;

    const newPassword = prompt(`Enter a new password for ${username}:`);
    if (!newPassword) return;

    try {
      const res = await fetch("assets/api/reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password reset successful");
      } else {
        showToast(data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error resetting password", "error");
    }
  }

  // --- Add user ---
  addUserBtn.addEventListener("click", () => {
    addUserModal.classList.remove("hidden");
  });

  document.querySelectorAll(".modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => addUserModal.classList.add("hidden"));
  });

  addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("addUsername").value.trim();
    const password = document.getElementById("addPassword").value.trim();
    const role = document.getElementById("userRole").value;

    if (!username || !password) {
      showToast("Username and password required", "error");
      return;
    }

    const res = await fetch("assets/api/add_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("User added successfully");
      addUserModal.classList.add("hidden");
      fetchUsers();
    } else {
      showToast(data.message || "Failed to add user", "error");
    }
  });

  // --- Init ---
  fetchUsers();
});
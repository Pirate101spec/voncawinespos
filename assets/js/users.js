document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    const addUserForm = document.getElementById('addUserForm');

    const fetchUsers = async () => {
        try {
            const response = await fetch('get_users.php');
            const result = await response.json();
            if (result.success) {
                renderUsers(result.data);
            } else {
                console.error('Failed to fetch users:', result.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const renderUsers = (users) => {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2 text-sm">${user.username}</td>
                <td class="px-3 py-2 text-sm">${user.role}</td>
                <td class="px-3 py-2 text-sm">
                    <button class="bg-red-500 text-white px-2 py-1 rounded text-xs" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    };

    addUserBtn.addEventListener('click', () => {
        addUserForm.reset();
        addUserModal.classList.remove('hidden');
    });

    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            username: document.getElementById('addUsername').value,
            password: document.getElementById('addPassword').value,
            role: document.getElementById('userRole').value,
        };

        try {
            const response = await fetch('add_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                alert('User added successfully!');
                addUserModal.classList.add('hidden');
                fetchUsers();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('An error occurred. Please try again.');
        }
    });

    fetchUsers();
});

// A simple delete function
window.deleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch('delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId }),
            });
            const result = await response.json();
            if (result.success) {
                alert('User deleted successfully!');
                fetchUsers();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred. Please try again.');
        }
    }
};

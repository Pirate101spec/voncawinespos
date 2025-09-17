<?php
require 'auth.php'; // Protect this page
require 'db.php';   // DB Connection

// Handle Form Submission
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];
    $role = $_POST["role"];

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    if ($stmt->execute([$username, $hashedPassword, $role])) {
        $message = "User '$username' added successfully!";
    } else {
        $message = "Error adding user.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add New User</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/tailwind.min.css">
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Add New User</h2>

        <?php if (isset($message)): ?>
            <div class="mb-4 text-green-600 font-semibold"><?= $message; ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="mb-4">
                <label class="block mb-1">Username</label>
                <input type="text" name="username" required class="w-full border p-2 rounded">
            </div>
            <div class="mb-4">
                <label class="block mb-1">Password</label>
                <input type="password" name="password" required class="w-full border p-2 rounded">
            </div>
            <div class="mb-4">
                <label class="block mb-1">Role</label>
                <select name="role" class="w-full border p-2 rounded">
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Add User</button>
        </form>
    </div>
</body>
</html>

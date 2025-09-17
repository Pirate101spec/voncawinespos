<?php
require 'db.php';

$username = 'admin1';
$password = 'adminpass'; // The password you will use to login
$role = 'admin';

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert into DB
$stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
$stmt->execute([$username, $hashedPassword, $role]);

echo "Admin user inserted successfully!";
?>

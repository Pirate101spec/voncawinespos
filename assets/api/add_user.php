<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
session_start();
header('Content-Type: application/json');

require_once 'db.php'; // PDO connection

$response = ["success" => false, "message" => ""];

try {
    // ✅ Only admins can add users
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    // ✅ Accept JSON
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['username'], $data['password'], $data['role'])) {
        throw new Exception("Missing required fields");
    }

    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    $role = $data['role'] === 'admin' ? 'admin' : 'cashier'; // prevent invalid roles

    // Insert
    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$username, $password, $role]);

    $response = ["success" => true, "message" => "User added successfully"];

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
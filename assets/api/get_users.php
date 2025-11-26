<?php
// assets/api/get_users.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
session_start();
header('Content-Type: application/json');

require_once 'db.php'; // PDO connection

$response = ['success' => false, 'data' => []];

try {
    // Only allow admins to fetch user list
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }

    $stmt = $pdo->query("SELECT id, username, role FROM users ORDER BY id DESC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['data'] = $users;

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Error fetching users: " . $e->getMessage();
}

echo json_encode($response);
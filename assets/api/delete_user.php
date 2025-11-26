<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
session_start();
header('Content-Type: application/json');

require_once 'db.php';

$response = ["success" => false, "message" => ""];

try {
    // ✅ Only admins can delete
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['id'])) {
        throw new Exception("User ID required");
    }

    $userId = intval($data['id']);

    // Prevent deleting yourself
    if ($userId === $_SESSION['user_id']) {
        throw new Exception("You cannot delete your own account.");
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() > 0) {
        $response = ["success" => true, "message" => "User deleted successfully"];
    } else {
        $response = ["success" => false, "message" => "User not found"];
    }

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
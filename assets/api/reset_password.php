<?php
// assets/api/reset_password.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$response = ["success" => false, "message" => ""];

try {
    // ✅ Check admin privileges
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    // ✅ Parse JSON body
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['id']) || !isset($data['new_password'])) {
        throw new Exception("Missing required fields");
    }

    $userId = intval($data['id']);
    $newPassword = trim($data['new_password']);
    if (strlen($newPassword) < 4) {
        throw new Exception("Password must be at least 4 characters long.");
    }

    // ✅ Hash password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // ✅ Update password in database
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $userId]);

    if ($stmt->rowCount() > 0) {
        $response = ["success" => true, "message" => "Password reset successfully"];
        // ✅ Log this action
        $logStmt = $pdo->prepare("INSERT INTO user_logs (user_id, action, performed_by, timestamp) VALUES (?, ?, ?, NOW())");
        $logStmt->execute([$userId, 'Password Reset', $_SESSION['user_id']]);
    } else {
        $response = ["success" => false, "message" => "User not found or no changes made"];
    }

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
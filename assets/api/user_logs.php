<?php
// assets/api/user_logs.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

try {
    // ✅ Admin-only access
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    // Handle GET: fetch logs
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("
            SELECT l.id, u.username AS affected_user, a.username AS performed_by, 
                   l.action, l.timestamp 
            FROM user_logs l
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN users a ON l.performed_by = a.id
            ORDER BY l.timestamp DESC
            LIMIT 100
        ");
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "logs" => $logs]);
        exit;
    }

    // Handle POST: record manually
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['user_id'], $data['action'])) {
            throw new Exception("Missing required fields.");
        }

        $stmt = $pdo->prepare("INSERT INTO user_logs (user_id, action, performed_by, timestamp) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$data['user_id'], $data['action'], $_SESSION['user_id']]);
        echo json_encode(["success" => true, "message" => "Log recorded successfully"]);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = ['success' => false, 'username' => null];

if (isset($_SESSION['user_id'])) {
    require_once 'assets/api/db.php';
    try {
        $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $response['success'] = true;
            $response['username'] = $user['username'];
        }
    } catch (Exception $e) {
        // Handle error gracefully
    }
}

echo json_encode($response);
?>

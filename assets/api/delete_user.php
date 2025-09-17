<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php';

$response = ['success' => false, 'message' => 'Invalid request method.'];

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['id'] ?? null;

    if (!$userId) {
        $response['message'] = 'User ID is required.';
        echo json_encode($response);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        $response['success'] = true;
        $response['message'] = 'User deleted successfully.';
    } catch (Exception $e) {
        $response['message'] = 'Error deleting user: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>

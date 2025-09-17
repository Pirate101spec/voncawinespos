<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        $response['message'] = 'Product ID is required.';
        echo json_encode($response);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        $response['success'] = true;
        $response['message'] = 'Product deleted successfully.';
    } catch (Exception $e) {
        $response['message'] = 'Error deleting product: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>

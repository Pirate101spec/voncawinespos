<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$response = ["success" => false, "message" => ""];

try {
    // ✅ Only admins allowed
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['id'])) {
        throw new Exception("Product ID is required.");
    }

    $productId = intval($data['id']);

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$productId]);

    if ($stmt->rowCount() > 0) {
        $response = ["success" => true, "message" => "Product deleted successfully"];
    } else {
        $response = ["success" => false, "message" => "Product not found"];
    }

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
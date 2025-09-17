<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php';
$response = ['success' => false, 'data' => []];

$searchTerm = $_GET['q'] ?? '';

if (!empty($searchTerm)) {
    try {
        $stmt = $pdo->prepare("SELECT barcode, name, retail_price FROM products WHERE name LIKE ? OR barcode LIKE ? LIMIT 10");
        $stmt->execute(["%$searchTerm%", "%$searchTerm%"]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['success'] = true;
        $response['data'] = $products;
    } catch (Exception $e) {
        $response['message'] = 'Error searching products: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>

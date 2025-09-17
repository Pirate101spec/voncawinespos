<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // We'll use POST with a _method flag
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $id = $data['id'] ?? null;
    $barcode = $data['barcode'] ?? null;
    $name = $data['name'] ?? null;
    $retail_price = $data['retail_price'] ?? null;
    $wholesale_price = $data['wholesale_price'] ?? null;
    $stock = $data['stock'] ?? 0;

    if (!$id || !$barcode || !$name || !$retail_price) {
        $response['message'] = 'Required fields missing.';
        echo json_encode($response);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE products SET barcode = ?, name = ?, retail_price = ?, wholesale_price = ?, stock = ? WHERE id = ?");
        $stmt->execute([$barcode, $name, $retail_price, $wholesale_price, $stock, $id]);

        $response['success'] = true;
        $response['message'] = 'Product updated successfully.';
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            $response['message'] = 'A product with this barcode already exists.';
        } else {
            $response['message'] = 'Database error: ' . $e->getMessage();
        }
    }
}

echo json_encode($response);
?>

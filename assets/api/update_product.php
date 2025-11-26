<?php
// assets/api/update_product.php
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'], $data['barcode'], $data['name'], $data['retail_price'], $data['wholesale_price'], $data['stock'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE products 
        SET barcode = ?, name = ?, retail_price = ?, wholesale_price = ?, stock = ? 
        WHERE id = ?");
    $success = $stmt->execute([
        $data['barcode'],
        $data['name'],
        $data['retail_price'],
        $data['wholesale_price'],
        $data['stock'],
        $data['id']
    ]);

    if ($success) {
        echo json_encode(["success" => true, "message" => "Product updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
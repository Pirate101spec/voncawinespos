<?php
// assets/api/edit_product.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$response = ["success" => false, "message" => ""];

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['id'], $data['barcode'], $data['name'], $data['retail_price'], $data['wholesale_price'], $data['stock'])) {
        throw new Exception("Missing required fields.");
    }

    $stmt = $pdo->prepare("UPDATE products 
                           SET barcode = ?, name = ?, retail_price = ?, wholesale_price = ?, stock = ? 
                           WHERE id = ?");
    $stmt->execute([
        $data['barcode'],
        $data['name'],
        $data['retail_price'],
        $data['wholesale_price'],
        $data['stock'],
        $data['id']
    ]);

    $response = ["success" => true, "message" => "Product updated successfully."];
} catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
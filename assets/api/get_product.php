<?php
// assets/api/get_product.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$response = ["success" => false, "message" => "", "product" => null];

try {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("Invalid product ID.");
    }

    $id = intval($_GET['id']);

    $stmt = $pdo->prepare("SELECT id, barcode, name, retail_price, wholesale_price, stock 
                           FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        $response = ["success" => true, "product" => $product];
    } else {
        $response["message"] = "Product not found.";
    }
} catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
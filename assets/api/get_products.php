<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT 
        id, 
        barcode, 
        name, 
        retail_price, 
        wholesale_price, 
        stock
    FROM products ORDER BY name ASC");

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $products   // ⚡ use "data" not "products" so it matches products.js
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
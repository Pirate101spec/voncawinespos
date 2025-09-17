<?php
require 'db.php';
session_start();
$cashier_id = $_SESSION['user_id'] ?? 1; // fallback to demo user
$items = json_decode(file_get_contents('php://input'), true)['items'];
$total = json_decode(file_get_contents('php://input'), true)['total'];

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO sales (total, datetime, cashier_id) VALUES (?, NOW(), ?)");
    $stmt->execute([$total, $cashier_id]);
    $sale_id = $pdo->lastInsertId();

    $itemStmt = $pdo->prepare("INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($items as $item) {
        $product_id = $item['product_id'];
        $quantity = $item['quantity'];
        $priceStmt = $pdo->prepare("SELECT price FROM products WHERE id = ?");
        $priceStmt->execute([$product_id]);
        $price = $priceStmt->fetchColumn();
        $itemStmt->execute([$sale_id, $product_id, $quantity, $price]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'sale_id' => $sale_id]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

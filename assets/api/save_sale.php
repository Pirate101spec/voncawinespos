<?php
require_once "db.php";
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['cart']) || count($data['cart']) === 0) {
    echo json_encode(["success" => false, "message" => "No items in sale"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Insert sale
    $stmt = $pdo->prepare("INSERT INTO sales 
        (customer_id, user_id, payment_method, subtotal, tax, total, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())");

    $customer_id = $data['customer_id'] ?? null;
    $user_id = $_SESSION['user_id'] ?? 1;
    $payment_method = $data['payment_method'] ?? 'cash';
    $subtotal = $data['subtotal'];
    $tax = $data['vat'];
    $total = $data['total'];

    $stmt->execute([$customer_id, $user_id, $payment_method, $subtotal, $tax, $total]);
    $sale_id = $pdo->lastInsertId();

    // Insert items and reduce stock
    $itemStmt = $pdo->prepare("INSERT INTO sales_items 
        (sale_id, product_id, qty, price, total) 
        VALUES (?, ?, ?, ?, ?)");
    $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    foreach ($data['cart'] as $item) {
        $lineTotal = $item['qty'] * $item['price'];
        $itemStmt->execute([$sale_id, $item['id'], $item['qty'], $item['price'], $lineTotal]);
        $stockStmt->execute([$item['qty'], $item['id']]);
    }

    $pdo->commit();

    echo json_encode(["success" => true, "sale_id" => $sale_id]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
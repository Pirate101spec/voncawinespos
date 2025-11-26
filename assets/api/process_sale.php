<?php
require_once "db.php";
session_start();

header("Content-Type: application/json");

// Decode JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['items'])) {
    echo json_encode(['success' => false, 'message' => 'No items provided']);
    exit;
}

try {
    $pdo->beginTransaction();

    // --- Sale core details ---
    $customer_id    = $data['customer_id'] ?? null;
    $user_id        = $_SESSION['user_id'] ?? 1; // replace with actual session user later
    $payment_method = $data['payment_method'] ?? 'Cash';
    $subtotal       = $data['subtotal'] ?? 0;
    $tax            = $data['tax'] ?? 0;
    $total          = $data['total'] ?? 0;

    // --- Insert into sales table ---
    $stmt = $pdo->prepare("
        INSERT INTO sales (customer_id, user_id, payment_method, subtotal, tax, total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$customer_id, $user_id, $payment_method, $subtotal, $tax, $total]);
    $sale_id = $pdo->lastInsertId();

    // --- Insert sale items + deduct stock ---
    $itemStmt = $pdo->prepare("
        INSERT INTO sale_items (sale_id, product_id, qty, price, total)
        VALUES (?, ?, ?, ?, ?)
    ");
    $updateStock = $pdo->prepare("
        UPDATE products SET stock = stock - ? WHERE id = ?
    ");

    foreach ($data['items'] as $item) {
        $product_id = $item['id'];
        $qty   = $item['qty'];
        $price      = $item['price'];
        $line_total = $qty * $price;

        $itemStmt->execute([$sale_id, $product_id, $qty, $price, $line_total]);
        $updateStock->execute([$qty, $product_id]);
    }

    $pdo->commit();

    // --- Fetch sale items back for receipt ---
    $stmtItems = $pdo->prepare("
        SELECT p.name, si.qty, si.price, si.total
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
    ");
    $stmtItems->execute([$sale_id]);
    $sale_items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    // --- Response to frontend ---
    echo json_encode([
        'success' => true,
        'message' => 'Sale processed successfully',
        'sale_id' => $sale_id,
        'payment_method' => $payment_method,
        'subtotal' => $subtotal,
        'tax' => $tax,
        'total' => $total,
        'cashier' => $_SESSION['username'] ?? 'Cashier',
        'items' => $sale_items
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
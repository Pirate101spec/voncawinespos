<?php
require_once "db.php";
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['sale_id'])) {
    echo json_encode(['success' => false, 'message' => 'No sale ID provided']);
    exit;
}

try {
    $pdo->beginTransaction();

    $sale_id = (int)$data['sale_id'];
    $user_id = $_SESSION['user_id'] ?? 1;

    // --- 1. Fetch sale items
    $stmt = $pdo->prepare("SELECT product_id, quantity FROM sale_items WHERE sale_id = ?");
    $stmt->execute([$sale_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) {
        echo json_encode(['success' => false, 'message' => 'No sale items found']);
        exit;
    }

    // --- 2. Restock each product
    $updateStock = $pdo->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
    foreach ($items as $item) {
        $updateStock->execute([$item['quantity'], $item['product_id']]);
    }

    // --- 3. Mark sale as refunded
    $updateSale = $pdo->prepare("UPDATE sales SET status = 'refunded' WHERE id = ?");
    $updateSale->execute([$sale_id]);

    // --- 4. Record refund log
    $log = $pdo->prepare("
        INSERT INTO refunds (sale_id, refunded_by, created_at)
        VALUES (?, ?, NOW())
    ");
    $log->execute([$sale_id, $user_id]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Refund processed successfully and stock restored.',
        'sale_id' => $sale_id
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
<?php
require "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? null;
$qty = $data["quantity"] ?? null;

if (!$id || !$qty || $qty <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
    $stmt->execute([$qty, $id]);

    echo json_encode(["success" => true, "message" => "Stock updated"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

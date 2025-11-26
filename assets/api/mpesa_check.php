<?php
// assets/api/mpesa_check.php
header("Content-Type: application/json");
require_once __DIR__ . "/db.php";

$checkout = $_GET['checkout_request_id'] ?? null;

if (!$checkout) {
    echo json_encode(['success' => false, 'message' => 'Missing checkout_request_id']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM mpesa_requests WHERE checkout_request_id = ?");
$stmt->execute([$checkout]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Request not found']);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $row
]);

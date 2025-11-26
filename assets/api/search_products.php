<?php
require_once "db.php";

header("Content-Type: application/json");

$q = isset($_GET['query']) ? trim($_GET['query']) : "";
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

$limit = 15;
$offset = ($page - 1) * $limit;

if ($q === '') {
    echo json_encode(["success" => false, "message" => "Empty search query"]);
    exit;
}

$like = '%' . $q . '%';

try {
    // ✅ Use integer interpolation for LIMIT and OFFSET (safe since casted)
    $sql = "SELECT id, barcode, name, retail_price AS price, wholesale_price, stock 
            FROM products 
            WHERE name LIKE ? OR barcode LIKE ? 
            LIMIT $limit OFFSET $offset";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$like, $like]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
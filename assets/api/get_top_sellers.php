<?php
include('db.php');
header("Content-Type: application/json");

try {
    $stmt = $pdo->query("
        SELECT p.name, SUM(si.qty) AS quantity_sold
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY si.product_id
        ORDER BY quantity_sold DESC
        LIMIT 10
    ");
    $topSellers = $stmt->fetchAll();

    echo json_encode(["success"=>true,"topSellers"=>$topSellers]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>

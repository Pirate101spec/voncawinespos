<?php
require_once "db.php";
header("Content-Type: application/json");

$startDate = $_GET['start_date'] ?? null;
$endDate   = $_GET['end_date'] ?? null;

if(!$startDate || !$endDate){
    $endDate = date("Y-m-d");
    $startDate = date("Y-m-d", strtotime("-7 days"));
}

try{
    // Daily sales
    $stmt = $pdo->prepare("
        SELECT DATE(created_at) AS sale_date, SUM(total) AS total_sales
        FROM sales
        WHERE DATE(created_at) BETWEEN :start AND :end
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
    ");
    $stmt->execute([':start'=>$startDate, ':end'=>$endDate]);
    $dailySales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top selling products
    $stmt = $pdo->prepare("
        SELECT p.name, SUM(si.qty) AS quantity_sold, SUM(si.total) AS total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) BETWEEN :start AND :end
        GROUP BY si.product_id
        ORDER BY quantity_sold DESC
        LIMIT 10
    ");
    $stmt->execute([':start'=>$startDate, ':end'=>$endDate]);
    $topSelling = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"=>true,
        "dailySales"=>$dailySales,
        "topSelling"=>$topSelling
    ]);
}catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}

<?php
include('db.php');
header("Content-Type: application/json");

try {
    $stmt = $pdo->query("
        SELECT DATE(created_at) AS sale_date, SUM(total) AS total_sales
        FROM sales
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
    ");
    $sales = $stmt->fetchAll();

    echo json_encode(["success"=>true,"sales"=>$sales]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>

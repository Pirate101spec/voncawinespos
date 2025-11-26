<?php
include('db.php');
header("Content-Type: application/json");

try {
    $totalInvoices = $pdo->query("SELECT COUNT(*) FROM sales")->fetchColumn();
    $totalCustomers = $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();
    $totalProducts = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();

    $stmt = $pdo->prepare("SELECT IFNULL(SUM(total),0) AS revenue_today FROM sales WHERE DATE(created_at)=CURDATE()");
    $stmt->execute();
    $revenueToday = $stmt->fetchColumn();

    $lowStock = $pdo->query("SELECT name, stock FROM products WHERE stock <=4 ORDER BY stock ASC LIMIT 10")->fetchAll();

    echo json_encode([
        "success" => true,
        "totalInvoices" => $totalInvoices,
        "totalCustomers" => $totalCustomers,
        "totalProducts" => $totalProducts,
        "revenueToday" => $revenueToday,
        "lowStock" => $lowStock
    ]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>

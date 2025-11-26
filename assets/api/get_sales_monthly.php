<?php
header("Content-Type: application/json");
require_once "db.php"; // same folder

try {

    // Monthly sales totals for current year
    $query = "
        SELECT 
            DATE_FORMAT(created_at, '%b') AS month,
            SUM(total) AS total_sales
        FROM sales
        WHERE YEAR(created_at) = YEAR(CURDATE())
        GROUP BY MONTH(created_at)
        ORDER BY MONTH(created_at)
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $row) {
        $data[] = [
            "month" => strtoupper($row["month"]),
            "total_sales" => round($row["total_sales"], 2)
        ];
    }

    echo json_encode([
        "success" => true,
        "sales" => $data
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

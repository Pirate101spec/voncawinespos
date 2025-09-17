<?php
// get_monthly_report.php

require 'db.php'; // Make sure you have a PDO connection in db.php

$month = $_GET['month'] ?? date('m');
$year = $_GET['year'] ?? date('Y');

// Get full revenue and expenses for the month
$stmt = $pdo->prepare("SELECT 
    SUM(total_amount) AS revenue,
    SUM(cost_of_goods) AS expenses
    FROM sales 
    WHERE MONTH(date) = ? AND YEAR(date) = ?");
$stmt->execute([$month, $year]);
$summary = $stmt->fetch();

// Get weekly breakdown
$weeklySales = [0, 0, 0, 0];

$stmt = $pdo->prepare("SELECT total_amount, cost_of_goods, DAY(date) as day
    FROM sales WHERE MONTH(date) = ? AND YEAR(date) = ?");
$stmt->execute([$month, $year]);

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $day = (int)$row['day'];
    $weekIndex = ceil($day / 7) - 1; // 0 = Week 1, 3 = Week 4
    if (!isset($weeklySales[$weekIndex])) $weeklySales[$weekIndex] = 0;
    $weeklySales[$weekIndex] += $row['total_amount'];
}

echo json_encode([
    'revenue' => $summary['revenue'] ?? 0,
    'expenses' => $summary['expenses'] ?? 0,
    'weekly' => $weeklySales
]);
?>

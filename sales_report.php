<?php
require 'db.php';
$start = $_GET['start'];
$end = $_GET['end'];

$sql = "
SELECT s.id, s.datetime, s.total, u.username AS cashier
FROM sales s
JOIN users u ON s.cashier_id = u.id
WHERE DATE(s.datetime) BETWEEN ? AND ?
ORDER BY s.datetime DESC
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$start, $end]);
$sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($sales);
?>

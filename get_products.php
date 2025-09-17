<?php
require 'db.php';

$stmt = $pdo->query("SELECT id, name, price FROM products ORDER BY name");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($products);
?>

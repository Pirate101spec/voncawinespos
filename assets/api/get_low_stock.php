<?php
include '../db.php';

// Try to get products with low stock (<=5)
$res = $conn->query("SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10");
$products = [];
while ($row = $res->fetch_assoc()) {
    $products[] = $row;
}

// If none, return first 10 products as fallback
if (count($products) === 0) {
    $res = $conn->query("SELECT id, name, stock FROM products ORDER BY stock ASC LIMIT 10");
    $products = [];
    while ($row = $res->fetch_assoc()) {
        $products[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($products);

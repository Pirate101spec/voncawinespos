<?php
include('db.php');
header("Content-Type: application/json");

try {
    $stmt = $pdo->query("SELECT * FROM sales ORDER BY created_at DESC LIMIT 10");
    $transactions = $stmt->fetchAll();

    echo json_encode(["success"=>true,"transactions"=>$transactions]);
} catch(Exception $e){
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
